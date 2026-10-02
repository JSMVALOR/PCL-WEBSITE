require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

let qrDataURL = null;
let clientStatus = 'DISCONNECTED';
let isProcessingQueue = false;
let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const logger = pino({ level: 'silent' });

// Use absolute path for auth to prevent CWD-related mismatches
const AUTH_DIR = path.join(__dirname, '.baileys_auth');

// ==========================================
// MESSAGE TEMPLATES
// ==========================================
const MESSAGE_TEMPLATES = {
    // Attendance Alerts
    PARENT_ABSENT_ALERT: ({ student_name, date, period_count }) =>
        `📛 *ATTENDANCE ALERT*\n\nDear Parent/Guardian,\n\nThis is to inform you that *${student_name}* has been marked *ABSENT* ${period_count ? `for ${period_count} session(s)` : 'for the day'} on ${date}.\n\nPlease check the Parent Portal for details.\n\n— Prudentia College of Law`,

    // Notice / Broadcast
    NOTICE_BROADCAST: ({ category, title, content, link }) =>
        `📢 *[${(category || 'GENERAL').toUpperCase()}] ${title}*\n\n${content}${link ? '\n\n🔗 Link: ' + link : ''}\n\n— Prudentia College of Law`,

    // Holiday / Campus Leave
    HOLIDAY_REMINDER: ({ event_type, title, date, description }) =>
        `🏫 *Reminder: ${event_type === 'holiday' ? 'Holiday' : 'Campus Leave'} Tomorrow!*\n\n*${title}*\nDate: ${date}\n${description ? '\n' + description : ''}\n\n— Prudentia College of Law`,

    // Timetable Published
    TIMETABLE_PUBLISHED: ({ batch_name }) =>
        `📚 *New Timetable Published*\n\nA new class schedule has been published for the *${batch_name}* batch.\n\nPlease log in to your ERP dashboard for details.\n\n— Prudentia College of Law`,

    // Leave Status Update
    LEAVE_STATUS: ({ student_name, status, leave_type, dates }) =>
        `📋 *Leave ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}*\n\nStudent: ${student_name}\nType: ${leave_type}\nDates: ${dates}\nStatus: *${(status || '').toUpperCase()}*\n\n— Prudentia College of Law`,

    // Fee Reminder
    FEE_REMINDER: ({ student_name, amount, due_date }) =>
        `💰 *Fee Payment Reminder*\n\nDear Parent/Guardian of *${student_name}*,\n\nA fee payment of ₹${amount} is due on ${due_date}.\n\nPlease make the payment at the earliest.\n\n— Prudentia College of Law`,

    // Generic / Custom
    GENERIC: ({ message }) => message || '',
};

async function startWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: ['PCL ERP', 'Chrome', '10.0'],
            connectTimeoutMs: 60000,
            // Prevent connection from going stale
            keepAliveIntervalMs: 30000,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                clientStatus = 'QR_READY';
                qrDataURL = await qrcode.toDataURL(qr);
                console.log('[WA] QR Code Generated - Ready to scan');
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                console.log('[WA] Connection closed. Status:', statusCode, '| Reconnecting:', shouldReconnect);
                
                clientStatus = 'DISCONNECTED';
                qrDataURL = null;

                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    // Exponential backoff: 3s, 6s, 12s, 24s... capped at 60s
                    const delay = Math.min(3000 * Math.pow(2, reconnectAttempts - 1), 60000);
                    console.log(`[WA] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                    setTimeout(() => startWhatsApp(), delay);
                } else if (!shouldReconnect) {
                    console.log('[WA] Logged out by user. Clear auth to re-link.');
                    clientStatus = 'LOGGED_OUT';
                } else {
                    console.log('[WA] Max reconnect attempts reached. Manual restart required.');
                    clientStatus = 'DISCONNECTED';
                }
            }

            if (connection === 'open') {
                clientStatus = 'CONNECTED';
                qrDataURL = null;
                reconnectAttempts = 0; // Reset on successful connection
                console.log('[WA] WhatsApp Client is Ready!');
            }
        });
    } catch (err) {
        console.error('[WA] Failed to start WhatsApp:', err.message);
        // If auth is corrupted, reset and retry
        if (err.message?.includes('Unexpected') || err.message?.includes('JSON')) {
            console.log('[WA] Auth may be corrupted. Clearing and retrying...');
            try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch(e) {}
            setTimeout(() => startWhatsApp(), 5000);
        }
    }
}

startWhatsApp();

// ==========================================
// EXPRESS ENDPOINTS
// ==========================================

// Health check
app.get('/api/whatsapp/health', (req, res) => {
    res.json({ 
        ok: true, 
        status: clientStatus, 
        uptime: process.uptime(),
        reconnectAttempts 
    });
});

app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        status: clientStatus,
        qr: qrDataURL
    });
});

// Get available templates
app.get('/api/whatsapp/templates', (req, res) => {
    const templateList = Object.keys(MESSAGE_TEMPLATES).map(key => ({
        id: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
    res.json({ templates: templateList });
});

// Preview a template with sample data
app.post('/api/whatsapp/templates/preview', (req, res) => {
    const { template_id, variables } = req.body;
    const templateFn = MESSAGE_TEMPLATES[template_id];
    if (!templateFn) {
        return res.status(404).json({ error: `Template '${template_id}' not found` });
    }
    const preview = templateFn(variables || {});
    res.json({ preview });
});

// ==========================================
// DIRECT SEND ENDPOINT (for FacultyAttendance, etc.)
// ==========================================
app.post('/api/whatsapp/send', async (req, res) => {
    const { to_phone, message, template_id, variables, recipient_name } = req.body;

    if (!to_phone) {
        return res.status(400).json({ error: 'to_phone is required' });
    }

    // Build message from template or use raw message
    let finalMessage = message;
    if (template_id && MESSAGE_TEMPLATES[template_id]) {
        finalMessage = MESSAGE_TEMPLATES[template_id](variables || {});
    }
    if (!finalMessage) {
        return res.status(400).json({ error: 'message or valid template_id is required' });
    }

    try {
        // Queue it in Supabase for the background processor
        const { error } = await supabase.from('whatsapp_queue').insert({
            phone: to_phone,
            message: finalMessage,
            status: 'PENDING'
        });
        if (error) throw error;
        res.json({ success: true, queued: true });
    } catch (e) {
        console.error('[WA] Failed to queue send:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// BATCH SEND (for bulk notifications)
// ==========================================
app.post('/api/whatsapp/send-batch', async (req, res) => {
    const { messages } = req.body; // Array of { to_phone, message, template_id, variables, recipient_name }
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    try {
        const queueItems = messages.map(m => {
            let finalMessage = m.message;
            if (m.template_id && MESSAGE_TEMPLATES[m.template_id]) {
                finalMessage = MESSAGE_TEMPLATES[m.template_id](m.variables || {});
            }
            return {
                phone: m.to_phone,
                message: finalMessage || '',
                status: 'PENDING'
            };
        }).filter(m => m.phone && m.message);

        if (queueItems.length === 0) {
            return res.status(400).json({ error: 'No valid messages to send' });
        }

        const { error } = await supabase.from('whatsapp_queue').insert(queueItems);
        if (error) throw error;
        res.json({ success: true, queued: queueItems.length });
    } catch (e) {
        console.error('[WA] Failed to queue batch:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// FETCH STUDENT/PARENT CONTACTS
// ==========================================
app.get('/api/whatsapp/contacts', async (req, res) => {
    try {
        const { batch, role } = req.query;
        
        let query = supabase.from('profiles').select('id, full_name, phone, parent_phone, email, role, academic_batch, erp_id');
        
        if (role) query = query.eq('role', role);
        if (batch) query = query.eq('academic_batch', batch);
        
        const { data, error } = await query.order('full_name');
        if (error) throw error;

        // Also fetch parent mappings for student-parent relationships
        const studentIds = (data || []).filter(p => p.role === 'student').map(p => p.id);
        let parentMappings = [];
        if (studentIds.length > 0) {
            const { data: mappings } = await supabase
                .from('parent_student_mappings')
                .select('student_id, parent_id, profiles!parent_student_mappings_parent_id_fkey(full_name, phone, email)')
                .in('student_id', studentIds);
            parentMappings = mappings || [];
        }

        const contacts = (data || []).map(p => ({
            id: p.id,
            name: p.full_name,
            phone: p.phone || null,
            parent_phone: p.parent_phone || null,
            email: p.email,
            role: p.role,
            batch: p.academic_batch,
            erp_id: p.erp_id,
            parent: parentMappings.find(m => m.student_id === p.id)?.profiles || null,
        }));

        res.json({ contacts });
    } catch (e) {
        console.error('[WA] Contacts fetch error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (sock) {
            try { await sock.logout(); } catch(err) { console.log('[WA] Sock logout err:', err.message); }
        }
    } catch (e) {
        console.error(e);
    } finally {
        // Clear auth files (using consistent absolute path)
        if (fs.existsSync(AUTH_DIR)) {
            try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch(e){}
        }
        clientStatus = 'DISCONNECTED';
        qrDataURL = null;
        reconnectAttempts = 0;
        // Restart to get a new QR
        setTimeout(() => startWhatsApp(), 1000);
        res.json({ success: true });
    }
});


app.get('/api/whatsapp/groups', async (req, res) => {
    try {
        if (!sock || clientStatus !== 'CONNECTED') {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        
        // Fetch all groups from store or directly
        const groupMetadata = await sock.groupFetchAllParticipating();
        const groups = Object.values(groupMetadata).map(g => ({
            id: g.id,
            name: g.subject,
            participants: g.participants.length
        }));
        
        res.json({ groups });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// THE THROTTLE QUEUE LOOP
// ==========================================
async function processQueue() {
    if (isProcessingQueue || clientStatus !== 'CONNECTED' || !sock) return;
    isProcessingQueue = true;

    try {
        const { data: pendingMsgs, error } = await supabase
            .from('whatsapp_queue')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .limit(1);

        if (error) {
            console.error('[WA] Supabase queue fetch error:', error);
            isProcessingQueue = false;
            return;
        }

        if (pendingMsgs && pendingMsgs.length > 0) {
            const msg = pendingMsgs[0];
            console.log(`[WA] Processing message for ${msg.recipient_name || msg.phone}...`);
            
            let jid = '';
            // Detect group: contains @g.us, starts with G:, or is a group-style long ID
            let isGroup = (msg.phone || '').includes('@g.us') || (msg.phone || '').startsWith('G:') || (msg.phone || '').includes('-');
            let formattedPhone = msg.phone;
            
            if (isGroup) {
                const cleanId = msg.phone.replace('G:', '').replace('@g.us', '');
                jid = cleanId + '@g.us';
            } else {
                formattedPhone = msg.phone.replace(/[^0-9]/g, '');
                if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
                    formattedPhone = '91' + formattedPhone;
                }
                jid = `${formattedPhone}@s.whatsapp.net`;
            }

            try {
                let targetJid = jid;
                
                if (!isGroup) {
                    // Check if registered
                    const [result] = await sock.onWhatsApp(jid);
                    if (!result?.exists) {
                        throw new Error('Phone number not registered on WhatsApp');
                    }
                    targetJid = result.jid;
                }

                // Send message
                await sock.sendMessage(targetJid, { text: msg.message });
                
                // Update Supabase
                await supabase.from('whatsapp_queue')
                    .update({ status: 'SENT', sent_at: new Date().toISOString() })
                    .eq('id', msg.id);
                    
                console.log(`[WA] Successfully sent to ${msg.recipient_name || formattedPhone}`);
            } catch (err) {
                console.error(`[WA] Failed to send to ${formattedPhone}:`, err.message);
                await supabase.from('whatsapp_queue')
                    .update({ status: 'FAILED', error_log: err.message })
                    .eq('id', msg.id);
            }
        }
    } catch (err) {
        console.error('[WA] Queue processing error:', err);
    }

    isProcessingQueue = false;
}

// Run the queue every 15 seconds
setInterval(processQueue, 15000);

const PORT = process.env.PORT || process.env.WA_PORT || 3005;
app.listen(PORT, () => {
    console.log(`[WA] Backend WhatsApp Engine listening on port ${PORT}`);
});

// ==========================================
// BACKGROUND CRON JOBS (Runs on Render 24/7)
// ==========================================
const cron = require('node-cron');

// Run every day at 17:00 (5 PM) to check for tomorrow's events
cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Running daily check for upcoming campus leaves/events...');
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Fetch events for tomorrow
        const { data: events, error } = await supabase
            .from('academic_calendar')
            .select('*')
            .eq('start_date', tomorrowStr)
            .in('type', ['holiday', 'campus_leave']);
            
        if (error || !events || events.length === 0) {
            console.log('[CRON] No holidays or campus leaves found for tomorrow.');
            return;
        }

        for (const event of events) {
            console.log(`[CRON] Processing event: ${event.title}`);
            
            // 1. WhatsApp Global Broadcast (using templates)
            const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
            if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
                const message = MESSAGE_TEMPLATES.HOLIDAY_REMINDER({
                    event_type: event.type,
                    title: event.title,
                    date: new Date(event.start_date).toLocaleDateString('en-IN'),
                    description: event.description || '',
                });
                const groupNotifs = globalSet.value.map(groupId => ({
                    phone: groupId,
                    message,
                    status: 'PENDING'
                }));
                if (groupNotifs.length > 0) {
                    await supabase.from('whatsapp_queue').insert(groupNotifs);
                }
            }
            
            // 2. Bell Notifications (for all users)
            const { data: users } = await supabase.from('profiles').select('id');
            if (users && users.length > 0) {
                // Batch insert notifications in chunks of 500 to avoid request limits
                const chunkSize = 500;
                for (let i = 0; i < users.length; i += chunkSize) {
                    const chunk = users.slice(i, i + chunkSize);
                    const notifs = chunk.map(u => ({
                        recipient_id: u.id,
                        title: `Tomorrow: ${event.title}`,
                        message: `Reminder: Tomorrow is a scheduled ${event.type === 'holiday' ? 'holiday' : 'campus leave'}.`,
                        type: 'notice',
                        action_link: 'notices'
                    }));
                    await supabase.from('notifications').insert(notifs);
                }
            }
        }
        console.log('[CRON] Daily check completed successfully.');
    } catch (e) {
        console.error('[CRON] Failed to run daily check:', e);
    }
}, {
    timezone: "Asia/Kolkata"
});
// ==========================================

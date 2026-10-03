const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

let qrDataURL = null;
let clientStatus = 'DISCONNECTED';
let isProcessingQueue = false;
let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 25;
let heartbeatInterval = null;
let reconnectTimer = null;

const logger = pino({ level: 'silent' });

// Use absolute path for auth to prevent CWD-related mismatches
const AUTH_DIR = path.join(__dirname, '.baileys_auth');

// Ensure auth directory exists on startup
if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
}

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

    // Account Status Change
    ACCOUNT_STATUS: ({ name, status }) =>
        `🔔 *Account Update*\n\nDear *${name || 'User'}*,\n\nYour ERP account has been *${(status || 'updated').toUpperCase()}* by the administration.\n\n${status === 'suspended' ? '⚠️ You will not be able to access the portal until reactivation. Contact the Admin office if needed.' : '✅ You can now log in and access all your resources.'}\n\n— Prudentia College of Law`,

    // Generic / Custom
    GENERIC: ({ message }) => message || '',

    // Fee Payment Confirmed
    FEE_PAYMENT_CONFIRMED: ({ student_name, amount, transaction_id, date }) =>
        `✅ *PAYMENT CONFIRMED*\n\nDear *${student_name}*,\n\nWe have successfully received and verified your payment.\n\n💰 Amount: ₹${amount}\n🔖 Transaction ID: ${transaction_id || 'N/A'}\n📅 Date: ${date || new Date().toLocaleDateString('en-IN')}\n\nYour official receipt has been emailed and is also available in your Student Portal under Finance.\n\n— Prudentia College of Law`,

    // Fee Invoice Raised
    FEE_INVOICE_RAISED: ({ student_name, title, amount, due_date }) =>
        `📋 *NEW FEE INVOICE*\n\nDear *${student_name || 'Student'}*,\n\nA new fee invoice has been raised against your account.\n\n📝 Fee: ${title || 'Academic Fee'}\n💰 Amount: ₹${amount || 'See Portal'}\n📅 Due Date: ${due_date}\n\nPlease check your Student ERP Portal under Finance to view and pay your dues securely.\n\n— Prudentia College of Law`,

    // Grievance Update
    GRIEVANCE_UPDATE: ({ student_name, category, new_status, notes }) =>
        `⚖️ *Grievance Update*\n\nDear *${student_name}*,\n\nYour grievance regarding *${category}* has been updated.\n\n📌 New Status: *${new_status}*\n${notes ? '📝 Remarks: ' + notes : ''}\n\nPlease check your ERP portal for full details.\n\n— Prudentia College of Law`,

    // Meeting Call
    MEETING_CALL: ({ student_name, category, time }) =>
        `🔴 *MANDATORY MEETING*\n\nDear *${student_name}*,\n\nYou are hereby called for a mandatory meeting.\n\n📂 Regarding: ${category}\n🕐 Time: ${time}\n\nPlease be present on time. Failure to attend may result in ex-parte proceedings.\n\n— Prudentia College of Law`,

    // Attendance Shortage Warning
    ATTENDANCE_WARNING: ({ student_name, percentage, threshold }) =>
        `⚠️ *ATTENDANCE WARNING*\n\nDear *${student_name}*,\n\nYour current attendance is *${percentage}%*, which is below the minimum required *${threshold}%*.\n\nPlease improve your attendance immediately to avoid examination debarment.\n\n— Prudentia College of Law`,

    // Debarment Notice
    DEBARMENT_NOTICE: ({ student_name, percentage, threshold }) =>
        `🚨 *DEBARMENT NOTICE*\n\nDear *${student_name}*,\n\nDue to severe attendance shortage (*${percentage}%* against the required *${threshold}%*), you have been *DEBARRED* from the upcoming examinations.\n\nPlease contact the Academic Office immediately.\n\n— Prudentia College of Law`,

    // Assignment Published
    ASSIGNMENT_PUBLISHED: ({ subject_name, title, deadline }) =>
        `📝 *New Assignment Published*\n\n📚 Subject: ${subject_name}\n📋 Title: ${title}\n📅 Deadline: ${deadline}\n\nPlease log in to your Student Portal to view details and submit.\n\n— Prudentia College of Law`,

    // Admission Rejection
    APPLICATION_REJECTED: ({ student_name, program, reason }) =>
        `📋 *Admission Update*\n\nDear *${student_name}*,\n\nThank you for your interest in *${program}* at Prudentia College of Law.\n\nAfter careful consideration, we regret to inform you that we are unable to offer admission at this time.${reason ? '\n\n📝 Reason: ' + reason : ''}\n\nWe wish you the best in your future endeavors.\n\n— Prudentia College of Law`,

    // First Credentials / New Account
    FIRST_CREDENTIALS: ({ name, erp_id, password }) =>
        `🎓 *Welcome to PCL ERP*\n\nDear *${name || 'User'}*,\n\nYour official ERP credentials have been generated:\n\n🆔 ERP ID: *${erp_id}*\n🔑 Temporary Password: *${password}*\n\nPlease log in and change your password immediately.\n\n— Prudentia College of Law`,

    // Payroll Disbursal
    PAYROLL_DISBURSAL: ({ faculty_name, month, year, net_pay }) =>
        `💼 *Salary Disbursal*\n\nDear Prof. *${faculty_name}*,\n\nYour salary for *${month} ${year}* has been processed.\n\n💰 Net Pay: ₹${net_pay}\n\nYour payslip has been emailed. Check your ERP Faculty Dashboard for the full breakdown.\n\n— Prudentia College of Law`,

    // Passcode Reset
    PASSCODE_RESET: ({ name, erp_id }) =>
        `🔐 *Password Reset*\n\nDear *${name || 'User'}*,\n\nYour ERP password has been reset by the administration.\n\n🆔 ERP ID: *${erp_id}*\n\nYour new temporary password has been sent to your registered email. Please change it immediately after logging in.\n\n— Prudentia College of Law`,

    // Happy Birthday
    HAPPY_BIRTHDAY: ({ name }) =>
        `🎉 *Happy Birthday ${name}!* 🎂\n\nThe entire faculty and administration at Prudentia College of Law wishes you a fantastic day ahead!\n\nMay this year bring you great success, learning, and wonderful memories.\n\n— Prudentia College of Law`,
};

// ==========================================
// WHATSAPP SESSION - BULLETPROOF PERSISTENCE
// ==========================================

function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    // Send a lightweight presence update every 2 minutes to keep the connection alive
    // WhatsApp can idle-drop connections that go quiet for >3 minutes
    heartbeatInterval = setInterval(async () => {
        if (sock && clientStatus === 'CONNECTED') {
            try {
                await sock.sendPresenceUpdate('available');
            } catch (e) {
                console.log('[WA] Heartbeat presence failed (non-fatal):', e.message);
            }
        }
    }, 2 * 60 * 1000);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function clearReconnectTimer() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
}

async function startWhatsApp() {
    // Clear any pending reconnect timer
    clearReconnectTimer();
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            // Use macOS Desktop identity — this is the most stable fingerprint
            // that WhatsApp's servers recognise as a legitimate multi-device client.
            // ubuntu('Chrome') gets flagged and force-disconnected.
            browser: Browsers.macOS('Desktop'),
            connectTimeoutMs: 120000,
            // Keep connection alive with frequent pings — critical for persistence
            keepAliveIntervalMs: 15000,
            // Don't request full history sync — this prevents the heavy
            // sync that causes Baileys to choke and disconnect
            syncFullHistory: false,
            // Reduce noise from message receipts
            markOnlineOnConnect: false,
            // Retry connection on failure
            retryRequestDelayMs: 2000,
            // CRITICAL: Provide getMessage for message retry requests.
            // Without this, WhatsApp considers the client "broken" and
            // drops the session after a few hours.
            getMessage: async (key) => {
                // We don't store messages, so return undefined.
                // This is enough to satisfy the retry protocol.
                return undefined;
            },
        });

        // CRITICAL: Save credentials on every update — this is what keeps
        // the session alive across restarts and device switches
        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
            } catch (e) {
                console.error('[WA] Failed to save credentials:', e.message);
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                clientStatus = 'QR_READY';
                qrDataURL = await qrcode.toDataURL(qr);
                console.log('[WA] QR Code Generated - Ready to scan');
            }

            if (connection === 'close') {
                stopHeartbeat();
                clearReconnectTimer();
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.output?.payload?.message || '';
                
                // Only consider truly logged out if status is 401 (loggedOut)
                // Status 408 = timeout, 428 = connection lost, 440 = replaced
                // 515 = restart required, 500/503 = server errors
                // ALL of these should reconnect — only 401 is a real logout
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;
                // Also treat 440 (replaced by another device) as NOT a logout —
                // this happens when WhatsApp's servers hiccup, not when the user
                // actually unlinked from their phone
                const shouldReconnect = !isLoggedOut;
                
                console.log(`[WA] Connection closed. Code: ${statusCode} | Reason: ${reason} | Reconnecting: ${shouldReconnect}`);
                
                clientStatus = 'DISCONNECTED';
                qrDataURL = null;

                if (isLoggedOut) {
                    // User explicitly logged out from their phone
                    console.log('[WA] Explicitly logged out. Clearing auth for re-link.');
                    clientStatus = 'LOGGED_OUT';
                    try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch(e) {}
                    fs.mkdirSync(AUTH_DIR, { recursive: true });
                    // Auto-restart to show QR again
                    reconnectTimer = setTimeout(() => startWhatsApp(), 3000);
                } else if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
                    // Faster initial reconnects to minimise downtime
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
                    console.log(`[WA] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                    reconnectTimer = setTimeout(() => startWhatsApp(), delay);
                } else if (!shouldReconnect) {
                    console.log('[WA] Session ended. Manual restart required.');
                    clientStatus = 'DISCONNECTED';
                } else {
                    console.log('[WA] Max reconnect attempts reached. Will retry in 2 minutes...');
                    clientStatus = 'DISCONNECTED';
                    // Even after max attempts, try again after 2 minutes
                    reconnectTimer = setTimeout(() => {
                        reconnectAttempts = 0;
                        startWhatsApp();
                    }, 2 * 60 * 1000);
                }
            }

            if (connection === 'open') {
                clientStatus = 'CONNECTED';
                qrDataURL = null;
                reconnectAttempts = 0; // Reset on successful connection
                startHeartbeat();
                console.log('[WA] WhatsApp Client is Ready!');
            }
        });

        // Handle messages-upsert to keep session actively synced
        sock.ev.on('messages.upsert', () => {
            // No-op — just having this listener prevents Baileys from
            // thinking the connection is idle and dropping it
        });

    } catch (err) {
        console.error('[WA] Failed to start WhatsApp:', err.message);
        // If auth is corrupted, reset and retry
        if (err.message?.includes('Unexpected') || err.message?.includes('JSON') || err.message?.includes('proto')) {
            console.log('[WA] Auth may be corrupted. Clearing and retrying...');
            try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); } catch(e) {}
            fs.mkdirSync(AUTH_DIR, { recursive: true });
            setTimeout(() => startWhatsApp(), 5000);
        } else {
            // Generic error — retry after backoff
            reconnectAttempts++;
            const delay = Math.min(3000 * Math.pow(2, reconnectAttempts - 1), 60000);
            console.log(`[WA] Retrying in ${delay / 1000}s...`);
            setTimeout(() => startWhatsApp(), delay);
        }
    }
}

// ==========================================
// GRACEFUL SHUTDOWN — flush creds before exit
// ==========================================
async function gracefulShutdown(signal) {
    console.log(`[WA] Received ${signal}. Shutting down gracefully...`);
    stopHeartbeat();
    clearReconnectTimer();
    if (sock) {
        try {
            // End the socket cleanly without logging out
            // This preserves the auth state for next startup
            sock.end(undefined);
        } catch (e) {
            console.log('[WA] Socket close error (non-fatal):', e.message);
        }
    }
    // Give a moment for final creds.update to fire
    await new Promise(r => setTimeout(r, 1000));
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

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
        reconnectAttempts,
        authFilesExist: fs.existsSync(path.join(AUTH_DIR, 'creds.json')),
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
            status: 'PENDING',
            recipient_name: recipient_name || null,
            template_id: template_id || null,
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
                status: 'PENDING',
                recipient_name: m.recipient_name || null,
                template_id: m.template_id || null,
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
        stopHeartbeat();
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
        fs.mkdirSync(AUTH_DIR, { recursive: true });
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

// Endpoint to force process queue manually
app.post('/api/whatsapp/process-queue', (req, res) => {
    processQueue();
    res.json({ success: true, message: 'Queue processing triggered.' });
});

// Endpoint to clear unsent messages
app.post('/api/whatsapp/queue/clear', async (req, res) => {
    try {
        const { error } = await supabase.from('whatsapp_queue').delete().eq('status', 'PENDING');
        if (error) throw error;
        res.json({ success: true, message: 'Unsent messages cleared.' });
    } catch (e) {
        console.error("Failed to clear queue:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Endpoint to delete a specific message
app.delete('/api/whatsapp/queue/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('whatsapp_queue').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true, message: 'Message deleted.' });
    } catch (e) {
        console.error("Failed to delete message:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Run the queue every 5 seconds for faster responsiveness
setInterval(processQueue, 5000);

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
                    status: 'PENDING',
                    template_id: 'HOLIDAY_REMINDER',
                    recipient_name: 'Global Broadcast'
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

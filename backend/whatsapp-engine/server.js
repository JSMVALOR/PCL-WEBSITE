require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

const logger = pino({ level: 'silent' });

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./.baileys_auth');

    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: ['PCL ERP', 'Chrome', '10.0'],
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            clientStatus = 'QR_READY';
            qrDataURL = await qrcode.toDataURL(qr);
            console.log('QR Code Generated - Ready to scan');
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Status:', statusCode, '| Reconnecting:', shouldReconnect);
            
            clientStatus = 'DISCONNECTED';
            qrDataURL = null;

            if (shouldReconnect) {
                setTimeout(() => startWhatsApp(), 3000);
            } else {
                console.log('Logged out. Clear auth to re-link.');
            }
        }

        if (connection === 'open') {
            clientStatus = 'CONNECTED';
            qrDataURL = null;
            console.log('WhatsApp Client is Ready!');
        }
    });
}

startWhatsApp();

// Express Endpoints
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        status: clientStatus,
        qr: qrDataURL
    });
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
        }
        // Clear auth files
        const fs = require('fs');
        const path = require('path');
        const authDir = path.join(__dirname, '.baileys_auth');
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
        }
        clientStatus = 'DISCONNECTED';
        qrDataURL = null;
        // Restart to get a new QR
        setTimeout(() => startWhatsApp(), 1000);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
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

// The Throttle Queue Loop
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
            console.error('Supabase queue fetch error:', error);
            isProcessingQueue = false;
            return;
        }

        if (pendingMsgs && pendingMsgs.length > 0) {
            const msg = pendingMsgs[0];
            console.log(`Processing message for ${msg.phone}...`);
            
            let jid = '';
            let isGroup = msg.phone.length > 13 || msg.phone.startsWith('G:');
            
            if (isGroup) {
                const cleanId = msg.phone.replace('G:', '').replace('@g.us', '');
                jid = cleanId + '@g.us';
            } else {
                let formattedPhone = msg.phone.replace(/[^0-9]/g, '');
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
                    
                console.log(`Successfully sent to ${formattedPhone}`);
            } catch (err) {
                console.error(`Failed to send to ${formattedPhone}:`, err.message);
                await supabase.from('whatsapp_queue')
                    .update({ status: 'FAILED', error_log: err.message })
                    .eq('id', msg.id);
            }
        }
    } catch (err) {
        console.error('Queue processing error:', err);
    }

    isProcessingQueue = false;
}

// Run the queue every 20 seconds
setInterval(processQueue, 20000);

const PORT = process.env.PORT || process.env.WA_PORT || 3005;
app.listen(PORT, () => {
    console.log(`Backend WhatsApp Engine listening on port ${PORT}`);
});
\n
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
            
            // 1. WhatsApp Global Broadcast
            const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
            if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
                const groupNotifs = globalSet.value.map(groupId => ({
                    phone: groupId,
                    message: `*Reminder: ${event.type === 'holiday' ? 'Holiday' : 'Campus Leave'} Tomorrow!*\n\n${event.title}\nDate: ${new Date(event.start_date).toLocaleDateString()}\n\n${event.description || ''}\n\n- Prudentia College of Law`,
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

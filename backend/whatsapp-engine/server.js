require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

let qrDataURL = null;
let clientStatus = 'DISCONNECTED'; // DISCONNECTED, QR_READY, CONNECTED
let isProcessingQueue = false;

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu', '--single-process']
    }
});

client.on('qr', async (qr) => {
    clientStatus = 'QR_READY';
    qrDataURL = await qrcode.toDataURL(qr);
    console.log('QR Code Generated - Ready to scan');
});

client.on('ready', () => {
    clientStatus = 'CONNECTED';
    qrDataURL = null;
    console.log('WhatsApp Client is Ready!');
});

client.on('disconnected', (reason) => {
    clientStatus = 'DISCONNECTED';
    console.log('WhatsApp Client was disconnected:', reason);
    client.initialize(); // Try to reconnect
});

client.initialize();

// Express Endpoints
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        status: clientStatus,
        qr: qrDataURL
    });
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        await client.logout();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// The Throttle Queue Loop
async function processQueue() {
    if (isProcessingQueue || clientStatus !== 'CONNECTED') return;
    isProcessingQueue = true;

    try {
        // Fetch oldest pending message
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
            
            // Format phone number (append @c.us for WhatsApp)
            let formattedPhone = msg.phone.replace(/[^0-9]/g, '');
            if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
                formattedPhone = '91' + formattedPhone;
            }
            const chatId = `${formattedPhone}@c.us`;

            try {
                // Check if registered
                const isRegistered = await client.isRegisteredUser(chatId);
                if (!isRegistered) {
                    throw new Error('Phone number not registered on WhatsApp');
                }

                // Send message
                await client.sendMessage(chatId, msg.message);
                
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

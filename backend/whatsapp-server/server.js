const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

let currentStatus = 'INITIALIZING';
let qrCodeData = null;
let client = null;

const initializeWhatsApp = () => {
    console.log("Initializing WhatsApp Client...");
    currentStatus = 'INITIALIZING';
    qrCodeData = null;

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', 
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', async (qr) => {
        console.log("QR Code received! Waiting for scan...");
        try {
            qrCodeData = await qrcode.toDataURL(qr);
            currentStatus = 'QR_READY';
        } catch (err) {
            console.error("Failed to generate QR Code data URL", err);
        }
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        currentStatus = 'AUTHENTICATED';
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Authenticated!');
    });

    client.on('auth_failure', msg => {
        console.error('WhatsApp Authentication failure:', msg);
        currentStatus = 'FAILED';
        qrCodeData = null;
    });

    client.on('disconnected', (reason) => {
        console.log('WhatsApp Client was disconnected:', reason);
        currentStatus = 'DISCONNECTED';
        qrCodeData = null;
        
        // Auto-reinitialize after a brief delay
        setTimeout(() => {
            initializeWhatsApp();
        }, 5000);
    });

    client.initialize().catch(err => {
        console.error("Initialization failed:", err);
        currentStatus = 'FAILED';
    });
};

// Start WhatsApp
initializeWhatsApp();

// API Endpoints
app.get('/api/status', (req, res) => {
    res.json({
        status: currentStatus,
        qrCode: qrCodeData
    });
});

app.post('/api/send', async (req, res) => {
    if (currentStatus !== 'AUTHENTICATED' || !client) {
        return res.status(400).json({ success: false, error: 'WhatsApp is not connected.' });
    }

    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ success: false, error: 'Phone number and message are required.' });
    }

    try {
        // Format the number (assuming Indian prefix by default if 10 digits)
        let formattedNumber = number.replace(/\D/g, ''); // Remove non-digits
        if (formattedNumber.length === 10) {
            formattedNumber = `91${formattedNumber}`; // Default to India +91
        }
        
        // WhatsApp Web JS requires the number with @c.us suffix
        const chatId = `${formattedNumber}@c.us`;

        // Check if registered on WhatsApp
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            return res.status(400).json({ success: false, error: 'Number is not registered on WhatsApp.' });
        }

        // Send message
        const response = await client.sendMessage(chatId, message);
        console.log(`Message sent to ${formattedNumber}`);
        
        res.json({ success: true, messageId: response.id._serialized });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to send message' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`WhatsApp Engine running on port ${PORT}`);
});

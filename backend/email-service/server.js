require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
});

let emailStats = { sent: 0, failed: 0, pending: 0, lastFailureReason: null };
let emailLogs = [];

// Emulate the Vercel API endpoint for local development
app.post('/api/send-email', async (req, res) => {
    try {
        const { to_email, subject, message_body, attachments } = req.body;
        
        if (!to_email || !subject || !message_body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const mailOptions = {
            from: `"Prudentia College of Law" <${process.env.EMAIL_USER}>`,
            to: to_email,
            subject: subject,
            html: message_body
        };

        if (attachments && Array.isArray(attachments)) {
            mailOptions.attachments = attachments;
        }

        await transporter.sendMail(mailOptions);
        emailStats.sent++;
        emailLogs.unshift({ id: Date.now(), to: to_email, subject, status: 'SENT', time: new Date() });
        if (emailLogs.length > 50) emailLogs.pop();
        
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        emailStats.failed++;
        emailStats.lastFailureReason = error.message;
        emailLogs.unshift({ id: Date.now(), to: req.body?.to_email || 'Unknown', subject: req.body?.subject || 'Unknown', status: 'FAILED', error: error.message, time: new Date() });
        if (emailLogs.length > 50) emailLogs.pop();
        console.error('Email send failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/email/stats', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ health: 'ONLINE', stats: emailStats, logs: emailLogs });
    } catch (e) {
        res.json({ health: 'OFFLINE', stats: emailStats, logs: emailLogs, error: e.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend Email Server listening on port ${PORT}`);
});

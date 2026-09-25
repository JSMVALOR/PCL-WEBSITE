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
        
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend Email Server listening on port ${PORT}`);
});

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
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/email/send', async (req, res) => {
    try {
        const { to, subject, html } = req.body;
        
        await transporter.sendMail({
            from: `"Prudentia ERP" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend Email Server listening on port ${PORT}`);
});

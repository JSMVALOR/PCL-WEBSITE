const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

app.post('/send-email', async (req, res) => {
    const { to_email, subject, message_body } = req.body;
    
    if (!to_email || !subject || !message_body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
        from: `Prudentia College of Law <${EMAIL_USER}>`,
        to: to_email,
        subject: subject,
        html: message_body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to_email}: ` + info.response);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: error.toString() });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`PCL Email Server running on port ${PORT}`);
    console.log(`Using email from .env: ${EMAIL_USER}`);
});

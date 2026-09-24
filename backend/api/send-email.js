import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers
  const allowedOrigin = process.env.VITE_SITE_URL || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to_email, subject, message_body, attachments } = req.body;
  
  if (!to_email || !subject || !message_body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
      from: `Prudentia College of Law <${process.env.EMAIL_USER}>`,
      to: to_email,
      subject: subject,
      html: message_body,
  };

  if (attachments && Array.isArray(attachments)) {
      mailOptions.attachments = attachments;
  }

  try {
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ success: true, message: 'Email sent successfully with attachments.' });
  } catch (error) {
    console.error('Vercel Email Error:', error);
    return res.status(500).json({ error: 'Internal Server Error: Failed to send email' });
  }
}

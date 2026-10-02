import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailHandler from './api/send-email.js';

dotenv.config({ path: '../.env' }); // Load env variables from root if needed
dotenv.config(); // Load from current dir if needed

const app = express();
app.use(cors());
app.use(express.json());

app.all('/api/send-email', async (req, res) => {
    // Mock the Vercel handler (which expects req, res)
    await emailHandler(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Local API Mock Server running on http://localhost:${PORT}`);
    console.log(`✅ Vite proxy will forward /api requests here.`);
});

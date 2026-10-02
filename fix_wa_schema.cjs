require('dotenv').config();
const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    
    try {
        await client.connect();
        console.log("Connected to DB!");
        await client.query("ALTER TABLE public.whatsapp_queue ALTER COLUMN phone TYPE TEXT;");
        console.log("Successfully altered whatsapp_queue phone column to TEXT.");
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await client.end();
    }
}
run();

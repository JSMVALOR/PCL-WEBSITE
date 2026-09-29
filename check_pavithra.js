import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: pData } = await provisionClient.from('profiles').select('id, full_name, email').ilike('full_name', '%Pavi%');
    console.log("Pavithra Profile:", pData);
}
run();

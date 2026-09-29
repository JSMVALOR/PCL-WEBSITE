import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data } = await provisionClient.from('faculty_profiles').select('*').limit(3);
    console.log(data);
}
run();

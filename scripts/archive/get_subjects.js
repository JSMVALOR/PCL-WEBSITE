import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: msData } = await provisionClient.from('master_subjects').select('*');
    const { data: bData } = await provisionClient.from('academic_batches').select('*');
    const { data: pData } = await provisionClient.from('profiles').select('*').eq('role', 'faculty');
    const { data: csData } = await provisionClient.from('cohort_subjects').select('*');
    fs.writeFileSync('debug_data.json', JSON.stringify({ msData, bData, pData, csData }, null, 2));
}
run();

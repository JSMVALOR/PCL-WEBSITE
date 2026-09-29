import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data } = await provisionClient.from('master_subjects').select('id, subject_name, subject_code').ilike('subject_name', '%english%');
    console.log("English Subjects:", data);
    
    const { data: bba } = await provisionClient.from('cohort_subjects')
        .select('master_subject_id, faculty_id, master_subjects(subject_name, subject_code)')
        .eq('batch_id', '17eea294-112e-477e-b9d5-33870698908d'); // BBA LLB (Class of 2031)
    console.log("BBA LLB Subjects:", bba);
}
run();

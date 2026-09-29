import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: msData } = await provisionClient.from('master_subjects').select('id, subject_name').ilike('subject_name', '%English%');
    console.log("English Subjects:", msData);

    // Using service role to bypass any RLS on cohort_subjects just in case? No, I'll use anon
    const { data: csData } = await provisionClient.from('cohort_subjects').select('id, batch_id, master_subject_id, faculty_id');
    
    let englishInCohort = csData.filter(c => msData.some(m => m.id === c.master_subject_id));
    console.log("English in Cohort:", englishInCohort);
}
run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: masterSubjects } = await supabase.from('master_subjects').select('*');
    const { data: batches } = await supabase.from('academic_batches').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'faculty');

    console.log("Master Subjects:");
    masterSubjects.forEach(s => console.log(`- ${s.name} (${s.code}) [ID: ${s.id}]`));
    
    console.log("\nBatches:");
    batches.forEach(b => console.log(`- ${b.name} [ID: ${b.id}]`));

    console.log("\nFaculties:");
    profiles.forEach(p => console.log(`- ${p.full_name} [ID: ${p.id}]`));
}
run();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function run() {
    const { data: batches } = await supabase.from('student_batches').select('id, batch_name, program');
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code');
    const { data: faculty } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
    
    console.log("Batches:", batches);
    console.log("Subjects:", subjects);
    console.log("Faculty:", faculty);
}
run();

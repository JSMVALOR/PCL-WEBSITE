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
    const { data: profiles } = await supabase.from('profiles').select('academic_batch, role').eq('role', 'student');
    const batches = [...new Set(profiles.map(p => p.academic_batch).filter(Boolean))];
    console.log("Unique Student Batches:", batches);
}
run();

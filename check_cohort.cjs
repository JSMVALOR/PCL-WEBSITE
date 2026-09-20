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
    const facultyId = 'cd51a5fe-9e55-4668-8b55-9ff1c83ea6c8';
    const { data } = await supabase.from('cohort_subjects').select('*').eq('faculty_id', facultyId);
    console.log("Existing cohorts:", data.length);
}
run();

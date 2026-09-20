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
    const { data: m } = await supabase.from('mentorship').select('student_id').limit(1);
    if (!m || m.length === 0) return console.log("No mentorship");
    
    const sid = m[0].student_id;
    console.log("student_id:", sid);
    const { data: p } = await supabase.from('profiles').select('id, role').eq('id', sid);
    console.log("profile:", p);
}
run();

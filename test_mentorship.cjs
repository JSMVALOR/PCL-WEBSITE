const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('mentorship').select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, avatar_url)').eq('student_id', '51b30956-4d58-444c-9ea0-18a7a1792f33').eq('status', 'active');
    console.log(error);
}
check();

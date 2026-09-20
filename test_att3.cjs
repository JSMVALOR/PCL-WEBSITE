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
    const { data, error } = await supabase.from('class_sessions').select('*').eq('id', '743f24f2-d672-4001-adbf-d4f3b793c579');
    console.log(data);
    
    // also test the join explicitly
    const { data: d2, error: e2 } = await supabase.from('attendance_records').select('id, class_sessions(id, date)').eq('id', '3493ad7a-7979-4fc8-a7c4-3e1130c11c0d');
    console.log(d2, e2);
}
check();

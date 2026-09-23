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
    const { data: d1 } = await supabase.from('class_schedule').select('*').limit(1);
    console.log("class_schedule:", d1);
    const { data: d2 } = await supabase.from('master_subjects').select('*').limit(1);
    console.log("master_subjects:", d2);
    const { data: d3 } = await supabase.from('profiles').select('*').limit(1);
    console.log("profiles:", d3);
}
check();

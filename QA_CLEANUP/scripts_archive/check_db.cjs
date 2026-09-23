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
    const r1 = await supabase.from('notices').select('requires_acknowledgement').limit(1);
    const r2 = await supabase.from('moot_bids').select('*').limit(1);
    const r3 = await supabase.from('exam_results').select('*').limit(1);
    console.log("notices error:", r1.error?.message);
    console.log("moot_bids error:", r2.error?.message);
    console.log("exam_results error:", r3.error?.message);
}
run();

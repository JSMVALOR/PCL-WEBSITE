const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

const selects = [
    // just a quick smoke test on the heavily used ones
    { table: 'mentorship', query: 'id, faculty_id, student_id, status' },
    { table: 'moot_bids', query: 'id, moot_id, student_id, research_memo, status, created_at' },
    { table: 'profiles', query: 'id, full_name, erp_id, programme, profile_picture_url, academic_batch' }
];

async function run() {
    for (const q of selects) {
        const { error } = await supabase.from(q.table).select(q.query).limit(1);
        if (error) console.log(`Error in ${q.table}: ${error.message}`);
        else console.log(`${q.table} OK`);
    }
}
run();

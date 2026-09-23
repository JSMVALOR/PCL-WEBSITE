const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);
async function test() {
    const { data, error } = await supabase.from('class_sessions').select('id, present_count, total_students, schedule_id').limit(5);
    console.log(data);
    
    if (data && data.length > 0) {
        const schIds = data.map(d => d.schedule_id);
        const { data: schData } = await supabase.from('class_schedule').select('id, subject_id, cohort_id, batch_id').in('id', schIds);
        console.log("Schedules:", schData);
    }
}
test();

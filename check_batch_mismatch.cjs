const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envPath = '.env';
let url = '', key = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) url = urlMatch[1].trim();
    if (keyMatch) key = keyMatch[1].trim();
}
const supabase = createClient(url, key);

async function check() {
    const { data: sched } = await supabase.from('class_schedule').select('batch').limit(5);
    console.log("class_schedule batches:", sched);
    
    const { data: cohort } = await supabase.from('cohort_subjects').select('batch_id').limit(5);
    console.log("cohort_subjects batches:", cohort);
}
check();

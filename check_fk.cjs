const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data, error } = await supabase.from('class_schedule').select('subject_id, subject:master_subjects(name)').limit(1);
    console.log(data || error);
}
run();

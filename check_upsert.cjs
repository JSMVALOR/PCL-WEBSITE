const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: sched } = await supabase.from('class_schedule').select('*').limit(1);
    if (!sched || sched.length === 0) return console.log("No schedule");
    
    const testUpdate = {
        id: sched[0].id,
        master_subject_id: sched[0].master_subject_id,
        faculty_id: sched[0].faculty_id
    };
    const { error } = await supabase.from('class_schedule').upsert([testUpdate]);
    console.log("Upsert error:", error);
}
run();

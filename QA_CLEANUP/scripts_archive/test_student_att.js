import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    // Check if attendance_records table exists and has FK to class_sessions
    const r1 = await supabase.from('attendance_records').select('*').limit(1);
    console.log("attendance_records:", JSON.stringify(r1));
    
    // Check the join
    const r2 = await supabase.from('attendance_records')
        .select('id, entry_status, session:class_sessions(id, date, status, schedule_id)')
        .limit(1);
    console.log("FK join:", JSON.stringify(r2));
    
    // Check class_schedule join from master_subjects
    const r3 = await supabase.from('class_schedule')
        .select('id, start_time, subject:master_subjects(id, name, code)')
        .limit(1);
    console.log("schedule->subject join:", JSON.stringify(r3));
}
test();

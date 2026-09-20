import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    // Without faculty_id
    const r = await supabase.from('class_schedule')
        .select('id, start_time, end_time, room_id, batch, subject:master_subjects(id, name, code), room:academic_classrooms(name)')
        .limit(1);
    console.log("Without faculty_id:", JSON.stringify(r));
    
    // Check if class_schedule has faculty_id directly
    const r2 = await supabase.from('class_schedule').select('*').limit(1);
    console.log("class_schedule cols:", JSON.stringify(r2));
}
test();

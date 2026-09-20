import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r = await supabase.from('class_schedule')
        .select('id, start_time, end_time, room_id, batch, subject:master_subjects(id, name, code, faculty_id), room:academic_classrooms(name)')
        .limit(1);
    console.log("full join:", JSON.stringify(r));
}
test();

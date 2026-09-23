import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r = await supabase.from('mark_correction_requests').select('*, faculty:profiles!mark_correction_requests_faculty_id_fkey(full_name), student:profiles!mark_correction_requests_student_id_fkey(full_name)').limit(1);
    console.log("mark_correction_requests:", JSON.stringify(r.error));
}
test();

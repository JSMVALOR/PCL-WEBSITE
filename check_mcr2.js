import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r = await supabase.from('mark_correction_requests').select('*, faculty:profiles!faculty_id(full_name), student:profiles!student_id(full_name), subject:master_subjects(name, code)').limit(1);
    console.log("mark_correction_requests 2:", JSON.stringify(r.error));
}
test();

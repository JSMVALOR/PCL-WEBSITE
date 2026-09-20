import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r1 = await supabase.from('faculty_leave_requests').select('*').limit(1);
    console.log("faculty_leave_requests:", JSON.stringify(r1));
    const r2 = await supabase.from('leave_requests').select('*').limit(0);
    console.log("leave_requests cols:", Object.keys(r2.data?.[0] || {}));
    // Try to get actual column names via an insert that lists them
    const r3 = await supabase.from('leave_requests').insert({student_id:'00000000-0000-0000-0000-000000000000',start_date:'2026-01-01',end_date:'2026-01-02',reason:'test',status:'pending',leave_type:'test',request_id:'LR-0000',document_path:'/test'});
    console.log("leave_requests insert test:", JSON.stringify(r3.error));
}
test();

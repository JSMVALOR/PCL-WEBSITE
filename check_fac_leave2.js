import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    // Test what columns exist on faculty_leave_requests
    const r1 = await supabase.from('faculty_leave_requests').insert({faculty_id:'fac00000-0000-0000-0000-000000000000',from_date:'2026-01-01',to_date:'2026-01-02'});
    console.log("fac from_date:", JSON.stringify(r1.error));
    const r2 = await supabase.from('faculty_leave_requests').insert({faculty_id:'fac00000-0000-0000-0000-000000000000',start_date:'2026-01-01',end_date:'2026-01-02'});
    console.log("fac start_date:", JSON.stringify(r2.error));
    
    // Test leave_requests without document_path
    const r3 = await supabase.from('leave_requests').insert({student_id:'00000000-0000-0000-0000-000000000000',start_date:'2026-01-01',end_date:'2026-01-02',reason:'test',status:'pending',leave_type:'test',request_id:'LR-0000'});
    console.log("leave request_id:", JSON.stringify(r3.error));
    
    // Without request_id
    const r4 = await supabase.from('leave_requests').insert({student_id:'00000000-0000-0000-0000-000000000000',start_date:'2026-01-01',end_date:'2026-01-02',reason:'test',status:'pending',leave_type:'test'});
    console.log("leave minimal:", JSON.stringify(r4.error));
    
    // marks_ledger -> master_subjects FK test
    const r5 = await supabase.from('marks_ledger').select('*, master_subjects(name, code)').limit(1);
    console.log("marks FK:", JSON.stringify(r5.error));
}
test();

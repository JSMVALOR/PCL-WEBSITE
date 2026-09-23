import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const res = await supabase.from('leave_requests').select('*').limit(0);
    console.log("Status:", res.status, "Error:", JSON.stringify(res.error));
    
    // Try inserting with mentor_id to see if column exists
    const test2 = await supabase.from('leave_requests').insert({
        student_id: '00000000-0000-0000-0000-000000000000',
        mentor_id: '00000000-0000-0000-0000-000000000000',
        start_date: '2026-09-20',
        end_date: '2026-09-21',
        total_days: 1,
        reason: 'test',
        status: 'pending'
    });
    console.log("Insert test:", JSON.stringify(test2.error));
}
test();

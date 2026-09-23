import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    // Try without mentor_id
    const test1 = await supabase.from('leave_requests').insert({
        student_id: '00000000-0000-0000-0000-000000000000',
        start_date: '2026-09-20',
        end_date: '2026-09-21',
        total_days: 1,
        reason: 'test',
        status: 'pending'
    });
    console.log("Without mentor_id:", JSON.stringify(test1.error));
    
    // Get actual columns by selecting one row
    const test2 = await supabase.from('leave_requests').select('*').limit(1);
    console.log("Columns sample:", JSON.stringify(test2));
}
test();

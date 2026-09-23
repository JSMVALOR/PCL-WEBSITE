import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    // Try bare minimum
    const test1 = await supabase.from('leave_requests').insert({
        student_id: '00000000-0000-0000-0000-000000000000',
        start_date: '2026-09-20',
        end_date: '2026-09-21',
        reason: 'test',
        status: 'pending'
    });
    console.log("Minimal:", JSON.stringify(test1.error));
    
    // Try even more minimal
    const test2 = await supabase.from('leave_requests').insert({
        student_id: '00000000-0000-0000-0000-000000000000',
        reason: 'test'
    });
    console.log("Ultra minimal:", JSON.stringify(test2.error));
}
test();

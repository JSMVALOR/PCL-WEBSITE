import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const res = await supabase.from('assignments').insert({
        faculty_id: 'fac00000-0000-0000-0000-000000000000',
        subject_id: '00000000-0000-0000-0000-000000000000',
        batch: 'BBA LLB',
        title: 'test',
        description: 'test',
        total_marks: 20,
        due_date: '2026-09-30'
    });
    console.log(JSON.stringify(res, null, 2));
}
test();

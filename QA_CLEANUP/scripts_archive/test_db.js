import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const res = await supabase.from('assignments').select('*').limit(1);
    console.log(JSON.stringify(res, null, 2));
}
test();

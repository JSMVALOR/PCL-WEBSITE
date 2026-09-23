import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r = await supabase.from('faculty_leaves').select('*').limit(1);
    console.log("faculty_leaves:", JSON.stringify(r));
}
test();

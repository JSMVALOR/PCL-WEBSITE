import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const r = await supabase.from('mark_correction_requests').select('*').limit(1);
    console.log("columns:", Object.keys(r.data?.[0] || {}));
}
test();

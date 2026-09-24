import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    let res = await supabase.from('mentorship_groups').select('*').limit(1).catch(() => ({error: {code: 'not found'}}));
    console.log("mentorship_groups:", res.error ? res.error.message : Object.keys(res.data[0] || {}));
    
    let res2 = await supabase.from('mentee_assignments').select('*').limit(1).catch(() => ({error: {code: 'not found'}}));
    console.log("mentee_assignments:", res2.error ? res2.error.message : Object.keys(res2.data[0] || {}));
}
run();

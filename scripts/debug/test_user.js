import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: profiles } = await supabase.from('profiles').select('semester, academic_batch, role').eq('role', 'student').limit(1);
    console.log("Profiles:", profiles);
}
run();

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    let res = await supabase.from('noc_requests').select('*').limit(1);
    console.log("noc_requests cols:", Object.keys(res.data[0] || {}));
    
    res = await supabase.from('internships').select('*').limit(1);
    console.log("internships cols:", Object.keys(res.data[0] || {}));
}
run();

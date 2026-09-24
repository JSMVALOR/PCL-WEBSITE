import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    let res = await supabase.from('noc_requests').select('*').limit(1);
    if(res.error) console.log(res.error);
    else console.log(res.data.length ? Object.keys(res.data[0]) : "No rows, cannot infer columns from empty dataset");
}
run();

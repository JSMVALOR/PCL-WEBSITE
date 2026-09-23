import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: noc } = await supabase.from('noc_requests').select('*').limit(1).catch(() => ({data: null}));
    console.log("noc_requests exists:", !!noc);
    const { data: int } = await supabase.from('internships').select('*').limit(1).catch(() => ({data: null}));
    console.log("internships exists:", !!int);
    const { data: perm } = await supabase.from('internship_permissions').select('*').limit(1).catch(() => ({data: null}));
    console.log("internship_permissions exists:", !!perm);
}
run();

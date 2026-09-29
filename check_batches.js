import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://ltcsfdoawpmbdalisagj.supabase.co", "sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT");
async function run() {
  const { data } = await supabase.from('academic_batches').select('*').limit(1);
  console.log(data ? Object.keys(data[0]) : "No data");
}
run();

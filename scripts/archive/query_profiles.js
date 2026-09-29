import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://ltcsfdoawpmbdalisagj.supabase.co", "sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT");
async function run() {
  const { data } = await supabase.from('profiles').select('erp_id, full_name, profile_picture_url');
  console.log(data);
}
run();

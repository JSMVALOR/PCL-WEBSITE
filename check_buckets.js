import { createClient } from '@supabase/supabase-js';
const supabase = createClient("https://ltcsfdoawpmbdalisagj.supabase.co", "sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT");
async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log(data);
}
run();

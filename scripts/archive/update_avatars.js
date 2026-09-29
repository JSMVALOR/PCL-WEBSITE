import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ltcsfdoawpmbdalisagj.supabase.co";
const supabaseKey = "sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const updates = [
    { erp_id: 'FAC1000', url: '/assets/people/Dr_Sneha_Mulla.png' },
    { erp_id: 'FAC1001', url: '/assets/people/tarun_tyagi.jpg' },
    { erp_id: 'FAC1002', url: '/assets/people/bhumika.jpg' },
    { erp_id: 'FAC1003', url: '/assets/people/n_pranay_goud.jpg' },
    { erp_id: 'LIB1001', url: '/assets/people/karnati_jyothi.jpg' },
    { erp_id: 'FAC1004', url: '/assets/people/badri_supriya.jpg' },
    { erp_id: 'FAC1005', url: '/assets/people/venugopal_narayanadas.jpg' },
    { erp_id: 'ADM0001', url: '/assets/people/Dr_Sneha_Mulla.png' }
  ];

  for (const u of updates) {
    const { error } = await supabase.from('profiles').update({ profile_picture_url: u.url }).eq('erp_id', u.erp_id);
    if (error) console.error("Error for", u.erp_id, error);
    else console.log("Updated", u.erp_id);
  }
}
run();

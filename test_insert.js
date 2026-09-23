import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { error } = await supabase.from('noc_requests').insert({
        student_id: 'test_uuid', // Need a valid UUID or just test to see if it complains about type
        company_name: 'Test',
        duration: `2026-09-14 to 2026-09-20`,
        offer_letter_path: 'https://drive.google.com/test',
        status: 'pending_mentor',
        mentor_name: "Assigned Mentor",
        hod_name: "Pending"
    });
    console.log("Error:", error);
}
run();

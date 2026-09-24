import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code, syllabus');
    
    let count = 0;
    
    if (subjects) {
        subjects.forEach(sub => {
            if (sub.syllabus && !sub.syllabus['Course Content']) {
                if (count < 5) {
                    console.log(sub.code, "keys:", Object.keys(sub.syllabus));
                }
                count++;
            }
        });
    }
    console.log("Total missing:", count);
}
run();

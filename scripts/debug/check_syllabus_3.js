import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code, syllabus');
    
    let missingContent = [];
    
    if (subjects) {
        subjects.forEach(sub => {
            if (sub.syllabus && !sub.syllabus['Course Content']) {
                missingContent.push(sub.code);
            }
        });
    }
    
    console.log("Missing Course Content count:", missingContent.length);
    console.log("Samples:", missingContent.slice(0, 5));
}
run();

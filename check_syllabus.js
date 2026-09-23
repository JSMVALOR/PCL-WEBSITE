import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code, syllabus');
    
    const missing = [];
    
    if (subjects) {
        subjects.forEach(sub => {
            if (!sub.syllabus || Object.keys(sub.syllabus).length === 0) {
                missing.push(`${sub.code} - ${sub.name}`);
            }
        });
    }
    
    console.log("Total Subjects:", subjects ? subjects.length : 0);
    console.log("Missing Syllabus Count:", missing.length);
    console.log("Subjects missing syllabus:");
    missing.forEach(m => console.log(" - " + m));
}
run();

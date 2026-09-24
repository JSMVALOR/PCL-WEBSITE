import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code, syllabus').limit(5);
    
    if (subjects) {
        subjects.forEach(sub => {
            console.log(`${sub.code} type: ${typeof sub.syllabus}, isArray: ${Array.isArray(sub.syllabus)}, value:`, sub.syllabus);
        });
    }
}
run();

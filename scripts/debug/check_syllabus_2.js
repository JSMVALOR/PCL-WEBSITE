import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ltcsfdoawpmbdalisagj.supabase.co'
const supabaseAnonKey = 'sb_publishable_oGVMAQxGEGnNDA7C7maEfg_Sbyo0qZT'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code, syllabus');
    
    let stringCount = 0;
    let objectCount = 0;
    let emptyCount = 0;
    let missingFieldCount = 0;
    
    if (subjects) {
        subjects.forEach(sub => {
            if (!sub.syllabus) {
                emptyCount++;
                return;
            }
            if (typeof sub.syllabus === 'string') {
                stringCount++;
                if (sub.syllabus.trim() === '' || sub.syllabus.trim() === '{}' || sub.syllabus.trim() === '[]') emptyCount++;
            } else if (typeof sub.syllabus === 'object') {
                objectCount++;
                if (Object.keys(sub.syllabus).length === 0) emptyCount++;
                else if (!sub.syllabus['Course Content'] && !sub.syllabus['Course Title']) {
                    missingFieldCount++;
                    // console.log("Missing expected keys in:", sub.code);
                }
            }
        });
    }
    
    console.log("Total Subjects:", subjects ? subjects.length : 0);
    console.log("String Type Count:", stringCount);
    console.log("Object Type Count:", objectCount);
    console.log("Empty/Null Count:", emptyCount);
    console.log("Missing expected keys (Course Content / Title) Count:", missingFieldCount);
}
run();

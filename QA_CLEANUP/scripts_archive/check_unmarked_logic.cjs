const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envPath = '.env';
let url = '', key = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) url = urlMatch[1].trim();
    if (keyMatch) key = keyMatch[1].trim();
}
const supabase = createClient(url, key);

async function check() {
    console.log("--- SCHEMAS ---");
    // Get schedule
    const { data: sched } = await supabase.from('class_schedule').select('*').limit(5);
    console.log("Sample class_schedule:", sched);
    
    // Get sessions
    const { data: sess } = await supabase.from('class_sessions').select('*').limit(5);
    console.log("Sample class_sessions:", sess);

    // Get attendance records
    const { data: att } = await supabase.from('attendance_records').select('*').limit(5);
    console.log("Sample attendance_records:", att);
    
    // Check specific Student 'Swaroop' (from Image 2)
    const { data: stud } = await supabase.from('profiles').select('*').ilike('full_name', '%Swaroop%').single();
    if (stud) {
        console.log("Student Found:", stud.full_name, "Batch:", stud.academic_batch);
        
        // Find their schedule
        const { data: mySched } = await supabase.from('class_schedule').select('*').eq('batch', stud.academic_batch);
        console.log(`Student's schedule has ${mySched?.length || 0} slots.`);
        
        // Check days of week
        console.log("Days of week in their schedule:", mySched?.map(s => s.day_of_week));
    }
}
check();

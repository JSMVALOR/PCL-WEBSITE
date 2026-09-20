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
    // 1. Get the student's batch
    const { data: stud } = await supabase.from('profiles').select('*').ilike('full_name', '%Swaroop%').single();
    if (!stud) return console.log("Student not found");
    
    // 2. Get schedule for batch
    const { data: sched } = await supabase.from('class_schedule').select('*').eq('batch', stud.academic_batch);
    console.log("Schedule length:", sched.length);
    console.log("Days of week:", sched.map(s => s.day_of_week));

    // 3. Get all sessions for this schedule
    const schedIds = sched.map(s => s.id);
    const { data: sessions } = await supabase.from('class_sessions').select('*').in('schedule_id', schedIds);
    console.log("Sessions found for this schedule:", sessions.length);

    if (sessions.length > 0) {
        console.log("Session dates:", sessions.map(s => s.date));
    }
}
check();

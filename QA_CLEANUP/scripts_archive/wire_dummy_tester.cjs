const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function run() {
    console.log("Starting dummy tester wire-up...");

    const facultyId = 'fac00000-0000-0000-0000-000000000000';
    
    const { data: cohorts } = await supabase.from('cohort_subjects').select('*').eq('faculty_id', facultyId);
    if (!cohorts || cohorts.length === 0) return console.log("No cohorts found for Dummy Tester");
    
    // Clear old schedules & sessions for this faculty
    await supabase.from('class_sessions').delete().eq('faculty_id', facultyId);
    await supabase.from('class_schedule').delete().eq('faculty_id', facultyId);
    
    const schedules = [];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let dayIndex = 0;
    
    cohorts.forEach((c) => {
        // Assign Section I
        schedules.push({
            faculty_id: facultyId,
            subject_id: c.master_subject_id,
            batch: 'LLB Section I',
            day_of_week: days[dayIndex % 5],
            start_time: '09:00:00',
            end_time: '10:00:00',
            status: 'Scheduled'
        });
        
        // Assign Section II on the same day but different time
        schedules.push({
            faculty_id: facultyId,
            subject_id: c.master_subject_id,
            batch: 'LLB Section II',
            day_of_week: days[dayIndex % 5],
            start_time: '10:30:00',
            end_time: '11:30:00',
            status: 'Scheduled'
        });
        
        dayIndex++;
    });
    
    const { data: insSch, error: schErr } = await supabase.from('class_schedule').insert(schedules).select();
    if(schErr) return console.log("Schedule Error", schErr);
    
    console.log("Schedules generated:", insSch.length);
    
    // Generate past classes from Aug 17, 2026 to Sep 20, 2026
    const start = new Date("2026-08-17T00:00:00Z");
    const end = new Date("2026-09-20T00:00:00Z");
    
    const dayMap = { 'Sunday':0, 'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6 };
    let sessionsToInsert = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayInt = d.getDay();
        
        insSch.forEach(sch => {
            if (dayMap[sch.day_of_week] === dayInt) {
                const dateStr = d.toISOString().split('T')[0];
                sessionsToInsert.push({
                    schedule_id: sch.id,
                    faculty_id: facultyId,
                    date: dateStr,
                    status: 'completed',
                    started_at: new Date(`${dateStr}T${sch.start_time}Z`).toISOString(),
                    ended_at: new Date(`${dateStr}T${sch.end_time}Z`).toISOString(),
                    present_count: 0,
                    total_students: 0
                });
            }
        });
    }
    
    const { data: insSess, error: sesErr } = await supabase.from('class_sessions').insert(sessionsToInsert).select();
    if(sesErr) return console.log("Sessions Error", sesErr);
    
    console.log("Sessions generated:", insSess.length);
}
run();

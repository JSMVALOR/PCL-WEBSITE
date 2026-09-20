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
    console.log("Starting data wire-up...");

    const facultyId = 'cd51a5fe-9e55-4668-8b55-9ff1c83ea6c8'; // Bhumika
    
    // 1. Fetch Subjects we want to assign
    const { data: subjects } = await supabase.from('master_subjects').select('id, name, code').ilike('code', '%LLB 10%');
    console.log("Found subjects to assign:", subjects.length);
    
    if (subjects.length === 0) return console.log("No subjects found.");
    
    // Assign Family Law (102) and Constitutional Law (103)
    const sub1 = subjects.find(s => s.code.includes('102'));
    const sub2 = subjects.find(s => s.code.includes('103'));
    
    if(!sub1 || !sub2) return console.log("Specific subjects not found");
    
    // 2. Setup cohort_subjects for Section I and Section II
    await supabase.from('cohort_subjects').delete().eq('faculty_id', facultyId);
    
    const cohorts = [
        { batch_id: 'LLB Section I', faculty_id: facultyId, master_subject_id: sub1.id },
        { batch_id: 'LLB Section I', faculty_id: facultyId, master_subject_id: sub2.id },
        { batch_id: 'LLB Section II', faculty_id: facultyId, master_subject_id: sub1.id },
        { batch_id: 'LLB Section II', faculty_id: facultyId, master_subject_id: sub2.id },
    ];
    
    const { data: insertedCohorts, error: ce } = await supabase.from('cohort_subjects').insert(cohorts).select();
    if(ce) return console.log("Cohort Error", ce);
    
    // 3. Setup Class Schedule
    await supabase.from('class_schedule').delete().eq('faculty_id', facultyId);
    
    // Room ID fallback if needed
    const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
    const roomId = rooms && rooms.length > 0 ? rooms[0].id : null;
    
    const schedules = [
        { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section I', day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
        { faculty_id: facultyId, subject_id: sub2.id, batch: 'LLB Section I', day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
        { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section II', day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
        { faculty_id: facultyId, subject_id: sub2.id, batch: 'LLB Section II', day_of_week: 'Thursday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
    ];
    
    const { data: insertedSchedules, error: se } = await supabase.from('class_schedule').insert(schedules).select();
    if(se) return console.log("Schedule Error", se);
    
    // 4. Generate past classes from Aug 17, 2026 to Sep 20, 2026
    const start = new Date("2026-08-17T00:00:00Z");
    const end = new Date("2026-09-20T00:00:00Z");
    
    // Clean up old sessions
    await supabase.from('class_sessions').delete().eq('faculty_id', facultyId);
    
    const dayMap = { 'Sunday':0, 'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6 };
    let sessionsToInsert = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayInt = d.getDay();
        
        insertedSchedules.forEach(sch => {
            if (dayMap[sch.day_of_week] === dayInt) {
                // Determine if we should mark it as unmarked or completed based on how far in the past it is
                // Let's leave them all as "completed" but without attendance records (so they show up as unmarked in the faculty's UI)
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
    
    // Assign Swaroop to LLB Section I
    await supabase.from('profiles').update({ academic_batch: 'LLB Section I' }).eq('full_name', 'Swaroop Choudary');

    console.log("Wiring completed successfully! Inserted sessions:", insSess.length);
}
run();

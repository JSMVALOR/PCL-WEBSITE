const fs = require('fs');

// Fix FacultyCourses
let p1 = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c1 = fs.readFileSync(p1, 'utf8');

const oldSessionsFetch1 = `// 3. Fetch Sessions
 const { data: sessions } = await supabase
 .from('class_sessions')
 .select('present_count, total_students, status, class_schedule(subject_id)')
 .eq('faculty_id', userSession.db_id)
 .neq('status', 'scheduled');`;

const newSessionsFetch1 = `// 3. Fetch Sessions
 const { data: rawSessions } = await supabase
 .from('class_sessions')
 .select('present_count, total_students, status, schedule_id')
 .eq('faculty_id', userSession.db_id)
 .neq('status', 'scheduled');
 
 let sessions = rawSessions || [];
 if (sessions.length > 0) {
    const { data: schData } = await supabase.from('class_schedule').select('id, subject_id').in('id', sessions.map(s => s.schedule_id).filter(Boolean));
    if (schData) {
        sessions = sessions.map(s => ({ ...s, class_schedule: schData.find(x => x.id === s.schedule_id) }));
    }
 }`;

c1 = c1.replace(oldSessionsFetch1, newSessionsFetch1);
fs.writeFileSync(p1, c1);


// Fix FacultyAttendance
let p2 = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let c2 = fs.readFileSync(p2, 'utf8');

const oldSessionsFetch2 = `const { data: sessions, error: sesError } = await supabase
                .from('class_sessions')
                .select('present_count, total_students, class_schedule(subject_id)')
                .eq('faculty_id', userSession.db_id)
                .neq('status', 'scheduled');`;

const newSessionsFetch2 = `const { data: rawSessions, error: sesError } = await supabase
                .from('class_sessions')
                .select('present_count, total_students, schedule_id, date, status')
                .eq('faculty_id', userSession.db_id)
                .neq('status', 'scheduled');
                
            let sessions = rawSessions || [];
            if (sessions.length > 0) {
                const { data: schData } = await supabase.from('class_schedule').select('id, subject_id').in('id', sessions.map(s => s.schedule_id).filter(Boolean));
                if (schData) {
                    sessions = sessions.map(s => ({ ...s, class_schedule: schData.find(x => x.id === s.schedule_id) }));
                }
            }`;

c2 = c2.replace(oldSessionsFetch2, newSessionsFetch2);
fs.writeFileSync(p2, c2);

console.log("Patched to use in-memory JS joins for sessions.");

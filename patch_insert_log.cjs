const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /const \{ data: newSession, error: insertError \} = await supabase.from\('class_sessions'\).insert\(\{/g,
    `console.log("INSERTING:", { schedule_id: missedSlot.sch_id, faculty_id: userSession.db_id, date: missedSlot.date });
                const { data: newSession, error: insertError } = await supabase.from('class_sessions').insert({`
);

fs.writeFileSync(path, content);

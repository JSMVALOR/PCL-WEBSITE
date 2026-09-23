const fs = require('fs');
let p = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    ".select('id, start_time, end_time, room, batch, subject:master_subjects(id, name, code, faculty_id)')",
    ".select('id, start_time, end_time, room_id, batch, subject:master_subjects(id, name, code, faculty_id), room:academic_classrooms(name)')"
);

fs.writeFileSync(p, c);
console.log("Attendance query patched");

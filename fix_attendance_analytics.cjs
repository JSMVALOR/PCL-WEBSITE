const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /\.select\('cohort_subject_id, present_count, total_students'\)/,
    `.select('present_count, total_students, schedule:schedule_id(subject_id)')`
);

c = c.replace(
    /const subSessions = \(sessions \|\| \[\]\)\.filter\(s => s\.cohort_subject_id === cs\.id\);/,
    `const subSessions = (sessions || []).filter(s => s.schedule?.subject_id === cs.id);`
);

fs.writeFileSync(p, c);
console.log("Fixed attendance analytics query.");

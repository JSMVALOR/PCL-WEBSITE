const fs = require('fs');
let p = 'src/ERP/components/Student/Timetable/Timetable.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    "subject: s.cohort_subject?.master_subject?.name || 'Unknown',",
    "subject: s.subject?.name || 'Unknown',"
);
c = c.replace(
    "color: s.cohort_subject?.master_subject?.theme_color || 'gray',",
    "color: s.subject?.theme_color || 'gray',"
);
c = c.replace(
    "credits: s.cohort_subject?.master_subject?.credits || 4,",
    "credits: s.subject?.credits || 4,"
);
c = c.replace(
    "faculty: s.cohort_subject?.faculty?.full_name || 'TBA',",
    "faculty: s.faculty?.full_name || 'TBA',"
);

fs.writeFileSync(p, c);
console.log("Timetable mapping fixed");

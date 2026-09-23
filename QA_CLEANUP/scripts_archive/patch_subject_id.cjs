const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /date: missedSlot\.date,/g,
    `date: missedSlot.date,
                    subject_id: missedSlot.subject?.id,`
);

fs.writeFileSync(path, content);
console.log("Patched subject_id.");

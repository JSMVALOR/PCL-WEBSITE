const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /date: todayDate,/g,
    `date: todayDate,
                    subject_id: classData.subject?.id || classData.subject_id,`
);

fs.writeFileSync(path, content);
console.log("Patched start attendance.");

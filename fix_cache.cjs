const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', 'utf8');

content = content.replace(/const cached = sessionStorage\.getItem\(`jsmerp_stu_timetable_\$\{userSession\.academic_batch\}`\);\n\s*if \(cached\) \{\n\s*setSchedule\(JSON\.parse\(cached\)\);\n\s*setLoading\(false\);\n\s*\}/g, '');

content = content.replace(/sessionStorage\.setItem\(`jsmerp_stu_timetable_\$\{userSession\.academic_batch\}`, JSON\.stringify\(formatted\)\);/g, '');

fs.writeFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', content);
console.log('Processed cache removal');

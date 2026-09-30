const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/activeSubject\.course_name/g, 'activeSubject?.course_name');
content = content.replace(/activeSubject\.course_code/g, 'activeSubject?.course_code');

fs.writeFileSync(file, content);

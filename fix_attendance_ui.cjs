const fs = require('fs');
const file = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /setOverallAttendance\(total === 0 \? 0 : Math\.round\(\(present \/ total\) \* 100\)\);/;
const replacement = `setOverallAttendance(total === 0 ? 100 : Math.round((present / total) * 100));`;
content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log("Patched Attendance.jsx");

const file2 = 'src/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let content2 = fs.readFileSync(file2, 'utf8');

const regex2 = /attendance: total === 0 \? 0 : Math\.round\(\(present \/ total\) \* 100\)/;
const replacement2 = `attendance: total === 0 ? 100 : Math.round((present / total) * 100)`;
content2 = content2.replace(regex2, replacement2);

fs.writeFileSync(file2, content2);
console.log("Patched StudentDashboard.jsx");

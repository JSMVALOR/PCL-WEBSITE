const fs = require('fs');
const file = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const overall = totCount === 0 \? 0 : \(\(attCount \/ totCount\) \* 100\)\.toFixed\(1\);\n\s*setOverallAttendance\(Number\(overall\)\);\n\s*\} else \{\n\s*setAttendanceData\(\[\]\);\n\s*setOverallAttendance\(0\);/,
    `const overall = totCount === 0 ? 100 : ((attCount / totCount) * 100).toFixed(1);\n setOverallAttendance(Number(overall));\n } else {\n setAttendanceData([]);\n setOverallAttendance(100);`
);
fs.writeFileSync(file, content);

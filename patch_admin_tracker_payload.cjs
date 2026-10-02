const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', 'utf8');

file = file.replace(
  /\/\/ OR we just rely on the status 'absent' in the payroll module\.\n(\s*)\};/g,
  "// OR we just rely on the status 'absent' in the payroll module.\n        };\n        if (newStatus === 'On Time' || newStatus === 'present') payload.late_minutes = 0;"
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', file);
console.log("Patched payload!");

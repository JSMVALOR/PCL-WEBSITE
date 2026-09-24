const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

code = code.replace(
  'fetchTodayClasses();\n fetchAllSubjects(); // Refresh past classes list',
  'await fetchTodayClasses();\n await fetchAllSubjects(); // Refresh past classes list'
);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched await');

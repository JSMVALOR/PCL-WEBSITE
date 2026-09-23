const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /window\.erpDialog\?\.alert\("Failed to open retro-attendance session\."\);/g,
    'window.erpDialog?.alert("Error: " + (error.message || JSON.stringify(error)));'
);

fs.writeFileSync(path, content);
console.log("Patched error alert.");

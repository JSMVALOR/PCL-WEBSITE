const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /console\.error\("Error resolving unmarked:", error\);/g,
    'console.error("Error resolving unmarked:", JSON.stringify(error, null, 2), error);'
);

fs.writeFileSync(path, content);
console.log("Patched console error.");

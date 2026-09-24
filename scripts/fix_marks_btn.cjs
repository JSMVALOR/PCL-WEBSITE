const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

code = code.replace('{students.length > 0 {subjectContext && students.length > 0 && ({subjectContext && students.length > 0 && ( (', '{students.length > 0 && (');

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Fixed');

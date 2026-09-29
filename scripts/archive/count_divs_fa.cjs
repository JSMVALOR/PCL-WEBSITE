const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnBody = content.slice(content.indexOf('return ('));
const opens = (returnBody.match(/<div/g) || []).length;
const closes = (returnBody.match(/<\/div>/g) || []).length;

console.log(`Opens: ${opens}, Closes: ${closes}`);

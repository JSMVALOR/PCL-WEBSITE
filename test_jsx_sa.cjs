const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Assignments/Assignments.jsx';
let content = fs.readFileSync(file, 'utf8');

// just log the last 30 lines
console.log(content.split('\n').slice(-30).join('\n'));

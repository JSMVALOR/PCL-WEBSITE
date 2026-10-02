const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(" </div>\n {selectedMentee && (", " </div>\n )}\n {selectedMentee && (");

fs.writeFileSync(file, code);
console.log("Fixed ternary");

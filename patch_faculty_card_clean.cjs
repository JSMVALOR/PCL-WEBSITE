const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyCard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const designation = fProfile.designation || faculty.department || 'Faculty Member';",
  "let designation = fProfile.designation || faculty.department || 'Faculty Member';\n  // Clean up redundant college names if they were entered in the ERP\n  designation = designation.replace(/,\\s*prudentia college of law/i, '').replace(/prudentia college of law/i, '');"
);

fs.writeFileSync(file, content);

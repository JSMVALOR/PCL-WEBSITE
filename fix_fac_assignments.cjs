const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("    </div>\n );\n}", "    </div>\n )}\n");

fs.writeFileSync(file, content);

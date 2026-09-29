const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/div>\n <\/div>\n <\/div>\n \);\n\}/;
content = content.replace(regex, '</div>\n</div>\n </div>\n </div>\n );\n}');

fs.writeFileSync(file, content);

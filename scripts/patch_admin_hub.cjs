const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the entire useEffect block
content = content.replace(/useEffect\(\(\) => \{[\s\S]*?wireDataAsAdmin\(\);\n    \}, \[\]\);/m, '');

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/SubjectBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/window\.erpDialog\?\.alert\(\`✅ Master Syllabus \$\{editingId \? 'Updated' : 'Deployed'\}\`\);/, 'window.erpToast?.show(\`Master Syllabus \${editingId ? "Updated" : "Deployed"} Successfully\`, "success");');

fs.writeFileSync(file, content);

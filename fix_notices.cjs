const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/n\.title\.toLowerCase\(\)/g, "(n.title || '').toLowerCase()");
content = content.replace(/n\.category\.toLowerCase\(\)/g, "(n.category || '').toLowerCase()");

fs.writeFileSync(file, content);

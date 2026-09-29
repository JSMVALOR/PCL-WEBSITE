const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

const handleAckRegex = /const handleAcknowledge = async \(id\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\};\n/m;
content = content.replace(handleAckRegex, '');

fs.writeFileSync(file, content);

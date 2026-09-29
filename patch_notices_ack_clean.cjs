const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{selectedNotice\.requires_acknowledgement \? \([\s\S]*?\) : null\}/;
content = content.replace(regex, '');

// There is also `needsAck` inside the detail view render. Let's check if it exists:
content = content.replace(/const needsAck = selectedNotice\.requires_acknowledgement && !acknowledged\.has\(selectedNotice\.id\);\n\s*/g, '');

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[acknowledged, setAcknowledged\] = useState\(new Set\(\)\);\n/g, '');

// There is a line `if (ackData) setAcknowledged(new Set(ackData.map(a => a.notice_id)));` in fetchNotices
content = content.replace(/const \{ data: ackData[\s\S]*?setAcknowledged\(new Set\(ackData\.map\(a => a\.notice_id\)\)\);\n/g, '');

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("</div>\n            )}\n\n            {/* 2. EVENTS GRID */}", "</div>\n\n            {/* 2. EVENTS GRID */}");

fs.writeFileSync(file, content);

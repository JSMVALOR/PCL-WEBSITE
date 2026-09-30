const fs = require('fs');
const file = 'Frontend/ERP/components/shared/TopNav.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /onClick=\{\(\) => setActiveTab\('notices'\)\}/g,
    "onClick={() => setActiveTab('notifications')}"
);

fs.writeFileSync(file, content);

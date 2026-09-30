const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /onClick=\{\(\) => window\.location\.hash = '#whatsapp'\}/,
    `onClick={() => setActiveTab('whatsapp')}`
);

fs.writeFileSync(file, content);

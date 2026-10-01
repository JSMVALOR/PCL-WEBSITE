const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /\{ label: 'Notice', icon: 'fa-bullhorn', tab: 'notices' \}/,
    `{ label: 'Notice', icon: 'fa-bullhorn', tab: 'notices' },\n { label: 'WhatsApp', icon: 'fa-whatsapp', tab: 'whatsapp' }`
);

// We need to change grid-cols-4 to grid-cols-5 since there are now 5 actions, or let it flow
content = content.replace(/className="grid grid-cols-4 gap-2"/, 'className="grid grid-cols-5 gap-2"');

fs.writeFileSync(file, content);

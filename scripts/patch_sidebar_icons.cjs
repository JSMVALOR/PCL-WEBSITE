const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /fa-solid \$\{action.icon\}/,
    `\${action.icon.includes('fa-') ? action.icon : 'fa-solid ' + action.icon}`
);

fs.writeFileSync(file, content);

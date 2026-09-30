const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

// I need to change it to \${action.icon.includes('fa-brands') || action.icon.includes('fa-solid') ? action.icon : 'fa-solid ' + action.icon}
content = content.replace(
    /\\\$\{action\.icon\.includes\('fa-'\) \? action\.icon : 'fa-solid ' \+ action\.icon\}/,
    `\${action.icon.includes(' ') ? action.icon : 'fa-solid ' + action.icon}`
);

// Now update the quickActions array to include fa-brands for whatsapp
content = content.replace(
    /icon: 'fa-whatsapp'/,
    `icon: 'fa-brands fa-whatsapp'`
);

fs.writeFileSync(file, content);

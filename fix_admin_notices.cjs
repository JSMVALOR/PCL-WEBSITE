const fs = require('fs');
let appCode = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

appCode = appCode.replace(
    "case 'notices': return <Notices setActiveTab={setActiveTab} />;",
    "case 'notices': return <AdminNotices />;"
);

fs.writeFileSync('Frontend/ERP/ErpApp.jsx', appCode);

let sidebarCode = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');
// Replace the entire comms_group object in ADMIN_NAV_MEGA
sidebarCode = sidebarCode.replace(
    /\{\s*id:\s*"comms_group"[\s\S]*?children:\s*\[[\s\S]*?\]\s*\},/g,
    ""
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', sidebarCode);
console.log("Fixed ErpApp and AdminSidebar");

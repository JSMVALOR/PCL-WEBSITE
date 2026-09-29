const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');

content = content.replace(
    /\{\s*id:\s*"adminapprovals",\s*label:\s*"Approvals",\s*icon:\s*"fa-solid fa-shield-halved"\s*\}/g,
    '{ id: "adminapprovals", label: "Approvals", icon: "fa-solid fa-shield-halved" },\n      { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" }'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', content);
console.log("Patched AdminSidebar mega menu");

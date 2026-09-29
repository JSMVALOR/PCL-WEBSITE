const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');

// Move System Broadcasts from Staff Operations to Main Hub
// Remove from Staff Operations
content = content.replace(
    /\{\s*id:\s*"notices",\s*label:\s*"System Broadcasts",\s*icon:\s*"fa-solid fa-bullhorn"\s*\},/g,
    ''
);

// Add to Main Hub
content = content.replace(
    /\{\s*id:\s*"adminapprovals",\s*label:\s*"Central Approvals",\s*icon:\s*"fa-solid fa-shield-halved"\s*\}/g,
    '{ id: "adminapprovals", label: "Central Approvals", icon: "fa-solid fa-shield-halved" },\n      { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" }'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', content);
console.log("Patched AdminSidebar.");

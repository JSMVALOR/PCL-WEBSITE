const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');

// 1. In ADMIN_NAV_GROUPS, add it to "HR & Finance"
code = code.replace(
  'category: "HR & Finance",\n    links: [',
  'category: "HR & Finance",\n    links: [\n      { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },'
);

// 2. In ADMIN_NAV_MEGA, add it to hr_group children
code = code.replace(
  'id: "hr_group", label: "HR & Finance", icon: "fa-solid fa-users",\n        sections: [\n          {\n            title: "Human Resources",\n            children: [',
  'id: "hr_group", label: "HR & Finance", icon: "fa-solid fa-users",\n        sections: [\n          {\n            title: "Human Resources",\n            children: [\n              { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },'
);
// Also add it to hr_group direct children (for fallback view)
code = code.replace(
  'id: "finance", label: "Finance & Payroll", icon: "fa-solid fa-indian-rupee-sign" }\n            ]\n          }\n        ],\n        children: [',
  'id: "finance", label: "Finance & Payroll", icon: "fa-solid fa-indian-rupee-sign" }\n            ]\n          }\n        ],\n        children: [\n          { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },'
);

// 3. Remove comms_group entirely from ADMIN_NAV_MEGA
const commsRegex = /\{\s*id:\s*"comms_group"[\s\S]*?\}\s*\},/g;
code = code.replace(commsRegex, '');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', code);
console.log("Updated AdminSidebar.jsx");

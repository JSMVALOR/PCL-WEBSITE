const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', 'utf8');

// 1. Move notices in ADMIN_NAV_GROUPS
code = code.replace(
    'links: [\n      { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },\n      { id: "users"',
    'links: [\n      { id: "users"'
);
code = code.replace(
    'id: "staff_ops", label: "Staff Operations", icon: "fa-solid fa-users",\n        children: [\n',
    'id: "staff_ops", label: "Staff Operations", icon: "fa-solid fa-users",\n        children: [\n          { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },\n'
);

// 2. Move notices in ADMIN_NAV_MEGA
code = code.replace(
    'title: "Human Resources",\n            children: [\n              { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },\n',
    'title: "Human Resources",\n            children: [\n'
);
code = code.replace(
    'title: "Operations & Finance",\n            children: [\n',
    'title: "Operations & Finance",\n            children: [\n              { id: "notices", label: "System Broadcasts", icon: "fa-solid fa-bullhorn" },\n'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx', code);
console.log("Updated AdminSidebar.jsx");

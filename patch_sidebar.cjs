const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultySidebar/FacultySidebar.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    `{ id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
          { id: "roster", label: "Class Roster", icon: "fa-solid fa-users-viewfinder" }`,
    `{ id: "attendance", label: "Attendance & Roster", icon: "fa-solid fa-clipboard-user" }`
);

fs.writeFileSync(p, c);
console.log("Removed roster from sidebar");

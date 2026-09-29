const fs = require('fs');
const file = 'Frontend/ERP/components/shared/MobileNav.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(role === 'admin'\) \{[\s\S]*?\}\n/m;

const replacement = `if (role === 'admin') {
        navGroups = ADMIN_NAV_GROUPS;
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
            { id: "adminapprovals", label: "Approvals", icon: "fa-solid fa-shield-halved" },
            { id: "academic", label: "Academic", icon: "fa-solid fa-chart-pie" },
            { id: "users", label: "Users", icon: "fa-solid fa-user-gear" },
        ];
    } else if (role === 'faculty') {
        navGroups = FACULTY_NAV_GROUPS;
        accentColor = "text-blue-500";
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
            { id: "teaching_hub", label: "Teaching", icon: "fa-solid fa-graduation-cap" },
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "facultyleave", label: "Admin", icon: "fa-solid fa-building-columns" },
        ];
    } else {
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
            { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
            { id: "fees", label: "Ledger", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "helpdesk", label: "Support", icon: "fa-solid fa-headset" },
        ];
    }
`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);

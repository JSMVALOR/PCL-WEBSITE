const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', 'utf8');

file = file.replace(
    /\{\/\* MAIN CONTENT WIDGETS \*\/\}\s*<div className="flex flex-col w-full animate-fade-in-up">\s*<AdminSystemVitals \/>\s*<\/div>/,
    ''
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', file);

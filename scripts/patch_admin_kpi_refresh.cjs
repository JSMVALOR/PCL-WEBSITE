const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx', 'utf8');

file = file.replace(
    /<button\s+onClick=\{handleRefreshDatabase\}[\s\S]*?<\/button>/,
    ''
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx', file);

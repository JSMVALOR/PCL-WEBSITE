const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

file = file.replace(
    /if\s*\(\s*window\.erpDialog\s*&&\s*!\(\s*await\s*new\s*Promise\(\s*r\s*=>\s*window\.erpDialog\.confirm\(\s*"Are you sure you want to delete this notice\?"\s*,\s*r\s*\)\s*\)\s*\)\s*\)\s*return;/g,
    'if (!(await window.erpDialog.confirm("Are you sure you want to delete this broadcast?"))) return;'
);

file = file.replace(
    /if\s*\(\s*window\.erpDialog\s*&&\s*!\(\s*await\s*new\s*Promise\(\s*r\s*=>\s*window\.erpDialog\.confirm\(\s*"Are you sure you want to delete this event\?"\s*,\s*r\s*\)\s*\)\s*\)\s*\)\s*return;/g,
    'if (!(await window.erpDialog.confirm("Are you sure you want to delete this event?"))) return;'
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', file);

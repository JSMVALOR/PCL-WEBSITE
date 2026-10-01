const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

file = file.replace(
    /\/\^FAC-\\\\d\+\$\//,
    '/^FAC\\\\d+$/'
);

file = file.replace(
    /"Faculty ERP ID must follow the format 'FAC-XXXX' \(e\.g\. FAC-0010\)\."/,
    '"Faculty ERP ID must follow the format \'FACXXXX\' (e.g. FAC1010)."'
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);

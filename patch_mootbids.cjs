const fs = require('fs');
let am = 'src/ERP/components/Admin/AdminMootCourt/AdminMootCourt.jsx';
let content = fs.readFileSync(am, 'utf8');

content = content.replace(
    'profiles!moot_bids_student_id_fkey(full_name, erp_id),\n moot_competitions!moot_bids_moot_id_fkey(moot_name)',
    ''
);
fs.writeFileSync(am, content);

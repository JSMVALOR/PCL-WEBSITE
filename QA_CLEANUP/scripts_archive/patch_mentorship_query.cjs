const fs = require('fs');
let p = 'src/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    "select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, avatar_url)')",
    "select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, profile_picture_url)')"
);

fs.writeFileSync(p, c);
console.log("Mentorship query patched");

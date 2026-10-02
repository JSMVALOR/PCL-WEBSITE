const fs = require('fs');

// Patch AdminFacultyAttendance.jsx
let admin = fs.readFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', 'utf8');

admin = admin.replace(
  /await supabase\.from\('attendance_audit_logs'\)\.insert\(\[\{([\s\S]*?)\}\]\);/,
  `const { error: auditError } = await supabase.from('attendance_audit_logs').insert([{$1}]);
      if (auditError) console.warn("Audit log failed, table might be missing:", auditError);`
);

admin = admin.replace(
  /await supabase\.from\('faculty_daily_presence'\)\.update\(\{ status: newStatus \}\)\.eq\('id', existing\.id\);/,
  `await supabase.from('faculty_daily_presence').update({ status: newStatus, late_minutes: newStatus === 'absent' ? 480 : 0 }).eq('id', existing.id);`
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx', admin);
console.log("Patched Admin");


const fs = require('fs');

const path = 'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldInsert = `
 const auditError = await supabase.from('attendance_audit_logs').insert([{
 faculty_id: facId,
 date: selectedDate,
 admin_id: userSession.db_id,
 previous_status: previousStatus,
 new_status: newStatus,
 action_reason: auditReason
 }]);
      if (auditError) console.warn("Audit log failed, table might be missing:", auditError);
`;

const newInsert = `
 const { error: auditError } = await supabase.from('attendance_audit_logs').insert([{
 faculty_id: facId,
 date: selectedDate,
 admin_id: userSession.db_id,
 previous_status: previousStatus,
 new_status: newStatus,
 action_reason: auditReason
 }]);
      if (auditError) console.warn("Audit log failed, table might be missing:", auditError);
`;

content = content.replace(oldInsert, newInsert);
fs.writeFileSync(path, content);
console.log('Patched insert statement');

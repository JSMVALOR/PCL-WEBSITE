const fs = require('fs');

function patchFile(path) {
  let code = fs.readFileSync(path, 'utf8');

  const oldCode = "const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });";
  const newCode = `// Pre-delete dependent records to satisfy FK constraints if DB isn't CASCADE yet
     await supabase.from('mentorship_meetings').delete().or(\`mentee_id.eq.\${user.db_id},mentor_id.eq.\${user.db_id}\`);
     await supabase.from('mentorship').delete().or(\`student_id.eq.\${user.db_id},mentor_id.eq.\${user.db_id}\`);
     await supabase.from('attendance_records').delete().eq('student_id', user.db_id);
     
     const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });`;

  if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync(path, code);
    console.log("Patched", path);
  }
}

patchFile('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx');
patchFile('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx');

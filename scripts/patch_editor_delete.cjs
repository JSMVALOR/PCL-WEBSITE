const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const newDelete = `
 const handleDeleteUser = async () => {
   if (!(await window.erpDialog.confirm("Are you sure you want to permanently delete this user? This action cannot be undone."))) return;
   
   onClose();
   
   try {
     const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });
     if (error) throw error;
     if (onUpdate) onUpdate();
     if (window.erpToast) window.erpToast.show("User permanently deleted.", "success");
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Delete Failed: " + (e.message || JSON.stringify(e)), "error"); 
     console.error("DELETE ERROR:", e);
   }
 };
`;

file = file.replace(/const handleDeleteUser = async \(\) => \{[\s\S]*?const handleSubmit = async \(e\) => \{/, newDelete + '\n const handleSubmit = async (e) => {');

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);

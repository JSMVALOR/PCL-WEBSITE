const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const suspendFunc = `
 const handleSuspendUser = async () => {
   if (!(await window.erpDialog.confirm("Are you sure you want to suspend this user? They will lose access immediately."))) return;
   
   onClose();
   
   try {
     const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
     const { error } = await supabase.rpc('admin_update_profile_status', { target_user_id: user.db_id, new_status: newStatus });
     if (error) throw error;
     
     if (onUpdate) onUpdate();
     if (window.erpToast) window.erpToast.show(\`User \${newStatus.toLowerCase()} successfully.\`, "success");
   } catch (e) {
     console.error("Suspend failed:", e);
     if (window.erpToast) window.erpToast.show("Failed to update status.", "error");
   }
 };

 const handleDeleteUser = async () => {
`;

file = file.replace(/const handleDeleteUser = async \(\) => \{/, suspendFunc);

const footerButtons = `<div className="border-t border-themeBorder bg-themePanel/60 backdrop-blur-3xl px-8 py-5 flex items-center justify-between shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
 <div className="flex gap-4">
 <button type="button" onClick={handleSuspendUser} disabled={isSaving} className="text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-themeApp px-5 py-2.5 rounded-xl font-bold tracking-normal text-xs transition-colors flex items-center gap-2 border border-amber-500/20">
 <i className="fa-solid fa-ban"></i> {user.status === 'Active' ? 'Suspend Identity' : 'Reactivate Identity'}
 </button>
 <button type="button" onClick={handleDeleteUser} disabled={isSaving} className="text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl font-bold tracking-normal text-xs transition-colors flex items-center gap-2 border border-rose-500/20">
 <i className="fa-solid fa-trash-can"></i> Delete Identity
 </button>
 </div>
 <div className="flex items-center gap-4">`;

file = file.replace(
    /<div className="border-t border-themeBorder bg-themePanel\/95 p-6 flex items-center justify-between sticky bottom-0 z-20">\s*<button type="button" onClick=\{handleDeleteUser\}[\s\S]*?<\/button>\s*<div className="flex items-center gap-4">/,
    footerButtons
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);

const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const funcs = `
 const handleSuspendUser = async () => {
   if (!(await window.erpDialog.confirm(\`Are you sure you want to \${user.status === 'Active' ? 'suspend' : 'reactivate'} this user?\`))) return;
   onClose();
   try {
     const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
     const { error } = await supabase.rpc('admin_update_profile_status', { target_user_id: user.db_id, new_status: newStatus });
     if (error) throw error;
     if (onUpdate) onUpdate();
     if (window.erpToast) window.erpToast.show(\`User \${newStatus.toLowerCase()} successfully.\`, "success");
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Failed to update status.", "error");
   }
 };

 const handleDeleteUser = async () => {
   if (!(await window.erpDialog.confirm("Are you sure you want to permanently delete this user? This action cannot be undone."))) return;
   onClose();
   if (window.erpToast) {
     window.erpToast.show("User marked for deletion.", "undo", {
       duration: 5000,
       onUndo: () => { window.erpToast.show("Deletion cancelled.", "info"); },
       onExecute: async () => {
         try {
           const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });
           if (error) throw error;
           if (onUpdate) onUpdate();
           window.erpToast.show("User permanently deleted.", "success");
         } catch (e) {
           window.erpToast.show("Failed to delete user.", "error");
         }
       }
     });
   }
 };

 const handleSubmit = async (e) => {
`;

file = file.replace(/const handleSubmit = async \(e\) => \{/, funcs);

const footerButtons = `<div className="bg-themePanel/95 backdrop-blur-3xl p-6 border-t border-themeBorder flex justify-between shrink-0 gap-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
 <div className="flex gap-4">
 <button type="button" onClick={onClose} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold tracking-normal text-[12px] text-themeTextSec hover:bg-themeElevated transition">
 Cancel
 </button>
 </div>
 <div className="flex items-center gap-3">
 <button type="button" onClick={handleSuspendUser} disabled={isSaving} className="text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-themeApp px-5 py-3 rounded-xl font-bold tracking-normal text-[12px] transition-colors flex items-center gap-2 border border-amber-500/20">
 <i className="fa-solid fa-ban"></i> {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
 </button>
 <button type="button" onClick={handleDeleteUser} disabled={isSaving} className="text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white px-5 py-3 rounded-xl font-bold tracking-normal text-[12px] transition-colors flex items-center gap-2 border border-rose-500/20">
 <i className="fa-solid fa-trash-can"></i> Delete
 </button>
 <button form="master-user-form" type="submit" disabled={isSaving} className="bg-themeAccent hover:bg-themeAccent/90 text-themeText px-8 py-3 rounded-xl font-black tracking-normal text-[12px] transition hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">`;

file = file.replace(
    /<div className="bg-themePanel\/95 backdrop-blur-3xl p-6 border-t border-themeBorder flex justify-end shrink-0 gap-4 z-10">\s*<button type="button" onClick=\{onClose\} disabled=\{isSaving\} className="px-8 py-3 rounded-xl font-bold tracking-normal text-\[12px\] text-themeTextSec hover:bg-themeElevated transition">\s*Cancel\s*<\/button>\s*<button form="master-user-form" type="submit" disabled=\{isSaving\} className="bg-themeAccent hover:bg-themeAccent\/90 text-themeText px-10 py-3 rounded-xl font-black tracking-normal text-\[12px\] transition hover:-translate-y-0\.5 active:scale-95 flex items-center gap-2">/,
    footerButtons
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);

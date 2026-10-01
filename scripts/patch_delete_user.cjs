const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

// Insert handleDeleteUser right before handleSave
const deleteFunc = `
 const handleDeleteUser = async () => {
   if (!(await window.erpDialog.confirm("Are you sure you want to permanently delete this user? This action cannot be undone."))) return;
   
   onClose(); // Close the modal immediately
   
   if (window.erpToast) {
     window.erpToast.show("User marked for deletion.", "undo", {
       duration: 5000,
       onUndo: () => {
         window.erpToast.show("Deletion cancelled.", "info");
       },
       onExecute: async () => {
         try {
           const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });
           if (error) throw error;
           if (onUpdate) onUpdate();
           window.erpToast.show("User permanently deleted.", "success");
         } catch (e) {
           console.error("Delete failed:", e);
           window.erpToast.show("Failed to delete user.", "error");
         }
       }
     });
   }
 };

 const handleSave = async (e) => {
`;

file = file.replace(/const handleSave = async \(e\) => \{/, deleteFunc);

// Insert Delete button next to Cancel in footer
const newFooter = `
 <div className="border-t border-themeBorder bg-themePanel/95 p-6 flex items-center justify-between sticky bottom-0 z-20">
 <button type="button" onClick={handleDeleteUser} disabled={isSaving} className="text-rose-500 hover:bg-rose-500/10 px-6 py-3 rounded-xl font-bold tracking-normal text-[12px] transition flex items-center gap-2">
 <i className="fa-solid fa-trash-can"></i> Delete Identity
 </button>
 <div className="flex items-center gap-4">
 <button type="button" onClick={onClose} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold tracking-normal text-[12px] text-themeTextSec hover:bg-themeElevated transition">
 Cancel
 </button>
`;

file = file.replace(
    /<div className="border-t border-themeBorder bg-themePanel\/95 p-6 flex items-center justify-end gap-4 sticky bottom-0 z-20">\s*<button type="button" onClick=\{onClose\}/,
    newFooter
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);

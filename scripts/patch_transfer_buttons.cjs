const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

const deletionFunc = `
 const executeDeletion = async (user) => {
   if (!(await window.erpDialog.confirm("Are you sure you want to permanently delete this user? This action cannot be undone."))) return;

   setTransferModalState({ isOpen: false, sourceUser: null, classes: 0, subjects: 0, isDeactivating: false, selectedTarget: '' });
   setIsLoading(true);

   try {
     const { error } = await supabase.rpc('admin_delete_user', { target_user_id: user.db_id });
     if (error) throw error;
     
     if (window.erpToast) window.erpToast.show("User permanently deleted.", "success");
     fetchDirectory();
   } catch(e) {
     if (window.erpToast) window.erpToast.show("Failed to delete user: " + e.message, "error");
   } finally {
     setIsLoading(false);
   }
 };

 const executeSuspension = async (user) => {
`;

file = file.replace(/const executeSuspension = async \(user\) => \{/, deletionFunc);

const footerButtons = `<div className="flex gap-3">
 {transferModalState.isDeactivating && (
 <>
 <button 
 onClick={() => executeSuspension(transferModalState.sourceUser)}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-themeApp transition-colors flex items-center gap-2"
 >
 <i className="fa-solid fa-ban"></i> Suspend
 </button>
 <button 
 onClick={() => executeDeletion(transferModalState.sourceUser)}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-2"
 >
 <i className="fa-solid fa-trash-can"></i> Delete
 </button>
 </>
 )}
 </div>`;

file = file.replace(
    /<div className="flex gap-3">\s*\{transferModalState\.isDeactivating && \([\s\S]*?\}\s*<\/div>/,
    footerButtons
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);

const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

// Insert executeSuspension method
const suspendFunc = `
 const executeSuspension = async (user) => {
   const input = await window.erpDialog.prompt(
     \`You are about to suspend access for \${user.name}.\\n\\n\` + 
     \`If suspended:\\n\` +
     \`• They will be immediately blocked from logging into the ERP.\\n\` +
     \`• Their account will not appear in allocations.\\n\\n\` +
     \`Type "SUSPEND" below to confirm this action.\`,
     "Account Restriction Warning",
     "",
     true
   );
   if (input !== 'SUSPEND') {
     if (input !== null) window.erpDialog.alert("Action cancelled. You must type SUSPEND exactly.");
     return;
   }

   setTransferModalState({ isOpen: false, sourceUser: null, classes: 0, subjects: 0, isDeactivating: false, selectedTarget: '' });
   setIsLoading(true);

   try {
     const newStatus = 'Suspended';
     const { error: restrictError } = await supabase.from('profiles').update({ status: newStatus }).eq('id', user.db_id);
     if (restrictError) throw restrictError;

     const updatedUsers = { ...usersData };
     const list = user.batch ? updatedUsers.students : updatedUsers.faculty;
     const index = list.findIndex(u => u.db_id === user.db_id);
     if (index !== -1) {
       list[index].status = newStatus;
       updatedUsers.disciplinary.push({...list[index], status: newStatus});
     }
     setUsersData(updatedUsers);

     await supabase.rpc('admin_update_profile_status', { target_user_id: user.db_id, new_status: newStatus });
     try {
       const { sendSystemEmail } = await import('../../../../Shared/lib/EmailService.js');
       await sendSystemEmail('ACCOUNT_LOCKED', { to_email: user.email, name: user.name });
     } catch(e) {}
     
     if (window.erpToast) window.erpToast.show("Account suspended successfully.", "success");
   } catch(e) {
     if (window.erpToast) window.erpToast.show("Failed to suspend: " + e.message, "error");
   } finally {
     setIsLoading(false);
   }
 };

 const handleWorkloadTransferSubmit = async () => {
`;

file = file.replace(/const handleWorkloadTransferSubmit = async \(\) => \{/, suspendFunc);

// Add the button to the footer
const footerStr = `<div className="p-6 border-t border-themeBorder dark:border-white/[0.05] flex justify-between gap-3 bg-themePanel">
 <div className="flex gap-3">
 {transferModalState.isDeactivating && (
 <button 
 onClick={() => executeSuspension(transferModalState.sourceUser)}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
 >
 Suspend Without Transfer
 </button>
 )}
 </div>
 <div className="flex gap-3">
 <button 
 onClick={() => setTransferModalState({ ...transferModalState, isOpen: false })}
 className="px-5 py-2.5 rounded-xl font-semibold text-xs text-themeTextSec hover:text-themeText hover:bg-themeElevated transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={handleWorkloadTransferSubmit}
 disabled={!transferModalState.selectedTarget}
 className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-500 hover:bg-blue-600 text-themeApp disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
 >
 <i className="fa-solid fa-exchange-alt"></i>
 Transfer Workload
 </button>
 </div>
 </div>`;

file = file.replace(
    /<div className="p-6 border-t border-themeBorder dark:border-white\/\[0\.05\] flex justify-end gap-3 bg-themePanel">[\s\S]*?<\/div>/,
    footerStr
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);

const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

const hook = '<div className="flex items-center justify-between mt-1">\n <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>\n\n <div className="flex gap-2">';

const newButtons = `<div className="flex items-center justify-between mt-1">
 <Badge variant="secondary">{user.batch || user.department || "Unassigned"}</Badge>

 <div className="flex gap-2">
 <button type="button" onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] text-themeTextSec flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>`;

file = file.replace(hook, newButtons);

const exchangeHook = '<button type="button" onClick={() => handleResetPassword(user)}';
const exchangeButton = `{user.role === 'faculty' && (
 <button type="button" onClick={() => handleOpenTransfer(user)} className="w-8 h-8 rounded-lg bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] text-themeTextSec flex items-center justify-center transition-colors" title="Transfer Workload">
 <i className="fa-solid fa-exchange-alt text-[10px]"></i>
 </button>
 )}
 <button type="button" onClick={() => handleResetPassword(user)}`;

file = file.replace(exchangeHook, exchangeButton);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);

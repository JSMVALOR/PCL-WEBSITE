const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

// 1. Fix the Passcode undefined issue
file = file.replace(
    /return \{ profilePayload, emailSent, generatedId, nextNum: nextNum \+ 1 \};/,
    'return { profilePayload, emailSent, generatedId, nextNum: nextNum + 1, password: generatedPassword };'
);

// 2. Fix the Email template key and params
file = file.replace(
    /await sendSystemEmail\('ERP_NEW_ACCOUNT', \{/,
    "await sendSystemEmail('FIRST_CREDENTIALS', {"
);
file = file.replace(
    /name: name,/,
    "name: name, student_name: name,"
);

// 3. Fix Log Rendering Colors
const oldLogRender = `<div className="bg-black text-emerald-400 p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto border border-themeBorder shadow-inner">
 {provisionLogs.map((log, i) => (
 <div key={i} className={log.includes('ERROR') ? 'text-rose-400' : ''}>&gt; {log}</div>
 ))}
 </div>`;

const newLogRender = `<div className="bg-black p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto border border-themeBorder shadow-inner">
 {provisionLogs.map((log, i) => {
   let colorClass = 'text-emerald-400';
   if (log.includes('[ERROR]')) colorClass = 'text-rose-500 font-bold';
   else if (log.includes('[WARNING]')) colorClass = 'text-amber-400 font-bold';
   else if (log.includes('[SUCCESS]')) colorClass = 'text-emerald-400 font-bold';
   else if (log.includes('[INIT]') || log.includes('[COMPLETE]')) colorClass = 'text-blue-300';
   return <div key={i} className={colorClass}>&gt; {log}</div>;
 })}
 </div>`;

file = file.replace(oldLogRender, newLogRender);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);

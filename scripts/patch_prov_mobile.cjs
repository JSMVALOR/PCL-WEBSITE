const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

// Make the header responsive
file = file.replace(
    /<div className="flex h-16 items-center justify-between px-6 border-b border-themeBorder bg-themePanel\/80 dark:bg-themePanel\/80 backdrop-blur-3xl saturate-\[1\.8\]">/,
    '<div className="flex min-h-[4rem] py-3 items-center justify-between px-4 md:px-6 border-b border-themeBorder bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex-wrap gap-4">'
);

// Hide stats text on mobile, or just make them shrink
file = file.replace(
    /<span className="text-\[10px\] font-bold text-themeTextSec uppercase tracking-widest">Accounts Created<\/span>/,
    '<span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest hidden sm:block">Accounts Created</span><span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest sm:hidden">Created</span>'
);

file = file.replace(
    /<span className="text-\[10px\] font-bold text-themeTextSec uppercase tracking-widest">Emails Sent<\/span>/,
    '<span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest hidden sm:block">Emails Sent</span><span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest sm:hidden">Sent</span>'
);

// Reduce padding of X button on mobile
file = file.replace(
    /<div className="pl-6 ml-2 border-l border-themeBorder">/,
    '<div className="pl-4 md:pl-6 ml-auto md:ml-2 border-l border-themeBorder flex items-center">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);

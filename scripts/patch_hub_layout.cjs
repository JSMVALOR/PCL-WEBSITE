const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

// 1. Fix the top X button overlap by moving Stats down or giving right padding
file = file.replace(
    /<div className="p-4 lg:p-6 border-b border-themeBorder flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-themePanel\/60 backdrop-blur-3xl shrink-0">/,
    '<div className="p-4 lg:p-6 pr-16 lg:pr-24 border-b border-themeBorder flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-themePanel/60 backdrop-blur-3xl shrink-0">'
);

// 2. Fix the flex layout for mobile stacking
file = file.replace(
    /<div className="flex flex-1 overflow-hidden">/,
    '<div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">'
);

file = file.replace(
    /\{?\/\* LEFT SIDE: CREATION \*\/\}?\s*<div className="w-1\/2 flex flex-col border-r border-themeBorder bg-themePanel\/40 \/20 overflow-y-auto custom-scrollbar">/,
    '{/* LEFT SIDE: CREATION */}\n<div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-themeBorder bg-themePanel/40 shrink-0 md:overflow-y-auto custom-scrollbar pb-10 md:pb-0">'
);

file = file.replace(
    /\{?\/\* RIGHT SIDE: EDITING \*\/\}?\s*<div className="w-1\/2 flex flex-col bg-themeApp overflow-y-auto custom-scrollbar">/,
    '{/* RIGHT SIDE: EDITING */}\n<div className="w-full md:w-1/2 flex flex-col bg-themeApp shrink-0 md:overflow-y-auto custom-scrollbar min-h-[500px] md:min-h-0">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);

// 3. Fix the fetchUsers error in UserManagement.jsx
let umFile = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');
umFile = umFile.replace(/fetchUsers\(\);/g, 'fetchDirectory();');
fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', umFile);


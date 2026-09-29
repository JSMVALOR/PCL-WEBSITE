const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /className="p-6 bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] shadow-none rounded-2xl flex flex-col gap-3 relative overflow-hidden group"/g;
const replacement = 'className="py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex flex-col gap-3 relative overflow-hidden group transition-opacity hover:opacity-80"';

if (content.match(targetRegex)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, content);
    console.log("Admin feed patched");
}

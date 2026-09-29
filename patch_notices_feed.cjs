const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /className={`bg-black\/5 dark:bg-white\/5 backdrop-blur-\[30px\] shadow-none border \${notice\.isUnread \? 'border-black\/5 dark:border-white\/10' : 'border-black\/10 dark:border-white\/20'} hover:bg-white\/10 rounded-\[1\.5rem\] p-6 cursor-pointer flex flex-col group relative overflow-hidden`}/g;
const replacement = "className={`py-5 border-b border-black/[0.04] dark:border-white/[0.04] cursor-pointer flex flex-col group relative overflow-hidden transition-opacity hover:opacity-80`}";

if (content.match(targetRegex)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, content);
    console.log("Feed patched");
}

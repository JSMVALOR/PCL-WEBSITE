const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetHeaderRegex = /<div className=\{`bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-2xl p-6 lg:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6`\}>/g;
const replacementHeader = '<div className="relative flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-b border-black/[0.04] dark:border-white/[0.04] shrink-0">';

if (content.match(targetHeaderRegex)) {
    content = content.replace(targetHeaderRegex, replacementHeader);
    
    // The background glow circle inside the header can be removed if it's unboxed.
    content = content.replace(/<div className=\{`absolute top-0 right-0 w-full max-w-\[16rem\] md:w-64 h-64 \$\{currentTheme\.glow\} rounded-full blur-3xl -translate-y-1\/2 translate-x-1\/3 opacity-50`\}><\/div>/g, '');
    
    fs.writeFileSync(file, content);
    console.log("EventsBoard patched");
} else {
    console.error("Target not found");
}

const fs = require('fs');
const glob = require('glob');

const files = glob.sync('Frontend/ERP/components/Admin/AdminMentorship/*.jsx');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove bg-white... rounded-[2rem] from panels to make them edge-to-edge
    // Often it looks like: className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6"
    content = content.replace(
        /className="bg-white dark:bg-\[\#121212\] border border-themeBorder dark:border-white\/5 rounded-\[2rem\] (.*?)"/g,
        'className="border-b border-black/5 dark:border-white/5 py-6 $1"'
    );

    // Same but with flex flex-col at the end
    content = content.replace(
        /className="bg-white dark:bg-\[\#121212\] border border-themeBorder dark:border-white\/5 rounded-\[2rem\] p-6 flex flex-col"/g,
        'className="border-b border-black/5 dark:border-white/5 py-6 flex flex-col"'
    );
    
    // 2. The 4 KPI/Action Buttons in Dashboard
    content = content.replace(
        /className="bg-white dark:bg-\[\#121212\] border border-themeBorder dark:border-white\/5 rounded-\[2rem\] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 hover:border-(.*?)-500 transition group active:scale-95"/g,
        'className="border-b-2 border-transparent hover:border-$1-500 py-6 px-4 flex flex-col items-center justify-center gap-3 transition group active:scale-95"'
    );

    // 3. Allocations List Items
    // bg-white dark:bg-[#121212] backdrop-blur-2xl p-2.5 lg:p-4 rounded-2xl shadow-none dark:shadow-none border border-themeBorder dark:border-white/5
    content = content.replace(
        /bg-white dark:bg-\[\#121212\] backdrop-blur-2xl p-2\.5 lg:p-4 rounded-2xl shadow-none dark:shadow-none border border-themeBorder dark:border-white\/5/g,
        'py-3 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors'
    );

    // Draggable student items
    content = content.replace(
        /bg-white dark:bg-\[\#121212\] backdrop-blur-2xl border p-2 lg:p-2\.5 rounded-2xl shadow-none dark:shadow-none flex items-center justify-between group transition/g,
        'py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between group transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
    );
    
    // Mentor Card Header
    content = content.replace(
        /bg-white dark:bg-\[\#121212\] backdrop-blur-2xl p-2\.5 lg:p-3 rounded-2xl shadow-none dark:shadow-none border flex flex-col group transition/g,
        'py-4 border-b-2 flex flex-col group transition'
    );

    // Mentor Column Background
    content = content.replace(
        /flex flex-col gap-2 p-3 bg-white dark:bg-\[\#121212\] border border-themeBorder dark:border-white\/5 rounded-\[2rem\]/g,
        'flex flex-col border-r border-black/5 dark:border-white/5 pr-4 last:border-0'
    );
    
    // Tag pills inside Allocations
    content = content.replace(
        /bg-white dark:bg-\[\#121212\] backdrop-blur-2xl border border-black\/5 dark:border-white\/10 px-1\.5 py-0\.5 rounded text-\[8px\]/g,
        'bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-[8px]'
    );

    // Remove random other boxy backgrounds
    content = content.replace(/bg-white dark:bg-\[\#121212\]/g, '');

    fs.writeFileSync(file, content);
}
console.log("Mentorship components unboxed.");

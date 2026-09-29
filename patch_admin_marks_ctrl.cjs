const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminMarksController/AdminMarksController.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<PageHeader[\s\S]*?\/>/;

const newHeader = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-themeAccent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-themeAccent shadow-sm">
                <i className="fa-solid fa-building-columns"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">OU Marks Dispatcher</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Track faculty submissions & generate exports</p>
            </div>
        </div>
    </div>
</div>`;

content = content.replace(regex, newHeader);

// Adjust wrapper padding to allow edge-to-edge
content = content.replace(/<div className="w-full mx-auto px-4 lg:px-8 py-6">/, '<div className="w-full mx-auto pb-10">');
// Since the banner provides padding, we need to add padding to the tabs and content below.
content = content.replace(/<div className="flex border-b border-themeBorder\/50 mb-8 mt-6 overflow-x-auto no-scrollbar">/, '<div className="px-4 lg:px-8"><div className="flex border-b border-themeBorder/50 mb-8 mt-6 overflow-x-auto no-scrollbar">');
// Close the added div at the very end
content = content.replace(/<\/div>\n        <\/div>\n    \);\n\}/, '</div>\n</div>\n        </div>\n    );\n}');

fs.writeFileSync(file, content);

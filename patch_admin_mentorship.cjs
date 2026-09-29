const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx', 'utf8');

// Replace PageHeader and old tabs with Panoramic Header and Flat Tabs
const oldHeaderRegex = /\{\!isHubView && \([\s\S]*?<\/PageHeader>[\s\S]*?\)\}[\s\S]*?<div className=\{`flex flex-wrap lg:flex-nowrap p-1\.5 bg-white\/80[\s\S]*?<\/div>/m;
const oldHeaderRegexFallback = /\{\!isHubView && \(\s*<PageHeader[\s\S]*?\/>\s*\)\}\s*<div className=\{`flex flex-wrap lg:flex-nowrap p-1\.5 bg-white\/80[\s\S]*?<\/div>/m;

const newHeader = `{!isHubView && (
<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-emerald-500 shadow-sm">
                <i className="fa-solid fa-server"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Mentorship Engine</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Centralized administration for mentor mapping</p>
            </div>
        </div>
    </div>
</div>
)}

<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4 px-4 lg:px-8">
    {tabs.map((tab) => (
        <button type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
        >
            <i className={\`fa-solid \${tab.icon} \${activeTab === tab.id ? 'animate-pulse' : ''}\`}></i>
            {tab.label}
        </button>
    ))}
</div>`;

content = content.replace(oldHeaderRegexFallback, newHeader);

// Adjust outer wrappers
content = content.replace(
    /className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 xl:pb-8" : "pb-10"\}`\}/,
    'className={`w-full max-w-[1800px] mx-auto flex flex-col pb-24 lg:pb-8 xl:pb-8`}'
);

content = content.replace(
    /<div className="flex-1 w-full relative min-h-\[500px\]">/,
    '<div className="flex-1 w-full relative min-h-[500px] p-4 sm:p-6 lg:p-8">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx', content);
console.log("Patched AdminMentorship.jsx main shell.");

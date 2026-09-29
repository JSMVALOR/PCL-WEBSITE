const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace PageHeader with Panoramic Banner
const oldHeaderRegex = /<PageHeader icon="fa-solid fa-scale-balanced" title="Central Approvals Center" subtitle="Manage student profile changes, mentor requests, faculty leaves, and document verifications\." \/>/;
const newHeader = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-themeAccent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-themeAccent shadow-sm">
                <i className="fa-solid fa-scale-balanced"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Central Approvals</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Manage requests, mentors & reschedules</p>
            </div>
        </div>
    </div>
</div>`;

content = content.replace(oldHeaderRegex, newHeader);

// Replace Boxed Tabs with Edge-to-Edge Segmented Tabs
const oldTabsRegex = /<div className="flex flex-wrap lg:flex-nowrap p-1\.5 bg-white\/80 dark:bg-themePanel\/80 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] rounded-2xl border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] relative z-10 gap-1\.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium">[\s\S]*?<\/div>/;
const newTabs = `<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4">
    <button type="button" 
        onClick={() => setActiveTab('profile_updates')}
        className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'profile_updates' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
    >
        Profile & Mentors
    </button>
    <button type="button" 
        onClick={() => setActiveTab('timetable_reschedules')}
        className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'timetable_reschedules' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
    >
        Timetable Reschedules
    </button>
</div>`;

content = content.replace(oldTabsRegex, newTabs);

// Fix wrapper to allow edge-to-edge
content = content.replace(/<div className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"\}`\}>/, '<div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>');

// We need to inject the padding into the content BELOW the new tabs.
// Just wrap the active tab content render!
const oldContentRegex = /\{activeTab === 'profile_updates' \? \([\s\S]*?<\/div>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*<\/div>/;
// Let's replace the bottom wrapper correctly by just adding a `<div className="flex flex-col p-4 lg:p-8 gap-6">`
content = content.replace(/\{activeTab === 'profile_updates' \? \(/, '<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 ${isEmbedded ? "p-0" : ""}`}>\n{activeTab === \'profile_updates\' ? (');
content = content.replace(/\)\s*\}\s*<\/div>\s*<\/div>/, ') }\n</div>\n</div>\n</div>');

fs.writeFileSync(file, content);

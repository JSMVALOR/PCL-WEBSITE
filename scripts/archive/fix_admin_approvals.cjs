const fs = require('fs');

let fileContent = fs.readFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', 'utf8');

// 1. Restore tabs
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
    <button type="button" 
        onClick={() => setActiveTab('faculty_leaves')}
        className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'faculty_leaves' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
    >
        Faculty Leaves
    </button>
    <button type="button" 
        onClick={() => setActiveTab('escalated_grievances')}
        className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'escalated_grievances' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
    >
        Escalated Grievances
    </button>
</div>`;

// Find where the old tabs start and end
fileContent = fileContent.replace(
    /<div className="flex w-full border-b border-black\/\[0\.04\] dark:border-white\/\[0\.08\] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4">[\s\S]*?Timetable Reschedules\n\s*<\/button>\n<\/div>/m,
    newTabs
);


// 2. Unbox content cards
// Faculty Leaves
fileContent = fileContent.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">/g,
    '<div className="flex flex-col">'
);
fileContent = fileContent.replace(
    /className={`\$\{theme\.layout\.panel\} rounded-themePanel border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] p-5 flex flex-col gap-4 relative overflow-hidden`}/g,
    'className={`py-5 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors px-4`}'
);

// Escalated Grievances
fileContent = fileContent.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 gap-5">/g,
    '<div className="flex flex-col">'
);
fileContent = fileContent.replace(
    /className=\{"bg-white\/80 dark:bg-themePanel\/80 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-2xl border-rose-500\/20 border p-5 flex flex-col gap-4 relative overflow-hidden"\}/g,
    'className={"py-6 px-4 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"}'
);

// Profile Updates
fileContent = fileContent.replace(
    /className=\{"bg-white\/80 dark:bg-themePanel\/80 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-2xl border-amber-500\/20 border p-5 flex flex-col gap-4 relative overflow-hidden"\}/g,
    'className={"py-6 px-4 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"}'
);

// Unbox inner content inside cards (the grey backdrop boxes)
fileContent = fileContent.replace(
    /<div className="bg-themeElevated\/90 backdrop-blur-2xl p-3 rounded-lg border border-black\/\[0\.04\] dark:border-white\/\[0\.08\]">/g,
    '<div className="py-2">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', fileContent);
console.log("AdminApprovals patched!");

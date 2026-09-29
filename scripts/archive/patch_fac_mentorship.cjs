const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the Main Header
const oldHeaderRegex = /\{\!selectedMentee && \([\s\S]*?<\/div>\s*\)\}/;
const newHeader = `{!selectedMentee && (
    <div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-amber-500/5 via-transparent to-transparent py-8 shrink-0">
        <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-amber-500 shadow-sm">
                    <i className="fa-solid fa-users"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Mentorship Hub</h1>
                    <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Manage mentees & academic progress</p>
                </div>
            </div>
        </div>
    </div>
)}`;

content = content.replace(oldHeaderRegex, newHeader);

// 2. Replace the Tab Bar inside selectedMentee
const oldTabBarRegex = /<div className="flex p-1\.5 bg-black\/\[0\.03\] dark:bg-white\/5 backdrop-blur-md rounded-2xl border border-black\/5 dark:border-white\/5 w-fit gap-1">[\s\S]*?<\/div>\s*<\/div>\s*\{menteeTab === 'profile'/;

const newTabBar = `<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4">
    {[
        { id: 'profile', label: '360° Profile', icon: 'fa-user-graduate' },
        { id: 'attendance', label: 'Attendance', icon: 'fa-clipboard-user' },
        { id: 'academic', label: 'Academic Record', icon: 'fa-graduation-cap' },
        { id: 'leaves', label: 'Leave Approvals', icon: 'fa-plane-departure' },
        { id: 'internships', label: 'Internships', icon: 'fa-briefcase' },
        { id: 'grievances', label: 'Grievance Record', icon: 'fa-scale-balanced' },
        { id: 'report', label: 'Report Mentee', icon: 'fa-triangle-exclamation' },
    ].map(tab => (
        <button
            key={tab.id}
            onClick={() => setMenteeTab(tab.id)}
            className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${menteeTab === tab.id ? 'text-amber-500 border-amber-500' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}
        >
            <i className={\`fa-solid \${tab.icon}\`}></i> {tab.label}
        </button>
    ))}
</div>
</div>
{menteeTab === 'profile'`;

content = content.replace(oldTabBarRegex, newTabBar);

// 3. Fix main padding to allow edge-to-edge
content = content.replace(/<div className="w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8">/, '<div className="w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8">');

// 4. Ensure selectedMentee view has padding
content = content.replace(/\{\/\* ──── MENTEE PROFILE VIEW ──── \*\/\}\s*<div className="flex flex-col gap-6">/, '{/* ──── MENTEE PROFILE VIEW ──── */}\n<div className="flex flex-col gap-6 p-4 lg:p-8">');

// 5. Ensure MAIN DASHBOARD has padding
content = content.replace(/\{\/\* ──── MAIN DASHBOARD ──── \*\/\}\s*<div className="flex flex-col lg:flex-row gap-6">/, '{/* ──── MAIN DASHBOARD ──── */}\n<div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8">');

fs.writeFileSync(file, content);

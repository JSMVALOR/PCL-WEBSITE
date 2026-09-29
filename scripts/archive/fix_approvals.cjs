const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', 'utf8');

const targetClass = '"py-6 px-4 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"';
const targetClassPx4 = '`py-5 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors px-4`';

const premiumClass = '"bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.01] transition-transform"';

// Replace all ugly flat classes with premium valor classes
content = content.replace(new RegExp(targetClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), premiumClass);
content = content.replace(new RegExp(targetClassPx4.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), premiumClass);

// Now wrap the `.map` inside a `<div className="grid...">`
// 1. Timetable:
content = content.replace(
    /timetableRequests\.map\(req => \(/,
    '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">\n{timetableRequests.map(req => ('
);
// Replace the closing of timetable map:
// 408: ))
// 409: )}
// 410: </div>
content = content.replace(
    /(\{\s*req\.status\s*\})([\s\S]*?)(<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\))(\s*\)\}\s*<\/div>)/,
    '$1$2$3\n</div>$4'
);


// 2. Faculty
content = content.replace(
    /facultyLeaves\.map\(req => \(/,
    '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">\n{facultyLeaves.map(req => ('
);
content = content.replace(
    /(Reject<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\))(\s*\)\}\s*<\/div>)/,
    '$1\n</div>$2'
);

// 3. Grievances
content = content.replace(
    /grievances\.map\(g => \(/,
    '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">\n{grievances.map(g => ('
);
content = content.replace(
    /(\{g\.resolution_notes \|\| "N\/A"\}<\/p>[\s\S]*?<\/div>[\s\S]*?)\}\s*<\/div>\s*\)\)(\s*\)\}\s*<\/div>)/,
    '$1}\n</div>\n))\n</div>$2'
);

// 4. Profiles
content = content.replace(
    /profileUpdates\.map\(req => \(/,
    '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">\n{profileUpdates.map(req => ('
);
content = content.replace(
    /(Reject<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\))(\s*\)\}\s*<\/div>)/,
    '$1\n</div>$2'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', content);

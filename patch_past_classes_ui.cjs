const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /<h3 className="text-sm font-bold uppercase tracking-widest text-themeTextSec mb-6">Unmarked Dates \(Last 30 Days\)<\/h3>/,
    `<h3 className="text-sm font-bold uppercase tracking-widest text-themeTextSec mb-6">Past Classes (Last 30 Days)</h3>`
);

content = content.replace(
    /<div className="w-10 h-10 rounded-full bg-rose-500\/10 flex items-center justify-center">\s*<i className="fa-solid fa-calendar-xmark text-rose-500"><\/i>\s*<\/div>/,
    `<div className={\`w-10 h-10 rounded-full flex items-center justify-center \${m.isMarked ? 'bg-emerald-500/10' : 'bg-rose-500/10'}\`}>
                                    <i className={\`fa-solid \${m.isMarked ? 'fa-check text-emerald-500' : 'fa-calendar-xmark text-rose-500'}\`}></i>
                                </div>`
);

content = content.replace(
    /<button type="button" onClick=\{\(\) => handleResolveUnmarked\(m\)\} className="text-\[11px\] font-black uppercase tracking-wider text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-2"><i className="fa-solid fa-pen-nib"><\/i> Mark Now<\/button>/,
    `<button type="button" onClick={() => handleResolveUnmarked(m)} className={\`text-[11px] font-black uppercase tracking-wider text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-2 \${m.isMarked ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-rose-500 hover:bg-rose-600'}\`}>
                                <i className={\`fa-solid \${m.isMarked ? 'fa-eye' : 'fa-pen-nib'}\`}></i> {m.isMarked ? 'Review' : 'Mark Now'}
                            </button>`
);

content = content.replace(
    /<h3 className="text-lg text-themeText dark:text-white font-black">All Caught Up!<\/h3>/,
    `<h3 className="text-lg text-themeText dark:text-white font-black">No Past Classes</h3>`
);

content = content.replace(
    /<p className="text-xs text-themeTextSec dark:text-white\/50 mt-2 max-w-sm mx-auto">You have no unmarked attendance for any subjects in the last 30 days\.<\/p>/,
    `<p className="text-xs text-themeTextSec dark:text-white/50 mt-2 max-w-sm mx-auto">You have no scheduled past classes for any subjects in the last 30 days.</p>`
);

// We need to count the unmarked items in the overview card:
// Was: {sub.missed.length} Missing
// Replace with: {sub.missed.filter(x => !x.isMarked).length} Unmarked
content = content.replace(
    /<span className="bg-rose-500\/10 text-rose-600 dark:text-rose-400 px-2\.5 py-1 rounded-md text-\[10px\] font-black uppercase tracking-widest">\s*\{sub\.missed\.length\} Missing\s*<\/span>/,
    `{sub.missed.filter(x => !x.isMarked).length > 0 ? (
                                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    {sub.missed.filter(x => !x.isMarked).length} Unmarked
                                </span>
                            ) : (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    All Marked
                                </span>
                            )}`
);

fs.writeFileSync(path, content);
console.log("Patched UI replacements");

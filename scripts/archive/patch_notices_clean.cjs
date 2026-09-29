const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove {notice.requires_acknowledgement ... Action Required}
content = content.replace(/\{\(notice\.requires_acknowledgement && !acknowledged\.has\(notice\.id\)\) && \([\s\S]*?<\/span>\n\s*\)\}/, '');

// Remove const needsAck = ...
content = content.replace(/\s*const needsAck = selectedNotice\.requires_acknowledgement && !acknowledged\.has\(selectedNotice\.id\);/, '');

// Remove Action Required button block in Footer / Actions Area
const footerRegex = /\{selectedNotice\.requires_acknowledgement \? \([\s\S]*?<i className="fa-solid fa-circle-check text-emerald-500"><\/i> No action required\n\s*<\/div>\n\s*\)\}/;
content = content.replace(footerRegex, `<div className="w-full sm:w-auto px-6 py-3.5 rounded-[1rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold tracking-tight text-themeTextSec flex items-center justify-center gap-3">
                            <i className="fa-solid fa-circle-check text-emerald-500"></i> No action required
                        </div>`);

// Replace 3rd stat column with something else or just remove it.
// Original wrapper: <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/10">
content = content.replace(/<div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-black\/5 dark:border-white\/10">/, '<div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-black/5 dark:border-white/10">');

// Remove the 3rd stat box
const statBoxRegex = /<div className="flex flex-col gap-1 items-center">\s*<span className="text-3xl font-semibold tracking-tight text-rose-400 drop-shadow-\[0_0_15px_rgba\(244,63,94,0\.3\)\]">\{notices\.filter\(n => n\.requires_acknowledgement && !acknowledged\.has\(n\.id\)\)\.length\}<\/span>\s*<span className="text-\[11px\] font-medium text-rose-400\/80 text-center leading-tight">Action<br\/>Required<\/span>\s*<\/div>/;
content = content.replace(statBoxRegex, '');

// Remove border-x from 2nd stat box
content = content.replace(/<div className="flex flex-col gap-1 items-center border-x border-black\/5 dark:border-white\/10">/, '<div className="flex flex-col gap-1 items-center border-l border-black/5 dark:border-white/10">');

fs.writeFileSync(file, content);

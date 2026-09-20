const fs = require('fs');

const holdButtonImport = "import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { Delete02Icon } from '@hugeicons/core-free-icons';\n";

function addImport(content, importStr, depthOffset = '') {
    if (content.includes('HoldButton')) return content;
    // Adjust depth dynamically if we know it (simplification: just use the absolute alias or hope it works)
    // For simplicity, let's just use absolute alias if we can? No, we don't have one. We use relative.
    const newStr = importStr.replace(/\.\.\/\.\.\/\.\.\/\.\.\//g, depthOffset);
    return content.replace(/import React.*?['"];/m, match => match + '\n' + newStr);
}

// 1. FacultyCourses
let fc = fs.readFileSync('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'utf8');
fc = addImport(fc, holdButtonImport, '../../../../');
fc = fc.replace(/if \(!window\.confirm\("Delete this resource link\?"\)\) return;/g, '// confirm removed');
fc = fc.replace(
    /<button type="button" onClick=\{\(\) => handleDeleteResource\(res\.id\)\} className="w-8 h-8 rounded-lg bg-rose-500\/10 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-gray-900 dark:text-white transition flex items-center justify-center shrink-0">([\s\S]*?)<\/button>/,
    `<HoldButton size="sm" onHold={() => handleDeleteResource(res.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`
);
fs.writeFileSync('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', fc);

// 2. AdminNotices
let an = fs.readFileSync('src/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');
an = addImport(an, holdButtonImport, '../../../../');
an = an.replace(/if \(!confirm\("Retract this broadcast\?"\)\) return;/g, '');
an = an.replace(/if \(!confirm\("Cancel this event\?"\)\) return;/g, '');
an = an.replace(
    /<button type="button" onClick=\{\(\) => handleDeleteNotice\(n\.id\)\} className="text-themeTextSec hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can"><\/i><\/button>/g,
    `<HoldButton size="sm" onHold={() => handleDeleteNotice(n.id)} radius={8} backgroundColor="transparent" fillColor="#f43f5e" textColor="#8E8E93" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`
);
an = an.replace(
    /<button type="button" onClick=\{\(\) => handleDeleteEvent\(e\.id\)\} className="text-themeTextSec hover:text-rose-500 transition-colors p-2"><i className="fa-solid fa-trash-can"><\/i><\/button>/g,
    `<HoldButton size="sm" onHold={() => handleDeleteEvent(e.id)} radius={8} backgroundColor="transparent" fillColor="#f43f5e" textColor="#8E8E93" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`
);
fs.writeFileSync('src/ERP/components/Admin/notices/AdminNotices.jsx', an);

console.log("Patched FacultyCourses and AdminNotices");

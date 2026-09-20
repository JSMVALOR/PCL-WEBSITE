const fs = require('fs');
const file = 'src/ERP/components/Admin/AdminAcademicCalendar/AdminAcademicCalendar.jsx';
let content = fs.readFileSync(file, 'utf8');

const holdButtonImport = "import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { Delete02Icon } from '@hugeicons/core-free-icons';\n";

if (!content.includes('HoldButton')) {
    content = content.replace(/import React.*?['"];/m, match => match + '\n' + holdButtonImport);
}

content = content.replace(/if \(!window\.confirm\("Are you sure you want to delete this event\?"\)\) return;/g, '');

const btnRegex = /<button type="button"\s*onClick=\{\(\) => handleDelete\(event\.id\)\}\s*className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500\/10 text-red-500 hover:bg-red-500\/20 transition-colors"\s*>\s*<i className="fa-solid fa-trash text-xs"><\/i>\s*<\/button>/;

const newBtn = `<HoldButton size="sm" onHold={() => handleDelete(event.id)} radius={8} backgroundColor="rgba(239,68,68,0.1)" fillColor="#ef4444" textColor="#ef4444" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`;

content = content.replace(btnRegex, newBtn);
fs.writeFileSync(file, content);
console.log("Patched AdminAcademicCalendar");

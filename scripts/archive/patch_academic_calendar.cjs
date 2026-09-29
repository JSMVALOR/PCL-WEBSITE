const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetHeaderRegex = /<div className="flex justify-between items-center bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] shadow-none rounded-2xl p-6">/g;
const replacementHeader = '<div className="flex justify-between items-center py-6 border-b border-black/[0.04] dark:border-white/[0.04] shrink-0">';
content = content.replace(targetHeaderRegex, replacementHeader);

const targetTableRegex = /<div className="overflow-x-auto bg-white\/70 dark:bg-white\/\[0\.03\] backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-2xl">/g;
const replacementTable = '<div className="overflow-x-auto">';
content = content.replace(targetTableRegex, replacementTable);

fs.writeFileSync(file, content);

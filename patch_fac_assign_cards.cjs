const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

// Unbox forms
content = content.replace(/bg-black\/5 dark:bg-themePanel backdrop-blur-xl border border-black\/10 dark:border-white\/10 rounded-xl px-4 py-3\.5/g, 'bg-transparent border-b-2 border-black/10 dark:border-white/10 px-0 py-2.5 hover:border-black/20 focus:border-amber-500 rounded-none');

// Unbox cards
content = content.replace(/className="grid grid-cols-1 lg:grid-cols-2 gap-5"/, 'className="flex flex-col"');
content = content.replace(/className="bg-black\/\[0\.02\] dark:bg-white\/\[0\.02\] backdrop-blur-xl border border-black\/5 dark:border-white\/5 rounded-2xl p-5 hover:border-black\/10 dark:hover:border-white\/10 transition flex flex-col gap-4 group"/g, 'className="py-5 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex flex-col gap-4 group px-4"');

fs.writeFileSync(file, content);

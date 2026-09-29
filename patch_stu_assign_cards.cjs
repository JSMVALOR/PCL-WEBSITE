const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Assignments/Assignments.jsx';
let content = fs.readFileSync(file, 'utf8');

// Unbox cards in student portal
content = content.replace(/className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"/g, 'className="flex flex-col"');
content = content.replace(/className=\{`\$\{theme\.layout\.panel\} border border-black\/10 dark:border-white\/20 rounded-\[2rem\] hover:border-black\/5 dark:border-white\/10 transition duration-300 overflow-hidden flex flex-col relative group`\}/g, 'className={`py-6 border-b border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex flex-col relative group px-4`}');

// Also for submitted and graded views
content = content.replace(/className=\{`\$\{theme\.layout\.panel\} border border-black\/10 dark:border-white\/20 rounded-\[2rem\] flex flex-col relative`\}/g, 'className={`py-6 border-b border-black/5 dark:border-white/10 flex flex-col relative px-4`}');

fs.writeFileSync(file, content);

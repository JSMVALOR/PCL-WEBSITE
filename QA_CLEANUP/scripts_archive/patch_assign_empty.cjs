const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    `className="w-full py-20 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 border-dashed"`,
    `className="w-full py-16 flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 shadow-sm"`
);

fs.writeFileSync(p, c);
console.log("Empty state patched.");

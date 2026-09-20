const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    '<h2 className="text-[12px] font-bold tracking-tight text-[#8E8E93]">Your Active Subjects</h2>',
    '<h2 className="text-[11px] font-black uppercase tracking-widest text-themeTextSec mb-4 px-2">Assigned Subjects</h2>'
);

const oldClass = "className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 rounded-2xl overflow-hidden cursor-pointer transition duration-300 group flex flex-col ${";
const newClass = "className={`bg-themeApp border rounded-[1.25rem] overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col ${";
c = c.replace(oldClass, newClass);

c = c.replace(
    "isSelected ? 'shadow-lg scale-[1.02]' : 'border-black/5 dark:border-white/5 hover:border-black/20'",
    "isSelected ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02] border-transparent z-10' : 'border-themeBorder hover:border-themeAccent/50'"
);

fs.writeFileSync(p, c);
console.log("Gentle UI polish applied to FacultyCourses");

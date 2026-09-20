const fs = require('fs');
let p = 'src/ERP/components/Student/Timetable/Timetable.jsx';
let c = fs.readFileSync(p, 'utf8');

// Polish SubjectFlipCard
const oldCard = `className="w-full h-32 rounded-3xl bg-black/5 dark:bg-white/5 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-4 flex flex-col justify-between cursor-pointer group hover:bg-black/10 dark:hover:bg-white/10 transition"`;
const newCard = `className="w-full h-36 rounded-[1.5rem] bg-themeApp border border-themeBorder shadow-sm p-5 flex flex-col justify-between cursor-pointer group hover:shadow-md hover:border-themeAccent/50 transition-all duration-300"`;
c = c.replace(oldCard, newCard);

// Make the icon bigger in flip card
c = c.replace(
    `<div className={\`w-10 h-10 rounded-2xl \${c.bg} \${c.text} flex items-center justify-center\`}>`,
    `<div className={\`w-10 h-10 rounded-[10px] \${c.bg} \${c.text} flex items-center justify-center shadow-sm\`}>`
);

// Enhance timeline item
c = c.replace(
    `className="w-20 shrink-0 flex flex-col items-end pt-4"`,
    `className="w-20 shrink-0 flex flex-col items-end pt-5"`
);
c = c.replace(
    `<div className="text-[13px] font-bold text-gray-900 dark:text-white">{lec.time}</div>`,
    `<div className="text-[13px] font-black text-themeText">{lec.time}</div>`
);

const oldLecCard = `className={\`flex-1 p-5 rounded-3xl bg-black/5 dark:bg-white/5 backdrop-blur-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between hover:bg-black/10 dark:hover:bg-white/10 transition group-hover:scale-[1.01] \${isCurrent ? \`\${c.bg} border-transparent\` : ''}\`}`;
const newLecCard = `className={\`flex-1 p-6 rounded-[1.5rem] bg-themeApp border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group-hover:scale-[1.01] \${isCurrent ? \`\${c.bg} border-\${c.border}\` : 'border-themeBorder'}\`}`;
c = c.replace(oldLecCard, newLecCard);

fs.writeFileSync(p, c);
console.log("Timetable UI polished");

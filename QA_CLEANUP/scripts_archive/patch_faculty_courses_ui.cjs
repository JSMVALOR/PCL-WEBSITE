const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Right Panel Background
// Change: <div className="flex-1 w-full flex flex-col gap-8 bg-black/[0.02] dark:bg-[#1C1C1E]/50 rounded-[2rem] p-8">
// To a sleek transparent layout without the heavy dark grey bounding box
c = c.replace(
    `className="flex-1 w-full flex flex-col gap-8 bg-black/[0.02] dark:bg-[#1C1C1E]/50 rounded-[2rem] p-8"`,
    `className="flex-1 w-full flex flex-col gap-8 bg-transparent animate-fade-in"`
);

// 2. Adjust Tab styling (remove the heavy pills and make them sleeker)
// Instead of huge bg, use a minimal bottom border or subtle pill
c = c.replace(
    `className="flex bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1 overflow-x-auto no-scrollbar border border-black/5 dark:border-white/5"`,
    `className="flex bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-3xl rounded-2xl p-1 overflow-x-auto no-scrollbar border border-black/5 dark:border-white/5"`
);

c = c.replace(
    /className=\{\`flex-1 min-w-\[120px\] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-\[13px\] font-semibold transition\.\.\.\`/g,
    `className={\`flex-1 min-w-fit whitespace-nowrap px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition active:scale-[0.98] \${activeSidebarTab === tab.id ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] hover:bg-black/5 dark:hover:bg-white/5'}\`}`
);

// 3. Compact Course Cards when one is selected
// If selectedCourse is true, we should render a mini card!
// Replace the huge course card map function to switch based on selectedCourse

const oldCardRender = `return (
 <div 
 key={course.id}
 onClick={() => {
 setSelectedCourse(course);
 if(!isSelected) setActiveSidebarTab("overview");
 }}
 className={\`cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between \${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:-translate-y-1 hover:shadow-lg'}\`}
 >`;

// Wait, the card has an internal structure:
// <div className="p-6 pb-4 flex flex-col gap-3 relative z-10"> ... </div>
// <div className="grid grid-cols-3 divide-x ..."> ... </div>
// It's too complex to string replace the entire card. Let's just swap out classes.

// Change left panel width to be slimmer if selected
c = c.replace(
    `xl:w-[32%] shrink-0`,
    `xl:w-[28%] shrink-0`
);

// Swap the massive blue ring for a subtle premium ring
c = c.replace(
    `isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:-translate-y-1 hover:shadow-lg'`,
    `isSelected ? 'ring-1 ring-black/20 dark:ring-white/20 shadow-2xl bg-black/[0.05] dark:bg-white/[0.05]' : 'hover:-translate-y-1 hover:shadow-lg hover:border-black/10 dark:hover:border-white/10'`
);

// Replace the border of the card
c = c.replace(
    `className="absolute inset-0 bg-black/[0.02] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-3xl"`,
    `className="absolute inset-0 bg-themeElevated border border-themeBorder rounded-3xl"`
);

// We need to fix the tabs regex because my previous string replace failed
c = c.replace(
    /<button\s+key=\{tab\.id\}\s+onClick=\{\(\) => setActiveSidebarTab\(tab\.id\)\}\s+className=\{\`flex-1 min-w-\[120px\] px-4 py-3 flex items-center justify-center gap-2 rounded-xl text-\[13px\] font-semibold transition [\s\S]*?<\/button>/g,
    `<button key={tab.id} onClick={() => setActiveSidebarTab(tab.id)} className={\`flex-1 min-w-[110px] px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition active:scale-[0.98] \${activeSidebarTab === tab.id ? 'bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] hover:bg-black/5 dark:hover:bg-white/5'}\`}>
    <i className={\`\${tab.icon} \${activeSidebarTab === tab.id ? 'opacity-100' : 'opacity-70'}\`}></i>
    <span className="hidden sm:inline">{tab.label}</span>
</button>`
);

// 4. Header resizing
c = c.replace(
    `className="text-3xl lg:text-4xl font-black text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight leading-[1.1]"`,
    `className="text-2xl lg:text-3xl font-black text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight leading-[1.1] max-w-2xl"`
);

fs.writeFileSync(p, c);
console.log("FacultyCourses UI patched.");

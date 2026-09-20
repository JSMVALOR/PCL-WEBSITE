const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /\{\s*id:\s*"attendance",\s*label:\s*"Attendance",\s*icon:\s*"fa-clipboard-user"\s*\},\s*\{\s*id:\s*"assignments",\s*label:\s*"Assignments",\s*icon:\s*"fa-file-signature"\s*\},\s*\{\s*id:\s*"marks",\s*label:\s*"Marks Ledger",\s*icon:\s*"fa-lock"\s*\},\s*\{\s*id:\s*"roster",\s*label:\s*"Class Roster",\s*icon:\s*"fa-users-viewfinder"\s*\}/g,
    `{ id: "attendance", label: "Attendance & Roster", icon: "fa-clipboard-user" },
 { id: "assignments", label: "Assignments", icon: "fa-file-signature" },
 { id: "marks", label: "Marks Ledger", icon: "fa-lock" }`
);

// Tab styling - remove the heavy pill background and make it clean transparent underline-style or subtle pills
c = c.replace(
    /<div className="flex bg-black\/\[0\.04\] dark:bg-white\/\[0\.04\] p-1\.5 rounded-2xl border border-black\/5 dark:border-white\/5 overflow-x-auto no-scrollbar w-fit max-w-full">/g,
    `<div className="flex bg-transparent border-b border-black/10 dark:border-white/10 overflow-x-auto no-scrollbar w-full gap-6">`
);

// Replace the button classes for tabs
c = c.replace(
    /className=\{\`flex-1 min-w-\[110px\] px-4 py-2\.5 rounded-xl text-\[13px\] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 \$\{activeSidebarTab === tab\.id \? "bg-white dark:bg-\[#2C2C2E\] shadow-sm border border-black\/5 dark:border-white\/5" : "text-\[#8E8E93\] hover:text-\[#1C1C1E\] dark:hover:text-\[#F2F2F7\] border border-transparent hover:bg-black\/5 dark:hover:bg-white\/10"\}\`\}/g,
    `className={\`whitespace-nowrap pb-3 border-b-2 text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-2 \${activeSidebarTab === tab.id ? "border-amber-500 text-amber-500 dark:text-amber-400" : "border-transparent text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] hover:border-black/20 dark:hover:border-white/20"}\`}`
);

// Remove the obsolete ClassRoster rendering code
c = c.replace(
    /\{\/\* EMBEDDED CLASS ROSTER MODULE \*\/\}\s*\{activeSidebarTab === "roster" && \(\s*<div className="-m-4 lg:-m-8">\s*<ClassRoster subjectContext=\{selectedCourse\} \/>\s*<\/div>\s*\)\}/g,
    ``
);

fs.writeFileSync(p, c);
console.log("Patched tabs layout.");

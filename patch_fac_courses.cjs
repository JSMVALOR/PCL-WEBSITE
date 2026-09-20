const fs = require('fs');

const path = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let content = fs.readFileSync(path, 'utf8');

// Right panel background
content = content.replace(
    /className="flex-1 w-full bg-white\/40 dark:bg-themePanel\/40 backdrop-blur-3xl shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/5 dark:border-white\/5 rounded-\[2rem\] flex flex-col animate-slide-in-right overflow-hidden min-h-\[750px\] relative"/g,
    'className="flex-1 w-full bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/5 dark:border-white/10 rounded-[2rem] flex flex-col animate-slide-in-right overflow-hidden min-h-[750px] relative"'
);

// Right panel header icon color logic
content = content.replace(
    /THEME_COLORS\[getBatchColorKey\(selectedCourse\?\.batches\?\.\[0\]\)\]/g,
    'THEME_COLORS[selectedCourse?.master_subjects?.theme_color]'
);

// Inner badge bg-themeApp
content = content.replace(
    /className="bg-themeApp border border-black\/5 dark:border-white\/5 px-3 py-1 rounded-full text-\[12px\] font-bold tracking-tight text-themeTextSec"/g,
    'className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight text-themeTextSec"'
);

// Overview inner cards (Course Synopsis)
content = content.replace(
    /className="bg-themeApp border border-black\/5 dark:border-white\/5 rounded-2xl p-6 flex flex-col justify-center"/g,
    'className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center"'
);
content = content.replace(
    /className="bg-themeApp border border-black\/5 dark:border-white\/5 rounded-2xl p-6 flex items-center justify-between"/g,
    'className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between"'
);

// Resources inner cards
content = content.replace(
    /className="bg-themeApp border border-black\/5 dark:border-white\/5 rounded-2xl p-5 flex flex-col gap-4 relative"/g,
    'className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative"'
);
content = content.replace(
    /className="text-center p-8 bg-themeApp rounded-2xl border border-black\/5 dark:border-white\/5 border-dashed"/g,
    'className="text-center p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] rounded-2xl border border-black/10 dark:border-white/10 border-dashed"'
);
content = content.replace(
    /className="bg-themeApp border border-black\/5 dark:border-white\/5 rounded-xl p-4 hover:border-\[\#007AFF\]\/50 transition group flex items-center justify-between"/g,
    'className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl p-4 hover:border-themeAccent/50 transition group flex items-center justify-between shadow-sm hover:shadow-md"'
);

// Inner grid left cards
content = content.replace(
    /className="grid grid-cols-3 divide-x divide-black\/5 dark:divide-white\/5 border-b border-black\/5 dark:border-white\/5 bg-transparent backdrop-blur-xl"/g,
    'className="grid grid-cols-3 divide-x divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5 bg-transparent"'
);
content = content.replace(
    /className="p-5 border-b border-black\/5 dark:border-white\/5\/50 flex flex-col gap-2 relative overflow-hidden z-10"/g,
    'className="p-5 flex flex-col gap-2 relative overflow-hidden z-10"'
);


fs.writeFileSync(path, content);
console.log("Scrubbed right panel and inner cards in FacultyCourses.jsx!");

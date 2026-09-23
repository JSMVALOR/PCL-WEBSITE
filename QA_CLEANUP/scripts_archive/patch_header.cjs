const fs = require('fs');

let fcPath = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let fc = fs.readFileSync(fcPath, 'utf8');

const oldHeader = `<div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: THEME_COLORS[getBatchColorKey(selectedCourse?.batches?.[0])]?.bg || THEME_COLORS.default.bg, color: THEME_COLORS[getBatchColorKey(selectedCourse?.batches?.[0])]?.primary || THEME_COLORS.default.primary }}>
 <i className="fa-solid fa-graduation-cap"></i>
 </div>
 <span className="bg-themeApp border border-black/5 dark:border-white/5 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight text-[#8E8E93]">
 {selectedCourse.code}
 </span>
 </div>
 <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{selectedCourse.name}</h2>
 </div>
 <button type="button" onClick={() => setSelectedCourse(null)} className="w-10 h-10 rounded-full bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 text-[#8E8E93] shadow-sm hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>`;

const newHeader = `<div className="relative overflow-hidden rounded-[2rem] bg-gray-900 dark:bg-white mb-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] border border-black/10 dark:border-white/10 group">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent mix-blend-overlay"></div>
 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
 <button type="button" onClick={() => setSelectedCourse(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 dark:bg-white/20 hover:bg-white dark:hover:bg-black hover:text-gray-900 dark:hover:text-white backdrop-blur-md border border-white/20 dark:border-black/20 text-white dark:text-gray-900 shadow-sm transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 z-10">
    <i className="fa-solid fa-xmark"></i>
 </button>
 <div className="relative p-8 lg:p-10 flex flex-col justify-end min-h-[220px]">
    <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-black/10 backdrop-blur-xl text-white dark:text-gray-900 flex items-center justify-center text-lg shadow-inner border border-white/20 dark:border-black/10">
            <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-white dark:text-gray-900 bg-white/20 dark:bg-black/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 dark:border-black/10 uppercase shadow-sm">
            {selectedCourse.code}
        </span>
    </div>
    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white dark:text-gray-900 leading-tight drop-shadow-sm max-w-2xl">
        {selectedCourse.name}
    </h2>
 </div>
 </div>`;

fc = fc.replace(oldHeader, newHeader);
fs.writeFileSync(fcPath, fc);
console.log("Course header patched!");

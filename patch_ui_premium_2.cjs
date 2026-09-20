const fs = require('fs');

let fcPath = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let fc = fs.readFileSync(fcPath, 'utf8');

const oldTab = '"bg-white dark:bg-[#2C2C2E] shadow-sm border border-black/5 dark:border-white/5"';
const newTab = '"bg-white dark:bg-[#2C2C2E] shadow-[0_4px_20px_rgb(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/5 scale-[1.02] z-10 text-gray-900 dark:text-white"';
fc = fc.split(oldTab).join(newTab);

const oldTabsCont = 'className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-fit max-w-full"';
const newTabsCont = 'className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-[1.25rem] border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-fit max-w-full mb-2"';
fc = fc.split(oldTabsCont).join(newTabsCont);

fs.writeFileSync(fcPath, fc);

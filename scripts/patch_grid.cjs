const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

// Wrapper
content = content.replace(/bg-white\/70 dark:bg-themePanel\/70 backdrop-blur-3xl saturate-\[1\.8\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\]/g, 'bg-themePanel border border-themeBorder');
content = content.replace(/border-b border-black\/\[0\.04\] dark:border-white\/\[0\.08\]/g, 'border-b border-themeBorder');
content = content.replace(/hover:bg-black\/\[0\.02\] dark:hover:bg-white\/\[0\.02\]/g, 'hover:bg-themeElevated');

// Inputs
content = content.replace(/bg-black\/5 dark:bg-white\/5 px-3 py-2 text-sm font-medium text-themeText border border-black\/10  focus:border-themeAccent focus:bg-white\/50 dark:focus:bg-black\/20/g, 'bg-themeElevated px-3 py-2 text-sm font-medium text-themeText border border-themeBorder focus:border-themeAccent focus:bg-themePanel');

// Buttons
content = content.replace(/bg-black\/5 dark:bg-white\/10 text-themeText font-bold text-\[13px\] hover:bg-black\/10 dark:hover:bg-white\/20/g, 'bg-themeElevated border border-themeBorder text-themeText font-bold text-[13px] hover:bg-themeBorder');
content = content.replace(/text-white font-bold/g, 'text-themeApp font-bold');

fs.writeFileSync(file, content);

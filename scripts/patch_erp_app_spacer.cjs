const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

const hook = " {/* Spacer for TopNav - Always present on Mobile because TopNav is always the mobile header! */}\n <div className={`shrink-0 w-full pointer-events-none transition duration-500 hidden lg:block ${navLayout === 'classic' ? 'hidden' : 'h-[84px]'}`}></div>";
const fixed = " {/* Spacer for TopNav - Always present on Mobile because TopNav is always the mobile header! */}\n <div className={`shrink-0 w-full pointer-events-none transition duration-500 ${navLayout === 'classic' ? 'h-[72px] lg:hidden' : 'h-[72px] lg:h-[84px]'}`}></div>";

file = file.replace(hook, fixed);
fs.writeFileSync('Frontend/ERP/ErpApp.jsx', file);

const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminHeroBanner.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = 'className="relative z-10 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 w-full lg:w-auto lg:min-w-[340px] shrink-0"';
const replacement = 'className="relative z-10 w-full lg:w-auto lg:min-w-[340px] shrink-0"';

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

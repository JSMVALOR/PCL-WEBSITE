const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'lg:col-span-5 bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 h-max',
    'lg:col-span-5 h-max py-4'
);

content = content.replace(
    'lg:col-span-7 bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 h-[calc(100vh-14rem)] min-h-[600px] flex flex-col',
    'lg:col-span-7 h-[calc(100vh-14rem)] min-h-[600px] flex flex-col py-4'
);

fs.writeFileSync(file, content);

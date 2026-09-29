const fs = require('fs');
const file = 'Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'className="flex-1 w-full relative h-full rounded-2xl overflow-hidden group min-w-[280px] lg:max-w-[400px] shadow-none border border-black/[0.04] dark:border-white/[0.08]"',
    'className="flex-1 w-full relative h-full group min-w-[280px] lg:max-w-[400px]"'
);

fs.writeFileSync(file, content);

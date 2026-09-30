const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

// The original class is: className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer"
content = content.replace(
  /className="flex-1 min-w-\[140px\] flex items-center gap-4 relative group cursor-pointer"/g,
  'className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all"'
);

// There is one that doesn't have cursor-pointer (maybe Revenue?)
content = content.replace(
  /className="flex-1 min-w-\[140px\] flex items-center gap-4 relative"/g,
  'className="flex-1 min-w-[140px] flex items-center gap-4 relative bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm"'
);

// We need to also remove gap-6 lg:gap-10 and use grid instead so they size nicely, or just reduce gap to gap-4
content = content.replace(
  /className="flex flex-wrap lg:flex-nowrap gap-6 lg:gap-10 shrink-0"/g,
  'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0"'
);

fs.writeFileSync(file, content);

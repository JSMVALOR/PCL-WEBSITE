const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveRequests.jsx', 'utf8');

// Compact the cards on mobile
file = file.replace(
  'bg-themePanel shadow-sm border border-themeBorder dark:border-white/[0.08] rounded-[2rem] p-5 lg:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-themeAccent/30 transition-colors group',
  'bg-themePanel shadow-sm border border-themeBorder dark:border-white/[0.08] rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 lg:gap-6 hover:border-themeAccent/30 transition-colors group'
);

file = file.replace(
  '<div className="w-px h-6 bg-black/10 "></div>',
  '<div className="w-px h-6 bg-black/10 mx-1"></div>'
);

fs.writeFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveRequests.jsx', file);

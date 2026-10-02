const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/DashboardWidgets/FacultyWebClock.jsx', 'utf8');

file = file.replace(
  'className="w-full bg-themePanel rounded-2xl p-6 text-themeApp relative overflow-hidden border border-[#2C2C2E]"',
  'className="w-full bg-themeElevated/50 border border-themeBorder/50 p-6 rounded-3xl relative overflow-hidden flex flex-col h-full"'
);

fs.writeFileSync('Frontend/ERP/components/shared/DashboardWidgets/FacultyWebClock.jsx', file);
console.log("Patched WebClock theme");

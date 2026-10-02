const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Student/Notices/Notices.jsx', 'utf8');

file = file.replace(
  "className={`px-5 py-2 rounded-xl text-[12px] font-bold tracking-tight transition-all border ${",
  "className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all border ${"
);

fs.writeFileSync('Frontend/ERP/components/Student/Notices/Notices.jsx', file);

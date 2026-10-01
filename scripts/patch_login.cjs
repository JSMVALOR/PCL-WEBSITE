const fs = require('fs');
let file = 'Frontend/ERP/components/Login/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hardcoded white text for Powered By
content = content.replace(
  '<span className="text-[9px] font-bold tracking-[0.2em] text-white">POWERED BY</span>',
  '<span className="text-[9px] font-bold tracking-[0.2em] text-[var(--text-color)]">POWERED BY</span>'
);

content = content.replace(
  '<span className="text-[7px] font-bold tracking-[0.4em] text-white/40 mt-1 uppercase">PCL ERP Framework V8.25</span>',
  '<span className="text-[7px] font-bold tracking-[0.4em] text-[var(--text-color)] opacity-40 mt-1 uppercase">PCL ERP Framework V8.25</span>'
);

fs.writeFileSync(file, content);

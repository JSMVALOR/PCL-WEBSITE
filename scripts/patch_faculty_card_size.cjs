const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyCard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Reduce padding
content = content.replace(
  'p-3 md:p-6 overflow-hidden',
  'p-3 md:p-4 lg:p-5 overflow-hidden'
);

// 2. Reduce name size
content = content.replace(
  'text-[15px] md:text-2xl font-bold',
  'text-[15px] md:text-lg lg:text-xl font-bold'
);

// 3. Reduce designation size and tracking
content = content.replace(
  'text-[9px] md:text-sm font-bold text-[var(--primary-color)] group-hover:text-black/80 transition-colors duration-300 uppercase tracking-[0.15em] md:tracking-widest',
  'text-[9px] md:text-[10px] lg:text-xs font-bold text-[var(--primary-color)] group-hover:text-black/80 transition-colors duration-300 uppercase tracking-widest md:tracking-[0.1em] leading-tight'
);

fs.writeFileSync(file, content);

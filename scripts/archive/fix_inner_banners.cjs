const fs = require('fs');

// Fix EventsBoard
let file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-purple-500\/5 via-transparent to-transparent py-8 shrink-0">/,
    '<div className="relative w-full overflow-hidden border border-black/[0.04] dark:border-white/[0.08] bg-gradient-to-r from-purple-500/5 via-transparent to-transparent py-8 rounded-3xl shrink-0">'
);
fs.writeFileSync(file, content);

// Fix AcademicCalendarGrid
file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-themeAccent\/5 via-transparent to-transparent py-8 shrink-0">/,
    '<div className="relative w-full overflow-hidden border border-black/[0.04] dark:border-white/[0.08] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 rounded-3xl shrink-0 mb-6">'
);
fs.writeFileSync(file, content);


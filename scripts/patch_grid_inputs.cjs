const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

// Change the input styles to look like actual spreadsheet cells
content = content.replace(/className="w-full bg-transparent px-3 py-2 text-sm font-medium text-themeText border border-transparent focus:border-themeAccent\/30 focus:bg-white\/50 dark:focus:bg-black\/20 rounded-lg outline-none transition-all"/g, 'className="w-full bg-black/5 dark:bg-white/5 px-3 py-2 text-sm font-medium text-themeText border border-black/10 dark:border-white/10 focus:border-themeAccent focus:bg-white/50 dark:focus:bg-black/20 rounded-lg outline-none transition-all"');

fs.writeFileSync(file, content);

const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx';
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(/bg-blue-500\/5 border border-blue-500\/20/g, 'bg-themeAccent/5 border border-themeAccent/20');
content = content.replace(/text-blue-500/g, 'text-themeAccent');

// Select Dropdown
content = content.replace(/bg-white dark:bg-black border border-blue-500\/20/g, 'bg-themePanel border border-themeAccent/40');
content = content.replace(/focus:border-blue-500/g, 'focus:border-themeAccent');

// Table
content = content.replace(/bg-gray-50\/50 dark:bg-white\/\[0\.02\]/g, 'bg-themeElevated/50');
content = content.replace(/hover:bg-gray-50\/50 dark:hover:bg-white\/\[0\.02\]/g, 'hover:bg-themeElevated/50');
content = content.replace(/border-gray-100/g, 'border-themeBorder');

// Select Cell
content = content.replace(/bg-emerald-500\/10 border-emerald-500\/20 text-emerald-600 dark:text-emerald-400/g, 'bg-themeAccent/10 border-themeAccent/20 text-themeAccent');
content = content.replace(/bg-gray-50 dark:bg-black/g, 'bg-themeElevated');

fs.writeFileSync(file, content);

const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/DialogContainer.jsx', 'utf8');

file = file.replace(/text-gray-900/g, 'text-themeText');
file = file.replace(/text-gray-500 dark:text-gray-400/g, 'text-themeTextSec');
file = file.replace(/text-gray-700 dark:text-gray-300/g, 'text-themeTextSec hover:text-themeText');
file = file.replace(/bg-gray-100 text-gray-600/g, 'bg-themeElevated text-themeTextSec');
file = file.replace(/border-gray-200/g, 'border-themeBorder');
file = file.replace(/border-gray-100/g, 'border-themeBorder');
file = file.replace(/bg-gray-900 hover:bg-black dark:bg-themePanel dark:hover:bg-gray-100 text-themeApp/g, 'bg-themeText text-themeApp hover:opacity-90');
file = file.replace(/dark:hover:bg-\[\#2a2a2a\]/g, 'hover:bg-themeBorder/50');
file = file.replace(/bg-blue-50 text-blue-500 dark:bg-blue-500\/10 dark:text-blue-400/g, 'bg-themeAccent/10 text-themeAccent');
file = file.replace(/bg-blue-600 hover:bg-blue-700 text-themeApp/g, 'bg-themeAccent hover:bg-themeAccent/90 text-themeApp');
file = file.replace(/focus:border-blue-500/g, 'focus:border-themeAccent');

fs.writeFileSync('Frontend/ERP/components/shared/DialogContainer.jsx', file);

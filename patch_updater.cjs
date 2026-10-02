const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/SystemUpdater.jsx', 'utf8');

file = file.replace(/text-\[\#3A3A3C\] dark:text-\[\#EBEBF5\]\/60/g, 'text-themeTextSec');
file = file.replace(/hover:bg-\[\#006DEB\]/g, 'hover:bg-themeAccent/80');

fs.writeFileSync('Frontend/ERP/components/shared/SystemUpdater.jsx', file);

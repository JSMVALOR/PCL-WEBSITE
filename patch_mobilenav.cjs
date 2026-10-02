const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/MobileNav.jsx', 'utf8');
file = file.replace(/text-\[\#3A3A3C\]\/70 dark:text-\[\#EBEBF5\]\/70/g, 'text-themeTextSec');
fs.writeFileSync('Frontend/ERP/components/shared/MobileNav.jsx', file);

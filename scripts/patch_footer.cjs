const fs = require('fs');
let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace dark: and hardcoded colors in footer
content = content.replace(/text-themeTextSec dark:text-white\/50/g, 'text-themeTextSec');
content = content.replace(/hover:text-themeText dark:text-white/g, 'hover:text-themeText');
content = content.replace(/text-black dark:text-white/g, 'text-themeText');
content = content.replace(/dark:border-white\/5/g, '');

fs.writeFileSync(file, content);

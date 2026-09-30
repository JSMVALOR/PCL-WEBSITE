const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/dark:bg-\[\#111\]/g, 'dark:bg-themeApp');
content = content.replace(/bg-\[\#cda75b\]\/10/g, 'bg-themeAccent/10');
content = content.replace(/text-\[\#cda75b\]/g, 'text-themeAccent');
content = content.replace(/bg-\[\#cda75b\]/g, 'bg-themeAccent');
content = content.replace(/hover:bg-\[\#b59049\]/g, 'hover:opacity-90');
content = content.replace(/shadow-\[\#cda75b\]\/20/g, 'shadow-themeAccent/20');
content = content.replace(/hover:text-\[\#cda75b\]/g, 'hover:text-themeAccent');

fs.writeFileSync(file, content);

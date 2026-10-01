const fs = require('fs');

// Patch ErpApp.jsx
const erpAppFile = 'Frontend/ERP/ErpApp.jsx';
let erpApp = fs.readFileSync(erpAppFile, 'utf8');

// Replace bg-gray-50 dark:bg-black with bg-themeApp text-themeText
erpApp = erpApp.replace(/bg-gray-50 dark:bg-black/g, 'bg-themeApp');
// Replace selection:bg-white dark:bg-[#121212] with selection:bg-themeAccent/20
erpApp = erpApp.replace(/selection:bg-white dark:bg-\[#121212\]/g, 'selection:bg-themeAccent/20');
// Replace bg-white dark:bg-[#121212]/30 in the Footer
erpApp = erpApp.replace(/bg-white dark:bg-\[#121212\]\/30/g, 'bg-themePanel/80 backdrop-blur-md');

fs.writeFileSync(erpAppFile, erpApp);

// Patch TopNav.jsx
const topNavFile = 'Frontend/ERP/components/shared/TopNav.jsx';
let topNav = fs.readFileSync(topNavFile, 'utf8');

// Replace bg-white/70 dark:bg-themePanel/70 with bg-themeApp/80 dark:bg-themePanel/80
topNav = topNav.replace(/bg-white\/70 dark:bg-themePanel\/70/g, 'bg-themeApp/80 backdrop-blur-3xl');
// Replace bg-white dark:bg-themePanel with bg-themePanel
topNav = topNav.replace(/bg-white dark:bg-themePanel/g, 'bg-themePanel');

fs.writeFileSync(topNavFile, topNav);

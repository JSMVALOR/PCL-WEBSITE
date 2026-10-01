const fs = require('fs');

let topNav = fs.readFileSync('Frontend/ERP/components/shared/TopNav.jsx', 'utf8');
topNav = topNav.replace(/pcl_logo\.svg/g, 'pcl_logo_gold.svg');
// Remove theme-logo class if it exists
topNav = topNav.replace(/className="(.*?)theme-logo(.*?)"/g, 'className="$1$2"');
fs.writeFileSync('Frontend/ERP/components/shared/TopNav.jsx', topNav);

let sidebar = fs.readFileSync('Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx', 'utf8');
sidebar = sidebar.replace(/pcl_logo\.svg/g, 'pcl_logo_gold.svg');
sidebar = sidebar.replace(/className="(.*?)theme-logo(.*?)"/g, 'className="$1$2"');
fs.writeFileSync('Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx', sidebar);

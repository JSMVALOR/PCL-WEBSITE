const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');
file = file.replace(/pcl_logo\.svg/g, 'pcl_logo_gold.svg');
file = file.replace(/className="(.*?)theme-logo(.*?)"/g, 'className="$1$2"');
fs.writeFileSync('Frontend/ERP/ErpApp.jsx', file);

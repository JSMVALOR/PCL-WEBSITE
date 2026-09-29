const fs = require('fs');
const file = 'Frontend/ERP/components/shared/TopNav.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/group-hover\/btn:bg-\[#007AFF\]\/5/g, 'group-hover/btn:bg-themeAccent/5');
content = content.replace(/group-hover\/btn:border-\[#007AFF\]\/10/g, 'group-hover/btn:border-themeAccent/10');

fs.writeFileSync(file, content);

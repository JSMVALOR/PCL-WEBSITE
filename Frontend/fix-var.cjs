const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/isSpotAdmissionsOpen/g, 'isSpotOpen');
fs.writeFileSync(file, content);
console.log('done');

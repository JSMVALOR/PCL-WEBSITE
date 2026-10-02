const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  / \)\}\n <\/div>\n \)\} <\/div>\n \)\}/g,
  ` )}\n </div>\n )}`
);

fs.writeFileSync(file, content);
console.log('done');

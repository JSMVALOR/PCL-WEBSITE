const fs = require('fs');
const file = 'ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /'\.\.\/\.\.\/\.\.\/Shared\/context\/NotificationContext'/,
  `'../../../../Shared/context/NotificationContext.jsx'`
);
fs.writeFileSync(file, content);
console.log('done');

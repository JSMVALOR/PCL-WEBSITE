const fs = require('fs');
const file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {\n                Notification.requestPermission();\n            }',
  '// Notification permission request disabled for aggressive prompting'
);

fs.writeFileSync(file, content);

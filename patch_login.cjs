const fs = require('fs');
const file = 'Frontend/ERP/components/Login/Login.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'activeTheme.includes("imperial")',
  'activeTheme.includes("imperial") || activeTheme.includes("royal")'
);

fs.writeFileSync(file, content);

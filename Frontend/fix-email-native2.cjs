const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \{ error: resetError \} = await provisionClient\.auth\.resetPasswordForEmail[\s\S]*?if \(resetError\) throw resetError;[\s\S]*?addLog\(`\[SUCCESS\] Setup link successfully dispatched to \$\{app\.email\}!`\);\s*\n/g,
  ''
);

fs.writeFileSync(file, content);
console.log('done');

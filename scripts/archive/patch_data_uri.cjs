const fs = require('fs');
const files = [
  'Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx',
  'Frontend/ERP/components/shared/TopNav.jsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\.match\(\/\^\(\\\/\|http\)\/\)/g, '.match(/^(\\/|http|data)/)');
  fs.writeFileSync(file, content);
  console.log("Patched", file);
}

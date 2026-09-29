const fs = require('fs');
const file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const VALID_ROLES = ['student', 'faculty', 'admin'];",
  "const VALID_ROLES = ['student', 'faculty', 'admin', 'parent'];"
);

fs.writeFileSync(file, content);

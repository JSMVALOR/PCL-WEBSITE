const fs = require('fs');
let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import AdminWhatsAppQueue')) {
  // Find a good place to insert it
  content = content.replace(
    /import AdminAdmissions from '\.\/components\/Admin\/AdminAdmissions\/AdminAdmissions';/,
    "import AdminAdmissions from './components/Admin/AdminAdmissions/AdminAdmissions';\nimport AdminWhatsAppQueue from './components/Admin/AdminWhatsApp/AdminWhatsAppQueue';"
  );
  fs.writeFileSync(file, content);
}

const fs = require('fs');
let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import if missing
if (!content.includes('AdminWhatsAppQueue')) {
    // Wait, the file has it in the case statement, but not at the top.
    const importStmt = "import AdminWhatsAppQueue from './components/Admin/AdminWhatsApp/AdminWhatsAppQueue';\n";
    content = content.replace(/import AdminHelpdesk from '\.\/components\/Admin\/AdminHelpdesk\/AdminHelpdesk';/, "import AdminHelpdesk from './components/Admin/AdminHelpdesk/AdminHelpdesk';\n" + importStmt);
}

fs.writeFileSync(file, content);

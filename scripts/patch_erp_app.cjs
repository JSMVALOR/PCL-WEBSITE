const fs = require('fs');
let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

const importAdminWhatsApp = "import AdminWhatsAppQueue from './components/Admin/AdminWhatsApp/AdminWhatsAppQueue';\n";
if (!content.includes('AdminWhatsAppQueue')) {
    content = content.replace("import SQLStudio from './components/Admin/SQLStudio/SQLStudio';", importAdminWhatsApp + "import SQLStudio from './components/Admin/SQLStudio/SQLStudio';");
}

if (!content.includes("case 'whatsapp': return <AdminWhatsAppQueue />;")) {
    content = content.replace("case 'helpdesk': return <AdminHelpdesk />;", "case 'helpdesk': return <AdminHelpdesk />;\n        case 'whatsapp': return <AdminWhatsAppQueue />;");
}

fs.writeFileSync(file, content);

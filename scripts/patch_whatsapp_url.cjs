const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/http:\/\/localhost:3005\/api\/whatsapp\/status/g, 'http://${window.location.hostname}:3005/api/whatsapp/status');
content = content.replace(/http:\/\/localhost:3005\/api\/whatsapp\/logout/g, 'http://${window.location.hostname}:3005/api/whatsapp/logout');

// Need to fix the literal string to template literal
content = content.replace(/'http:\/\/\$\{window\.location\.hostname\}:3005\/api\/whatsapp\/status'/g, '`http://${window.location.hostname}:3005/api/whatsapp/status`');
content = content.replace(/'http:\/\/\$\{window\.location\.hostname\}:3005\/api\/whatsapp\/logout'/g, '`http://${window.location.hostname}:3005/api/whatsapp/logout`');

fs.writeFileSync(file, content);

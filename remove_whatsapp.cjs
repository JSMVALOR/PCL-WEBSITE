const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminSidebar/AdminSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

// The WhatsApp Engine tab might be in AdminSidebar, or maybe in ErpApp.jsx?
// Let's check where WhatsAppAdmin is imported and rendered.

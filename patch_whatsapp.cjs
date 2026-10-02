const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'utf8');
file = file.replace(/bg-white/g, 'bg-themeElevated');
file = file.replace(/border-gray-200/g, 'border-themeBorder');
fs.writeFileSync('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', file);

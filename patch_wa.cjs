const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', 'utf8');

file = file.replace(
  "const ENGINE_URL = 'http://localhost:3005';",
  "const ENGINE_URL = import.meta.env.VITE_WHATSAPP_ENGINE_URL || 'http://localhost:3005';"
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx', file);

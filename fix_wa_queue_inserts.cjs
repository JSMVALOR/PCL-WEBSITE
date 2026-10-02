const fs = require('fs');

// 1. AdminWhatsAppQueue.jsx
let path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  'phone: selectedGroup,',
  "phone: selectedGroup.replace('@g.us', ''),"
);
fs.writeFileSync(path, content);
console.log("Patched AdminWhatsAppQueue.jsx");

// 2. AdminNotices.jsx (Notice hook)
path = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
content = fs.readFileSync(path, 'utf8');
content = content.replace(
  'phone: phone,',
  "phone: phone.replace('@g.us', ''),"
);
// and for the first hook:
content = content.replace(
  'phone: groupId,',
  "phone: groupId.replace('@g.us', ''),"
);
fs.writeFileSync(path, content);
console.log("Patched AdminNotices.jsx");

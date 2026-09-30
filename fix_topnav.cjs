const fs = require('fs');
let file = 'Frontend/ERP/components/shared/TopNav.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\(userSession\.profile_picture_url \|\| getAvatarUrl\(userSession\)\)/g, '(userSession?.profile_picture_url || getAvatarUrl(userSession))');
content = content.replace(/encodeURIComponent\(userSession\.name \|\| 'US'\)/g, "encodeURIComponent(userSession?.name || 'US')");

fs.writeFileSync(file, content);

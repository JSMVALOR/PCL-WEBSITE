const fs = require('fs');
let file = 'Frontend/ERP/components/shared/Navigation/SidebarFramework.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\(userSession\.profile_picture_url \|\| getLocalAvatar\(userSession\.name\)\)/g, '(userSession?.profile_picture_url || getLocalAvatar(userSession?.name))');

fs.writeFileSync(file, content);

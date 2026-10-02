const fs = require('fs');
let path = 'Backend/whatsapp-engine/Dockerfile';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('chromium \\', 'chromium \\\n    git \\');
fs.writeFileSync(path, content);
console.log('Added git to Dockerfile');

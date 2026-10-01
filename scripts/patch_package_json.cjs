const fs = require('fs');
let content = fs.readFileSync('package.json', 'utf8');

content = content.replace(
    /"dev": "concurrently \\"vite\\" \\"node Backend\/email-service\/server\.js\\""/,
    `"dev": "concurrently \\"vite\\" \\"node Backend/email-service/server.js\\" \\"node Backend/whatsapp-engine/server.js\\""`
);

fs.writeFileSync('package.json', content);

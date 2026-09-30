const fs = require('fs');
let file = 'Frontend/ERP/lib/emailtemplate.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /<\/a>\` : ''\`\n    \)\n\n    PLACEMENT_STATUS_UPDATE:/,
    `</a>\` : ''\`\n    ),\n\n    PLACEMENT_STATUS_UPDATE:`
);

fs.writeFileSync(file, content);

const fs = require('fs');
let file = 'Frontend/ERP/lib/emailtemplate.js';
let content = fs.readFileSync(file, 'utf8');

// I need to find PLACEMENT_STATUS_UPDATE and ensure the previous block ends with a comma.
// The block before it was ASSIGNMENT_PUBLISHED.
content = content.replace(
    /<\/div>`\n\s*\)\s*\n\s*PLACEMENT_STATUS_UPDATE:/,
    '</div>`\n    ),\n\n    PLACEMENT_STATUS_UPDATE:'
);

fs.writeFileSync(file, content);

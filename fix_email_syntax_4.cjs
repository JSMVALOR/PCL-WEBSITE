const fs = require('fs');
let file = 'Frontend/ERP/lib/emailtemplate.js';
let content = fs.readFileSync(file, 'utf8');

// replace "    )\n\n    PLACEMENT_STATUS_UPDATE" with "    ),\n\n    PLACEMENT_STATUS_UPDATE"
content = content.replace("    )\n\n    PLACEMENT_STATUS_UPDATE", "    ),\n\n    PLACEMENT_STATUS_UPDATE");

fs.writeFileSync(file, content);

const fs = require('fs');
let file = 'Frontend/ERP/lib/EmailService.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /HTML_EMAIL_TEMPLATES\.SHORTAGE_WARNING\(params\) \}\)\n\s*FEE_PAYMENT_RECEIPT/g,
    'HTML_EMAIL_TEMPLATES.SHORTAGE_WARNING(params) }),\n    FEE_PAYMENT_RECEIPT'
);

fs.writeFileSync(file, content);

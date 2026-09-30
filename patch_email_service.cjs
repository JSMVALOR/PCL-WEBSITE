const fs = require('fs');

// Add to emailtemplate.js
let templateFile = 'Frontend/ERP/lib/emailtemplate.js';
let templateContent = fs.readFileSync(templateFile, 'utf8');

const rejectTemplate = `
    APPLICATION_REJECTED: (params) => buildEmailHtml(
        'Update on Your Admission Application',
        \`<p>Dear \${params.student_name},</p>
        <p>Thank you for your interest in the <strong>\${params.program}</strong> at Prudentia College of Law.</p>
        <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
        <p>We appreciate the time you took to apply and wish you the best in your future academic endeavors.</p>\`
    ),
`;

templateContent = templateContent.replace(/APPLICATION_RECEIVED: \(params\) => buildEmailHtml\(/, rejectTemplate + "\n    APPLICATION_RECEIVED: (params) => buildEmailHtml(");
fs.writeFileSync(templateFile, templateContent);

// Add to EmailService.js
let serviceFile = 'Frontend/ERP/lib/EmailService.js';
let serviceContent = fs.readFileSync(serviceFile, 'utf8');

const rejectService = `
    APPLICATION_REJECTED: (params) => ({
        subject: \`Update on Your Admission Application\`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_REJECTED(params) }),
`;

serviceContent = serviceContent.replace(/APPLICATION_RECEIVED: \(params\) => \(\{/, rejectService + "\n    APPLICATION_RECEIVED: (params) => ({");
fs.writeFileSync(serviceFile, serviceContent);


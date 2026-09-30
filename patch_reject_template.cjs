const fs = require('fs');

let templateFile = 'Frontend/ERP/lib/emailtemplate.js';
let templateContent = fs.readFileSync(templateFile, 'utf8');

const oldTemplate = `
    APPLICATION_REJECTED: (params) => buildEmailHtml(
        'Update on Your Admission Application',
        \`<p>Dear \${params.student_name},</p>
        <p>Thank you for your interest in the <strong>\${params.program}</strong> at Prudentia College of Law.</p>
        <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
        <p>We appreciate the time you took to apply and wish you the best in your future academic endeavors.</p>\`
    ),`;

const newTemplate = `
    APPLICATION_REJECTED: (params) => buildEmailHtml(
        'Update on Your Admission Application',
        \`<p>Dear \${params.student_name},</p>
        <p>Thank you for your interest in the <strong>\${params.program}</strong> at Prudentia College of Law.</p>
        <p>After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
        \${params.reason ? \`<div class="data-box"><div class="data-row"><span class="data-label">Message from Admissions</span><span class="data-value">\${params.reason}</span></div></div>\` : ''}
        <p>We appreciate the time you took to apply and wish you the best in your future academic endeavors.</p>\`
    ),`;

templateContent = templateContent.replace(oldTemplate, newTemplate);
fs.writeFileSync(templateFile, templateContent);


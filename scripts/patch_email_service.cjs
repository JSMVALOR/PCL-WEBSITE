const fs = require('fs');

const file = 'Frontend/ERP/lib/EmailService.js';
let content = fs.readFileSync(file, 'utf8');

const missingKeys = `    FEE_PAYMENT_RECEIPT: (params) => ({
        subject: \`Fee Payment Receipt - \${params.fee_type}\`,
        message_body: HTML_EMAIL_TEMPLATES.FEE_PAYMENT_RECEIPT(params) }),

    PLACEMENT_STATUS_UPDATE: (params) => ({
        subject: \`Placement Update: \${params.company_name}\`,
        message_body: HTML_EMAIL_TEMPLATES.PLACEMENT_STATUS_UPDATE(params) }),

    MENTOR_ASSIGNED: (params) => ({
        subject: \`New Faculty Mentor Assigned\`,
        message_body: HTML_EMAIL_TEMPLATES.MENTOR_ASSIGNED(params) }),

    CLINIC_ASSIGNMENT: (params) => ({
        subject: \`Clinical Program Assignment: \${params.clinic_name}\`,
        message_body: HTML_EMAIL_TEMPLATES.CLINIC_ASSIGNMENT(params) }),
`;

if (!content.includes('FEE_PAYMENT_RECEIPT:')) {
    content = content.replace(/};\n\nexport const sendSystemEmail/, missingKeys + '};\n\nexport const sendSystemEmail');
}

// Fix attachments bug in EmailService.js where it only checks params.attachment, but AdminFees passed params.attachments
content = content.replace(
    /attachments: params\.attachment \? \[\{\n\s*filename: params\.attachment_name \|\| 'Document\.pdf',\n\s*content: params\.attachment,\n\s*encoding: 'base64'\n\s*\}\] : undefined/g,
    'attachments: params.attachments ? params.attachments : (params.attachment ? [{ filename: params.attachment_name || "Document.pdf", content: params.attachment, encoding: "base64" }] : undefined)'
);

// Fix AdminAdmissions FIRST_CREDENTIALS key bug.
// AdminAdmissions uses 'FIRST_CREDENTIALS' but EmailService maps it as 'ONBOARDING'.
// Let's add FIRST_CREDENTIALS alias to EmailService.
const firstCredAlias = `    FIRST_CREDENTIALS: (params) => ({
        subject: \`Welcome to PCL ERP - Your Official Credentials\`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : '' }),\n`;
if (!content.includes('FIRST_CREDENTIALS:')) {
    content = content.replace(/ONBOARDING: \(params\) => \(\{/g, firstCredAlias + '    ONBOARDING: (params) => ({');
}

fs.writeFileSync(file, content);

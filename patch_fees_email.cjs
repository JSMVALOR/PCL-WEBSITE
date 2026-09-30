const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace APPLICATION_RECEIVED with FEE_PAYMENT_RECEIPT and standard params
content = content.replace(
    /await sendSystemEmail\('APPLICATION_RECEIVED', \{\n\s*to_email: txn\.profiles\?\.email \|\| 'marvelswaroop118@gmail\.com',\n\s*subject: `Official Fee Invoice - \$\{txn\.id\}`,\n\s*message_body: `[\s\S]*?`,\n\s*attachments: \[\n\s*\{\n\s*filename: `Fee_Invoice_\$\{txn\.id\}\.pdf`,\n\s*content: base64Pdf,\n\s*encoding: 'base64'\n\s*\}\n\s*\]\n\s*\}\);/g,
    `await sendSystemEmail('FEE_PAYMENT_RECEIPT', {
            to_email: txn.profiles?.email || 'marvelswaroop118@gmail.com',
            student_name: txn.profiles?.full_name || 'Student',
            amount: txn.amount,
            fee_type: txn.fee_invoices?.fee_types?.fee_name || 'Fee Payment',
            attachments: [
                {
                    filename: \`Fee_Invoice_\${txn.id}.pdf\`,
                    content: base64Pdf,
                    encoding: 'base64'
                }
            ]
        });`
);
fs.writeFileSync(file, content);


const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/lib/EmailService.js', 'utf8');

const oldFetch = `        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: import.meta.env.VITE_EMAIL_OVERRIDE || params.to_email,
                subject: subject,
                message_body: message_body,
                attachments: params.attachments ? params.attachments : (params.attachment ? [{ filename: params.attachment_name || "Document.pdf", content: params.attachment, encoding: "base64" }] : undefined)
            }) });

        const result = await response.json();`;

const newFetch = `        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: import.meta.env.VITE_EMAIL_OVERRIDE || params.to_email,
                subject: subject,
                message_body: message_body,
                attachments: params.attachments ? params.attachments : (params.attachment ? [{ filename: params.attachment_name || "Document.pdf", content: params.attachment, encoding: "base64" }] : undefined)
            }) });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error(response.status === 504 ? "Email gateway timeout. The server is taking too long." : "Email server returned an invalid response.");
        }`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('Frontend/ERP/lib/EmailService.js', code);
console.log("Patched EmailService");

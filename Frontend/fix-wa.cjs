const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = ` } catch (emailErr) {
 console.error("Email Engine Error:", emailErr);
 addLog(\`[WARNING] Credentials dispatch failed: \${emailErr.message}. The account was created successfully, but credentials must be provided manually.\`);
 }`;

const replacement = ` } catch (emailErr) {
 console.error("Email Engine Error:", emailErr);
 addLog(\`[WARNING] Credentials dispatch failed: \${emailErr.message}. The account was created successfully, but credentials must be provided manually.\`);
 }

 // 6. Send WhatsApp Notification
 addLog(\`[WHATSAPP] Dispatching credentials via WhatsApp to \${app.phone}...\`);
 try {
 const waMsg = \`Welcome to Prudentia College of Law, \${app.name}!\\n\\nYour ERP credentials have been generated.\\n\\nERP ID: \${generatedId}\\nTemporary Password: \${generatedPassword}\\n\\nPlease login at \${window.location.origin} and change your password immediately.\`;
 await sendSystemWhatsApp(app.phone, waMsg, { recipient_name: app.name });
 addLog(\`[SUCCESS] WhatsApp message queued/sent to \${app.phone}!\`);
 } catch (waErr) {
 console.error("WhatsApp Error:", waErr);
 addLog(\`[WARNING] WhatsApp dispatch failed: \${waErr.message}\`);
 }`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('done');

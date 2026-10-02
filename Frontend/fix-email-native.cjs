const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = ` // 5. Send Welcome Email
 addLog(\`[EMAIL] Dispatching secure setup link via Supabase...\`);
 try {
 const { error: resetError } = await provisionClient.auth.resetPasswordForEmail(app.email, {
 redirectTo: window.location.origin
 });
 if (resetError) throw resetError;
 addLog(\`[SUCCESS] Setup link successfully dispatched to \${app.email}!\`);
 
 // ADDED: Send the actual credentials email
 await sendSystemEmail('FIRST_CREDENTIALS', {
 to_email: app.email,
 student_name: app.name,
 erp_id: generatedId,
 password: generatedPassword,
 portal_link: window.location.origin
 });
 addLog(\`[SUCCESS] First credentials sent successfully to \${app.email}!\`);
 } catch (emailErr) {
 
 console.error("Supabase Email Error:", emailErr);
 addLog(\`[WARNING] Link dispatch failed: \${emailErr.message}. The account was created successfully, but credentials must be provided manually.\`);
 }`;

const replacement = ` // 5. Send Welcome Email
 addLog(\`[EMAIL] Dispatching secure setup credentials...\`);
 try {
 await sendSystemEmail('FIRST_CREDENTIALS', {
 to_email: app.email,
 student_name: app.name,
 erp_id: generatedId,
 password: generatedPassword,
 portal_link: window.location.origin
 });
 addLog(\`[SUCCESS] First credentials sent successfully to \${app.email}!\`);
 } catch (emailErr) {
 console.error("Email Engine Error:", emailErr);
 addLog(\`[WARNING] Credentials dispatch failed: \${emailErr.message}. The account was created successfully, but credentials must be provided manually.\`);
 }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('done');
} else {
  console.log('Target not found!');
}

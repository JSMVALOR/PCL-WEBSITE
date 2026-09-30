const fs = require('fs');

// 1. Fix handleReject argument in the button
let admissionsFile = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let admissionsContent = fs.readFileSync(admissionsFile, 'utf8');

// Change onClick={() => handleReject(app.id)} to onClick={() => handleReject(app)}
admissionsContent = admissionsContent.replace(/onClick=\{\(\) => handleReject\(app\.id\)\}/g, "onClick={() => handleReject(app)}");

// 2. Add FIRST_CREDENTIALS email to the pipeline
const emailCode = `
 // 5. Send Welcome Email
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
`;
admissionsContent = admissionsContent.replace(
/ \/\/ 5\. Send Welcome Email[\s\S]*?\} catch \(emailErr\) \{/, 
emailCode
);

// 3. Fix hardcoded bg-white and bg-gray-100 everywhere
admissionsContent = admissionsContent.replace(/bg-white/g, "bg-themePanel");
admissionsContent = admissionsContent.replace(/bg-gray-100/g, "bg-themeApp");

fs.writeFileSync(admissionsFile, admissionsContent);

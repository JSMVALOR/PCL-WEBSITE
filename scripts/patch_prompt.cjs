const fs = require('fs');

let admissionsFile = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let admissionsContent = fs.readFileSync(admissionsFile, 'utf8');

const oldReject = ` const handleReject = async (app) => {
 if (!(await window.erpDialog?.confirm(\`Are you sure you want to reject \${app.name}'s application? This will send a rejection notification email.\`))) return;
 try {
 const { error } = await supabase.from("admissions_applications").update({ status: 'rejected' }).eq("id", app.id);
 if (error) throw error;`;

const newReject = ` const handleReject = async (app) => {
 const reason = await window.erpDialog?.prompt(
 \`Please enter the reason for rejecting \${app.name}'s application. This message will be included in the email sent to the applicant.\`,
 "Reject Application",
 "Your application did not meet the minimum requirements at this time."
 );
 
 if (reason === null) return; // User cancelled
 
 try {
 const { error } = await supabase.from("admissions_applications").update({ status: 'rejected' }).eq("id", app.id);
 if (error) throw error;`;

admissionsContent = admissionsContent.replace(oldReject, newReject);

// Also need to pass the reason to the email template
const oldEmailCall = ` await sendSystemEmail('APPLICATION_REJECTED', {
 to_email: app.email,
 student_name: app.name,
 program: app.program || 'Law Program'
 });`;

const newEmailCall = ` await sendSystemEmail('APPLICATION_REJECTED', {
 to_email: app.email,
 student_name: app.name,
 program: app.program || 'Law Program',
 reason: reason
 });`;

admissionsContent = admissionsContent.replace(oldEmailCall, newEmailCall);

fs.writeFileSync(admissionsFile, admissionsContent);


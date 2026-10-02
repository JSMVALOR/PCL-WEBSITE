const fs = require('fs');

const path = 'Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `// Notify Requester
 const grievanceData = error ? null : (await supabase.from('grievances').select('reporter_id, category, reporter:profiles!grievances_reporter_id_fkey(full_name, email)').eq('id', grievanceId).single()).data;
 if (grievanceData && grievanceData.reporter_id) {
 const noticeId = \`CIR-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 9000) + 1000}\`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: \`Grievance Update\`,
 category: 'System Alert',
 target_audience: 'person',
 target_id: grievanceData.reporter_id,
 priority: 'high',
 content: \`Your grievance regarding \${grievanceData.category} has been marked as \${newStatus}.\`,
 author_name: 'Admin',
 author_id: null
 }]);
 
 const email = grievanceData.reporter?.email;
 if (email) {
 await sendSystemEmail('GRIEVANCE_UPDATE', {
 to_email: email,
 student_name: grievanceData.reporter.full_name,
 category: grievanceData.category,
 new_status: newStatus.toUpperCase(),
 notes: notes || "No specific remarks provided."
 }).catch(e => console.error("Email failed:", e));
 }
 }`;

const newLogic = `// Notify Requester and Accused
 const grievanceData = error ? null : (await supabase.from('grievances').select('reporter_id, accused_id, category, reporter:profiles!grievances_reporter_id_fkey(full_name, email), accused:profiles!grievances_accused_id_fkey(full_name, email)').eq('id', grievanceId).single()).data;
 
 if (grievanceData) {
     const noticeIdPrefix = \`CIR-\${new Date().getFullYear()}-\`;
     const newNotices = [];
     
     // Notify Reporter
     if (grievanceData.reporter_id) {
         newNotices.push({
             notice_id: noticeIdPrefix + (Math.floor(Math.random() * 9000) + 1000),
             title: \`Grievance Update\`,
             category: 'System Alert',
             target_audience: 'person',
             target_id: grievanceData.reporter_id,
             priority: 'high',
             content: \`Your grievance regarding \${grievanceData.category} has been marked as \${newStatus}. \${notes ? "Notes: " + notes : ""}\`,
             author_name: 'Admin',
             author_id: null
         });
         
         const reporterEmail = grievanceData.reporter?.email;
         if (reporterEmail) {
             sendSystemEmail('GRIEVANCE_UPDATE', {
                 to_email: reporterEmail,
                 student_name: grievanceData.reporter.full_name,
                 category: grievanceData.category,
                 new_status: newStatus.toUpperCase(),
                 notes: notes || "No specific remarks provided."
             }).catch(e => console.error("Email failed:", e));
         }
     }
     
     // Notify Accused
     if (grievanceData.accused_id) {
         newNotices.push({
             notice_id: noticeIdPrefix + (Math.floor(Math.random() * 9000) + 1000),
             title: \`Grievance Resolution\`,
             category: 'System Alert',
             target_audience: 'person',
             target_id: grievanceData.accused_id,
             priority: 'high',
             content: \`A grievance filed against you regarding \${grievanceData.category} has been resolved. \${notes ? "Resolution Notes: " + notes : ""}\`,
             author_name: 'Admin',
             author_id: null
         });
         
         const accusedEmail = grievanceData.accused?.email;
         if (accusedEmail) {
             sendSystemEmail('GRIEVANCE_UPDATE', {
                 to_email: accusedEmail,
                 student_name: grievanceData.accused.full_name,
                 category: grievanceData.category,
                 new_status: newStatus.toUpperCase(),
                 notes: notes || "You have been cleared/notified."
             }).catch(e => console.error("Email failed:", e));
         }
     }
     
     if (newNotices.length > 0) {
         await supabase.from('notices').insert(newNotices);
     }
 }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(path, content);
console.log("Patched AdminApprovals for Grievance Notifications");

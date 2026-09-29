const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace success alerts
content = content.replace(/window\.erpDialog\.alert\(`Meeting scheduled and email sent to \$\{g\.reporter\.full_name\}\.`\);/g, 'window.erpToast.show(`Meeting scheduled and email sent to ${g.reporter.full_name}.`, "success");');
content = content.replace(/window\.erpDialog\.alert\(`Escalated grievance marked as \$\{newStatus\}\.`\);/g, 'window.erpToast.show(`Escalated grievance marked as ${newStatus}.`, "success");');
content = content.replace(/window\.erpDialog\.alert\(`Document marked as \$\{newStatus\}\.`\);/g, 'window.erpToast.show(`Document marked as ${newStatus}.`, "success");');
content = content.replace(/window\.erpDialog\.alert\(`Profile update request marked as \$\{newStatus\}\.`\);/g, 'window.erpToast.show(`Profile update request marked as ${newStatus}.`, "success");');
content = content.replace(/window\.erpDialog\?\.alert\(`Timetable request marked as \$\{newStatus\} \$\{newStatus === 'Approved' \? 'and slot reassigned\.' : ''\}`\);/g, 'window.erpToast?.show(`Timetable request marked as ${newStatus}.`, "success");');

// Replace error alerts
content = content.replace(/window\.erpDialog\.alert\("Failed to send meeting email\."\);/g, 'window.erpToast.show("Failed to send meeting email.", "error");');
content = content.replace(/window\.erpDialog\.alert\("Failed to process grievance\."\);/g, 'window.erpToast.show("Failed to process grievance.", "error");');
content = content.replace(/window\.erpDialog\.alert\("Failed to process document verification\."\);/g, 'window.erpToast.show("Failed to process document verification.", "error");');
content = content.replace(/window\.erpDialog\.alert\("Failed to process profile update request\."\);/g, 'window.erpToast.show("Failed to process profile update request.", "error");');
content = content.replace(/window\.erpDialog\?\.alert\("Failed to load document preview\."\);/g, 'window.erpToast?.show("Failed to load document preview.", "error");');
content = content.replace(/window\.erpDialog\?\.alert\("Failed to process timetable request\."\);/g, 'window.erpToast?.show("Failed to process timetable request.", "error");');

fs.writeFileSync(file, content);

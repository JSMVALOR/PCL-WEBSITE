const fs = require('fs');

// 1. LeaveReview.jsx - Add notification bell insert after notices insert
let path = 'Frontend/ERP/components/Admin/LeaveManagement/LeaveReview.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldLeaveReview = `await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: \`Leave Request \${actionType === 'Reject' ? 'Rejected' : 'Approved'}\`,
 category: 'System Alert',
 target_audience: ['person'],
 target_id: request.faculty_id,
 priority: 'high',
 content: \`Your leave request from \${new Date(request.from_date).toLocaleDateString()} to \${new Date(request.to_date).toLocaleDateString()} has been \${actionType === 'Reject' ? 'Rejected' : 'Approved'}.\`,
 author_name: 'Admin',
 author_id: null
 }]);`;

const newLeaveReview = `await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: \`Leave Request \${actionType === 'Reject' ? 'Rejected' : 'Approved'}\`,
 category: 'System Alert',
 target_audience: ['person'],
 target_id: request.faculty_id,
 priority: 'high',
 content: \`Your leave request from \${new Date(request.from_date).toLocaleDateString()} to \${new Date(request.to_date).toLocaleDateString()} has been \${actionType === 'Reject' ? 'Rejected' : 'Approved'}.\`,
 author_name: 'Admin',
 author_id: null
 }]);
 // Bell notification
 await supabase.from('notifications').insert([{
   recipient_id: request.faculty_id,
   title: \`Leave \${actionType === 'Reject' ? 'Rejected' : 'Approved'}\`,
   message: \`Your leave from \${new Date(request.from_date).toLocaleDateString()} to \${new Date(request.to_date).toLocaleDateString()} was \${actionType === 'Reject' ? 'rejected' : 'approved'}.\`,
   type: 'leave',
   action_link: 'facultyleave'
 }]);`;

content = content.replace(oldLeaveReview, newLeaveReview);
fs.writeFileSync(path, content);
console.log("Patched LeaveReview.jsx");

// 2. AdminHelpdesk.jsx - Add notification bell insert
path = 'Frontend/ERP/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx';
content = fs.readFileSync(path, 'utf8');

const oldHelpdesk = "await supabase.from('notices').insert([{";
const helpdeskIdx = content.indexOf(oldHelpdesk);
if (helpdeskIdx !== -1) {
    // Find the end of this insert
    const insertEnd = content.indexOf('}]);', helpdeskIdx) + 4;
    const existingInsert = content.substring(helpdeskIdx, insertEnd);
    
    // Extract target_id from the insert
    const targetIdMatch = existingInsert.match(/target_id:\s*([^,\n]+)/);
    const targetId = targetIdMatch ? targetIdMatch[1].trim() : 'ticket.profile_id';
    
    const bellNotif = `
 // Bell notification for ticket update
 if (${targetId}) {
   await supabase.from('notifications').insert([{
     recipient_id: ${targetId},
     title: 'Support Ticket Update',
     message: 'Your support ticket has been updated by admin.',
     type: 'attendance',
     action_link: 'helpdesk'
   }]);
 }`;
    
    content = content.substring(0, insertEnd) + bellNotif + content.substring(insertEnd);
    fs.writeFileSync(path, content);
    console.log("Patched AdminHelpdesk.jsx");
} else {
    console.log("AdminHelpdesk.jsx - notices insert not found, skipping");
}

// 3. AdminPayroll.jsx - Add notification bell insert
path = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
content = fs.readFileSync(path, 'utf8');
const payrollIdx = content.indexOf("await supabase.from('notices').insert([{");
if (payrollIdx !== -1) {
    const payInsertEnd = content.indexOf('}]);', payrollIdx) + 4;
    const payInsert = content.substring(payrollIdx, payInsertEnd);
    const payTargetMatch = payInsert.match(/target_id:\s*([^,\n]+)/);
    const payTarget = payTargetMatch ? payTargetMatch[1].trim() : 'fac.id';
    
    const payBell = `
 // Bell notification for payroll
 if (${payTarget}) {
   await supabase.from('notifications').insert([{
     recipient_id: ${payTarget},
     title: 'Payroll Disbursed',
     message: 'Your salary slip has been processed.',
     type: 'notice',
     action_link: 'payroll'
   }]);
 }`;
    
    content = content.substring(0, payInsertEnd) + payBell + content.substring(payInsertEnd);
    fs.writeFileSync(path, content);
    console.log("Patched AdminPayroll.jsx");
}

// 4. Student Leave.jsx - Add bell notification for admin 
path = 'Frontend/ERP/components/Student/Leave/Leave.jsx';
content = fs.readFileSync(path, 'utf8');
const leaveIdx = content.indexOf("await supabase.from('notices').insert([{");
if (leaveIdx !== -1) {
    const leaveInsertEnd = content.indexOf('}]);', leaveIdx) + 4;
    
    const leaveBell = `
 // Bell notification for all admins about new leave request
 const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'admin');
 if (adminProfiles && adminProfiles.length > 0) {
   await supabase.from('notifications').insert(adminProfiles.map(a => ({
     recipient_id: a.id,
     title: 'New Leave Request',
     message: \`A student has requested \${leaveType} leave for \${diffDays} day(s).\`,
     type: 'leave',
     action_link: 'leavemanagement'
   })));
 }`;
    
    content = content.substring(0, leaveInsertEnd) + leaveBell + content.substring(leaveInsertEnd);
    fs.writeFileSync(path, content);
    console.log("Patched Student/Leave.jsx");
}

// 5. Student Helpdesk.jsx - Add bell notification for admin
path = 'Frontend/ERP/components/Student/Helpdesk/Helpdesk.jsx';
content = fs.readFileSync(path, 'utf8');
const hdIdx = content.indexOf("await supabase.from('notices').insert([{");
if (hdIdx !== -1) {
    const hdInsertEnd = content.indexOf('}]);', hdIdx) + 4;
    
    const hdBell = `
 // Bell notification for all admins about new support ticket
 const { data: adminUsers } = await supabase.from('profiles').select('id').eq('role', 'admin');
 if (adminUsers && adminUsers.length > 0) {
   await supabase.from('notifications').insert(adminUsers.map(a => ({
     recipient_id: a.id,
     title: 'New Support Ticket',
     message: \`A new support ticket has been raised: \${ticketForm.subject}\`,
     type: 'attendance',
     action_link: 'helpdesk'
   })));
 }`;
    
    content = content.substring(0, hdInsertEnd) + hdBell + content.substring(hdInsertEnd);
    fs.writeFileSync(path, content);
    console.log("Patched Student/Helpdesk.jsx");
}

console.log("All notification bell inserts added!");

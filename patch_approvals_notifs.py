import re

# --- Student Approvals ---
with open('Frontend/ERP/components/Student/Approvals/StudentApprovals.jsx', 'r') as f:
    content = f.read()

old_student = """ // Notify Assignee
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Grievance Escalation',
 category: 'System Alert',
 target_audience: assignedTo === null ? ['admin'] : ['person'],
 target_id: assignedTo,
 priority: 'high',
 content: `A new grievance (${grievanceData.category}) has been reported and requires your attention.`,
 }]);"""

new_student = """ // Notify Assignee
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Grievance Escalation',
 category: 'System Alert',
 target_audience: assignedTo === null ? ['admin'] : ['person'],
 target_id: assignedTo,
 priority: 'high',
 content: `A new grievance (${grievanceData.category}) has been reported and requires your attention.`,
 }]);
 
 // App Notifications
 if (assignedTo === null) {
   const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
   if (admins && admins.length > 0) {
     const notifications = admins.map(a => ({
       recipient_id: a.id,
       type: 'system',
       title: 'New Grievance Escalation',
       message: `A new grievance (${grievanceData.category}) requires admin review.`,
       action_link: 'approvals'
     }));
     await supabase.from('notifications').insert(notifications);
   }
 } else {
   await supabase.from('notifications').insert({
     recipient_id: assignedTo,
     type: 'system',
     title: 'New Grievance Escalation',
     message: `A new grievance (${grievanceData.category}) requires your attention.`,
     action_link: 'mentorship'
   });
 }"""

content = content.replace(old_student, new_student)

with open('Frontend/ERP/components/Student/Approvals/StudentApprovals.jsx', 'w') as f:
    f.write(content)

# --- Faculty Approvals ---
with open('Frontend/ERP/components/Faculty/Approvals/Approvals.jsx', 'r') as f:
    content_fac = f.read()

old_fac = """ const { error } = await supabase.from('grievances').insert([payload]);
 if (error) throw error;

 window.erpDialog.alert("Grievance submitted successfully. It has been escalated directly to the Admin.");"""

new_fac = """ const { error } = await supabase.from('grievances').insert([payload]);
 if (error) throw error;
 
 // Notify Admins
 const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
 if (admins && admins.length > 0) {
   const notifications = admins.map(a => ({
     recipient_id: a.id,
     type: 'system',
     title: 'New Faculty Grievance Report',
     message: `A faculty member has filed a grievance (${grievanceData.category}) that requires admin review.`,
     action_link: 'approvals'
   }));
   await supabase.from('notifications').insert(notifications);
 }

 window.erpDialog.alert("Grievance submitted successfully. It has been escalated directly to the Admin.");"""

content_fac = content_fac.replace(old_fac, new_fac)

with open('Frontend/ERP/components/Faculty/Approvals/Approvals.jsx', 'w') as f:
    f.write(content_fac)

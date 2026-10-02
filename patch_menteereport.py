import re
with open('Frontend/ERP/components/Faculty/FacultyMentorship/MenteeReport.jsx', 'r') as f:
    content = f.read()

old = """ const { error } = await supabase.from('grievances').insert({
 reporter_id: userSession.db_id,
 accused_id: menteeId,
 category: formData.category,
 description: formData.description,
 status: 'pending'
 });
 if (error) throw error;
 window.erpDialog?.alert("Report successfully filed with Admin.");"""

new = """ const { error } = await supabase.from('grievances').insert({
 reporter_id: userSession.db_id,
 accused_id: menteeId,
 category: formData.category,
 description: formData.description,
 status: 'pending'
 });
 if (error) throw error;
 
 const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
 if (admins && admins.length > 0) {
   const notifications = admins.map(a => ({
     recipient_id: a.id,
     type: 'system',
     title: 'New Faculty Grievance Report',
     message: `A faculty member has filed a grievance (${formData.category}) against ${menteeName} that requires admin review.`,
     action_link: 'approvals'
   }));
   await supabase.from('notifications').insert(notifications);
 }

 window.erpDialog?.alert("Report successfully filed with Admin.");"""

content = content.replace(old, new)

with open('Frontend/ERP/components/Faculty/FacultyMentorship/MenteeReport.jsx', 'w') as f:
    f.write(content)

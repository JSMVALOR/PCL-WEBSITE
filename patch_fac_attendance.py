import re
with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

old = """ await supabase.from('helpdesk_tickets').insert({
 user_id: userSession.db_id,
 subject: activeSession.classData?.subject?.name || "Attendance Correction",
 category: 'Attendance',
 description: `Requested change to ${newStatus.toUpperCase()} - Reason: ${reason}`,
 status: 'open',
 system_metadata: JSON.stringify({ session_id: activeSession.id, student_id: studentId, record_id: record?.id })
 });
 }
 if (window.erpDialog) window.erpDialog.alert("Correction requests submitted to Admin!", "success");"""

new = """ await supabase.from('helpdesk_tickets').insert({
 user_id: userSession.db_id,
 subject: activeSession.classData?.subject?.name || "Attendance Correction",
 category: 'Attendance',
 description: `Requested change to ${newStatus.toUpperCase()} - Reason: ${reason}`,
 status: 'open',
 system_metadata: JSON.stringify({ session_id: activeSession.id, student_id: studentId, record_id: record?.id })
 });
 }
 
 const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
 if (admins && admins.length > 0) {
   const notifications = admins.map(a => ({
     recipient_id: a.id,
     type: 'system',
     title: 'Attendance Correction Request',
     message: 'A faculty member requested an attendance record change.',
     action_link: 'approvals'
   }));
   await supabase.from('notifications').insert(notifications);
 }

 if (window.erpDialog) window.erpDialog.alert("Correction requests submitted to Admin!", "success");"""

content = content.replace(old, new)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

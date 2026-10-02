const fs = require('fs');
let path = 'Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = ` // HEADLESS NOTIFICATION TRIGGER
 if (status === 'absent') {
 // Fire and forget for bulk
 for (const studentObj of filteredStudents) {
 supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentObj.id).maybeSingle().then(({data: mapping}) => {
 if (mapping && mapping.parent_id) {
 supabase.from('profiles').select('email, phone').eq('id', mapping.parent_id).single().then(({data: parent}) => {
 if (parent && parent.email) {
 sendSystemEmail('PARENT_ABSENT_ALERT', {
 to_email: parent.email,
 student_name: studentObj.full_name,
 subject: activeSession.subject || 'Class',
 date: new Date().toLocaleDateString(),
 portal_link: window.location.origin + '/login'
 }).catch(e => {});
 if (parent.phone) {
 sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj.full_name} has been marked ABSENT for \${activeSession.subject || 'Class'} on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`).catch(e => {});
 }
 }
 });
 }
 });
 }
 }`;

const replacement = ` // HEADLESS NOTIFICATION TRIGGER
 if (status === 'absent') {
 try {
 const todayDateStr = getLocalDateString(new Date());
 const { data: todaySessions } = await supabase.from('class_sessions').select('id').eq('date', todayDateStr);
 const sessionIds = (todaySessions || []).map(s => s.id);
 const { data: allAbsencesToday } = await supabase.from('attendance_records').select('student_id').in('session_id', sessionIds).eq('entry_status', 'absent');
 const absentCounts = {};
 (allAbsencesToday || []).forEach(r => {
 absentCounts[r.student_id] = (absentCounts[r.student_id] || 0) + 1;
 });

 for (const studentObj of filteredStudents) {
 if (absentCounts[studentObj.id] >= 1) {
 supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentObj.id).maybeSingle().then(({data: mapping}) => {
 if (mapping && mapping.parent_id) {
 supabase.from('profiles').select('email, phone').eq('id', mapping.parent_id).single().then(({data: parent}) => {
 if (parent && parent.email) {
 sendSystemEmail('PARENT_ABSENT_ALERT', {
 to_email: parent.email,
 student_name: studentObj.full_name,
 subject: 'the day (missed multiple classes)',
 date: new Date().toLocaleDateString(),
 portal_link: window.location.origin + '/login'
 }).catch(e => {});
 if (parent.phone) {
 sendSystemWhatsApp(parent.phone, \`[ATTENDANCE ALERT] Dear Parent, \${studentObj.full_name} has been marked ABSENT for the day (missed multiple classes) on \${new Date().toLocaleDateString()}. Please check the Parent Portal.\`).catch(e => {});
 }
 }
 });
 }
 });
 }
 }
 } catch(e) { console.error(e); }
 }`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Bulk patch applied.');

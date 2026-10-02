import re

path = 'Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx'
with open(path, 'r') as f:
    content = f.read()

# PATCH 1: handleAction
target1 = r"""// HEADLESS NOTIFICATION TRIGGER
 if \(status === 'absent'\) \{
 // Find parent email mapped to this student
 try \{
 const \{ data: mapping \}"""

replacement1 = """// HEADLESS NOTIFICATION TRIGGER
 if (status === 'absent') {
 // Wait for second class attendance to mark absent for the day
 try {
 const todayDateStr = getLocalDateString(new Date());
 const { data: todaySessions } = await supabase.from('class_sessions').select('id').eq('date', todayDateStr);
 const sessionIds = (todaySessions || []).map(s => s.id);
 const { data: prevAbsences } = await supabase.from('attendance_records').select('id').in('session_id', sessionIds).eq('student_id', studentId).eq('entry_status', 'absent');
 
 if (prevAbsences && prevAbsences.length >= 1) {
 const { data: mapping }"""

# Fix indentation and closing braces
target1_full = r"""// HEADLESS NOTIFICATION TRIGGER
 if \(status === 'absent'\) \{
 // Find parent email mapped to this student
 try \{
 const \{ data: mapping \} = await supabase.from\('parent_student_mappings'\).select\('parent_id'\).eq\('student_id', studentId\).maybeSingle\(\);
 if \(mapping && mapping.parent_id\) \{
 const \{ data: parent \} = await supabase.from\('profiles'\).select\('email, phone'\).eq\('id', mapping.parent_id\).single\(\);
 if \(parent && parent.email\) \{
 const studentObj = enrolledStudents.find\(s => s.id === studentId\);
 sendSystemEmail\('PARENT_ABSENT_ALERT', \{
 to_email: parent.email,
 student_name: studentObj \? studentObj.full_name : 'Your Ward',
 subject: activeSession.subject \|\| 'Class',
 date: new Date\(\).toLocaleDateString\(\),
 portal_link: window.location.origin \+ '/login'
 \}\).catch\(e => console.error\("Headless email failed", e\)\);
 
 if \(parent.phone\) \{
 sendSystemWhatsApp\(parent.phone, `\[ATTENDANCE ALERT\] Dear Parent, \$\{studentObj \? studentObj.full_name : 'your ward'\} has been marked ABSENT for \$\{activeSession.subject \|\| 'Class'\} on \$\{new Date\(\).toLocaleDateString\(\)\}. Please check the Parent Portal.`\)
 .catch\(e => console.error\("Headless WhatsApp failed", e\)\);
 \}
 \}
 \}
 \} catch \(e\) \{ console.error\(e\); if \(window.toast\) window.toast.error\("An error occurred. Please try again."\); \}
 \}"""

replacement1_full = """// HEADLESS NOTIFICATION TRIGGER
 if (status === 'absent') {
 try {
 const todayDateStr = getLocalDateString(new Date());
 const { data: todaySessions } = await supabase.from('class_sessions').select('id').eq('date', todayDateStr);
 const sessionIds = (todaySessions || []).map(s => s.id);
 const { data: prevAbsences } = await supabase.from('attendance_records').select('id').in('session_id', sessionIds).eq('student_id', studentId).eq('entry_status', 'absent');
 
 if (prevAbsences && prevAbsences.length >= 1) {
 const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentId).maybeSingle();
 if (mapping && mapping.parent_id) {
 const { data: parent } = await supabase.from('profiles').select('email, phone').eq('id', mapping.parent_id).single();
 if (parent && parent.email) {
 const studentObj = enrolledStudents.find(s => s.id === studentId);
 sendSystemEmail('PARENT_ABSENT_ALERT', {
 to_email: parent.email,
 student_name: studentObj ? studentObj.full_name : 'Your Ward',
 subject: 'the day (missed multiple classes)',
 date: new Date().toLocaleDateString(),
 portal_link: window.location.origin + '/login'
 }).catch(e => console.error("Headless email failed", e));
 
 if (parent.phone) {
 sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for the day (missed multiple classes) on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
 .catch(e => console.error("Headless WhatsApp failed", e));
 }
 }
 }
 }
 } catch (e) { console.error(e); }
 }"""

content = re.sub(target1_full, replacement1_full, content)


# PATCH 2: handleBulkMark
target2_full = r"""if \(status === 'absent'\) \{
 // Find parent email mapped to this student
 for \(const studentObj of filteredStudents\) \{
 supabase.from\('parent_student_mappings'\).select\('parent_id'\).eq\('student_id', studentObj.id\).maybeSingle\(\).then\(\(\{data: mapping\}\) => \{
 if \(mapping && mapping.parent_id\) \{
 supabase.from\('profiles'\).select\('email, phone'\).eq\('id', mapping.parent_id\).single\(\).then\(\(\{data: parent\}\) => \{
 if \(parent && parent.email\) \{
 sendSystemEmail\('PARENT_ABSENT_ALERT', \{
 to_email: parent.email,
 student_name: studentObj.full_name,
 subject: activeSession.subject \|\| 'Class',
 date: new Date\(\).toLocaleDateString\(\),
 portal_link: window.location.origin \+ '/login'
 \}\).catch\(e => console.error\("Headless email failed", e\)\);
 \}
 if \(parent && parent.phone\) \{
 sendSystemWhatsApp\(parent.phone, `\[ATTENDANCE ALERT\] Dear Parent, \$\{studentObj.full_name\} has been marked ABSENT for \$\{activeSession.subject \|\| 'Class'\} on \$\{new Date\(\).toLocaleDateString\(\)\}. Please check the Parent Portal.`\)
 .catch\(e => console.error\("Headless WhatsApp failed", e\)\);
 \}
 \}\);
 \}
 \}\);
 \}
 \}"""

replacement2_full = """if (status === 'absent') {
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
 }).catch(e => console.error("Headless email failed", e));
 }
 if (parent && parent.phone) {
 sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj.full_name} has been marked ABSENT for the day (missed multiple classes) on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
 .catch(e => console.error("Headless WhatsApp failed", e));
 }
 });
 }
 });
 }
 }
 } catch(e) { console.error(e); }
 }"""

content = re.sub(target2_full, replacement2_full, content)

with open(path, 'w') as f:
    f.write(content)

print("Patched handleAction and handleBulkMark for Daily Absences")

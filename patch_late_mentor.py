import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

new_logic = """if (status === 'arrived_late') {
 payload = {
 session_id: activeSession.id,
 student_id: studentId,
 entry_status: 'late',
 entry_marked_at: new Date().toISOString(),
 exit_status: 'present',
 exit_marked_at: new Date().toISOString(),
 marked_by: 'faculty'
 };
 
 supabase.from('mentee_reports').insert({
   student_id: studentId,
   faculty_id: userSession.db_id,
   title: 'Late Arrival Notice',
   category: 'attendance',
   notes: `Arrived late for ${activeSession.classData?.subject?.name || 'class'} on ${new Date().toLocaleDateString()}.`
 }).catch(e => console.error(e));
 }"""

content = re.sub(r'if \(status === \'arrived_late\'\) \{\n payload = \{\n session_id: activeSession\.id,\n student_id: studentId,\n entry_status: \'late\',\n entry_marked_at: new Date\(\)\.toISOString\(\),\n exit_status: \'present\',\n exit_marked_at: new Date\(\)\.toISOString\(\),\n marked_by: \'faculty\'\n \};\n \}', new_logic, content, flags=re.DOTALL)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

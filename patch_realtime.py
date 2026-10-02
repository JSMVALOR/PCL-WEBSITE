import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

new_realtime = """setAttendanceRecords(prev => ({
 ...prev,
 [newRecord.student_id]: {
 ...prev[newRecord.student_id],
 entry_status: newRecord.entry_status,
 exit_status: newRecord.exit_status,
 isNew: false,
 marked_by: newRecord.marked_by
 }
 }));"""

content = re.sub(r'setAttendanceRecords\(prev => \(\{.*?\[newRecord\.student_id\]: \{.*?\}.*?\}\)\);', new_realtime, content, flags=re.DOTALL)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

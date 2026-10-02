import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

new_swipe = """actions={{
 right: { label: 'Present', color: 'bg-emerald-500', icon: <CheckmarkBadge01Icon />, action: () => handleAction(attendancePhase === 'exit' && (record.entry_status === 'absent' || record.isNew) ? 'arrived_late' : 'present') },
 left: { label: 'Absent', color: 'bg-rose-500', icon: <Cancel01Icon />, action: () => handleAction('absent') }
}}"""

content = re.sub(r'actions=\{.*?\}.*?\} : \{.*?\}', new_swipe, content, flags=re.DOTALL)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

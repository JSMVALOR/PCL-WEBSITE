import re

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'r') as f:
    content = f.read()

# Replace the filter conditions in the JSX
old_filter = r'assignments\.filter\(a => subjectContext \? a\.subject_id === subjectContext\.id : true\)'
new_filter = r'assignments.filter(a => subjectContext ? a.subject_id === (subjectContext.master_subjects?.id || subjectContext.subject_id || subjectContext.id) : true)'

content = re.sub(old_filter, new_filter, content)

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'w') as f:
    f.write(content)

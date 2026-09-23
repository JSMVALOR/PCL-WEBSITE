import re

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'r') as f:
    content = f.read()

old_err = r'window\.erpDialog\?\.alert\("Failed to create assignment\."\);'
new_err = r'window.erpDialog?.alert("Failed to create assignment: " + (error?.message || error?.details || JSON.stringify(error)));'

content = re.sub(old_err, new_err, content)

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'w') as f:
    f.write(content)

import re

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'r') as f:
    content = f.read()

old_del = r'console\.error\("Error deleting:", error\);\n\s*\}'
new_del = r'console.error("Error deleting:", error);\n window.erpDialog?.alert("Failed to delete assignment: " + (error?.message || error?.details || JSON.stringify(error)));\n }'

content = re.sub(old_del, new_del, content)

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'w') as f:
    f.write(content)

import re
with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'window.erpDialog?.alert("Failed to publish notice. Check console.");',
    'window.erpDialog?.alert(`Failed to publish notice: ${err?.message || JSON.stringify(err)}`);'
)

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

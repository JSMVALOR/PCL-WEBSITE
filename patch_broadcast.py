import re
with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'target_audience: targetAudience,',
    'target_audience: Array.isArray(targetAudience) ? targetAudience.join(", ") : targetAudience,'
)

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

import re
with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'author_id: userSession?.db_id',
    'author_id: userSession?.db_id,\n author_name: userSession?.name'
)

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

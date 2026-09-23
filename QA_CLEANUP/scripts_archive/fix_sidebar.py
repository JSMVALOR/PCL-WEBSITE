import re
with open('src/ERP/components/shared/DirectorySidebarWidget/DirectorySidebarWidget.jsx', 'r') as f:
    content = f.read()

old = """                const myMenteeIds = mentorships.filter(m => m.faculty_id === userSession?.id).map(m => m.student_id);"""
new = """                const myMenteeIds = mentorships.filter(m => m.faculty_id === userSession?.id || m.faculty_id === userSession?.db_id).map(m => m.student_id);"""

if old in content:
    content = content.replace(old, new)

with open('src/ERP/components/shared/DirectorySidebarWidget/DirectorySidebarWidget.jsx', 'w') as f:
    f.write(content)

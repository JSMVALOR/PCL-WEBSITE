import re
with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

replacement = """
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 const { error } = await supabase.from('notices').insert([{
 notice_id: noticeId,
 title,
"""
content = content.replace(
    " const { error } = await supabase.from('notices').insert([{",
    replacement
)

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

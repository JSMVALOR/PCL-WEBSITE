import re
with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'r') as f:
    content = f.read()

# Fix the duplicate title and target_audience string join
replacement = """ const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 const { error } = await supabase.from('notices').insert([{
 notice_id: noticeId,
 title,
 content,
 category,
 priority,
 target_audience: targetAudience,
 // requires_acknowledgement: requiresAck,
 author_id: userSession?.db_id
 }]);"""

# We'll use a regex to replace the entire insert block
content = re.sub(r'const noticeId = `CIR-.*?\}\]\);', replacement, content, flags=re.DOTALL)

with open('src/ERP/components/Student/Notices/FacultyBroadcastForm.jsx', 'w') as f:
    f.write(content)

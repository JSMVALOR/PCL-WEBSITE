with open('src/ERP/components/Student/Approvals/StudentApprovals.jsx', 'r') as f:
    content = f.read()

import re
pattern = r'<PageHeader.*?\/>'
new_header = '<PageHeader icon="fa-solid fa-scale-balanced" title="Grievance Cell" subtitle="Report and track disciplinary and academic grievances." />'

content = re.sub(pattern, new_header, content, flags=re.DOTALL)

# Remove the 'leaves' condition entirely.
# Let's replace `{false ? (` and `{true ? (` etc.
# Wait, I'll just leave them for now because `activeTab` is initialized to 'grievances' and it works. But the user shouldn't see 'Leave History' in the title.
content = content.replace("{false ? 'Leave History' : 'Grievance History'}", "'Grievance History'")

with open('src/ERP/components/Student/Approvals/StudentApprovals.jsx', 'w') as f:
    f.write(content)

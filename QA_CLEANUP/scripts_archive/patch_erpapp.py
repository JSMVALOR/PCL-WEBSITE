import re

with open('src/ERP/ErpApp.jsx', 'r') as f:
    content = f.read()

content = content.replace("case 'approvals': return <StudentApprovals />;", "case 'grievances': return <StudentApprovals />;\n        case 'approvals': return <StudentApprovals />;")

content = content.replace('approvals: "Student Approvals"', 'grievances: "Grievance Cell",\n      approvals: "Student Approvals"')

with open('src/ERP/ErpApp.jsx', 'w') as f:
    f.write(content)

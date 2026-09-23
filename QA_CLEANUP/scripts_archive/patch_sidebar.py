import re

with open('src/ERP/components/Student/sidebar/Sidebar.jsx', 'r') as f:
    content = f.read()

content = content.replace('{ id: "approvals", label: "My Approvals", icon: "fa-solid fa-check-to-slot" }', '{ id: "grievances", label: "Grievance Cell", icon: "fa-solid fa-scale-balanced" }')

with open('src/ERP/components/Student/sidebar/Sidebar.jsx', 'w') as f:
    f.write(content)

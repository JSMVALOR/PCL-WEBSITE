import re

with open('src/ERP/components/Faculty/FacultySidebar/FacultySidebar.jsx', 'r') as f:
    content = f.read()

content = content.replace('{ id: "facultyleave", label: "Time Off", icon: "fa-solid fa-mug-hot" },\n          { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }', '{ id: "facultyleave", label: "Time Off", icon: "fa-solid fa-mug-hot" }')

with open('src/ERP/components/Faculty/FacultySidebar/FacultySidebar.jsx', 'w') as f:
    f.write(content)

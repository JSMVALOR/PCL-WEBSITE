with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

content = content.replace("                </div>\n                }", "                </div>")

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

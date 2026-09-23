import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

# 1. Remove Tabs Navigation
pattern_tabs = r'\{\/\* TAB NAVIGATION \*\/.*?<\/div>'
content = re.sub(pattern_tabs, '', content, flags=re.DOTALL)

# 2. Remove the {activeTab === 'tickets' ? ( conditional
content = content.replace("{activeTab === 'tickets' ? (", "")

# 3. Remove the entire Grievance Content block and the closing `)}` of the conditional
pattern_grievance = r'\)\s*:\s*\(\s*<>\s*\/\* GRIEVANCE CONTENT \*\/.*?<\/>\s*\)'
content = re.sub(pattern_grievance, '', content, flags=re.DOTALL)

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

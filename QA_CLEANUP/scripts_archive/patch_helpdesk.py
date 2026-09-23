import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

# 1. Remove Tab Navigation UI completely
tabs_pattern = r'\{\/\* TAB NAVIGATION \*\/.*?<\/div>'
content = re.sub(tabs_pattern, '', content, flags=re.DOTALL)

# 2. Replace {activeTab === 'tickets' ? ( ... ) : ( ...grievance content... )}
# Actually, the quickest way is just to replace {activeTab === 'tickets' ? ( with `<div>` and delete everything after the ticket map.
# Let's check where the grievance content starts.
grievance_start_pattern = r'\} : \(\s*\/\* GRIEVANCE CONTENT \*\/.*?<\/div>\s*\)$'
content = re.sub(grievance_start_pattern, '', content, flags=re.DOTALL)

# Let's fix the ending divs
# I'll just do a more precise replacement

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

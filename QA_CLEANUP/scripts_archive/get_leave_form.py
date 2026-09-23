with open('src/ERP/components/Student/Leave/Leave.jsx', 'r') as f:
    content = f.read()

import re
match = re.search(r'(<div className="grid grid-cols-2 gap-4">.*?</div>)', content, re.DOTALL)
if match:
    print(match.group(1))


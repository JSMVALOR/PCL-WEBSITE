import re
with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    content = f.read()

old = """</div>
 )}
 </div>
 </div>
 );
}"""
new = """</div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}"""

content = content.replace(old, new)

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'w') as f:
    f.write(content)

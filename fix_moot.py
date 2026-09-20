import re

with open('src/ERP/components/Student/MootCourt/MootCourt.jsx', 'r') as f:
    content = f.read()

old_block = """     </div>
     );
     })
     )}
     </div>
     </div>
     )}"""

new_block = """     </div>
     );
     })}
     </div>
     )}
     </div>
     )}"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    # Just fix the literal typo
    content = content.replace("     })\n     )}\n     </div>\n     </div>\n     )}", "     })}\n     </div>\n     )}\n     </div>\n     )}")

with open('src/ERP/components/Student/MootCourt/MootCourt.jsx', 'w') as f:
    f.write(content)


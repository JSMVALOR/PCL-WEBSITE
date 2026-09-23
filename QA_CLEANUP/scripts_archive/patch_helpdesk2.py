import re

with open('src/ERP/components/Student/Helpdesk/Helpdesk.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "/* TAB NAVIGATION */" in line:
        skip = True
        continue
    
    if skip and "</div>" in line:
        skip = False
        continue
        
    if "{activeTab === 'tickets' ? (" in line:
        continue # skip this line entirely
        
    if "/* GRIEVANCE CONTENT */" in line:
        # We need to stop taking lines, but we also need to close the divs.
        break
        
    new_lines.append(line)

# Add closing tags for the main container
new_lines.append("                </div>\n")
new_lines.append("            </div>\n")
new_lines.append("            \n")

# Need to append the MODALS section which is at the end!
# Wait, the modals are inside the main return! I can't just break.

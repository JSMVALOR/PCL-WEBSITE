import re
path = 'src/ERP/components/Student/Credentials/Credentials.jsx'
with open(path, 'r') as f:
    c = f.read()

# Replace the giant inline div template with the imported component
import_stmt = "import IDCardTemplate from '../../../DocumentTemplates/IDCardTemplate';\n"
if "IDCardTemplate" not in c:
    c = c.replace("import { supabase }", import_stmt + "import { supabase }")

old_template = r"<div ref=\{idCardRef\} className=\"w-\[340px\] bg-white border-2 border-black/10 rounded-2xl overflow-hidden relative flex flex-col shadow-2xl\">[\s\S]*?<div className=\"w-48 h-8 bg-\[url\('https://upload\.wikimedia\.org/wikipedia/commons/e/e9/UPC-A-036000291452\.svg'\)\] bg-cover opacity-60 mix-blend-multiply mb-1\"></div>\n </div>\n </div>\n </div>"
new_template = "<IDCardTemplate ref={idCardRef} profileData={profileData} roleTitle={roleTitle} userSession={userSession} />"

c = re.sub(old_template, new_template, c)

with open(path, 'w') as f:
    f.write(c)

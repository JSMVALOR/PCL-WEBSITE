with open('src/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx', 'r') as f:
    content = f.read()

# Make sure it's syntactically correct
content = content.replace('import { supabase } from "../../../../Shared/lib/supabase/supabaseClient";', '')

content = 'import { supabase } from "../../../../Shared/lib/supabase/supabaseClient";\n' + content

with open('src/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx', 'w') as f:
    f.write(content)


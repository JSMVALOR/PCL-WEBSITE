import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

old_code = """                return {
                    id: cs.id,
                    batch: cs.batch_id,
                    name: cs.master_subjects?.name || 'Unknown',"""

new_code = """                return {
                    id: cs.id,
                    batch: cs.batch_id, // Kept for DB references if needed, but not rendered directly to users
                    name: cs.master_subjects?.name || 'Unknown',"""

content = content.replace(old_code, new_code)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)


import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

old_code = """                    unmarkedMap[cs.id] = {
                        id: cs.id,
                        name: cs.master_subjects?.name || 'Unknown',
                        code: cs.master_subjects?.code || 'Unknown',
                        batch: cs.batch_id,
                        missed: missed.sort((a,b) => new Date(b.date) - new Date(a.date))
                    };"""

new_code = """                    unmarkedMap[cs.id] = {
                        id: cs.id,
                        name: cs.master_subjects?.name || 'Unknown',
                        code: cs.master_subjects?.code || 'Unknown',
                        batch: missed[0]?.batch || 'Section I',
                        missed: missed.sort((a,b) => new Date(b.date) - new Date(a.date))
                    };"""

content = content.replace(old_code, new_code)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)


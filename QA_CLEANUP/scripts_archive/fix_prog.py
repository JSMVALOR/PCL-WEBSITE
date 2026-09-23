import re
with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'r') as f:
    content = f.read()

old = """const match = progs.find(p => studentProfile.programme && studentProfile.programme.toLowerCase().includes(p.name.toLowerCase().replace('.', '')));"""
new = """const match = progs.find(p => {
                    if (!studentProfile.programme) return false;
                    const p1 = studentProfile.programme.toLowerCase().replace(/\./g, '').trim();
                    const p2 = p.name.toLowerCase().replace(/\./g, '').trim();
                    return p1.includes(p2) || p2.includes(p1);
                });"""

content = content.replace(old, new)
with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'w') as f:
    f.write(content)

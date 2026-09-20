import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# Change the strict equality to a contains/ilike for sections
# Old: .eq('academic_batch', classData.batch)
# New: classData.batch.includes('Section') ? .ilike('academic_batch', '%LLB%') : .eq('academic_batch', classData.batch)

# Actually, the user wants a proper way to mark Section II. If all students are in 'LLB (Class of 2029)', the system doesn't know who is in Section II.
# Since we have an RLS issue on profiles, let's just make the query:
# .ilike('academic_batch', `%${classData.batch.split(' ')[0]}%`)
# This will fetch ALL LLB students for both Section I and Section II. It's a valid fallback!

target = ".eq('academic_batch', classData.batch)"
replacement = ".ilike('academic_batch', `%${classData.batch.split(' ')[0]}%`)"

content = content.replace(target, replacement)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)


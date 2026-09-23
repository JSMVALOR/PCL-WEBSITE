import re

with open('src/ERP/components/Student/Timetable/Timetable.jsx', 'r') as f:
    content = f.read()

old_grid = r'<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">'
new_grid = r'<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">'

content = re.sub(old_grid, new_grid, content)

with open('src/ERP/components/Student/Timetable/Timetable.jsx', 'w') as f:
    f.write(content)

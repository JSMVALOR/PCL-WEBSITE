import re

with open('src/ERP/components/Student/Assignments/Assignments.jsx', 'r') as f:
    content = f.read()

content = content.replace("{task.subject_name}", "{task.master_subjects?.name || task.subject_name || 'Subject'}")
content = content.replace("{selectedTask.subject_name}", "{selectedTask.master_subjects?.name || selectedTask.subject_name || 'Subject'}")

with open('src/ERP/components/Student/Assignments/Assignments.jsx', 'w') as f:
    f.write(content)

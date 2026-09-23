import re

with open('src/ERP/components/Student/Assignments/Assignments.jsx', 'r') as f:
    content = f.read()

old_ui = """<span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.subject_name}</span>"""
new_ui = """<span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.master_subjects?.name || task.subject_name || 'Subject'}</span>"""
content = content.replace(old_ui, new_ui)

# What about the modal? Does the modal show subject_name?

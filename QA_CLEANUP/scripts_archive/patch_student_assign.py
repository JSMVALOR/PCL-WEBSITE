import re

with open('src/ERP/components/Student/Assignments/Assignments.jsx', 'r') as f:
    content = f.read()

old_query = """        let assignQuery = supabase
            .from('assignments')
            .select('*, faculty:profiles!assignments_faculty_id_fkey(full_name)')
            .eq('status', 'active');"""

new_query = """        let assignQuery = supabase
            .from('assignments')
            .select('*, faculty:profiles!assignments_faculty_id_fkey(full_name), master_subjects(name)')
            .eq('status', 'active');"""
content = content.replace(old_query, new_query)

# Also fix the UI rendering `task.subject_name || 'Subject'` to use `task.master_subjects?.name`
old_ui = """<span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.subject_name || 'Subject'}</span>"""
new_ui = """<span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.master_subjects?.name || task.subject_name || 'Subject'}</span>"""
content = content.replace(old_ui, new_ui)

with open('src/ERP/components/Student/Assignments/Assignments.jsx', 'w') as f:
    f.write(content)

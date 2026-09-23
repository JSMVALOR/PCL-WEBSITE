import re

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'r') as f:
    content = f.read()

# 1. Update initial formData
old_formdata = """        title: "",
        description: "",
        total_marks: 100,
        due_date: """
new_formdata = """        title: "",
        description: "",
        word_limit: "",
        total_marks: 100,
        due_date: """
content = content.replace(old_formdata, new_formdata)

# 2. Update the insert payload
old_insert = """                    description: formData.description,
                    total_marks: Number(formData.total_marks),"""
new_insert = """                    description: formData.description,
                    word_limit: formData.word_limit ? Number(formData.word_limit) : null,
                    total_marks: Number(formData.total_marks),"""
content = content.replace(old_insert, new_insert)

# 3. Add the UI input for word limit
old_ui = """                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Total Marks</label>"""
new_ui = """                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Word Limit (Optional)</label>
                                    <input type="number" min="0" placeholder="e.g. 500" value={formData.word_limit} onChange={e => setFormData({...formData, word_limit: e.target.value})} className="w-full bg-white/50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white outline-none focus:border-themeAccent transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Total Marks</label>"""
content = content.replace(old_ui, new_ui)

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'w') as f:
    f.write(content)

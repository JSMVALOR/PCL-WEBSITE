import re
with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    """<input type="text" value={row.subject_name} onChange={e => updateRow(idx, 'subject_name', e.target.value)} placeholder="Law of Torts"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />""",
    """<input type="text" value={row.subject_name} readOnly disabled placeholder="Law of Torts"
                                        className="px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-themeTextSec dark:text-white/60 outline-none cursor-not-allowed" />"""
)

content = content.replace(
    """<input type="text" value={row.subject_code} onChange={e => updateRow(idx, 'subject_code', e.target.value)} placeholder="LAW101"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />""",
    """<input type="text" value={row.subject_code} readOnly disabled placeholder="LAW101"
                                        className="px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-themeTextSec dark:text-white/60 outline-none cursor-not-allowed" />"""
)

content = content.replace(
    """<input type="number" value={row.credits} onChange={e => updateRow(idx, 'credits', e.target.value)} placeholder="4"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />""",
    """<input type="number" value={row.credits} readOnly disabled placeholder="4"
                                        className="px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-themeTextSec dark:text-white/60 outline-none cursor-not-allowed" />"""
)

with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'w') as f:
    f.write(content)

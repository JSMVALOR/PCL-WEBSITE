import re
with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'r') as f:
    content = f.read()

buttons_html = """
                                        {leave.status === 'pending' && (
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 w-full">
                                                <button onClick={() => handleEdit(leave)} className="flex-1 py-1.5 rounded-lg bg-themeAccent/10 text-themeAccent text-[10px] font-black uppercase tracking-widest hover:bg-themeAccent/20 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleWithdraw(leave.id)} className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-colors">
                                                    Withdraw
                                                </button>
                                            </div>
                                        )}
"""

content = content.replace(
    "{leave.replacement_faculty_id && (",
    buttons_html + "\n                                        {leave.replacement_faculty_id && ("
)

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'w') as f:
    f.write(content)

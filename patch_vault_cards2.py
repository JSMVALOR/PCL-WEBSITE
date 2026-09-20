import re

with open('src/ERP/components/Student/CourseVault/CourseVault.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if '<div className="p-4 flex-1 flex flex-col">' in line:
        skip = True
        new_lines.append(line)
        new_lines.append("""                                        <div className="flex-1 flex flex-col items-center justify-center py-8">
                                            <button 
                                                onClick={() => setActiveMaterialsSubject({ subject: masterSubject, items: items })}
                                                className="px-6 py-3 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeText font-bold text-xs tracking-wide transition active:scale-[0.98] shadow-sm flex items-center gap-2"
                                            >
                                                <i className="fa-solid fa-layer-group"></i> 
                                                {items.length === 0 ? "No Materials Yet" : `View Materials (${items.length})`}
                                            </button>
                                        </div>
""")
        continue
    
    if skip and '                                </div>' in line and 'return (' not in lines[i-1] and lines[i+1].strip() == ');':
        # End of the card
        skip = False
        new_lines.append(line)
        continue
    
    if skip and '                            );' in line:
        skip = False
        new_lines.append('                                </div>\n                            );\n')
        continue
        
    if not skip:
        new_lines.append(line)

content = "".join(new_lines)
if 'const [activeMaterialsSubject, setActiveMaterialsSubject] = useState(null);' not in content:
    content = content.replace(
        'const [previewUrl, setPreviewUrl] = useState(null);',
        'const [previewUrl, setPreviewUrl] = useState(null);\n    const [activeMaterialsSubject, setActiveMaterialsSubject] = useState(null);'
    )

# Now inject the modal at the bottom
modal_code = """
            {activeMaterialsSubject && (
                <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[80vh] bg-themeApp rounded-3xl overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <i className="fa-solid fa-folder-open text-amber-500 text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-themeText dark:text-white leading-tight">
                                        {activeMaterialsSubject.subject.name}
                                    </h3>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-themeTextSec">{activeMaterialsSubject.subject.code}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveMaterialsSubject(null)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 custom-scrollbar">
                            {activeMaterialsSubject.items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                    <i className="fa-regular fa-folder-open text-4xl mb-4"></i>
                                    <p className="text-sm font-bold italic">No materials published yet.</p>
                                </div>
                            ) : (
                                activeMaterialsSubject.items.map(item => (
                                    <a 
                                        key={item.id} 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        onClick={(e) => handleResourceClick(e, item)}
                                        className="group bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-4 rounded-xl hover:bg-white dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all flex items-center gap-4 cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 bg-white/5 group-hover:scale-110 transition-transform ${getTypeIcon(item.type).split(' ').slice(2).join(' ')}`}>
                                            <i className={`${getTypeIcon(item.type).split(' ')[0]} ${getTypeIcon(item.type).split(' ')[1]} text-lg`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-themeText dark:text-white group-hover:text-themeAccent transition-colors truncate">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-themeTextSec uppercase tracking-widest">
                                                <span>{item.type}</span>
                                                <span>•</span>
                                                <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-arrow-up-right-from-square text-themeTextSec opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
"""

content = content.replace('{activeSyllabusSubject && (', modal_code + '\n            {activeSyllabusSubject && (')

with open('src/ERP/components/Student/CourseVault/CourseVault.jsx', 'w') as f:
    f.write(content)

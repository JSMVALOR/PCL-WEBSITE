import re

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'r') as f:
    content = f.read()

old_btn = 'className="w-full lg:w-auto px-6 lg:px-8 py-3.5 lg:py-4 bg-themePanel border-theme border-themeBorderStrong hover:bg-neutral-200 text-[#050505] rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shrink-0"'
new_btn = 'className="w-full lg:w-auto px-6 lg:px-8 py-3.5 lg:py-4 bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 rounded-[2rem] text-xs lg:text-sm font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"'

content = content.replace(old_btn, new_btn)

with open('src/ERP/components/Student/CVBuilder/CVBuilder.jsx', 'w') as f:
    f.write(content)


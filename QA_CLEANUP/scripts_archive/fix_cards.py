import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

content = content.replace("rounded-[2rem] rounded-2xl", "rounded-[2rem]")
content = content.replace("hover:border-amber-500/30/30", "hover:border-amber-500/30")
content = content.replace("w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center text-lg border border-black/5", "w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center text-lg")

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


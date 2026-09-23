import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

content = content.replace("hover:bg-themePanel border border-black/5 dark:border-white/10 cursor-pointer", "hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer")
content = content.replace("bg-themePanel border border-black/5 dark:border-white/10 border-b border-black/10 dark:border-white/20", "bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/20")

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


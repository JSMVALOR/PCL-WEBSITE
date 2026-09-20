import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

content = content.replace("border border-black/5 dark:border-white/10 p-4 rounded-xl border border-black/10 dark:border-white/20", "border border-black/5 dark:border-white/10 p-4 rounded-xl")
content = content.replace("rounded-full bg-themePanel border border-black/5 dark:border-white/10 rounded-[2rem]", "w-8 h-8 rounded-full bg-themePanel border border-black/5 dark:border-white/10")

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


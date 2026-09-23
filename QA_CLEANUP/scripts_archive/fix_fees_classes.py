import re

with open('src/ERP/components/Student/Fees/Fees.jsx', 'r') as f:
    content = f.read()

content = content.replace("bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08]", "bg-themePanel border border-black/5 dark:border-white/10")

# Fix double borders
content = content.replace("border-themeBorder dark:border-white/5 border border-themeBorder dark:border-white/5", "border border-black/5 dark:border-white/10")
content = content.replace("border border-themeBorder dark:border-white/5", "border border-black/5 dark:border-white/10")

with open('src/ERP/components/Student/Fees/Fees.jsx', 'w') as f:
    f.write(content)


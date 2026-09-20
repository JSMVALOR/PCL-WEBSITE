import re

with open('src/ERP/components/Student/Fees/Fees.jsx', 'r') as f:
    content = f.read()

content = content.replace("border-themeBorder dark:border-white/5Accent/30", "border-amber-500/30")
content = content.replace("border-themeBorder dark:border-white/5Accent/40", "border-amber-500/40")
content = content.replace("border-themeBorder dark:border-white/5Accent/50", "border-amber-500/50")

with open('src/ERP/components/Student/Fees/Fees.jsx', 'w') as f:
    f.write(content)


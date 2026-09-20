import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

# Fix Stat box icons
content = content.replace('bg-[#E6F4EA] text-[#137333]', 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20')
content = content.replace('bg-[#FEF7E0] text-[#B06000]', 'bg-amber-500/10 text-amber-500 border border-amber-500/20')
content = content.replace('bg-orange-50 text-orange-500', 'bg-orange-500/10 text-orange-500 border border-orange-500/20')
content = content.replace('bg-yellow-50 text-yellow-500', 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20')

# Fix badges
content = content.replace('bg-[#E6F4EA] text-[#137333]', 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20')
content = content.replace('bg-[#FCE8E6] text-[#C5221F]', 'bg-rose-500/10 text-rose-500 border border-rose-500/20')
content = content.replace('bg-[#E8F0FE] text-[#1967D2]', 'bg-blue-500/10 text-blue-500 border border-blue-500/20')
content = content.replace('bg-[#FEF7E0] text-[#B06000]', 'bg-amber-500/10 text-amber-500 border border-amber-500/20')

# Replace bg-white dark:bg-[#121212]/10 with black/10 dark:bg-white/10 for the highlight
content = content.replace("bg-white dark:bg-[#121212]/10", "bg-black/10 dark:bg-white/20")

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


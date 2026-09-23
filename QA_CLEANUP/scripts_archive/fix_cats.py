import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

content = content.replace('color: "text-red-500", bg: "bg-red-50"', 'color: "text-rose-500", bg: "bg-rose-500/10 border border-rose-500/20"')
content = content.replace('color: "text-blue-500", bg: "bg-blue-50"', 'color: "text-blue-500", bg: "bg-blue-500/10 border border-blue-500/20"')
content = content.replace('color: "text-green-500", bg: "bg-green-50"', 'color: "text-emerald-500", bg: "bg-emerald-500/10 border border-emerald-500/20"')
content = content.replace('color: "text-purple-500", bg: "bg-purple-50"', 'color: "text-purple-500", bg: "bg-purple-500/10 border border-purple-500/20"')
content = content.replace('color: "text-orange-500", bg: "bg-orange-50"', 'color: "text-orange-500", bg: "bg-orange-500/10 border border-orange-500/20"')
content = content.replace('color: "text-yellow-500", bg: "bg-yellow-50"', 'color: "text-amber-500", bg: "bg-amber-500/10 border border-amber-500/20"')
content = content.replace('color: "text-slate-800", bg: "bg-slate-100"', 'color: "text-slate-400", bg: "bg-slate-500/10 border border-slate-500/20"')
content = content.replace('color: "text-pink-500", bg: "bg-pink-50"', 'color: "text-pink-500", bg: "bg-pink-500/10 border border-pink-500/20"')

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


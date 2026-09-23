import re

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'r') as f:
    content = f.read()

# Fix broken double borders
content = content.replace("border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong", "border border-black/5 dark:border-white/10")
content = content.replace("border-themeBorder dark:border-white/5Accent", "border-amber-500/30")
content = content.replace("bg-white dark:bg-[#121212]", "bg-themePanel")
content = content.replace("rounded-[2rem] rounded-xl", "rounded-[2rem]")
content = content.replace("rounded-[2rem] p-5 rounded-xl", "rounded-[2rem] p-6 lg:p-8")

# Fix empty state
content = content.replace("w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4", "w-full py-10 lg:py-12 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4")

# Update add button
content = content.replace("bg-themeAccent hover:brightness-110 text-themeText dark:text-white px-6 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 active:scale-95", "bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl text-xs lg:text-sm font-bold tracking-tight transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2")

# Update filters container
content = content.replace("flex flex-col lg:flex-row gap-4 items-center justify-between bg-themePanel border border-black/5 dark:border-white/10 p-3 rounded-xl border border-black/10 dark:border-white/20", "flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 p-3 rounded-[2rem] shadow-sm")

# Update cv completeness card
content = content.replace("bg-themeAccent text-themeText dark:text-white border border-amber-500/30", "bg-gradient-to-br from-amber-400 to-amber-600 text-black border border-amber-500/30 shadow-xl shadow-amber-500/20")

# Text replacements for dark mode
content = content.replace("dark:text-white/50", "dark:text-white/60")
content = content.replace("text-themeTextSec dark:text-white/60 opacity-80", "text-themeTextSec")

with open('src/ERP/components/Student/Achievements/Achievements.jsx', 'w') as f:
    f.write(content)


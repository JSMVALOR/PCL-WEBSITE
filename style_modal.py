import re
with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'r') as f:
    content = f.read()

# Make the modal backdrop more distinct and the modal card sleeker
content = content.replace(
    'className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"',
    'className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-fade-in"'
)

content = content.replace(
    'className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col max-h-[90vh]"',
    'className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl saturate-[1.8] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]"'
)

# Modal header
content = content.replace(
    'className="p-6 border-b border-white/[0.08] shrink-0 flex justify-between items-start bg-[#161616]"',
    'className="p-6 sm:p-8 border-b border-black/5 dark:border-white/[0.08] shrink-0 flex justify-between items-start bg-transparent"'
)

# Modal body
content = content.replace(
    'className="overflow-y-auto no-scrollbar flex-1 bg-white dark:bg-[#121212]"',
    'className="overflow-y-auto no-scrollbar flex-1 bg-transparent p-2"'
)

# Make inputs more modern
content = content.replace(
    'className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition appearance-none cursor-pointer"',
    'className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm appearance-none cursor-pointer"'
)

content = content.replace(
    'className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition dark:[color-scheme:dark]"',
    'className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm dark:[color-scheme:dark]"'
)

content = content.replace(
    'className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 outline-none transition resize-none placeholder:text-themeTextSec dark:text-white/30"',
    'className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm resize-none placeholder:text-themeTextSec dark:text-white/30"'
)

# Make submit button better
content = content.replace(
    'className="w-full mt-2 py-4 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"',
    'className="w-full mt-4 py-4 rounded-2xl bg-amber-500 text-black font-black text-[13px] tracking-wide uppercase hover:bg-amber-400 hover:shadow-[0_0_20px_#f59e0b40] active:scale-[0.98] transition-all flex items-center justify-center gap-2"'
)

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'w') as f:
    f.write(content)

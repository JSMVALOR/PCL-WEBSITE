import re

with open('src/ERP/components/Student/Fees/Fees.jsx', 'r') as f:
    content = f.read()

old_start = ''' <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-white" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 <div className="relative z-20 w-full mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">'''

new_start = ''' <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-white" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in relative z-20">'''

content = content.replace(old_start, new_start)

# Replace the 4 closing divs with 2
old_end = " </div></div></div></div>"
new_end = " </div></div>"
content = content.replace(old_end, new_end)

with open('src/ERP/components/Student/Fees/Fees.jsx', 'w') as f:
    f.write(content)


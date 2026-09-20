import re

with open('src/ERP/components/Student/StudentSupportHub/StudentSupportHub.jsx', 'r') as f:
    content = f.read()

old_start = ''' <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
 <div className="relative z-20 w-full mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">'''

new_start = ''' <div className="w-full h-auto min-h-screen relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 font-sans flex flex-col">
 <div className="relative z-20 w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">'''

content = content.replace(old_start, new_start)

# Replace the 4 closing divs with 3
old_end = " </div></div></div></div>"
new_end = " </div></div></div>"
content = content.replace(old_end, new_end)

with open('src/ERP/components/Student/StudentSupportHub/StudentSupportHub.jsx', 'w') as f:
    f.write(content)


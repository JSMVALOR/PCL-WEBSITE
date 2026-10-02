import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

new_ui = """<div className="w-full xl:w-[68%] bg-themePanel/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-themeBorder shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col overflow-hidden relative">
 <div className="p-5 lg:p-6 border-b border-themeBorder flex gap-4 bg-black/[0.02] dark:bg-themePanel/[0.02] sticky top-0 z-10">
 <div className="relative flex-1">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input 
 type="text" 
 placeholder="Search by name, roll, or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-themePanel dark:bg-themeElevated border border-themeBorder rounded-xl pl-10 pr-4 py-3.5 text-[14px] font-medium text-themeText outline-none focus:border-[var(--theme-accent)] shadow-sm transition-colors placeholder-[#8E8E93]"
 />
 </div>
 <button type="button" onClick={() => setIsSwipeMode(!isSwipeMode)} className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg transition-colors lg:hidden ${isSwipeMode ? 'bg-[var(--theme-accent)] text-themeApp border-[var(--theme-accent)]' : 'bg-themeElevated text-themeTextSec border-themeBorder hover:text-themeText'}`}>
 <i className="fa-solid fa-layer-group"></i>
 </button>
 <button type="button" onClick={refreshLiveAttendance} className="w-12 h-12 rounded-xl border border-themeBorder bg-themeElevated text-themeTextSec flex items-center justify-center text-lg hover:text-themeText hover:bg-black/10 transition-colors shadow-sm">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
 </div>
 
 {isLocked && activeSession.status !== 'completed' ? (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative z-20 bg-themePanel/95 backdrop-blur-sm">
      <i className="fa-solid fa-lock text-6xl text-rose-500/80 mb-6"></i>
      <h3 className="text-2xl font-black text-themeText mb-2">{lockedMsg}</h3>
      <p className="text-themeTextSec mb-6">
        Time left to unlock: <span className="font-mono text-themeText font-bold">
        {Math.max(0, Math.floor((unlockTime - now) / 60000))}m {Math.max(0, Math.floor(((unlockTime - now) % 60000) / 1000))}s
        </span>
      </p>
    </div>
 ) : (
 <div className="flex-1 overflow-y-auto min-h-[400px] bg-themeApp relative">"""

content = re.sub(r'<div className="w-full xl:w-\[68%\] bg-themePanel/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-\[2rem\] border border-themeBorder shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] flex flex-col overflow-hidden relative">\n <div className="p-5 lg:p-6 border-b border-themeBorder flex gap-4 bg-black/\[0\.02\] dark:bg-themePanel/\[0\.02\] sticky top-0 z-10">\n <div className="relative flex-1">\n <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"><\/i>\n <input \n type="text" \n placeholder="Search by name, roll, or ID\.\.\." \n value=\{searchQuery\}\n onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}\n className="w-full bg-themePanel dark:bg-themeElevated border border-themeBorder rounded-xl pl-10 pr-4 py-3\.5 text-\[14px\] font-medium text-themeText outline-none focus:border-\[var\(--theme-accent\)\] shadow-sm transition-colors placeholder-\[#8E8E93\]"\n \/>\n <\/div>\n <button type="button" onClick=\{\(\) => setIsSwipeMode\(!isSwipeMode\)\} className=\{`w-12 h-12 rounded-xl border flex items-center justify-center text-lg transition-colors lg:hidden \$\{isSwipeMode \? \'bg-\[var\(--theme-accent\)\] text-themeApp border-\[var\(--theme-accent\)\]\' : \'bg-themeElevated text-themeTextSec border-themeBorder hover:text-themeText\'\}`\}>\n <i className="fa-solid fa-layer-group"><\/i>\n <\/button>\n <button type="button" onClick=\{refreshLiveAttendance\} className="w-12 h-12 rounded-xl border border-themeBorder bg-themeElevated text-themeTextSec flex items-center justify-center text-lg hover:text-themeText hover:bg-black/10 transition-colors shadow-sm">\n <i className="fa-solid fa-rotate-right"><\/i>\n <\/button>\n <\/div>\n \n <div className="flex-1 overflow-y-auto min-h-\[400px\] bg-themeApp relative">', new_ui, content)

# Close the newly added conditional parenthesis at the bottom of the list
end_list_replacement = """ {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 )}
 </div>"""
 
content = re.sub(r' \{filteredStudents\.length === 0 && \(\n <div className="text-center py-20 text-themeTextSec text-\[13px\] font-medium">No students found in this roster\.<\/div>\n \)\}\n <\/div>\n <\/div>', end_list_replacement, content)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

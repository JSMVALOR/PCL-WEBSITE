import re

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'r') as f:
    content = f.read()

old_grid = """<div className="grid grid-cols-3 divide-x divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5 bg-transparent">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText">{course.classesDone}</span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">Done</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-amber-500">{course.examDate ? course.classesLeft : '—'}</span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">{course.examDate ? 'Left (Est)' : 'No Exam Set'}</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className={`text-xl font-semibold tracking-tight ${Number(course.avgAttendance) >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
 {course.avgAttendance}%
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">Avg Attd</span>
 </div>
 </div>"""

new_grid = """<div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5 bg-transparent">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText">{course.classesDone}</span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal uppercase">Classes Done</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className={`text-xl font-semibold tracking-tight ${Number(course.avgAttendance) >= 75 ? 'text-emerald-500' : Number(course.avgAttendance) > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
 {course.avgAttendance}%
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal uppercase">Avg Attendance</span>
 </div>
 </div>"""

content = content.replace(old_grid, new_grid)

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'w') as f:
    f.write(content)


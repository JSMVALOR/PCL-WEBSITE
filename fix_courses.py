import re

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'r') as f:
    content = f.read()

# Fix the matching logic
old_filter = """ const subjSchedule = (schedule || []).filter(s => s.subject_id === subject.id);
 const subjSessions = (sessions || []).filter(s => s.class_schedule?.subject_id === subject.id);"""

new_filter = """ const subjSchedule = (schedule || []).filter(s => s.subject_id === subject.id || (subject.master_subjects && s.subject_id === subject.master_subjects.id));
 const subjSessions = (sessions || []).filter(s => s.class_schedule?.subject_id === subject.id || (subject.master_subjects && s.class_schedule?.subject_id === subject.master_subjects.id));"""
content = content.replace(old_filter, new_filter)

# Remove Exam Date UI
old_grid = """ <div className="grid grid-cols-3 divide-x divide-black/5 dark:divide-white/10 border-t border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/10">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-white">
 {course.classesDone}
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">Done</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center relative group">
 <span className={`text-sm lg:text-base font-semibold tracking-tight ${course.examDate ? 'text-blue-500' : 'text-amber-500'}`}>
 {course.examDate ? new Date(course.examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">{course.examDate ? 'Exam Date' : 'No Exam Set'}</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className={`text-xl font-semibold tracking-tight ${Number(course.avgAttendance) >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
 {course.avgAttendance}%
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal">Avg Attd</span>
 </div>
 </div>"""

new_grid = """ <div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/10 border-t border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/10">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-white">
 {course.classesDone}
 </span>
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

# In case there's another occurrence or slightly different spacing, let's also do a broader regex if needed, but direct replace should work if spacing matches.

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'w') as f:
    f.write(content)


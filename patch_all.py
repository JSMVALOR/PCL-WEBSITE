import re

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# Replace Desktop Buttons
new_desktop = """<div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorder shrink-0">
 <button type="button" onClick={() => handleAction(attendancePhase === 'exit' && (record.entry_status === 'absent' || record.isNew) ? 'arrived_late' : 'present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'present') || (!editMode && (attendancePhase === 'entry' ? record.entry_status === 'present' : (record.exit_status === 'present' || record.exit_status === 'arrived_late'))) ? 'bg-themePanel dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>P</button>
 <button type="button" onClick={() => handleAction('absent')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'absent') || (!editMode && (attendancePhase === 'entry' ? record.entry_status === 'absent' : record.exit_status === 'absent')) ? 'bg-themePanel dark:bg-themeElevated text-rose-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>A</button>
 <button type="button" onClick={() => handleAction('medical')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'medical') || (!editMode && (attendancePhase === 'entry' ? (record.entry_status === 'medical' || record.entry_status === 'approved_leave') : (record.exit_status === 'medical' || record.exit_status === 'early_leave'))) ? 'bg-themePanel dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>E</button>
 </div>"""
content = re.sub(r'<div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorder shrink-0">.*?</div>\n </div>\n\n {/* MOBILE VIEW \(SwipeRow\) \*/}', new_desktop + '\n </div>\n\n {/* MOBILE VIEW (SwipeRow) */}', content, flags=re.DOTALL)

# Replace Swipe actions
new_swipe = """actions={
 [
 { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
 { id: 'present', label: 'Present', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true },
 { id: 'medical', label: 'Exempt', color: '#f59e0b', icon: <HugeiconsIcon icon={Add01Icon} size={20} />, dismiss: true }
 ]
 }
 onAction={(actionId) => {
   if (actionId === 'present' && attendancePhase === 'exit' && (record.entry_status === 'absent' || record.isNew)) {
     handleAction('arrived_late');
   } else {
     handleAction(actionId);
   }
 }}"""
content = re.sub(r'actions=\{.*?\}\s+onAction=\{\(actionId\).*?\}', new_swipe, content, flags=re.DOTALL)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# 1. Desktop Buttons
old_desktop = """<div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorder shrink-0">
 {attendancePhase === 'entry' ? (
 <>
 <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'present') || (!editMode && record.entry_status === 'present') ? 'bg-themePanel dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>P</button>
 <button type="button" onClick={() => handleAction('absent')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'absent') || (!editMode && record.entry_status === 'absent') ? 'bg-themePanel dark:bg-themeElevated text-rose-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>A</button>
 <button type="button" onClick={() => handleAction('medical')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'medical') || (!editMode && (record.entry_status === 'medical' || record.entry_status === 'approved_leave')) ? 'bg-themePanel dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>M</button>
 </>
 ) : (
 <>
 {(() => {
 if (isPhaseOneSkipped) {
 return (
 <>
 <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-themePanel dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
 <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-themePanel dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
 </>
 );
 }
 if (record.entry_status === 'present' || record.entry_status === 'late') {
 return (
 <>
 <button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-themePanel dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
 <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-themePanel dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
 </>
 );
 }
 if (record.entry_status === 'absent') {
 return (
 <button type="button" onClick={() => updateAttendance(student.id, 'arrived_late')} className="w-[160px] h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-themeTextSec hover:text-amber-500 bg-themeElevated hover:bg-themePanel dark:hover:bg-themeElevated hover:shadow-sm transition-all border border-transparent hover:border-themeBorder ">
 Mark as Arrived Late
 </button>
 );
 }
 return null;
 })()}
 </>
 )}
 </div>"""

new_desktop = """<div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorder shrink-0">
 <button type="button" onClick={() => handleAction(attendancePhase === 'exit' && (record.entry_status === 'absent' || record.isNew) ? 'arrived_late' : 'present')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'present') || (!editMode && (attendancePhase === 'entry' ? record.entry_status === 'present' : (record.exit_status === 'present' || record.entry_status === 'late'))) ? 'bg-themePanel dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>P</button>
 <button type="button" onClick={() => handleAction('absent')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'absent') || (!editMode && (attendancePhase === 'entry' ? record.entry_status === 'absent' : record.exit_status === 'absent')) ? 'bg-themePanel dark:bg-themeElevated text-rose-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>A</button>
 <button type="button" onClick={() => handleAction('medical')} disabled={activeSession.status === 'completed' && !editMode} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${(editMode && stagedChanges[student.id] === 'medical') || (!editMode && (attendancePhase === 'entry' ? (record.entry_status === 'medical' || record.entry_status === 'approved_leave') : (record.exit_status === 'medical' || record.exit_status === 'early_leave'))) ? 'bg-themePanel dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>E</button>
 </div>"""

content = content.replace(old_desktop, new_desktop)

# 2. Swipe Buttons
old_swipe = """actions={
 attendancePhase === 'entry' ? [
 { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
 { id: 'present', label: 'Present', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true },
 { id: 'medical', label: 'Medical', color: '#f59e0b', icon: <HugeiconsIcon icon={Add01Icon} size={20} />, dismiss: true }
 ] : isPhaseOneSkipped || ['present', 'late'].includes(record.entry_status) ? [
 { id: 'early_leave', label: 'Left Early', color: '#f59e0b', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
 { id: 'present', label: 'Stayed', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
 ] : [
 { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
 { id: 'arrived_late', label: 'Arrived Late', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
 ]
 }
 onAction={(actionId) => {
 if (actionId === 'early_leave' || actionId === 'arrived_late') {
 updateAttendance(student.id, actionId);
 } else {
 handleAction(actionId);
 }
 }}"""

new_swipe = """actions={[
 { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
 { id: 'present', label: 'Present', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true },
 { id: 'medical', label: 'Exempt', color: '#f59e0b', icon: <HugeiconsIcon icon={Add01Icon} size={20} />, dismiss: true }
]}
 onAction={(actionId) => {
 if (actionId === 'present' && attendancePhase === 'exit' && (record.entry_status === 'absent' || record.isNew)) {
 handleAction('arrived_late');
 } else {
 handleAction(actionId);
 }
 }}"""

content = content.replace(old_swipe, new_swipe)

# 3. Realtime Update Logic
old_realtime = """setAttendanceRecords(prev => ({
 ...prev,
 [newRecord.student_id]: {
 status: newRecord.status,
 isNew: false,
 marked_by: newRecord.marked_by
 }
 }));"""

new_realtime = """setAttendanceRecords(prev => ({
 ...prev,
 [newRecord.student_id]: {
 ...prev[newRecord.student_id],
 entry_status: newRecord.entry_status,
 exit_status: newRecord.exit_status,
 isNew: false,
 marked_by: newRecord.marked_by
 }
 }));"""

content = content.replace(old_realtime, new_realtime)

# 4. Late Arrival Logic
old_late = """if (status === 'arrived_late') {
 payload = {
 session_id: activeSession.id,
 student_id: studentId,
 entry_status: 'late',
 entry_marked_at: new Date().toISOString(),
 exit_status: 'present',
 exit_marked_at: new Date().toISOString(),
 marked_by: 'faculty'
 };
 }"""

new_late = """if (status === 'arrived_late') {
 payload = {
 session_id: activeSession.id,
 student_id: studentId,
 entry_status: 'late',
 entry_marked_at: new Date().toISOString(),
 exit_status: 'present',
 exit_marked_at: new Date().toISOString(),
 marked_by: 'faculty'
 };
 supabase.from('mentee_reports').insert({
 student_id: studentId,
 faculty_id: userSession.db_id,
 title: 'Late Arrival Notice',
 category: 'attendance',
 notes: `Arrived late for ${activeSession.classData?.subject?.name || 'class'} on ${new Date().toLocaleDateString()}.`
 }).catch(e => console.error(e));
 }"""

content = content.replace(old_late, new_late)

# 5. UI Time Overlay
old_window = """{/* ACTIVE WINDOW VIEW */}
 {activeTab === 'window' && activeSession && (
 <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">"""

new_window = """{/* ACTIVE WINDOW VIEW */}
 {activeTab === 'window' && activeSession && (() => {
 const now = new Date();
 const [sh, sm, ss] = (activeSession.classData?.start_time || '00:00:00').split(':');
 const [eh, em, es] = (activeSession.classData?.end_time || '23:59:59').split(':');
 const startTime = new Date(); startTime.setHours(parseInt(sh, 10), parseInt(sm, 10), parseInt(ss, 10), 0);
 const endTime = new Date(); endTime.setHours(parseInt(eh, 10), parseInt(em, 10), parseInt(es, 10), 0);
 
 const p1End = new Date(startTime.getTime() + 15 * 60000);
 const p2Start = new Date(endTime.getTime() - 15 * 60000);
 
 let lockedMsg = null;
 let unlockTime = null;
 let isLocked = false;
 
 if (now < startTime) {
 isLocked = true;
 lockedMsg = "Class hasn't started yet.";
 unlockTime = startTime;
 } else if (attendancePhase === 'entry' && now > p1End) {
 isLocked = true;
 lockedMsg = "Phase 1 is locked. Please wait for Phase 2.";
 unlockTime = p2Start;
 } else if (attendancePhase === 'exit' && now < p2Start) {
 isLocked = true;
 lockedMsg = "Phase 2 is not yet open.";
 unlockTime = p2Start;
 }
 
 return (
 <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">"""
 
content = content.replace(old_window, new_window)

old_list = """<div className="w-full xl:w-[68%] bg-themePanel/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-themeBorder shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col overflow-hidden relative">
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
 
 <div className="flex-1 overflow-y-auto min-h-[400px] bg-themeApp relative">"""

new_list = """<div className="w-full xl:w-[68%] bg-themePanel/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-themeBorder shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col overflow-hidden relative">
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

content = content.replace(old_list, new_list)

old_list_end = """{filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 </div>
 </div>
 )}"""

new_list_end = """{filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
})()}"""

content = content.replace(old_list_end, new_list_end)

with open('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

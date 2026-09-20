const fs = require('fs');
const file = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// The original map start
const startPattern = '{filteredStudents.map((student, index) => {';
const endPattern = ' })}'; // up to the closing tags

const startIndex = content.indexOf(startPattern);
if (startIndex === -1) {
    console.error("Could not find start pattern");
    process.exit(1);
}

// Find the end index
const endIndexRegex = /\s*\}\)\}\s*<\/>\s*\)/;
const endMatch = content.match(endIndexRegex);

// Wait, looking at the code:
/*
752- })}
753-    </>
754-)}
*/

const oldMap = content.substring(startIndex, content.indexOf('</>', startIndex));

const newMap = `{filteredStudents.map((student, index) => {
 const record = attendanceRecords[student.id] || { entry_status: 'absent', exit_status: null };
 
 const isPhaseOneSkipped = Object.values(attendanceRecords).every(r => r.isNew);
 const handleAction = (actionId) => {
     updateAttendance(student.id, actionId);
 };
 
 const getStatusColor = (status) => {
     if (status === 'present' || status === 'late') return '#10b981'; // emerald-500
     if (status === 'absent') return '#f43f5e'; // rose-500
     if (status === 'medical' || status === 'early_leave') return '#f59e0b'; // amber-500
     return 'transparent';
 };
 
 const currentStatus = attendancePhase === 'entry' ? record.entry_status : record.exit_status;
 const activeColor = getStatusColor(currentStatus);

 return (
    <React.Fragment key={student.id}>
        {/* DESKTOP VIEW (Manual buttons) */}
        <div className="hidden lg:flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors border-b border-black/5 dark:border-white/5 last:border-0 group">
            <div className="flex items-center gap-4">
                <div className="w-8 text-center text-[12px] font-bold text-[#8E8E93] opacity-60">{index + 1}</div>
                <div>
                    <p className="text-[16px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight mb-0.5">{student.full_name}</p>
                    <p className="text-[12px] font-medium text-[#8E8E93]">
                    {student.erp_id}
                    </p>
                </div>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 shrink-0">
                {attendancePhase === 'entry' ? (
                <>
                    <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={\`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all \${record.entry_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>P</button>
                    <button type="button" onClick={() => updateAttendance(student.id, 'absent')} disabled={activeSession.status === 'completed'} className={\`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all \${record.entry_status === 'absent' ? 'bg-white dark:bg-[#2C2C2E] text-rose-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>A</button>
                    <button type="button" onClick={() => updateAttendance(student.id, 'medical')} disabled={activeSession.status === 'completed'} className={\`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all \${record.entry_status === 'medical' || record.entry_status === 'approved_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>M</button>
                </>
                ) : (
                <>
                {(() => {
                if (isPhaseOneSkipped) {
                    return (
                        <>
                            <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={\`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all \${record.exit_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>Stayed</button>
                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={\`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all \${record.exit_status === 'early_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>Left Early</button>
                        </>
                    );
                }
                if (record.entry_status === 'present' || record.entry_status === 'late') {
                    return (
                        <>
                            <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={\`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all \${record.exit_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>Stayed</button>
                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={\`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all \${record.exit_status === 'early_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}\`}>Left Early</button>
                        </>
                    );
                }
                if (record.entry_status === 'absent') {
                    return (
                        <button type="button" onClick={() => updateAttendance(student.id, 'arrived_late')} className="w-[160px] h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-[#8E8E93] hover:text-amber-500 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-[#2C2C2E] hover:shadow-sm transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5">
                            Mark as Arrived Late
                        </button>
                    );
                }
                return null;
                })()}
                </>
                )}
            </div>
        </div>

        {/* MOBILE VIEW (SwipeRow) */}
        <div className="block lg:hidden">
            <SwipeRow
                actions={
                    attendancePhase === 'entry' ? [
                        { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
                        { id: 'present', label: 'Present', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true },
                        { id: 'medical', label: 'Medical', color: '#f59e0b', icon: <HugeiconsIcon icon={Add01Icon} size={20} />, dismiss: true }
                    ] : isPhaseOneSkipped || ['present', 'late'].includes(record.entry_status) ? [
                        { id: 'early_leave', label: 'Left Early', color: '#f59e0b', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
                        { id: 'present', label: 'Stayed', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
                    ] : [
                        { id: 'arrived_late', label: 'Arrived Late', color: '#f59e0b', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
                    ]
                }
                onCommit={(action) => handleAction(action.id)}
                onAction={(action) => handleAction(action.id)}
                actionColor={attendancePhase === 'entry' ? '#f43f5e' : '#f59e0b'} // Left-swipe primary action color
                drawerColor="rgba(0,0,0,0.8)"
                rowColor={currentStatus !== 'absent' && currentStatus ? activeColor + '1A' : 'transparent'} // subtle background for marked
                textColor="inherit"
                height={72}
                radius={16}
                actionWidth={80}
                direction="left"
                snapBounce={0.2}
                resistance={0.55}
                collapseMs={200}
                commitAt={0.5}
                fullSwipe={true}
                closeOnAction={true}
                disabled={activeSession.status === 'completed'}
                className="mb-2 border border-black/5 dark:border-white/5"
            >
                <div className="flex items-center gap-4 w-full cursor-pointer pl-2">
                    <div className="w-8 text-center text-[12px] font-bold text-[#8E8E93] opacity-60">{index + 1}</div>
                    <div className="flex-1">
                        <p className="text-[16px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight mb-0.5">{student.full_name}</p>
                        <p className="text-[12px] font-medium text-[#8E8E93]">{student.erp_id}</p>
                    </div>
                    <div className="shrink-0 flex gap-2">
                        {currentStatus === 'present' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Present</span>}
                        {currentStatus === 'absent' && <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">Absent</span>}
                        {(currentStatus === 'medical' || currentStatus === 'early_leave') && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">{currentStatus === 'medical' ? 'Medical' : 'Left Early'}</span>}
                        {currentStatus === 'late' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Late</span>}
                        {!currentStatus && <span className="bg-black/5 dark:bg-white/5 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">Unmarked</span>}
                    </div>
                </div>
            </SwipeRow>
        </div>
    </React.Fragment>
 );
})}`;

content = content.replace(oldMap, newMap);
fs.writeFileSync(file, content);
console.log("Patched desktop view to use manual buttons.");

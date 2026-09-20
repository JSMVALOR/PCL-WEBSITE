const fs = require('fs');
const file = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure we have imports
if (!content.includes('SwipeRow')) {
    content = content.replace(
        "import SwipeableRosterDeck from './SwipeableRosterDeck';",
        "import SwipeableRosterDeck from './SwipeableRosterDeck';\nimport SwipeRow from '../../../../Shared/components/ReactBits/SwipeRow/SwipeRow';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { CheckmarkBadge01Icon, Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons';"
    );
}

// Find the map block using regex
const mapRegex = /\{filteredStudents\.map\(\(student, index\) => \{[\s\S]*?\}\)\(\)\}\n\s*<\/>\n \)\}\n <\/div>\n <\/div>\n \);\n \}\)\}/;

const replacement = `{filteredStudents.map((student, index) => {
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
 <SwipeRow
    key={student.id}
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
 );
 })}`;

if (mapRegex.test(content)) {
    content = content.replace(mapRegex, replacement);
    fs.writeFileSync(file, content);
    console.log("Patched successfully via regex");
} else {
    console.log("Regex did not match");
}

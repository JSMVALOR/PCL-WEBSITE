const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

code = code.replace(
  'const [attendancePhase, setAttendancePhase] = useState("entry"); // entry, exit',
  `const [attendancePhase, setAttendancePhase] = useState("entry"); // entry, exit
  const [editMode, setEditMode] = useState(false);
  const [stagedChanges, setStagedChanges] = useState({});`
);

const handleActionStr = `const handleAction = (actionId) => {
     updateAttendance(student.id, actionId);
 };`;
 
const handleActionRepl = `const handleAction = (actionId) => {
     if (editMode) {
         setStagedChanges(prev => ({ ...prev, [student.id]: actionId }));
     } else {
         updateAttendance(student.id, actionId);
     }
 };`;
code = code.replace(handleActionStr, handleActionRepl);

const desktopPBtn = `<button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'}`;
const desktopPBtnRepl = `<button type="button" onClick={() => handleAction('present')} disabled={activeSession.status === 'completed' && !editMode}`;
code = code.replaceAll(desktopPBtn, desktopPBtnRepl);

const desktopABtn = `<button type="button" onClick={() => updateAttendance(student.id, 'absent')} disabled={activeSession.status === 'completed'}`;
const desktopABtnRepl = `<button type="button" onClick={() => handleAction('absent')} disabled={activeSession.status === 'completed' && !editMode}`;
code = code.replaceAll(desktopABtn, desktopABtnRepl);

const desktopMBtn = `<button type="button" onClick={() => updateAttendance(student.id, 'medical')} disabled={activeSession.status === 'completed'}`;
const desktopMBtnRepl = `<button type="button" onClick={() => handleAction('medical')} disabled={activeSession.status === 'completed' && !editMode}`;
code = code.replaceAll(desktopMBtn, desktopMBtnRepl);

const statusColorCheck = `const currentStatus = attendancePhase === 'entry' ? record.entry_status : record.exit_status;`;
const statusColorCheckRepl = `const currentStatus = (editMode && stagedChanges[student.id]) ? stagedChanges[student.id] : (attendancePhase === 'entry' ? record.entry_status : record.exit_status);`;
code = code.replace(statusColorCheck, statusColorCheckRepl);

const bgChecks = [
  `record.entry_status === 'present'`,
  `record.entry_status === 'absent'`,
  `record.entry_status === 'medical' || record.entry_status === 'approved_leave'`
];
code = code.replace(bgChecks[0], `(editMode && stagedChanges[student.id] === 'present') || (!editMode && record.entry_status === 'present')`);
code = code.replace(bgChecks[1], `(editMode && stagedChanges[student.id] === 'absent') || (!editMode && record.entry_status === 'absent')`);
code = code.replace(bgChecks[2], `(editMode && stagedChanges[student.id] === 'medical') || (!editMode && (record.entry_status === 'medical' || record.entry_status === 'approved_leave'))`);

const finalizeBtnBlock = `{activeSession.status === 'completed' ? (
    <button type="button" disabled className="w-full py-4.5 rounded-2xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight bg-transparent text-themeTextSec dark:text-white/40 cursor-not-allowed mt-auto flex items-center justify-center gap-2">
        <i className="fa-solid fa-lock text-[12px]"></i> Finalize & Lock Session
    </button>
) : (`;

const finalizeBtnBlockRepl = `{activeSession.status === 'completed' ? (
    <div className="mt-auto w-full flex flex-col gap-2">
        {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="w-full py-4 rounded-xl border border-amber-500/50 text-[14px] font-bold tracking-tight bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                <i className="fa-solid fa-pen text-[12px]"></i> Request Corrections
            </button>
        ) : (
            <div className="flex gap-2">
                <button type="button" onClick={() => { setEditMode(false); setStagedChanges({}); }} className="flex-1 py-4 rounded-xl border border-black/10 dark:border-white/10 text-[14px] font-bold tracking-tight bg-black/5 dark:bg-white/5 text-themeText hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm">
                    Cancel
                </button>
                <button type="button" onClick={async () => {
                    if (Object.keys(stagedChanges).length === 0) {
                        if (window.erpDialog) window.erpDialog.alert("No changes made.");
                        else alert("No changes made.");
                        return;
                    }
                    let reason = null;
                    if (window.erpDialog) {
                        reason = await window.erpDialog.prompt("Provide a reason for these changes:", "Input Required");
                    } else {
                        reason = prompt("Provide a reason for these changes:");
                    }
                    if (!reason) return;
                    setIsSaving(true);
                    try {
                        for (const [studentId, newStatus] of Object.entries(stagedChanges)) {
                            const record = attendanceRecords[studentId];
                            await supabase.from('helpdesk_tickets').insert({
                                user_id: userSession.db_id,
                                subject: activeSession.classData?.subject?.name || "Attendance Correction",
                                category: 'Attendance',
                                description: \`Requested change to \${newStatus.toUpperCase()} - Reason: \${reason}\`,
                                status: 'open',
                                system_metadata: JSON.stringify({ session_id: activeSession.id, student_id: studentId, record_id: record?.id })
                            });
                        }
                        if (window.erpDialog) window.erpDialog.alert("Correction requests submitted to Admin!", "success");
                        else alert("Correction requests submitted to Admin!");
                        setEditMode(false);
                        setStagedChanges({});
                    } catch (e) {
                        console.error(e);
                        if (window.erpDialog) window.erpDialog.alert("Failed to submit corrections.", "error");
                        else alert("Failed to submit corrections.");
                    } finally {
                        setIsSaving(false);
                    }
                }} disabled={isSaving} className="flex-1 py-4 rounded-xl text-[14px] font-bold tracking-tight bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
                    {isSaving ? "Submitting..." : "Submit Changes"}
                </button>
            </div>
        )}
    </div>
) : (`;

code = code.replace(finalizeBtnBlock, finalizeBtnBlockRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched FacultyAttendance.jsx');

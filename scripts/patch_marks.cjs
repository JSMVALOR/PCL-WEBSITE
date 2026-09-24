const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

// 1. Add state for editMode and stagedMarks
code = code.replace(
  'const [isLocked, setIsLocked] = useState(false);',
  `const [isLocked, setIsLocked] = useState(false);
   const [editMode, setEditMode] = useState(false);
   const [stagedMarks, setStagedMarks] = useState({});`
);

// 2. Modify handleMarkChange to use stagedMarks if editMode
code = code.replace(
  `const handleMarkChange = (studentId, val) => {
 setMarksData(prev => ({ ...prev, [studentId]: val }));
 };`,
  `const handleMarkChange = (studentId, val) => {
    if (editMode) {
        setStagedMarks(prev => ({ ...prev, [studentId]: val }));
    } else {
        setMarksData(prev => ({ ...prev, [studentId]: val }));
    }
 };`
);

// 3. Remove handleRequestChange entirely since it's going to be bulk now.
// We'll replace it with a dummy or just ignore it.
// Wait, we can just let handleBulkSubmitRequest handle it.

// 4. Update the render of the table cell
const originalCell = `{isLocked ? (
     <div className="flex items-center gap-3">
         <span className="text-[15px] font-bold text-themeText">{hasMark ? mark : "—"}</span>
         <button onClick={() => handleRequestChange(student.id, mark)} className="text-[10px] uppercase font-bold tracking-widest text-blue-500 hover:text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">Change</button>
     </div>
 ) : (
     <input 
     type="number"
     step="0.1"
     min="0"
     max={maxMarks}
     placeholder="—"
     className="w-20 bg-white/40 dark:bg-white/10 border border-themeBorder rounded-lg px-3 py-2 text-right text-[15px] font-semibold text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition"
     value={hasMark ? mark : ""}
     onChange={(e) => handleMarkChange(student.id, e.target.value)}
     disabled={isLocked}
     />
 )}`;

const newCell = `{isLocked && !editMode ? (
     <div className="flex items-center justify-end gap-3 w-full">
         <span className="text-[15px] font-bold text-themeText">{hasMark ? mark : "—"}</span>
     </div>
 ) : (
     <input 
     type="number"
     step="0.1"
     min="0"
     max={maxMarks}
     placeholder="—"
     className="w-20 bg-white/40 dark:bg-white/10 border border-themeBorder rounded-lg px-3 py-2 text-right text-[15px] font-semibold text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition"
     value={editMode ? (stagedMarks[student.id] !== undefined ? stagedMarks[student.id] : (hasMark ? mark : "")) : (hasMark ? mark : "")}
     onChange={(e) => handleMarkChange(student.id, e.target.value)}
     disabled={isLocked && !editMode}
     />
 )}`;

code = code.replace(originalCell, newCell);

// 5. Update the action buttons block
const actionButtonsBlock = `{!isLocked ? (
     <>
         <button type="button" 
         onClick={handleSaveMarks}
         disabled={isSaving || gradedCount === 0}
         className="px-8 py-3.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
         >
         {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
         {isSaving ? 'Saving...' : 'Save Grades'}
         </button>
         <button type="button" 
         onClick={handleLockMarks}
         disabled={isSaving || gradedCount === 0}
         className="px-8 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
         >
         <i className="fa-solid fa-lock"></i>
         Lock Marks
         </button>
     </>
 ) : (
     <div className="px-8 py-3.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2">
         <i className="fa-solid fa-lock"></i> Marks Locked
     </div>
 )}`;

const newActionButtonsBlock = `{!isLocked ? (
     <>
         <button type="button" 
         onClick={handleSaveMarks}
         disabled={isSaving || gradedCount === 0}
         className="px-8 py-3.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
         >
         {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
         {isSaving ? 'Saving...' : 'Save Grades'}
         </button>
         <button type="button" 
         onClick={handleLockMarks}
         disabled={isSaving || gradedCount === 0}
         className="px-8 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
         >
         <i className="fa-solid fa-lock"></i>
         Lock Marks
         </button>
     </>
 ) : (
     <>
         {!editMode ? (
             <button type="button" onClick={() => setEditMode(true)} className="px-8 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[13px] font-bold flex items-center gap-2 transition-colors">
                 <i className="fa-solid fa-pen"></i> Request Corrections
             </button>
         ) : (
             <div className="flex items-center gap-2">
                 <button type="button" onClick={() => { setEditMode(false); setStagedMarks({}); }} className="px-6 py-3.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeText text-[13px] font-bold transition-colors">
                     Cancel
                 </button>
                 <button type="button" onClick={async () => {
                     const changes = Object.keys(stagedMarks).filter(id => stagedMarks[id] !== marksData[id]);
                     if (changes.length === 0) return window.erpDialog?.alert("No changes made.");
                     const reason = await window.erpDialog?.prompt("Provide a reason for these changes:");
                     if (!reason) return;
                     setIsSaving(true);
                     try {
                         for (const studentId of changes) {
                             await supabase.from('mark_correction_requests').insert({
                                 faculty_id: userSession.db_id,
                                 student_id: studentId,
                                 subject_id: selectedSubject,
                                 assessment_type: currentAssessmentTitle,
                                 old_mark: marksData[studentId] || '0',
                                 requested_mark: stagedMarks[studentId],
                                 reason: reason,
                                 status: 'pending'
                             });
                         }
                         window.erpDialog?.alert("Correction requests submitted to Admin!");
                         setEditMode(false);
                         setStagedMarks({});
                     } catch (e) {
                         console.error(e);
                         window.erpDialog?.alert("Failed to submit corrections.");
                     } finally {
                         setIsSaving(false);
                     }
                 }} disabled={isSaving} className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold flex items-center gap-2 transition-colors">
                     {isSaving ? "Submitting..." : "Submit Changes"}
                 </button>
             </div>
         )}
         <div className="px-4 py-3.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2 ml-2">
             <i className="fa-solid fa-lock"></i> Locked
         </div>
     </>
 )}`;

code = code.replace(actionButtonsBlock, newActionButtonsBlock);

// 6. Same for !subjectContext action buttons
const globalActionButtonsBlock = `{!isLocked ? (
            <>
                <button type="button" 
                onClick={handleSaveMarks}
                disabled={isSaving || gradedCount === 0}
                className="px-8 py-3.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                >
                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                {isSaving ? 'Saving...' : 'Save Grades'}
                </button>
                <button type="button" 
                onClick={handleLockMarks}
                disabled={isSaving || gradedCount === 0}
                className="px-8 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                >
                <i className="fa-solid fa-lock"></i>
                Lock Marks
                </button>
            </>
        ) : (
            <div className="px-8 py-3.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2 w-fit">
                <i className="fa-solid fa-lock"></i> Marks Locked
            </div>
        )}`;

// It's possible the block is slightly different in indentation. Let's use regex or just duplicate the newActionButtonsBlock.
code = code.replace(globalActionButtonsBlock, newActionButtonsBlock);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched FacultyMarks.jsx change request logic');

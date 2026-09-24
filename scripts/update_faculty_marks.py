import re

file_path = "/Users/JSM/Developer/VALOR./WEBSITE REBUILDS/PRUDENTIA COLLEGE OF LAW WEBSITE & ERP/Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Fix CSS for the Select dropdowns to remove rogue styling and add autoComplete off
content = re.sub(
    r'className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"',
    r'autoComplete="off" className="w-full !bg-transparent border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"',
    content
)

content = re.sub(
    r'className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"',
    r'autoComplete="off" className="w-full !bg-transparent border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"',
    content
)

# Add isLocked, fetchLockStatus, handleLockMarks, handleRequestChange
state_hooks_addition = """
 const [isLocked, setIsLocked] = useState(false);
 const currentAssessmentTitle = isGenericAssessment ? selectedAssessmentType : (activeAssignment?.title || selectedAssessmentType);

 const fetchLockStatus = async () => {
     if (!selectedSubject || !selectedBatch || !selectedAssessmentType) {
         setIsLocked(false);
         return;
     }
     try {
         const { data } = await supabase.from('marks_submissions')
             .select('id')
             .eq('subject_id', selectedSubject)
             .eq('batch', selectedBatch)
             .eq('assessment_type', currentAssessmentTitle);
         setIsLocked(data && data.length > 0);
     } catch (e) {
         console.error(e);
     }
 };

 useEffect(() => {
     fetchLockStatus();
 }, [selectedSubject, selectedBatch, selectedAssessmentType, currentAssessmentTitle]);

 const handleLockMarks = async () => {
     const confirmed = await window.erpDialog?.confirm("Are you sure you want to lock these marks? They will be sent to the Admin, and further changes will require approval.");
     if (!confirmed) return;
     setIsSaving(true);
     try {
         const { error } = await supabase.from('marks_submissions').insert({
             faculty_id: userSession.db_id,
             subject_id: selectedSubject,
             batch: selectedBatch,
             assessment_type: currentAssessmentTitle,
             submitted_at: new Date().toISOString()
         });
         if (error) throw error;
         window.erpDialog?.alert("Marks locked successfully!");
         setIsLocked(true);
     } catch (e) {
         console.error(e);
         window.erpDialog?.alert("Failed to lock marks.");
     } finally {
         setIsSaving(false);
     }
 };

 const handleRequestChange = async (studentId, currentMark) => {
     const newMarkStr = await window.erpDialog?.prompt("Enter the requested new mark:", currentMark);
     if (newMarkStr === null || newMarkStr === undefined || newMarkStr === "") return;
     const newMark = Number(newMarkStr);
     if (isNaN(newMark) || newMark < 0 || newMark > maxMarks) {
         window.erpDialog?.alert("Invalid mark entered.");
         return;
     }
     const reason = await window.erpDialog?.prompt("Reason for mark change:", "");
     if (!reason) {
         window.erpDialog?.alert("Reason is required.");
         return;
     }
     try {
         const { error } = await supabase.from('mark_correction_requests').insert({
             faculty_id: userSession.db_id,
             student_id: studentId,
             subject_id: selectedSubject,
             assessment_type: currentAssessmentTitle,
             old_mark: currentMark,
             requested_mark: newMark,
             reason: reason,
             status: 'pending'
         });
         if (error) throw error;
         window.erpDialog?.alert("Change request submitted to Admin.");
     } catch (e) {
         console.error(e);
         window.erpDialog?.alert("Failed to submit change request.");
     }
 };
"""

# Inject state_hooks_addition right before useEffect(() => { fetchMetadata(); }, [userSession]);
content = content.replace(
    " useEffect(() => {\n fetchMetadata();\n }, [userSession]);",
    state_hooks_addition + "\n useEffect(() => {\n fetchMetadata();\n }, [userSession]);"
)

# Update the "Save Grades" button area to include the Lock Marks button
save_grades_replacement = """
 {subjectContext && students.length > 0 && (
 <div className="flex justify-end gap-3">
 {!isLocked ? (
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
 )}
 </div>
 )}
"""
content = re.sub(r'\{subjectContext && students\.length > 0 && \(\s*<div className="flex justify-end">\s*<button type="button"[\s\S]*?</button>\s*</div>\s*\)\}', save_grades_replacement.strip(), content)

# Update the input field to disable if locked, and show request change button
input_replacement = """
 <div className="flex items-center justify-end gap-2">
 {isLocked ? (
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
 )}
 <span className="text-xs font-bold text-themeTextSec">/ {maxMarks}</span>
 </div>
"""
content = re.sub(r'<div className="flex items-center justify-end gap-2">\s*<input[\s\S]*?/>\s*<span className="text-xs font-bold text-themeTextSec">/ \{maxMarks\}</span>\s*</div>', input_replacement.strip(), content)

with open(file_path, "w") as f:
    f.write(content)
print("Updated FacultyMarks.jsx")

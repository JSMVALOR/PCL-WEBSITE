/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

const getBatchColorKey = (batchName) => {
    if (!batchName) return 'default';
    const b = batchName.toUpperCase();
    if (b.includes('BA LLB')) return 'rose';
    if (b.includes('BBA LLB')) return 'emerald';
    if (b.includes('LLM')) return 'purple';
    if (b.includes('LLB')) return 'indigo';
    return 'default';
};

const THEME_COLORS = {
    blue: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
    emerald: { primary: '#34C759', bg: 'rgba(52,199,89,0.1)' },
    amber: { primary: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
    rose: { primary: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
    indigo: { primary: '#5856D6', bg: 'rgba(88,86,214,0.1)' },
    purple: { primary: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },
    default: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' }
};

export default function FacultyMarks({ subjectContext, isEmbedded = false }) {
 const { userSession } = useERP();
 
 // Selection State
 const [subjects, setSubjects] = useState(() => {
    const cached = sessionStorage.getItem(`fac_marks_subjects_${userSession?.db_id}`);
    return cached ? JSON.parse(cached) : [];
 });
 const [assignments, setAssignments] = useState(() => {
    const cached = sessionStorage.getItem(`fac_marks_assignments_${userSession?.db_id}`);
    return cached ? JSON.parse(cached) : [];
 });
 const [availableBatches, setAvailableBatches] = useState([]);
 const [facultySchedule, setFacultySchedule] = useState(() => {
    const cached = sessionStorage.getItem(`fac_marks_schedule_${userSession?.db_id}`);
    return cached ? JSON.parse(cached) : [];
 });
 
 const [selectedSubject, setSelectedSubject] = useState("");
 const [selectedBatch, setSelectedBatch] = useState("");
 const [selectedAssessmentType, setSelectedAssessmentType] = useState(""); 
 const [maxMarksOverride, setMaxMarksOverride] = useState("");
 
 // Data State
 const [students, setStudents] = useState([]);
 const [marksData, setMarksData] = useState({});
 const [existingLedgerIds, setExistingLedgerIds] = useState({});
 const [submissionStatus, setSubmissionStatus] = useState({});
 const [submissionFiles, setSubmissionFiles] = useState({});
 const [viewingSubmission, setViewingSubmission] = useState(null);
 
 const [isSaving, setIsSaving] = useState(false);
 
 const activeAssignment = assignments.find(a => a.id === selectedAssessmentType);
 const isGenericAssessment = ['Internals', 'Mid-Term', 'Viva'].includes(selectedAssessmentType);
 const maxMarks = activeAssignment ? activeAssignment.total_marks : (maxMarksOverride ? Number(maxMarksOverride) : 0);

 const [isLocked, setIsLocked] = useState(false);
 const [editMode, setEditMode] = useState(false);
 const [stagedMarks, setStagedMarks] = useState({});
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

 useEffect(() => {
    fetchMetadata();
 }, [userSession]);

 const fetchMetadata = async () => {
     if (!userSession?.db_id) return;
     try {
         // 1. Subjects (merge direct assignment + schedule assignment)
         const { data: directSubs } = await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);
         const { data: scheduledSubs } = await supabase.from('class_schedule').select('subject_id').eq('faculty_id', userSession.db_id);
         
         let allSubIds = (directSubs || []).map(s => s.id);
         if (scheduledSubs && scheduledSubs.length > 0) {
            allSubIds = [...new Set([...allSubIds, ...scheduledSubs.map(s => s.subject_id)])];
         }
         
         let finalSubs = directSubs || [];
         const missingIds = allSubIds.filter(id => !finalSubs.find(s => s.id === id));
         
         if (missingIds.length > 0) {
            const { data: extraSubs } = await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code)').in('id', missingIds);
            if (extraSubs) {
                finalSubs = [...finalSubs, ...extraSubs];
            }
         }

         let subs = finalSubs.map(s => ({ id: s.id, master_id: s.master_subjects?.id, name: s.master_subjects?.name || 'Unknown', code: s.master_subjects?.code || 'Unknown', batch_name: s.academic_batches?.batch_name }));

         // 2. Assignments
         const { data: assigns } = await supabase.from('assignments').select('id, title, total_marks, subject_id, batch, submission_type').eq('faculty_id', userSession.db_id);
         if (assigns) {
            setAssignments(assigns);
            sessionStorage.setItem(`fac_marks_assignments_${userSession.db_id}`, JSON.stringify(assigns));
            
            // Add missing subjects from assignments
            const assignSubIds = [...new Set(assigns.map(a => a.subject_id))];
            const missingAssignIds = assignSubIds.filter(id => !subs.find(s => (s.master_id === id || s.id === id)));
            if (missingAssignIds.length > 0) {
                const { data: extraSubs2 } = await supabase.from('master_subjects').select('id, name, code').in('id', missingAssignIds);
                if (extraSubs2) {
                    const mappedSubs = extraSubs2.map(s => ({ id: s.id, master_id: s.id, name: s.name, code: s.code, batch_name: assigns.find(a => a.subject_id === s.id)?.batch }));
                    subs = [...subs, ...mappedSubs];
                }
            }
         }

         if (subs) {
             setSubjects(subs);
             sessionStorage.setItem(`fac_marks_subjects_${userSession.db_id}`, JSON.stringify(subs));
         }

         // 3. Batches (from class_schedule)
         const { data: schedule } = await supabase.from('class_schedule').select('subject_id, batch').in('subject_id', (subs || []).map(s => s.master_id).filter(Boolean));
         if (schedule) {
             setFacultySchedule(schedule);
             sessionStorage.setItem(`fac_marks_schedule_${userSession.db_id}`, JSON.stringify(schedule));
         }

         if (subjectContext) {
             const masterId = subjectContext.master_subjects?.id || subjectContext.subject_id || subjectContext.master_subjects_id || subjectContext.id;
             setSelectedSubject(masterId);
             if (subjectContext.batches && subjectContext.batches.length > 0) {
                 setSelectedBatch(subjectContext.batches[0]);
             }
         }
     } catch (error) {
         console.error(error);
     }
 };

  useEffect(() => {
      if (subjectContext) {
          const masterId = subjectContext.master_subjects?.id || subjectContext.subject_id || subjectContext.master_subjects_id || subjectContext.id;
          setSelectedSubject(masterId);
          const matchedSub = subjects.find(s => s.master_id === masterId || s.id === masterId);
          if (matchedSub && matchedSub.batch_name) {
              setAvailableBatches([matchedSub.batch_name]);
              setSelectedBatch(matchedSub.batch_name);
          } else {
              const subjSchedule = facultySchedule.filter(s => s.subject_id === masterId);
              const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
              setAvailableBatches(uniqueBatches);
              if (uniqueBatches.length > 0) setSelectedBatch(uniqueBatches[0]);
          }
      }
  }, [subjectContext, facultySchedule, subjects]);

 useEffect(() => {
     if (selectedSubject && selectedBatch && selectedAssessmentType) {
         if (isGenericAssessment && !maxMarksOverride) {
             setStudents([]);
             return;
         }
         fetchStudentsAndMarks();
     } else {
         setStudents([]);
     }
 }, [selectedSubject, selectedBatch, selectedAssessmentType, maxMarksOverride]);

 const fetchStudentsAndMarks = async () => {
     try {
         const { data: allStds, error: sErr } = await supabase
             .from('profiles')
             .select('*')
             .eq('role', 'student');
         if (sErr) throw sErr;
         
         // Sort by roll_number or full_name in memory
         allStds?.sort((a, b) => {
             const aRoll = a.roll_number || '';
             const bRoll = b.roll_number || '';
             if (aRoll && bRoll) return aRoll.localeCompare(bRoll);
             return (a.full_name || '').localeCompare(b.full_name || '');
         });
         
         let filteredStds = (allStds || []).filter(s => s.academic_batch === selectedBatch);
         
         if (filteredStds.length === 0) {
             const cleanBatch = selectedBatch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
             filteredStds = (allStds || []).filter(s => {
                 if (!s.academic_batch) return false;
                 const cb = s.academic_batch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                 return cb.includes(cleanBatch) || cleanBatch.includes(cb);
             });
         }
         
         // Absolute fallback for testing if dummy data doesn't align
         if (filteredStds.length === 0 && allStds && allStds.length > 0) {
             filteredStds = allStds;
         }
         
         setStudents(filteredStds);

         let query = supabase.from('marks_ledger')
             .select('id, student_id, marks_obtained')
             .eq('faculty_id', userSession.db_id)
             .eq('subject_id', selectedSubject);

         if (!isGenericAssessment) {
             query = query.eq('assignment_id', selectedAssessmentType);
         } else {
             query = query.eq('assessment_type', selectedAssessmentType);
         }

         const { data: marks, error: mErr } = await query;
         if (mErr) throw mErr;

         const newMarksData = {};
         const newLedgerIds = {};
         marks?.forEach(m => {
             newMarksData[m.student_id] = m.marks_obtained;
             newLedgerIds[m.student_id] = m.id;
         });
         
         if (!isGenericAssessment) {
            const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded, status, file_url, submission_text').eq('assignment_id', selectedAssessmentType);
            const statMap = {};
            const fileMap = {};
            subs?.forEach(s => {
                statMap[s.student_id] = s.status;
                fileMap[s.student_id] = { url: s.file_url, text: s.submission_text };
                if (s.marks_awarded !== null && s.marks_awarded !== undefined && newMarksData[s.student_id] === undefined) {
                    newMarksData[s.student_id] = s.marks_awarded;
                }
            });
            setSubmissionStatus(statMap);
            setSubmissionFiles(fileMap);
         }
         
         setMarksData(newMarksData);
         setExistingLedgerIds(newLedgerIds);

     } catch (error) {
         console.error(error);
     }
 };

 const handleMarkChange = (studentId, value) => {
     if (value === "") {
         const newData = { ...marksData };
         delete newData[studentId];
         setMarksData(newData);
         return;
     }

     const num = Number(value);
     if (isNaN(num)) return;
     if (num < 0) return;
     if (num > maxMarks) return;

     setMarksData(prev => ({
         ...prev,
         [studentId]: num
     }));
 };

 const handleSaveAndLock = async () => {
     if (!selectedSubject || !selectedBatch || !selectedAssessmentType) return;
     
     const confirmed = await window.erpDialog?.danger(
         "Locking this roster is a permanent action. Once locked, any future modifications to student grades will require an official correction request and Admin approval.\n\nAre you sure you want to proceed?",
         "CONFIRM ROSTER LOCK",
         "Lock Roster"
     );
     if (!confirmed) return;
     
     setIsSaving(true);
     try {
         const upsertArray = [];
         Object.keys(marksData).forEach(studentId => {
             const row = {
                 faculty_id: userSession.db_id,
                 subject_id: selectedSubject,
                 student_id: studentId,
                 total_marks: maxMarks,
                 marks_obtained: marksData[studentId],
                 assessment_type: isGenericAssessment ? selectedAssessmentType : activeAssignment.title
             };
             if (!isGenericAssessment) {
                 row.assignment_id = selectedAssessmentType;
             }
             if (existingLedgerIds[studentId]) {
                 row.id = existingLedgerIds[studentId];
             }
             upsertArray.push(row);
         });

         if (upsertArray.length === 0) {
             window.erpDialog?.alert("No marks entered to save.");
             setIsSaving(false);
             return;
         }

         let error = null;
         for (const row of upsertArray) {
             const { data: existing } = await supabase.from('marks_ledger').select('id').eq('student_id', row.student_id).eq('subject_id', row.subject_id).eq('assessment_type', row.assessment_type);
             if (existing && existing.length > 0) {
                 const { error: updErr } = await supabase.from('marks_ledger').update(row).eq('id', existing[0].id);
                 if (updErr) error = updErr;
             } else {
                 const { error: insErr } = await supabase.from('marks_ledger').insert(row);
                 if (insErr) error = insErr;
             }
         }
        
         try {
             if (!isGenericAssessment) {
                 for (const row of upsertArray) {
                     await supabase.from('assignment_submissions').update({
                         marks_awarded: row.marks_obtained,
                         status: 'Graded'
                     }).eq('assignment_id', row.assignment_id).eq('student_id', row.student_id);
                 }
             }
         } catch(e) {
             console.error("Failed to sync assignment submissions", e);
         }

         if (error) throw error;
         
         // Lock the roster
         const { error: lockErr } = await supabase.from('marks_submissions').insert({
             faculty_id: userSession.db_id,
             subject_id: selectedSubject,
             batch: selectedBatch,
             assessment_type: currentAssessmentTitle,
             submitted_at: new Date().toISOString(),
             marks_data: upsertArray
         });
         
         if (lockErr) {
             console.error("Failed to insert lock:", lockErr);
             throw lockErr;
         }
         
         setIsLocked(true);
         window.erpDialog?.alert("Grades submitted and roster locked successfully!");
         fetchStudentsAndMarks(); 
     } catch (error) {
         console.error("Save Error:", error);
         window.erpDialog?.alert(`Failed to save and lock marks. Error: ${error.message || error.details || JSON.stringify(error)}`, "Action Failed", true);
     } finally {
         setIsSaving(false);
     }
 };

 const gradedCount = Object.keys(marksData).length;
 const totalMarksEntered = Object.values(marksData).reduce((a, b) => a + b, 0);
 const average = gradedCount > 0 ? (totalMarksEntered / gradedCount).toFixed(1) : 0;
 const highest = gradedCount > 0 ? Math.max(...Object.values(marksData)) : 0;

 return (
    <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
        <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
            
            {!subjectContext && !isEmbedded && (
                <PageHeader 
                    icon="fa-solid fa-file-pen" 
                    title="Marks & Assignments" 
                    subtitle="Select a subject to grade active assignments and internal marks." 
                />
            )}

            {students.length > 0 && selectedAssessmentType && (
                <div className="flex justify-between items-center bg-themePanel border border-themeBorder p-4 rounded-2xl animate-fade-in">
                    <button onClick={() => { setSelectedAssessmentType(""); setStudents([]); }} className="text-[13px] font-bold text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Back to Assignments
                    </button>
                    <div className="flex gap-3">
                        {!isLocked ? (
                            <>
                                <button type="button" onClick={handleSaveAndLock} disabled={isSaving || gradedCount === 0} className="px-6 py-2.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-white text-[13px] font-bold transition active:scale-[0.98] flex items-center gap-2 disabled:opacity-50">
                                    {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-lock"></i>} Submit & Lock Grades
                                </button>
                            </>
                        ) : (
                            <>
                                {!editMode ? (
                                    <button type="button" onClick={() => setEditMode(true)} className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-[13px] font-bold flex items-center gap-2 transition-colors">
                                        <i className="fa-solid fa-pen"></i> Request Corrections
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => { setEditMode(false); setStagedMarks({}); }} className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeText text-[13px] font-bold transition-colors">
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
                                        }} disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold flex items-center gap-2 transition-colors">
                                            {isSaving ? "Submitting..." : "Send for Approval"}
                                        </button>
                                    </div>
                                )}
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[13px] font-bold flex items-center gap-2 ml-2">
                                    <i className="fa-solid fa-lock"></i> Locked
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {selectedSubject && !selectedAssessmentType && (
                <div className="flex items-center mb-[-10px] animate-slide-in-right">
                    <button onClick={() => { setSelectedSubject(""); setSelectedBatch(""); }} className="text-[13px] font-bold text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2 bg-themePanel border border-themeBorder px-4 py-2 rounded-xl shadow-sm">
                        <i className="fa-solid fa-arrow-left"></i> Back to Subjects
                    </button>
                </div>
            )}

            {!selectedSubject ? (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-themeTextSec ml-1">Your Assigned Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subjects.map(sub => (
                            <button type="button" key={sub.id || sub.master_id} onClick={() => {
                                setSelectedSubject(sub.master_id || sub.id);
                                if (sub.batch_name) setSelectedBatch(sub.batch_name);
                                else {
                                    const subjSchedule = facultySchedule.filter(s => s.subject_id === (sub.master_id || sub.id));
                                    if (subjSchedule.length > 0) setSelectedBatch(subjSchedule[0].batch);
                                }
                            }} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 text-left cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group flex flex-col gap-4">
                                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-amber-500/10 group-hover:text-amber-500">
                                    <i className="fa-solid fa-book-open text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-themeText leading-tight">{sub.name}</h4>
                                    <p className="text-xs font-bold text-themeTextSec mt-1">{sub.code}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-auto text-themeTextSec opacity-70 group-hover:opacity-100 group-hover:text-amber-500 transition-colors pt-2">
                                    <span className="text-[11px] font-bold tracking-widest uppercase">Open Grading <i className="fa-solid fa-arrow-right ml-1 -rotate-45 group-hover:rotate-0 transition-transform"></i></span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {subjects.length === 0 && (
                        <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
                            <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
                            <h3 className="text-lg lg:text-xl text-themeText font-black">No Subjects Found</h3>
                            <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">You don't have any subjects or assignments mapped to your account.</p>
                        </div>
                    )}
                </div>
            ) : null}

            {selectedSubject && !selectedAssessmentType && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-themeBorder rounded-[2rem] p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg shadow-inner border border-amber-500/20">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-themeText tracking-tight leading-tight">Active Assignments</h3>
                                <p className="text-[10px] font-bold text-themeTextSec mt-0.5 tracking-normal">Click an assignment to auto-load the grading roster</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assignments.filter(a => a.subject_id === selectedSubject).map(assign => (
                                <button type="button" key={assign.id} onClick={() => {
                                    setSelectedBatch(assign.batch);
                                    setSelectedAssessmentType(assign.id);
                                }} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-5 hover:border-themeAccent/50 hover:bg-themeAccent/5 transition-all duration-300 flex flex-col gap-3 group text-left shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] active:scale-[0.98]">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-2">
                                            <span className="w-full bg-themeElevated px-2 py-0.5 rounded text-[10px] font-bold text-themeTextSec border border-themeBorder group-hover:border-themeAccent/30">{assign.batch}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-themeText text-[12px] font-bold">
                                            <i className="fa-solid fa-star text-amber-500 text-[10px]"></i> {assign.total_marks}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-semibold tracking-tight text-themeText leading-tight">{assign.title}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-themeTextSec opacity-70 group-hover:opacity-100 group-hover:text-themeAccent transition-colors">
                                        <span className="text-[11px] font-bold tracking-widest uppercase">Grade Now <i className="fa-solid fa-arrow-right ml-1 -rotate-45 group-hover:rotate-0 transition-transform"></i></span>
                                    </div>
                                </button>
                            ))}
                            {assignments.filter(a => a.subject_id === selectedSubject).length === 0 && (
                                <div className="col-span-full py-8 text-center text-sm font-bold text-themeTextSec">No active assignments found for this subject.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedAssessmentType && students.length > 0 && maxMarks > 0 && (
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 flex-1 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/5 rounded-full blur-2xl"></div>
                        <div>
                            <h3 className="text-[13px] font-medium text-themeTextSec mb-4">Grading Analytics</h3>
                            <div className="flex gap-8">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-semibold tracking-tight text-themeText">{gradedCount}<span className="text-sm text-themeTextSec font-bold">/{students.length}</span></span>
                                    <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Graded</span>
                                </div>
                                <div className="flex flex-col border-l border-themeBorder pl-6">
                                    <span className="text-3xl font-semibold tracking-tight text-amber-500">{average}</span>
                                    <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Class Avg</span>
                                </div>
                                <div className="flex flex-col border-l border-themeBorder pl-6">
                                    <span className="text-3xl font-semibold tracking-tight text-emerald-500">{highest}</span>
                                    <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Highest</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right pr-6">
                            <span className="text-4xl font-black text-themeText opacity-20">{maxMarks} Max</span>
                        </div>
                    </div>

                    <div className="bg-themePanel border border-themeBorder rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="w-full bg-themeElevated/50 border-b border-themeBorder">
                                        <th className="px-6 py-4 text-[13px] font-medium text-themeTextSec w-24">Roll No</th>
                                        <th className="px-6 py-4 text-[13px] font-medium text-themeTextSec">Student Name</th>
                                        <th className="px-6 py-4 text-[13px] font-medium text-themeTextSec w-32 text-center">ERP ID</th>
                                        <th className="px-6 py-4 text-[13px] font-medium text-themeAccent w-48 text-right bg-themeAccent/5">Marks Obtained</th>
                                        <th className="px-6 py-4 text-[13px] font-medium text-themeTextSec w-32 text-right">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => {
                                        const mark = marksData[student.id];
                                        const hasMark = mark !== undefined && mark !== "";
                                        const percentage = hasMark ? ((mark / maxMarks) * 100).toFixed(1) : "0.0";
                                        return (
                                            <tr key={student.id} className="border-b border-themeBorder/50 hover:bg-themeElevated/20 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <span className="text-[14px] font-medium text-themeTextSec font-mono">{student.roll_number || '—'}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-sm font-bold text-themeText">{student.full_name}</span>
                                                    {!isGenericAssessment && submissionStatus[student.id] && (
                                                        <span className="ml-2 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-themeAccent/10 text-themeAccent border border-themeAccent/20">{submissionStatus[student.id]}</span>
                                                    )}
                                                    {!isGenericAssessment && submissionFiles[student.id] && (submissionFiles[student.id].url || submissionFiles[student.id].text) && (
                                                        <button onClick={() => {
                                                            if (submissionFiles[student.id].url) {
                                                                window.open(submissionFiles[student.id].url, '_blank');
                                                            } else {
                                                                setViewingSubmission({
                                                                    student: student,
                                                                    text: submissionFiles[student.id].text
                                                                });
                                                            }
                                                        }} className="ml-2 text-[10px] uppercase font-bold tracking-widest text-blue-500 hover:text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 transition-colors">
                                                            <i className="fa-solid fa-eye mr-1"></i> View
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-[10px] font-bold text-themeTextSec tracking-normal">{student.erp_id}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right bg-themeAccent/5 group-hover:bg-themeAccent/10 transition-colors">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isLocked && !editMode ? (
                                                            <div className="flex items-center justify-end gap-3 w-full">
                                                                <span className="text-[15px] font-bold text-themeText">{hasMark ? mark : "—"}</span>
                                                            </div>
                                                        ) : (
                                                            <input 
                                                                type="number" step="0.1" min="0" max={maxMarks} placeholder="—"
                                                                className="w-20 bg-white/40 dark:bg-white/10 border border-themeBorder rounded-lg px-3 py-2 text-right text-[15px] font-semibold text-themeText outline-none focus:border-themeAccent focus:ring-0 focus:outline-none focus:ring-1 focus:ring-themeAccent transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                value={editMode ? (stagedMarks[student.id] !== undefined ? stagedMarks[student.id] : (hasMark ? mark : "")) : (hasMark ? mark : "")}
                                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                                disabled={(isLocked && !editMode) || (!isGenericAssessment && activeAssignment?.submission_type === 'online' && !(submissionFiles[student.id] && (submissionFiles[student.id].url || submissionFiles[student.id].text)))}
                                                                title={(!isGenericAssessment && activeAssignment?.submission_type === 'online' && !(submissionFiles[student.id] && (submissionFiles[student.id].url || submissionFiles[student.id].text))) ? "Cannot grade: No online submission received yet" : ""}
                                                            />
                                                        )}
                                                        <span className="text-xs font-bold text-themeTextSec">/ {maxMarks}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className={`text-[15px] font-semibold ${
                                                        hasMark ? Number(percentage) >= 75 ? 'text-emerald-500' : Number(percentage) >= 50 ? 'text-amber-500' : 'text-rose-500' : 'text-themeTextSec opacity-50'
                                                    }`}>
                                                        {hasMark ? `${percentage}%` : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {viewingSubmission && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-fade-in">
                    <div className="bg-themeApp w-full max-w-4xl h-full max-h-[85vh] rounded-[2rem] border border-themeBorder shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-themeBorder flex items-center justify-between bg-themePanel/80">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-themeElevated border border-themeBorder flex items-center justify-center text-xl font-black text-themeText">
                                    {viewingSubmission.student.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-themeText tracking-tight">{viewingSubmission.student.full_name}'s Submission</h2>
                                    <p className="text-xs font-mono font-bold text-themeTextSec mt-0.5 uppercase tracking-widest">{viewingSubmission.student.roll_number} • {viewingSubmission.student.erp_id}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewingSubmission(null)} className="w-10 h-10 rounded-full bg-themeElevated/50 hover:bg-themeElevated text-themeText flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-themeApp">
                            <div className="w-full max-w-3xl mx-auto bg-white/[0.02] dark:bg-black/20 border border-themeBorder rounded-2xl p-8">
                                <div className="whitespace-pre-wrap font-medium text-[15px] leading-relaxed text-themeText">
                                    {viewingSubmission.text || 'No text content provided.'}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-themeBorder bg-themePanel/80 flex items-center justify-between">
                            <div className="text-xs font-bold text-themeTextSec">
                                <i className="fa-solid fa-circle-info mr-1"></i> 
                                Submission for {activeAssignment?.title || 'Assignment'}
                            </div>
                            <button onClick={() => setViewingSubmission(null)} className="px-6 py-2.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-white font-bold text-sm transition-colors">
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
 );
}

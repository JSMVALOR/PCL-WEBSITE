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

export default function FacultyMarks({ subjectContext }) {
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
 const [selectedAssessmentType, setSelectedAssessmentType] = useState(""); // Can be an assignment ID or 'Internals' or 'Mid-Term'
 const [maxMarksOverride, setMaxMarksOverride] = useState(""); // For generic types like 'Internals'
 
 // Data State
 const [students, setStudents] = useState([]);
 const [marksData, setMarksData] = useState({}); // { student_id: marks_obtained }
 const [existingLedgerIds, setExistingLedgerIds] = useState({}); // { student_id: ledger_id }
 
 const [isSaving, setIsSaving] = useState(false);
 
 // Computed assessment details
 const activeAssignment = assignments.find(a => a.id === selectedAssessmentType);
 const isGenericAssessment = ['Internals', 'Mid-Term', 'Viva'].includes(selectedAssessmentType);
 const maxMarks = activeAssignment ? activeAssignment.total_marks : (maxMarksOverride ? Number(maxMarksOverride) : 0);

 useEffect(() => {
 fetchMetadata();
 }, [userSession]);

 const fetchMetadata = async () => {
 if (!userSession?.db_id) return;
 try {
 // 1. Subjects
 const { data: rawSubs } = await supabase.from('cohort_subjects').select('id, batch_id, academic_batches(batch_name), master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);
 const subs = rawSubs ? rawSubs.map(s => ({ id: s.id, master_id: s.master_subjects?.id, name: s.master_subjects?.name || 'Unknown', code: s.master_subjects?.code || 'Unknown', batch_name: s.academic_batches?.batch_name })) : [];
 if (subs) {
 setSubjects(subs);
 sessionStorage.setItem(`fac_marks_subjects_${userSession.db_id}`, JSON.stringify(subs));
 }

 // 2. Batches (from class_schedule)
 const { data: schedule } = await supabase.from('class_schedule').select('subject_id, batch').in('subject_id', (subs || []).map(s => s.master_id).filter(Boolean));
 if (schedule) {
 setFacultySchedule(schedule);
 sessionStorage.setItem(`fac_marks_schedule_${userSession.db_id}`, JSON.stringify(schedule));
 }

 // Handle initial state if opened from Dashboard Action (subjectContext)
 if (subjectContext) {
 if (subjectContext.master_subjects && typeof subjectContext.master_subjects === 'object' && subjectContext.master_subjects.id) {
 setSelectedSubject(subjectContext.master_subjects.id);
 } else if (subjectContext.subject_id) {
 setSelectedSubject(subjectContext.subject_id);
 } else if (subjectContext.master_subjects_id) {
 setSelectedSubject(subjectContext.master_subjects_id);
 } else {
 setSelectedSubject(subjectContext.id);
 }
 if (subjectContext.batches && subjectContext.batches.length > 0) {
 setSelectedBatch(subjectContext.batches[0]);
 }
 }

 // 3. Assignments
 const { data: assigns } = await supabase.from('assignments').select('id, title, total_marks, subject_id, batch').eq('faculty_id', userSession.db_id);
 if (assigns) {
 setAssignments(assigns);
 sessionStorage.setItem(`fac_marks_assignments_${userSession.db_id}`, JSON.stringify(assigns));
 }
 } catch (error) {
 console.error(error);
 }
 };

  // When subjectContext changes, auto-select it and its batches
  useEffect(() => {
  if (subjectContext) {
  const masterId = subjectContext.master_subjects?.id || subjectContext.subject_id || subjectContext.master_subjects_id || subjectContext.id;
  setSelectedSubject(masterId);
  
  // Find batch from subjects list (sourced from cohort_subjects -> academic_batches)
  const matchedSub = subjects.find(s => s.master_id === masterId || s.id === masterId);
  if (matchedSub && matchedSub.batch_name) {
  setAvailableBatches([matchedSub.batch_name]);
  setSelectedBatch(matchedSub.batch_name);
  } else {
  // Fallback: try schedule
  const subjSchedule = facultySchedule.filter(s => s.subject_id === masterId);
  const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
  setAvailableBatches(uniqueBatches);
  if (uniqueBatches.length > 0) setSelectedBatch(uniqueBatches[0]);
  }
  } else {
  setSelectedSubject("");
  setAvailableBatches([]);
  setSelectedBatch("");
  }
  }, [subjectContext, facultySchedule, subjects]);

 // When criteria changes, fetch students and existing marks
 useEffect(() => {
 if (selectedSubject && selectedBatch && selectedAssessmentType) {
 // If it's a generic assessment but maxMarksOverride isn't set, don't fetch yet
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
 // 1. Fetch Students in batch
 const { data: stds, error: sErr } = await supabase
 .from('profiles')
 .select('id, full_name, roll_number, erp_id')
 .eq('role', 'student')
 .eq('academic_batch', selectedBatch)
 .order('roll_number');
 
 if (sErr) throw sErr;
 setStudents(stds || []);

 // 2. Fetch Existing Marks
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

 // Map existing data to state
 const newMarksData = {};
 const newLedgerIds = {};
 marks?.forEach(m => {
 newMarksData[m.student_id] = m.marks_obtained;
 newLedgerIds[m.student_id] = m.id;
 });
 
 setMarksData(newMarksData);
 setExistingLedgerIds(newLedgerIds);

 } catch (error) {
 console.error(error);
 }
 };

 const handleMarkChange = (studentId, value) => {
 // Allow empty string for clearing
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

 const handleSaveMarks = async () => {
 if (!selectedSubject || !selectedBatch || !selectedAssessmentType) return;
 
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
 
 // If it's an assignment, link it
 if (!isGenericAssessment) {
 row.assignment_id = selectedAssessmentType;
 }
 
 // If we already have a ledger ID, include it for UPDATE
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
        
        // SYNC TO LEGACY student_marks TABLE FOR ADMIN EXAM LOCKING
        try {
            if (isGenericAssessment && ['Mid-Semester', 'End-Semester', 'Internal'].includes(selectedAssessmentType)) {
                const legacyPayload = upsertArray.map(row => ({
                    student_id: row.student_id,
                    faculty_id: userSession.db_id,
                    subject_name: activeSubjectObj?.subject?.name || 'Unknown Subject',
                    exam_type: row.assessment_type,
                    marks_obtained: row.marks_obtained,
                    max_marks: row.total_marks,
                    status: 'draft'
                }));
                
                for (const legRow of legacyPayload) {
                    const { data: exLeg } = await supabase.from('student_marks').select('id').eq('student_id', legRow.student_id).eq('subject_name', legRow.subject_name).eq('exam_type', legRow.exam_type);
                    if (exLeg && exLeg.length > 0) {
                        await supabase.from('student_marks').update(legRow).eq('id', exLeg[0].id);
                    } else {
                        await supabase.from('student_marks').insert(legRow);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to sync to legacy student_marks", e);
        }

 
 if (error) throw error;
 
 window.erpDialog?.alert("Marks saved successfully!");
 fetchStudentsAndMarks(); // Refresh to get real IDs back
 
 } catch (error) {
 console.error("Save Error:", error);
 window.erpDialog?.alert("Failed to save marks.");
 } finally {
 setIsSaving(false);
 }
 };

 // Calculate Stats
 const gradedCount = Object.keys(marksData).length;
 const totalMarksEntered = Object.values(marksData).reduce((a, b) => a + b, 0);
 const average = gradedCount > 0 ? (totalMarksEntered / gradedCount).toFixed(1) : 0;
 const highest = gradedCount > 0 ? Math.max(...Object.values(marksData)) : 0;

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full max-w-[1800px] mx-auto flex flex-col gap-8 pb-32 xl:pb-8' : 'flex flex-col gap-4'}`}>
 
 {/* HEADER */}
 {!subjectContext && (
 <PageHeader 
 icon="fa-solid fa-file-pen" 
 title="Marks Ledger" 
 subtitle="Bulk grading interface for assignments and internal assessments." 
 />
 )}

 {subjectContext && students.length > 0 && (
 <div className="flex justify-end">
 <button type="button" 
 onClick={handleSaveMarks}
 disabled={isSaving || gradedCount === 0}
 className="px-8 py-3.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
 >
 {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
 {isSaving ? 'Saving...' : 'Save Grades'}
 </button>
 </div>
 )}

 {/* FILTERS & STATS */}
 <div className={`flex flex-col ${!subjectContext ? 'lg:flex-row' : ''} gap-6 items-stretch`}>
 
 {/* Control Panel */}
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 flex-1 lg:max-w-2xl flex flex-col gap-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {!subjectContext && (
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Subject</label>
 <div className="relative"><select 
 className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedSubject}
 onChange={(e) => { setSelectedSubject(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Subject</option>
 {subjects.map(s => <option key={s.id} value={s.master_id || s.id}>{s.code} - {s.name}</option>)}
 </select><i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>
 </div>
 )}
 
 {!subjectContext && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
 <div className="relative"><select 
 className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedBatch}
 onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
 </select><i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>
 </div>
 )}
 </div>

 {selectedSubject && selectedBatch && (
 <div className="flex flex-col gap-2 animate-fade-in border-t border-themeBorder pt-4">
 <label className="text-[13px] font-medium text-themeTextSec flex items-center gap-2">
 Assessment Type <i className="fa-solid fa-arrow-turn-down text-[8px]"></i>
 </label>
 <div className="relative"><select 
 className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedAssessmentType}
 onChange={(e) => setSelectedAssessmentType(e.target.value)}
 >
 <option value="">Select Assessment...</option>
 <optgroup label="Generic Assessments">
 <option value="Internals">Internals</option>
 <option value="Mid-Term">Mid-Term Exams</option>
 <option value="Viva">Viva Voce</option>
 </optgroup>
 <optgroup label="Specific Assignments">
 {assignments.filter(a => a.subject_id === selectedSubject && a.batch === selectedBatch).map(a => (
 <option key={a.id} value={a.id}>{a.title} ({a.total_marks} Marks)</option>
 ))}
 </optgroup>
 </select><i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>
 </div>
 )}

 {isGenericAssessment && (
 <div className="flex flex-col gap-2 animate-fade-in border-t border-themeBorder pt-4">
 <label className="text-[13px] font-medium text-themeTextSec">Maximum Marks Base *</label>
 <input 
 type="number"
 min="1"
 placeholder="e.g. 25 for Internals"
 className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors"
 value={maxMarksOverride}
 onChange={(e) => setMaxMarksOverride(e.target.value)}
 />
 </div>
 )}
 </div>

 {/* Quick Stats Panel */}
 {students.length > 0 && maxMarks > 0 && (
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 flex-1 flex flex-col justify-center animate-slide-in-right relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/5 rounded-full blur-2xl"></div>
 
 <h3 className="text-[13px] font-medium text-themeTextSec mb-4">Grading Analytics</h3>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="flex flex-col">
 <span className="text-3xl font-semibold tracking-tight text-themeText">{gradedCount}<span className="text-sm text-themeTextSec font-bold">/{students.length}</span></span>
 <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Graded</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-semibold tracking-tight text-themeText">{maxMarks}</span>
 <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Max Base</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-semibold tracking-tight text-amber-500">{average}</span>
 <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Class Avg</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-semibold tracking-tight text-emerald-500">{highest}</span>
 <span className="text-[9px] font-bold text-themeTextSec tracking-normal mt-1">Highest</span>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* SPREADSHEET GRID */}
 {(!selectedSubject || !selectedBatch || !selectedAssessmentType || (isGenericAssessment && !maxMarksOverride)) && (
 <div className="flex flex-col gap-6 w-full animate-fade-in">
    <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
        <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
        <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
        <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Subject, Batch, and Assessment Type above to load the grading roster.</p>
    </div>

    {selectedSubject && assignments.filter(a => a.subject_id === selectedSubject).length > 0 && (
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-themeBorder rounded-[2rem] p-6 lg:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg shadow-inner border border-amber-500/20">
                    <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-themeText tracking-tight leading-tight">Quick Grade Assignments</h3>
                    <p className="text-[10px] font-bold text-themeTextSec mt-0.5 tracking-normal">Click an active assignment to auto-load the grading roster</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
        </div>
    )}
</div>
 )}

 {students.length > 0 && maxMarks > 0 && (
 <div className="bg-themePanel border border-themeBorder rounded-2xl overflow-hidden animate-fade-in">
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
 <span className="text-[14px] font-medium text-themeTextSec font-mono">{student.roll_number}</span>
 </td>
 <td className="px-6 py-3">
 <span className="text-sm font-bold text-themeText">{student.full_name}</span>
 </td>
 <td className="px-6 py-3 text-center">
 <span className="text-[10px] font-bold text-themeTextSec tracking-normal">{student.erp_id}</span>
 </td>
 <td className="px-6 py-3 text-right bg-themeAccent/5 group-hover:bg-themeAccent/10 transition-colors">
 <div className="flex items-center justify-end gap-2">
 <input 
 type="number"
 step="0.1"
 min="0"
 max={maxMarks}
 placeholder="—"
 className="w-20 bg-white/40 dark:bg-white/10 border border-themeBorder rounded-lg px-3 py-2 text-right text-[15px] font-semibold text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition"
 value={hasMark ? mark : ""}
 onChange={(e) => handleMarkChange(student.id, e.target.value)}
 />
 <span className="text-xs font-bold text-themeTextSec">/ {maxMarks}</span>
 </div>
 </td>
 <td className="px-6 py-3 text-right">
 <span className={`text-[15px] font-semibold ${
 hasMark 
 ? Number(percentage) >= 75 ? 'text-emerald-500' 
 : Number(percentage) >= 50 ? 'text-amber-500' 
 : 'text-rose-500'
 : 'text-themeTextSec opacity-50'
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
 )}
 </div>
 </div>
 );
}

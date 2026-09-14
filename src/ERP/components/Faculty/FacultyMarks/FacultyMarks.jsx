/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

export default function FacultyMarks({ subjectContext }, isEmbedded = false) {
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
 const { data: subs } = await supabase.from('subjects').select('id, name, code').eq('faculty_id', userSession.db_id);
 if (subs) {
 setSubjects(subs);
 sessionStorage.setItem(`fac_marks_subjects_${userSession.db_id}`, JSON.stringify(subs));
 }

 // 2. Batches (from class_schedule)
 const { data: schedule } = await supabase.from('class_schedule').select('subject_id, batch').in('subject_id', (subs || []).map(s => s.id));
 if (schedule) {
 setFacultySchedule(schedule);
 sessionStorage.setItem(`fac_marks_schedule_${userSession.db_id}`, JSON.stringify(schedule));
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
 setSelectedSubject(subjectContext.id);
 const subjSchedule = facultySchedule.filter(s => s.subject_id === subjectContext.id);
 const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
 setAvailableBatches(uniqueBatches);
 if (uniqueBatches.length === 1) setSelectedBatch(uniqueBatches[0]);
 else if (!uniqueBatches.includes(selectedBatch)) setSelectedBatch("");
 } else {
 setSelectedSubject("");
 setAvailableBatches([]);
 setSelectedBatch("");
 }
 }, [subjectContext, facultySchedule]);

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

 const { error } = await supabase.from('marks_ledger').upsert(upsertArray, { onConflict: 'student_id,subject_id,assessment_type' });
        
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
                await supabase.from('student_marks').upsert(legacyPayload, { onConflict: 'student_id, subject_name, exam_type' });
            }
        } catch(e) {
            console.error("Failed to sync to legacy student_marks", e);
        }

 
 if (error) throw error;
 
 window.erpDialog?.alert("Marks saved successfully!");
 fetchStudentsAndMarks(); // Refresh to get real IDs back
 
 } catch(error) {
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
 <div className={`${!subjectContext ? 'w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12' : 'flex flex-col gap-4'}`}>
 
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
 <button 
 onClick={handleSaveMarks}
 disabled={isSaving || gradedCount === 0}
 className="px-8 py-3.5 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
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
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Subject</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedSubject}
 onChange={(e) => { setSelectedSubject(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Subject</option>
 {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
 </select>
 </div>
 )}
 
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Target Batch</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedBatch}
 onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
 </select>
 </div>
 </div>

 {selectedSubject && selectedBatch && (
 <div className="flex flex-col gap-2 animate-fade-in border-t border-themeBorder pt-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
 Assessment Type <i className="fa-solid fa-arrow-turn-down text-[8px]"></i>
 </label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeAccent outline-none focus:border-themeAccent transition-colors appearance-none"
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
 </select>
 </div>
 )}

 {isGenericAssessment && (
 <div className="flex flex-col gap-2 animate-fade-in border-t border-themeBorder pt-4">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Maximum Marks Base *</label>
 <input 
 type="number"
 min="1"
 placeholder="e.g. 25 for Internals"
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors"
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
 
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-4">Grading Analytics</h3>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="flex flex-col">
 <span className="text-3xl font-black text-themeText">{gradedCount}<span className="text-sm text-themeTextSec font-bold">/{students.length}</span></span>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Graded</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-black text-themeText">{maxMarks}</span>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Max Base</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-black text-amber-500">{average}</span>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Class Avg</span>
 </div>
 <div className="flex flex-col border-l border-themeBorder pl-4">
 <span className="text-3xl font-black text-emerald-500">{highest}</span>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Highest</span>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* SPREADSHEET GRID */}
 {(!selectedSubject || !selectedBatch || !selectedAssessmentType || (isGenericAssessment && !maxMarksOverride)) && (
 <div className="py-24 text-center border-2 border-dashed border-themeBorder rounded-2xl bg-themePanel/30 px-4">
 <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Subject, Batch, and Assessment Type above to load the grading roster.</p>
 </div>
 )}

 {students.length > 0 && maxMarks > 0 && (
 <div className="bg-themePanel border border-themeBorder rounded-2xl overflow-hidden animate-fade-in">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-themeElevated/50 border-b border-themeBorder">
 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec w-24">Roll No</th>
 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Student Name</th>
 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec w-32 text-center">ERP ID</th>
 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-themeAccent w-48 text-right bg-themeAccent/5">Marks Obtained</th>
 <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec w-32 text-right">Percentage</th>
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
 <span className="text-xs font-black text-themeTextSec font-mono">{student.roll_number}</span>
 </td>
 <td className="px-6 py-3">
 <span className="text-sm font-bold text-themeText">{student.full_name}</span>
 </td>
 <td className="px-6 py-3 text-center">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{student.erp_id}</span>
 </td>
 <td className="px-6 py-3 text-right bg-themeAccent/5 group-hover:bg-themeAccent/10 transition-colors">
 <div className="flex items-center justify-end gap-2">
 <input 
 type="number"
 step="0.1"
 min="0"
 max={maxMarks}
 placeholder="—"
 className="w-20 bg-themeApp border border-themeBorder rounded-lg px-3 py-2 text-right text-sm font-black text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition"
 value={hasMark ? mark : ""}
 onChange={(e) => handleMarkChange(student.id, e.target.value)}
 />
 <span className="text-xs font-bold text-themeTextSec">/ {maxMarks}</span>
 </div>
 </td>
 <td className="px-6 py-3 text-right">
 <span className={`text-sm font-black ${
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

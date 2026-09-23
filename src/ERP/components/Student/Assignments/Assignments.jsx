/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";

// --- CACHE HELPERS ---
const CACHE_PENDING = 'asgn_v2_pending';
const CACHE_COMPLETED = 'asgn_v2_completed';
const readCache = (key, fallback) => {
 try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
 catch { return fallback; }
};
const writeCache = (key, data) => {
 try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export default function Assignments({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- STATE (instant from cache) ---
 const [view, setView] = useState("pending");
 const [pendingAssignments, setPendingAssignments] = useState(() => readCache(CACHE_PENDING, []));
 const [completedAssignments, setCompletedAssignments] = useState(() => readCache(CACHE_COMPLETED, []));

 // --- MODAL STATE ---
 const [selectedTask, setSelectedTask] = useState(null);
 const [submissionUrl, setSubmissionUrl] = useState("");
 const [submissionText, setSubmissionText] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitSuccess, setSubmitSuccess] = useState(false);
 const [submitError, setSubmitError] = useState("");

 // --- BACKGROUND FETCH (no loading gate) ---
 const fetchAssignments = useCallback(async () => {
 if (!userSession) return;
 try {
 const studentId = userSession.db_id || userSession.id;
 const batchName = userSession.academic_batch || 'BATCH-2026';
 
 const { data: batchData } = await supabase.from('academic_batches').select('id').eq('name', batchName).single();
 const actualBatchId = batchData?.id;

 let assignQuery = supabase
 .from('assignments')
 .select('*, profiles!faculty_id(full_name)')
 .order('due_date', { ascending: true });
 
 if (actualBatchId) {
 assignQuery = assignQuery.eq('batch_id', actualBatchId);
 } else {
 assignQuery = assignQuery.eq('batch', batchName);
 }

 // Parallel fetch: assignments + submissions
 const [assignRes, subRes] = await Promise.all([
 assignQuery,
 supabase
 .from('assignment_submissions')
 .select('*')
 .eq('student_id', studentId)
 ]);

 if (assignRes.error) throw assignRes.error;
 if (subRes.error) throw subRes.error;

 const assignments = assignRes.data || [];
 const submissions = subRes.data || [];
 const submittedIds = submissions.map(s => s.assignment_id);

 const pending = assignments.filter(a => !submittedIds.includes(a.id));
 const completed = submissions.map(sub => {
 const detail = assignments.find(a => a.id === sub.assignment_id);
 return { ...sub, assignment: detail };
 }).filter(s => s.assignment);

 setPendingAssignments(pending);
 setCompletedAssignments(completed);
 writeCache(CACHE_PENDING, pending);
 writeCache(CACHE_COMPLETED, completed);
 } catch (err) {
 console.error("Assignments fetch:", err.message);
 }
 }, [userSession]);

 useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

 // --- MODAL CONTROLS ---
 const openModal = (task) => {
 setSelectedTask(task);
 setSubmissionUrl("");
 setSubmissionText("");
 setSubmitSuccess(false);
 setSubmitError("");
 };
 const closeModal = () => {
 setSelectedTask(null);
 setSubmissionUrl("");
 setSubmissionText("");
 setSubmitSuccess(false);
 setSubmitError("");
 };

 // --- SUBMISSION ENGINE ---
 const handleSubmission = async (e) => {
 e.preventDefault();
 if (!submissionText.trim() || !selectedTask) return;
 
 const currentWords = submissionText.trim().split(/\s+/).filter(Boolean).length;
 if(selectedTask.word_limit && currentWords > selectedTask.word_limit) {
 setSubmitError(`Word limit exceeded! You wrote ${currentWords} words, but the limit is ${selectedTask.word_limit}.`);
 return;
 }

 setIsSubmitting(true);
 setSubmitError("");

 try {
 const studentId = userSession.db_id || userSession.id;
 const { error } = await supabase
 .from('assignment_submissions')
 .insert({
 assignment_id: selectedTask.id,
 student_id: studentId,
 submission_text: submissionText,
 status: 'Pending Review'
 });
 if (error) throw error;

 setSubmitSuccess(true);
 fetchAssignments();
 setTimeout(() => closeModal(), 50);
 } catch (err) {
 console.error("Submission failed:", err);
 setSubmitError("Submission failed. Please try again.");
 } finally {
 setIsSubmitting(false);
 }
 };

 // --- HELPERS ---
 const getTimeLeft = (dueDate) => {
 const diff = new Date(dueDate).getTime() - Date.now();
 if (diff <= 0) return { label: "Overdue", urgent: true };
 const days = Math.floor(diff / 86400000);
 const hours = Math.floor((diff % 86400000) / 3600000);
 if (days > 3) return { label: `${days}d left`, urgent: false };
 if (days > 0) return { label: `${days}d ${hours}h left`, urgent: true };
 return { label: `${hours}h left`, urgent: true };
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case 'Graded': return { color: 'text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent bg-emerald-500/10 border-emerald-500/20', icon: 'fa-check-double', label: 'Graded' };
 case 'Pending Review': return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: 'fa-clock', label: 'Awaiting Grade' };
 default: return { color: 'text-themeTextSec bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/10 dark:border-white/20', icon: 'fa-hourglass-half', label: status || 'Processing' };
 }
 };

 const wordCount = submissionText.trim() ? submissionText.trim().split(/\s+/).filter(Boolean).length : 0;
 const isOverLimit = selectedTask && selectedTask.word_limit && wordCount > selectedTask.word_limit;

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>

 {/* ═══════════════ HEADER ═══════════════ */}
 <PageHeader 
 icon="fa-solid fa-file-signature" 
 title="Assignment Portal" 
 subtitle="Draft your coursework and submit securely to faculty." 
 isEmbedded={isEmbedded}
 rightContent={
 <div className="flex p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
 <button type="button"
 onClick={() => setView("pending")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === "pending"
 ? "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent border border-black/5 dark:border-white/10"
 : "text-themeTextSec opacity-80 hover:text-themeText"
 }`}
 >
 <span className={`w-2 h-2 rounded-full ${view === "pending" && pendingAssignments.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-neutral-600'}`}></span>
 Pending ({pendingAssignments.length})
 </button>
 <button type="button"
 onClick={() => setView("completed")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === "completed"
 ? "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent border border-black/5 dark:border-white/10"
 : "text-themeTextSec opacity-80 hover:text-themeText"
 }`}
 >
 <i className="fa-solid fa-check-double text-[10px]"></i>
 Completed ({completedAssignments.length})
 </button>
 </div>
 }
 />

 {/* ═══════════════ PENDING VIEW ═══════════════ */}
 {view === "pending" && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
 {pendingAssignments.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-mug-hot text-5xl text-neutral-700 mb-6"></i>
 <h3 className={`${theme.text.heading} text-2xl text-themeText tracking-tight`}>You're all caught up!</h3>
 <p className={`${theme.text.secondary} text-sm mt-2 max-w-sm`}>There are no pending assignments active for {userSession?.academic_batch || 'your batch'}.</p>
 </div>
 ) : (
 pendingAssignments.map((task) => {
 const timeLeft = getTimeLeft(task.due_date);

 return (
 <div key={task.id} className={`${theme.layout.panel} border border-black/10 dark:border-white/20 rounded-[2rem] hover:border-black/5 dark:border-white/10 transition duration-300 overflow-hidden flex flex-col relative group`}>
 {timeLeft.urgent && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>}

 <div className="p-5 lg:p-6 flex-1 flex flex-col">
 <div className="flex items-center justify-between gap-3 mb-3">
 <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.master_subjects?.name || task.subject_name || 'Subject'}</span>
 <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 border-theme ${timeLeft.urgent
 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
 : 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeTextSec border-black/10 dark:border-white/20'
 }`}>
 <i className={`fa-solid ${timeLeft.urgent ? 'fa-fire' : 'fa-clock'} mr-1`}></i> {timeLeft.label}
 </span>
 </div>

 <h3 className="text-lg font-semibold tracking-tight text-themeText tracking-tight leading-tight group-hover:text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent transition-colors mb-2 line-clamp-2">
 {task.title}
 </h3>

 {task.description && (
 <p className="text-xs text-themeTextSec opacity-80 leading-relaxed mb-4 line-clamp-2">{task.description}</p>
 )}

 <div className="mt-auto flex flex-wrap items-center gap-3 text-[9px] font-bold text-themeTextSec tracking-normal">
 <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-2 py-1 border border-black/10 dark:border-white/20 rounded">
 <i className="fa-solid fa-align-left text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent/50"></i> {task.word_limit ? `${task.word_limit} Words` : 'No Limit'}
 </span>
 <span className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-2 py-1 border border-black/10 dark:border-white/20 rounded">
 <i className="fa-solid fa-award text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent/50"></i> {task.max_marks || 100} Marks
 </span>
 </div>
 </div>

 <div className="p-4 border-t-theme border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 <button type="button"
 onClick={() => openModal(task)}
 className="w-full bg-indigo-600 hover:bg-indigo-500 text-themeText dark:text-white font-black tracking-normal text-[10px] py-3.5 rounded-lg transition active:scale-[0.98]"
 >
 <i className="fa-solid fa-pen-nib mr-2"></i> Start Writing
 </button>
 </div>
 </div>
 );
 })
 )}
 </div>
 )}

 {/* ═══════════════ COMPLETED VIEW ═══════════════ */}
 {view === "completed" && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
 {completedAssignments.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-file-circle-check text-5xl text-neutral-700 mb-6"></i>
 <h3 className={`${theme.text.heading} text-2xl text-themeText tracking-tight`}>No submissions yet</h3>
 <p className={`${theme.text.secondary} text-sm mt-2`}>Your completed assignments will appear here.</p>
 </div>
 ) : (
 completedAssignments.map((sub) => {
 const task = sub.assignment;
 const badge = getStatusBadge(sub.status);
 const maxM = task.max_marks || 100;

 return (
 <div key={sub.id} className={`${theme.layout.panel} border border-black/10 dark:border-white/20 rounded-[2rem] flex flex-col relative`}>
 <div className="p-5 lg:p-6 flex-1 flex flex-col">
 <div className="flex items-center justify-between gap-3 mb-3">
 <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent tracking-normal truncate">{task.master_subjects?.name || task.subject_name || 'Subject'}</span>
 <span className={`px-2 py-1 rounded-md text-[11px] font-medium shrink-0 border-theme ${badge.color}`}>
 <i className={`fa-solid ${badge.icon} mr-1`}></i> {badge.label}
 </span>
 </div>

 <h3 className="text-lg font-semibold tracking-tight text-themeText tracking-tight leading-tight mb-2">
 {task.title}
 </h3>

 {task.description && (
 <p className="text-xs text-themeTextSec opacity-80 leading-relaxed mb-4 line-clamp-2">{task.description}</p>
 )}

 {sub.submission_text && (
 <div className="mt-2 mb-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
 <p className="text-[10px] uppercase tracking-widest font-black text-themeTextSec mb-2"><i className="fa-solid fa-file-lines mr-1.5 text-indigo-500"></i> Your Submission</p>
 <p className="text-xs text-themeText leading-relaxed line-clamp-3 font-serif italic">"{sub.submission_text}"</p>
 </div>
 )}

 {sub.file_url && (
 <div className="mt-2 mb-4">
 <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] uppercase font-black tracking-widest hover:bg-indigo-500/20 transition-colors">
 <i className="fa-solid fa-paperclip"></i> Attached File
 </a>
 </div>
 )}

 {sub.status === 'Graded' && (
 <div className="mt-2 mb-4 bg-emerald-500/5 border-theme border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
 <div>
 <p className="text-[12px] font-medium text-emerald-500/70 mb-1">Marks Awarded</p>
 <p className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent">{sub.marks_awarded} <span className="text-sm text-themeTextSec">/ {maxM}</span></p>
 </div>
 {sub.remarks && (
 <div className="text-right max-w-[50%]">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Faculty Remarks</p>
 <p className="text-xs text-themeText font-serif italic line-clamp-2">"{sub.remarks}"</p>
 </div>
 )}
 </div>
 )}

 <div className="mt-auto flex flex-wrap items-center gap-3 text-[9px] font-bold text-themeTextSec tracking-normal">
 <span className="flex items-center gap-1.5">
 <i className="fa-solid fa-clock-rotate-left"></i> Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB')}
 </span>
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 )}

 {/* ═══════════════ SUBMISSION MODAL ═══════════════ */}
 {selectedTask && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] w-full max-w-3xl rounded-xl flex flex-col max-h-[90vh]">
 
 {/* Modal Header */}
 <div className="p-5 border-b-theme border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 flex items-start justify-between gap-4 rounded-t-xl">
 <div>
 <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent tracking-normal mb-1 block">{selectedTask.master_subjects?.name || selectedTask.subject_name || 'Subject'}</span>
 <h3 className="text-xl font-semibold tracking-tight text-themeText tracking-tight">{selectedTask.title}</h3>
 </div>
 <button type="button" onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-themeTextSec hover:text-themeText dark:text-white transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>

 {/* Modal Body */}
 <div className="flex-1 overflow-y-auto p-6 bg-transparent">
 {submitSuccess ? (
 <div className="py-20 flex flex-col items-center justify-center text-center animate-scale-in">
 <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent rounded-full flex items-center justify-center text-4xl mb-4 border border-emerald-500/20">
 <i className="fa-solid fa-check-double"></i>
 </div>
 <h2 className="text-2xl font-semibold tracking-tight text-themeText tracking-tight mb-2">Submission Successful</h2>
 <p className="text-themeTextSec text-sm font-medium">Your work has been securely sent to the faculty.</p>
 </div>
 ) : (
 <form onSubmit={handleSubmission} className="flex flex-col gap-5">
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-lg border border-black/10 dark:border-white/20 text-sm text-themeTextSec leading-relaxed">
 {selectedTask.description}
 </div>

 {submitError && (
 <div className="bg-rose-500/10 border-l-4 border-rose-500 p-3 text-rose-400 text-xs font-bold">
 {submitError}
 </div>
 )}

 <div className="flex flex-col">
 <div className="flex justify-between items-end mb-2">
 <label className="text-[13px] font-medium text-themeText">Write your submission</label>
 <span className={`text-[13px] font-medium px-2 py-1 rounded ${isOverLimit ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-transparent border border-black/10 dark:border-white/20'}`}>
 {wordCount} / {selectedTask.word_limit || '∞'} Words
 </span>
 </div>
 <textarea
 value={submissionText}
 onChange={(e) => setSubmissionText(e.target.value)}
 placeholder="Begin typing your assignment here..."
 className={`w-full h-64 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-theme ${isOverLimit ? 'border-rose-500 focus:border-rose-400' : 'border-black/5 dark:border-white/10 focus:border-indigo-400'} rounded-lg p-4 text-sm text-themeText outline-none resize-none transition-colors font-serif`}
 required
 ></textarea>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t-theme border-black/10 dark:border-white/20">
 <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg text-xs font-bold text-themeTextSec hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 transition-colors">
 Cancel
 </button>
 <button 
 type="submit" 
 disabled={isSubmitting || isOverLimit || !submissionText.trim()}
 className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-themeTextSec text-themeText dark:text-white font-black tracking-normal text-[10px] px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2"
 >
 {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Submit Final</>}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
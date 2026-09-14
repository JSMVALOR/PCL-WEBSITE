/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

export default function FacultyAssignments({ subjectContext }, isEmbedded = false) {
 const { userSession } = useERP();
 const [assignments, setAssignments] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assignments_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [subjects, setSubjects] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assign_subjects_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });

 // Form State
 const [showForm, setShowForm] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 subject_id: "",
 batch: "",
 title: "",
 description: "",
 total_marks: 100,
 due_date: ""
 });

 // Batches logic
 const [facultySchedule, setFacultySchedule] = useState(() => {
 const cached = sessionStorage.getItem(`fac_assign_schedule_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [availableBatches, setAvailableBatches] = useState([]);

 useEffect(() => {
 fetchInitialData();
 }, [userSession]);

 // When subject changes, filter batches and auto-select if only one
 useEffect(() => {
 if (!formData.subject_id) {
 setAvailableBatches([]);
 setFormData(prev => ({ ...prev, batch: "" }));
 return;
 }
 
 const subjSchedule = facultySchedule.filter(s => s.subject_id === formData.subject_id);
 const uniqueBatches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
 setAvailableBatches(uniqueBatches);
 
 // Auto-select if only 1 batch is mapped to this subject
 if (uniqueBatches.length === 1) {
 setFormData(prev => ({ ...prev, batch: uniqueBatches[0] }));
 } else if (!uniqueBatches.includes(formData.batch)) {
 setFormData(prev => ({ ...prev, batch: "" }));
 }
 }, [formData.subject_id, facultySchedule]);

 const fetchInitialData = async () => {
 if (!userSession?.db_id) return;
 try {
 // 1. Fetch Subjects assigned to this faculty
 const { data: subs, error: subErr } = await supabase
 .from('subjects')
 .select('id, name, code')
 .eq('faculty_id', userSession.db_id);
 
 if (subErr) throw subErr;
 if (subs) {
 setSubjects(subs);
 sessionStorage.setItem(`fac_assign_subjects_${userSession.db_id}`, JSON.stringify(subs));
 }

 // 2. Batches taught by this faculty (from class_schedule)
 const { data: schedule, error: schErr } = await supabase
 .from('class_schedule')
 .select('subject_id, batch')
 .in('subject_id', (subs || []).map(s => s.id));
 
 if (schErr) throw schErr;
 if (schedule) {
 setFacultySchedule(schedule);
 sessionStorage.setItem(`fac_assign_schedule_${userSession.db_id}`, JSON.stringify(schedule));
 }

 // 3. Fetch all assignments created by this faculty
 const { data: assigns, error: assErr } = await supabase
 .from('assignments')
 .select('*, subject:subject_id(name, code)')
 .eq('faculty_id', userSession.db_id)
 .order('created_at', { ascending: false });
 
 if (assErr) throw assErr;
 if (assigns) {
 setAssignments(assigns);
 sessionStorage.setItem(`fac_assignments_${userSession.db_id}`, JSON.stringify(assigns));
 }

 } catch (error) {
 console.error("Error fetching assignment data:", error);
 }
 };

 const handlePublish = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const finalSubjectId = subjectContext ? subjectContext.id : formData.subject_id;
 
 const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: formData.batch,
 title: formData.title,
 description: formData.description,
 total_marks: Number(formData.total_marks),
 due_date: formData.due_date,
 status: 'active'
 });

 if (error) throw error;
 
 setShowForm(false);
 setFormData({
 subject_id: "",
 batch: "",
 title: "",
 description: "",
 total_marks: 100,
 due_date: ""
 });
 fetchInitialData();
 
 } catch (error) {
 console.error("Error creating assignment:", error);
 window.erpDialog?.alert("Failed to create assignment.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id) => {
 if(!window.confirm("Are you sure you want to delete this assignment?")) return;
 try {
 await supabase.from('assignments').delete().eq('id', id);
 setAssignments(prev => prev.filter(a => a.id !== id));
 } catch(error) {
 console.error("Error deleting:", error);
 }
 };

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12' : 'flex flex-col gap-4'}`}>
 
 {/* HEADER */}
 {!subjectContext && (
 <PageHeader 
 icon="fa-solid fa-file-signature"
 title="Assignment Engine"
 subtitle="Publish assignments, set deadlines, and manage submissions across batches."
 rightContent={
 <button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={`px-6 py-3.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 ${
 showForm ? 'bg-neutral-600 hover:bg-neutral-700' : 'bg-themeAccent hover:bg-themeAccent/90'
 }`}
 >
 <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-sm`}></i> 
 {showForm ? 'Cancel' : 'New Assignment'}
 </button>
 }
 />
 )}
 
 {subjectContext && (
 <button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={`px-6 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98] flex items-center justify-center gap-2 ${
 showForm ? 'bg-neutral-600' : 'bg-themeAccent'
 }`}
 >
 <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-sm`}></i> 
 {showForm ? 'Cancel' : 'New Assignment'}
 </button>
 )}

 {/* CREATE FORM */}
 {showForm && (
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-lg">
 <i className="fa-solid fa-file-signature"></i>
 </div>
 <div>
 <h2 className="text-xl font-black text-themeText">Issue New Assignment</h2>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">Offline Submission Tracker</p>
 </div>
 </div>

 <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {!subjectContext && (
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Subject *</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={formData.subject_id}
 onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
 required
 >
 <option value="">Select Subject</option>
 {subjects.map(s => (
 <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
 ))}
 </select>
 </div>
 )}

 {/* Batch */}
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Target Batch *</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={formData.batch}
 onChange={(e) => setFormData({...formData, batch: e.target.value})}
 required
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => (
 <option key={b} value={b}>{b}</option>
 ))}
 </select>
 </div>

 {/* Title */}
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Assignment Title *</label>
 <input 
 type="text"
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors"
 placeholder="e.g., Constitutional Law Research Paper"
 value={formData.title}
 onChange={(e) => setFormData({...formData, title: e.target.value})}
 required
 />
 </div>

 {/* Description */}
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Instructions / Description</label>
 <textarea 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors resize-none h-24"
 placeholder="Optional instructions for the batch..."
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 />
 </div>

 {/* Total Marks */}
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Max Marks *</label>
 <input 
 type="number"
 min="1"
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors"
 value={formData.total_marks}
 onChange={(e) => setFormData({...formData, total_marks: e.target.value})}
 required
 />
 </div>

 {/* Due Date */}
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Offline Due Date *</label>
 <input 
 type="datetime-local"
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors [color-scheme:dark]"
 value={formData.due_date}
 onChange={(e) => setFormData({...formData, due_date: e.target.value})}
 required
 />
 </div>

 <div className="md:col-span-2 pt-4">
 <button 
 type="submit"
 disabled={isSubmitting}
 className="btn-erp"
 >
 {isSubmitting ? 'Issuing...' : 'Issue Assignment'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* ASSIGNMENTS LIST */}
 <div className="flex flex-col gap-4">
 <h2 className="text-xl font-black text-themeText tracking-tight">Active Assignments</h2>
 
 {assignments.filter(a => subjectContext ? a.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-themeBorder rounded-2xl bg-themePanel/30 px-4">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Assignments Issued</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">You haven't created any offline assignments yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {assignments.filter(a => subjectContext ? a.subject_id === subjectContext.id : true).map(assign => {
 const dueDate = new Date(assign.due_date);
 const isPastDue = dueDate < new Date();
 
 return (
 <div key={assign.id} className="bg-themePanel border border-themeBorder rounded-2xl p-5 hover:border-themeAccent/50 transition flex flex-col gap-4 group">
 
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isPastDue ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
 {isPastDue ? 'Past Due' : 'Active'}
 </span>
 <span className="bg-themeElevated px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">
 {assign.batch}
 </span>
 </div>
 <h3 className="text-lg font-black text-themeText leading-tight">{assign.title}</h3>
 <p className="text-[11px] font-bold text-themeTextSec mt-1">{assign.subject?.code} - {assign.subject?.name}</p>
 </div>
 
 <button type="button" 
 onClick={() => handleDelete(assign.id)}
 className="w-8 h-8 rounded-full bg-themeElevated border border-themeBorder flex items-center justify-center text-themeTextSec hover:text-rose-500 hover:border-rose-500/50 transition opacity-0 group-hover:opacity-100"
 title="Delete Assignment"
 >
 <i className="fa-solid fa-trash text-xs"></i>
 </button>
 </div>
 
 {assign.description && (
 <p className="text-xs text-themeTextSec line-clamp-2 leading-relaxed bg-themeElevated/50 p-3 rounded-xl border border-themeBorder/50">
 {assign.description}
 </p>
 )}
 
 <div className="flex items-center justify-between mt-auto pt-2 border-t border-themeBorder/50">
 <div className="flex items-center gap-2 text-themeTextSec">
 <i className="fa-regular fa-calendar text-sm"></i>
 <span className="text-[10px] font-black uppercase tracking-widest">
 Due {dueDate.toLocaleDateString()}
 </span>
 </div>
 <div className="flex items-center gap-2 text-themeText">
 <i className="fa-solid fa-star text-amber-500 text-sm"></i>
 <span className="text-xs font-black">{assign.total_marks} Marks</span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
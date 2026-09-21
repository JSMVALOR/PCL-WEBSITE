/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../lib/EmailService';
import { useERP } from "../../../context/ErpContext";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';




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

export default function FacultyAssignments({ subjectContext }) {
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
 const tColor = THEME_COLORS.amber; // Enforce premium amber aesthetic
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
 const { data: cohortSubs, error: subErr } = await supabase
 .from('cohort_subjects')
 .select('id, master_subjects(id, name, code)')
 .eq('faculty_id', userSession.db_id);
 
 const subs = (cohortSubs || []).map(cs => cs.master_subjects).filter(Boolean);
 // Remove duplicates
 const uniqueSubs = [];
 const seen = new Set();
 subs.forEach(s => {
     if (!seen.has(s.id)) {
         seen.add(s.id);
         uniqueSubs.push(s);
     }
 });
 
 if (subErr) throw subErr;
 if (uniqueSubs.length > 0) {
        setSubjects(uniqueSubs);
        sessionStorage.setItem(`fac_assign_subjects_${userSession.db_id}`, JSON.stringify(uniqueSubs));
    }

 // 2. Batches taught by this faculty (from class_schedule)
 const { data: schedule, error: schErr } = await supabase
 .from('class_schedule')
 .select('subject_id, batch')
 .in('subject_id', (uniqueSubs || []).map(s => s.id));
 
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
 let finalSubjectId = formData.subject_id;
    if (subjectContext) {
        if (subjectContext.master_subjects && typeof subjectContext.master_subjects === 'object' && subjectContext.master_subjects.id) {
            finalSubjectId = subjectContext.master_subjects.id;
        } else if (subjectContext.subject_id) {
            finalSubjectId = subjectContext.subject_id;
        } else if (subjectContext.master_subjects_id) {
            finalSubjectId = subjectContext.master_subjects_id;
        } else {
            finalSubjectId = subjectContext.id;
        }
    }
 const finalBatch = subjectContext ? (subjectContext.batches?.[0] || subjectContext.batch || "") : formData.batch;
 
 const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: finalBatch,
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
 window.erpDialog?.alert("Failed to create assignment: " + (error?.message || error?.details || JSON.stringify(error)));
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id) => {
 const confirmed = await window.erpDialog?.confirm("Are you sure you want to delete this assignment?");
 if (!confirmed) return;
 try {
 await supabase.from('assignments').delete().eq('id', id);
 setAssignments(prev => prev.filter(a => a.id !== id));
 } catch (error) {
 console.error("Error deleting:", error);
 window.erpDialog?.alert("Failed to delete assignment: " + (error?.message || error?.details || JSON.stringify(error)));
 }
 };

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full max-w-[1800px] mx-auto flex flex-col gap-8 pb-32 xl:pb-8' : 'flex flex-col gap-4'}`}>
 
 {/* HEADER */}
 {!subjectContext && (
 <PageHeader 
 icon="fa-solid fa-file-signature"
 title="Assignment Engine"
 subtitle="Publish assignments, set deadlines, and manage submissions across batches."
 rightContent={
 <button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={`px-6 py-3.5 rounded-xl text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 ${
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
 className={`px-6 py-3 w-fit rounded-xl text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 ${showForm ? "bg-neutral-600" : ""}`} style={{ backgroundColor: !showForm ? tColor.primary : undefined }}
 >
 <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-sm`}></i> 
 {showForm ? 'Cancel' : 'New Assignment'}
 </button>
 )}

 {/* CREATE FORM */}
 {showForm && (
 <div className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: tColor.bg, color: tColor.primary }}>
 <i className="fa-solid fa-file-signature"></i>
 </div>
 <div>
 <h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-white">Issue New Assignment</h2>
 <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 tracking-normal mt-0.5">Offline Submission Tracker</p>
 </div>
 </div>

 <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {!subjectContext && (
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Subject *</label>
 <select 
 className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors appearance-none"
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

 {!subjectContext && (
    <div className="flex flex-col gap-2">
        <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Target Batch *</label>
        <select 
            className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors appearance-none"
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
 )}

 {/* Title */}
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Assignment Title *</label>
 <input 
 type="text"
 className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
 placeholder="e.g., Constitutional Law Research Paper"
 value={formData.title}
 onChange={(e) => setFormData({...formData, title: e.target.value})}
 required
 />
 </div>

 {/* Description */}
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Instructions / Description</label>
 <textarea 
 className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors resize-none h-24"
 placeholder="Optional instructions for the batch..."
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 />
 </div>

 {/* Total Marks */}
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Max Marks *</label>
 <input 
 type="number"
 min="1"
 className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
 value={formData.total_marks}
 onChange={(e) => setFormData({...formData, total_marks: e.target.value})}
 required
 />
 </div>

 {/* Due Date */}
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Offline Due Date *</label>
 <input 
 type="date"
    className="bg-black/5 dark:bg-themePanel backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white outline-none focus:ring-0 focus:border-amber-500 dark:focus:border-amber-500 transition-colors [color-scheme:dark] cursor-pointer"
    onClick={(e) => e.target.showPicker && e.target.showPicker()}
    onKeyDown={(e) => e.preventDefault()}
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
 <h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight">Active Assignments</h2>
 
 {assignments.filter(a => subjectContext ? a.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="w-full py-16 flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 shadow-sm">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText dark:text-white font-black">No Assignments Issued</h3>
 <p className="text-xs lg:text-sm text-themeTextSec dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">You haven't created any offline assignments yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {assignments.filter(a => subjectContext ? a.subject_id === subjectContext.id : true).map(assign => {
 const dueDate = new Date(assign.due_date);
 const isPastDue = dueDate < new Date();
 
 return (
 <div key={assign.id} className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-5 hover:border-black/10 dark:hover:border-white/10 transition flex flex-col gap-4 group">
 
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-2 py-0.5 rounded text-[12px] font-medium ${isPastDue ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
 {isPastDue ? 'Past Due' : 'Active'}
 </span>
 <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-themeTextSec dark:text-white/50">
 {assign.batch}
 </span>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText dark:text-white leading-tight">{assign.title}</h3>
 <p className="text-[11px] font-bold text-themeTextSec dark:text-white/50 mt-1">{assign.subject?.code} - {assign.subject?.name}</p>
 </div>
 
 <HoldButton size="sm" onHold={() => handleDelete(assign.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
 </div>
 
 {assign.description && (
 <p className="text-xs text-themeTextSec dark:text-white/50 line-clamp-2 leading-relaxed bg-black/5 dark:bg-white/5 backdrop-blur-xl/50 p-3 rounded-xl border border-black/5 dark:border-white/5/50">
 {assign.description}
 </p>
 )}
 
 <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5 dark:border-white/5/50">
 <div className="flex items-center gap-2 text-themeTextSec dark:text-white/50">
 <i className="fa-regular fa-calendar text-sm"></i>
 <span className="text-[13px] font-medium">
 Due {dueDate.toLocaleDateString()}
 </span>
 </div>
 <div className="flex items-center gap-2 text-themeText dark:text-white">
 <i className="fa-solid fa-star text-amber-500 text-sm"></i>
 <span className="text-[14px] font-medium">{assign.total_marks} Marks</span>
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
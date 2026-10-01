/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { notifyBatchWhatsApp } from '../../../../Shared/utils/whatsappIntegration';

export default function AutoGenerator({}) {
 const [isGenerating, setIsGenerating] = useState(false);
 const [progress, setProgress] = useState('');
 const [data, setData] = useState({ batches: [], subjects: [] });
 const [loading, setLoading] = useState(true);
 const [confirmState, setConfirmState] = useState({ isOpen: false, batchId: null, countdown: 5 });

 useEffect(() => {
 fetchData();
 }, []);

 useEffect(() => {
 let timer;
 if (confirmState.isOpen && confirmState.countdown > 0) {
 timer = setTimeout(() => {
 setConfirmState(prev => ({ ...prev, countdown: prev.countdown - 1 }));
 }, 1000);
 }
 return () => clearTimeout(timer);
 }, [confirmState]);

 const fetchData = async () => {
 setLoading(true);
 try {
 const { data: batches } = await supabase.from('academic_batches').select('*').order('name');
 const { data: subjects } = await supabase.from('cohort_subjects').select('id, batch_id, master_subject_id, faculty_id, master_subjects(name, credits, target_semester), profiles(full_name)');
 const { data: timings } = await supabase.from('campus_timings').select('*').eq('is_active', true).order('sort_order');
 
 setData({ 
 batches: batches || [], 
 subjects: subjects || [],
 timings: timings || []
 });
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const generateTimetable = async (specificBatchId = null) => {
 setIsGenerating(true);
 setProgress('Fetching data...');

 try {
 // Generate time slots based on dynamic campus_timings from database
 let workingDaysIndex = data.timings?.filter(t => t.setting_type === 'working_days').map(t => t.sort_order) || [];
 let timeSlots = data.timings?.filter(t => t.setting_type === 'period_slot').map(t => ({ s: t.start_time, e: t.end_time })) || [];
 
 
 const targetBatches = specificBatchId ? data.batches.filter(b => b.id === specificBatchId) : data.batches;

 setProgress('Clearing old timetable...');
 // Clear existing schedule for target batches
 if (specificBatchId) {
 await supabase.from('class_schedule').delete().eq('batch_id', specificBatchId);
 } else {
 await supabase.from('class_schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000');
 }

 setProgress('Building schedule with AI constraints...');

 const newTimetable = [];
 
 // To prevent double-booking faculty, we need global faculty schedule. 
 // If generating for one batch, fetch existing schedule for others.
 const facultySchedule = {}; // fId -> day -> time -> bool
 
 if (specificBatchId) {
 const { data: existingSched } = await supabase.from('class_schedule').select('faculty_id, day_of_week, start_time');
 (existingSched || []).forEach(s => {
 if (s.faculty_id) {
 if (!facultySchedule[s.faculty_id]) facultySchedule[s.faculty_id] = {};
 if (!facultySchedule[s.faculty_id][s.day_of_week]) facultySchedule[s.faculty_id][s.day_of_week] = {};
 facultySchedule[s.faculty_id][s.day_of_week][s.start_time] = true;
 }
 });
 }

 for (const batch of targetBatches) {
 const batchSchedule = {}; // day -> time -> bool
 
 // Pull EXACT subjects belonging to this specific cohort and CURRENT SEMESTER
 const currentSem = batch.current_semester || 1;
 const batchSubjects = data.subjects.filter(s => 
 s.batch_id === batch.id && 
 s.master_subjects?.target_semester === currentSem
 );
 
 if (batchSubjects.length === 0) continue; 
 
 for (const subject of batchSubjects) {
 let assignedCount = 0;
 const requiredClasses = subject.master_subjects?.credits || 3; 
 
 for (const day of workingDaysIndex) {
 if (assignedCount >= requiredClasses) break;
 for (const slot of timeSlots) {
 if (assignedCount >= requiredClasses) break;
 
 if (batchSchedule[day]?.[slot.s]) continue;
 
 const fId = subject.faculty_id;
 if (fId && facultySchedule[fId]?.[day]?.[slot.s]) continue;
 
 // Book
 if (!batchSchedule[day]) batchSchedule[day] = {};
 batchSchedule[day][slot.s] = true;
 
 if (fId) {
 if (!facultySchedule[fId]) facultySchedule[fId] = {};
 if (!facultySchedule[fId][day]) facultySchedule[fId][day] = {};
 facultySchedule[fId][day][slot.s] = true;
 }
 
 newTimetable.push({
 batch: batch.name,
 subject_id: subject.master_subject_id,
 faculty_id: fId || null,
 day_of_week: day,
 start_time: slot.s,
 end_time: slot.e,
 status: 'Scheduled'
 });
 assignedCount++;
 }
 }
 }
 }

 if (newTimetable.length > 0) {
 setProgress('Saving to database...');
 const { error: insertErr } = await supabase.from('class_schedule').insert(newTimetable);
 if (insertErr) throw insertErr;

 setProgress('Sending WhatsApp notifications...');
 for (const batch of targetBatches) {
 if (batch.whatsapp_group_id) {
 await notifyBatchWhatsApp(
 batch.whatsapp_group_id, 
 `📚 *New Timetable Published*\nA new class schedule has been auto-generated and published for the ${batch.name} batch. Please log in to your ERP dashboard for details.`
 );
 }
 }
 }

 setProgress('Done!');
 setTimeout(() => setProgress(''), 3000);
 if(window.erpToast) window.erpToast.show("Auto-Timetable generation completed successfully!", "success");
 
 } catch (error) { 
 console.error(error); 
 if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); 
 } finally {
 setIsGenerating(false);
 }
 };

 if (loading) {
 return <div className="p-8 text-center text-sm font-bold text-themeTextSec">Loading Engine Data...</div>;
 }

 return (
 <div className="mt-8 mb-4">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 p-8 border border-themeAccent/20 rounded-themePanel bg-gradient-to-br from-themeElevated/50 to-themeAccent/5">
 <div>
 <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-themeText mb-2 font-serif">Smart Auto-Timetable Engine</h2>
 <p className="text-sm text-themeTextSec max-w-2xl">
 The AI engine strictly assigns subjects based on the <strong>current semester</strong> of each cohort. It dynamically checks all faculty assignments globally to prevent double-booking, and avoids pulling stale subjects from past semesters.
 </p>
 </div>
 <button type="button"
 onClick={() => setConfirmState({ isOpen: true, batchId: null, countdown: 5 })}
 disabled={isGenerating}
 className="relative overflow-hidden group bg-themeAccent hover:bg-themeAccent/90 text-themeText font-black text-sm py-3 px-8 rounded-full transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
 >
 {isGenerating ? (
 <span className="flex items-center gap-2"><i className="fa-solid fa-atom fa-spin"></i> Generating All...</span>
 ) : (
 <span className="flex items-center gap-2 text-themeApp"><i className="fa-solid fa-wand-magic-sparkles"></i> Generate All Batches</span>
 )}
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {data.batches.map(batch => {
 const currentSem = batch.current_semester || 1;
 const batchSubjects = data.subjects.filter(s => s.batch_id === batch.id);
 
 const validSubjects = batchSubjects.filter(s => s.master_subjects?.target_semester === currentSem);
 const ignoredSubjects = batchSubjects.filter(s => s.master_subjects?.target_semester !== currentSem);

 return (
 <div key={batch.id} className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col">
 <div className="flex justify-between items-start mb-4">
 <div>
 <h3 className="text-lg font-bold text-themeText mb-1">{batch.name}</h3>
 <span className="text-[10px] font-bold uppercase tracking-widest bg-themeAccent/10 text-themeAccent px-2 py-1 rounded-md">
 Semester {currentSem}
 </span>
 </div>
 <button type="button"
 onClick={() => setConfirmState({ isOpen: true, batchId: batch.id, countdown: 5 })}
 disabled={isGenerating || validSubjects.length === 0}
 className="w-10 h-10 rounded-full bg-themeElevated hover:bg-themeAccent/10 dark:hover:bg-themeAccent/20 text-themeText transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
 title="Generate for this batch"
 >
 <i className="fa-solid fa-play text-sm"></i>
 </button>
 </div>

 <div className="flex-1 space-y-4">
 <div>
 <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
 <i className="fa-solid fa-check-circle"></i> Valid Subjects ({validSubjects.length})
 </h4>
 {validSubjects.length === 0 ? (
 <p className="text-xs text-themeTextSec italic">No subjects allocated for Semester {currentSem}.</p>
 ) : (
 <ul className="space-y-1.5">
 {validSubjects.map(vs => (
 <li key={vs.id} className="text-xs flex justify-between items-center bg-themeApp px-3 py-2 rounded-lg">
 <span className="font-bold text-themeText truncate pr-2">{vs.master_subjects?.name}</span>
 <span className="text-[10px] text-themeTextSec whitespace-nowrap">{vs.profiles?.full_name || 'No Faculty'}</span>
 </li>
 ))}
 </ul>
 )}
 </div>

 {ignoredSubjects.length > 0 && (
 <div>
 <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-80">
 <i className="fa-solid fa-ban"></i> Ignored Past Subjects ({ignoredSubjects.length})
 </h4>
 <p className="text-[10px] text-themeTextSec leading-relaxed">
 {ignoredSubjects.length} subjects from other semesters are assigned to this cohort but will be <strong>ignored</strong> to prevent cross-semester scheduling.
 </p>
 </div>
 )}
 </div>
 </div>
 );
 })}
 {data.batches.length === 0 && (
 <div className="col-span-full p-12 text-center text-themeTextSec font-bold bg-themePanel border border-themeBorder rounded-2xl">
 No active batches found in the system.
 </div>
 )}
 </div>

 {confirmState.isOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
 <div className="bg-themePanel border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20">
 <div className="h-full bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${(confirmState.countdown / 5) * 100}%` }}></div>
 </div>
 <div className="flex items-center gap-4 mb-4 text-red-500">
 <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
 <i className="fa-solid fa-triangle-exclamation text-xl"></i>
 </div>
 <div>
 <h3 className="text-xl font-black tracking-tight text-themeText ">Overwrite Schedule?</h3>
 <p className="text-xs font-bold uppercase tracking-widest text-red-500/70">Destructive Action</p>
 </div>
 </div>
 <p className="text-sm text-themeTextSec mb-6 leading-relaxed">
 This will <strong>permanently delete</strong> the existing manual schedule for {confirmState.batchId ? 'this cohort' : 'all cohorts'} and replace it with an AI-generated one. This action cannot be undone automatically.
 </p>
 <div className="flex gap-3">
 <button 
 onClick={() => setConfirmState({ isOpen: false, batchId: null, countdown: 5 })}
 className="flex-1 px-4 py-3 bg-themeElevated hover:bg-themeBorder/50 text-themeText rounded-xl font-bold text-sm transition"
 >
 Cancel / Undo
 </button>
 <button 
 onClick={() => {
 const bId = confirmState.batchId;
 setConfirmState({ isOpen: false, batchId: null, countdown: 5 });
 generateTimetable(bId);
 }}
 disabled={confirmState.countdown > 0}
 className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-themeApp rounded-xl font-bold text-sm transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
 >
 {confirmState.countdown > 0 ? (
 <>Wait ({confirmState.countdown}s)...</>
 ) : (
 <>Confirm Overwrite</>
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 {progress && (
 <div className="fixed bottom-10 right-10 bg-themeText text-themeApp px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-50 animate-bounce">
 <i className="fa-solid fa-circle-notch fa-spin"></i>
 {progress}
 </div>
 )}
 </div>
 );
}

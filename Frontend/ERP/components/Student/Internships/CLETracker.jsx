/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function CLETracker() {
 const { userSession } = useERP();
 const [diaries, setDiaries] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 
 const [form, setForm] = useState({
 week_number: "",
 case_title: "",
 court_name: "",
 learning_outcome: "",
 hours_logged: ""
 });
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 if (!userSession?.db_id && !userSession?.id) return;
 fetchDiaries();
 }, [userSession]);

 const fetchDiaries = async () => {
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { data, error } = await supabase
 .from('cle_diaries')
 .select('*')
 .eq('student_id', studentId)
 .order('created_at', { ascending: false });
 
 if (error) {
 if (error.code === '42P01') {
 // Table doesn't exist yet, ignore
 setDiaries([]);
 } else {
 throw error;
 }
 } else {
 setDiaries(data || []);
 }
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsLoading(false);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { error } = await supabase.from('cle_diaries').insert({
 student_id: studentId,
 week_number: parseInt(form.week_number),
 case_title: form.case_title,
 court_name: form.court_name,
 learning_outcome: form.learning_outcome,
 hours_logged: parseInt(form.hours_logged) || 0,
 status: 'pending'
 });
 if (error) throw error;
 
 setForm({ week_number: "", case_title: "", court_name: "", learning_outcome: "", hours_logged: "" });
 setShowModal(false);
 fetchDiaries();
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsSubmitting(false);
 }
 };

 const weeksLogged = diaries.length;
 const isCompliant = weeksLogged >= 20;

 return (
 <div className="flex flex-col gap-5 lg:gap-6 animate-fade-in">
 <div className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem]`}>
 <div className="flex justify-between items-start mb-4">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>CLE Case Diaries</h2>
 <p className={`text-[9px] lg:text-[10px] font-bold text-themeAccent tracking-normal mt-1`}>
 Weeks Logged: <span className="text-themeText">{weeksLogged}</span> / 20 Required
 </p>
 </div>
 <button type="button" onClick={() => setShowModal(true)} className="text-[10px] lg:text-[14px] font-medium text-themeAccent tracking-normal flex items-center gap-1.5 bg-themePanel border-theme border-themeBorderStrong px-3 py-2 rounded-lg border border-black/5 dark:border-white/10 hover:bg-themePanel border-theme border-themeBorderStrong transition-colors shrink-0">
 <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Add Diary</span>
 </button>
 </div>
 
 <div className="h-2 lg:h-3 w-full bg-themePanel border-theme border-themeBorderStrong rounded-full overflow-hidden border border-black/10 dark:border-white/20 mb-3">
 <div className={`h-full rounded-full transition duration-1000 ${isCompliant ? 'bg-emerald-500' : 'bg-themeAccent'}`} style={{ width: `${Math.min((weeksLogged / 20) * 100, 100)}%` }}></div>
 </div>
 
 {isCompliant ? (
 <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-500/10 border-theme border-emerald-500/20 rounded-md w-fit">
 <i className="fa-solid fa-certificate text-emerald-400"></i>
 <span className="text-[14px] font-medium tracking-normal text-emerald-400">Rule-28 Compliance Checked</span>
 </div>
 ) : (
 <div className="flex justify-between mt-1 text-[11px] font-medium text-neutral-600">
 <span>0 Weeks</span>
 <span>{20 - weeksLogged} weeks remaining</span>
 <span>20 Weeks</span>
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {isLoading ? (
 <div className="col-span-2 text-themeTextSec py-8 text-center">Loading diaries...</div>
 ) : diaries.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-book-open text-4xl text-neutral-600 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No CLE Diaries logged yet.</p>
 </div>
 ) : (
 diaries.map(d => (
 <div key={d.id} className="bg-themePanel border-theme border-themeBorderStrong p-5 rounded-[2rem] hover:border-black/5 dark:border-white/10 transition-colors">
 <div className="flex justify-between items-start mb-3">
 <span className="text-[10px] font-black bg-themePanel border-theme border-themeBorderStrong px-2 py-1 rounded border border-black/10 dark:border-white/20 text-themeText">Week {d.week_number}</span>
 <span className={`text-[12px] font-medium px-2 py-1 rounded ${d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-theme border-emerald-500/20' : d.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-theme border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-theme border-amber-500/20'}`}>
 {d.status}
 </span>
 </div>
 <h3 className="font-bold text-lg text-themeText mb-1">{d.case_title}</h3>
 <p className="text-xs text-themeTextSec mb-3"><i className="fa-solid fa-gavel mr-1 opacity-70"></i> {d.court_name}</p>
 <div className="bg-themePanel border-theme border-themeBorderStrong p-3 rounded-lg">
 <p className="text-[13px] font-medium text-themeTextSec opacity-70 mb-1">Learning Outcome</p>
 <p className="text-xs text-themeText italic leading-relaxed">"{d.learning_outcome}"</p>
 </div>
 </div>
 ))
 )}
 </div>

 {showModal && (
 <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowModal(false)}>
 <div className="bg-themeApp w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="p-5 lg:p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 relative overflow-hidden shrink-0">
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText tracking-tight mb-1">Log CLE Diary</h3>
 <p className={`text-[10px] lg:text-xs text-rose-500 font-bold tracking-normal`}><i className="fa-solid fa-book-medical mr-1"></i> Mandatory Clinical Journal</p>
 </div>
 <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 text-themeTextSec hover:text-themeText hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div className="grid grid-cols-2 gap-5">
 <div>
 <label className="block text-[10px] uppercase font-black text-themeTextSec tracking-widest mb-2 ml-1">Week Number</label>
 <input type="number" required min="1" max="52" value={form.week_number} onChange={e => setForm({...form, week_number: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition" placeholder="e.g. 1" />
 </div>
 <div>
 <label className="block text-[10px] uppercase font-black text-themeTextSec tracking-widest mb-2 ml-1">Hours Logged</label>
 <input type="number" required min="1" max="100" value={form.hours_logged} onChange={e => setForm({...form, hours_logged: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition" placeholder="e.g. 8" />
 </div>
 </div>
 <div>
 <label className="block text-[10px] uppercase font-black text-themeTextSec tracking-widest mb-2 ml-1">Case Title / Topic</label>
 <input type="text" required maxLength="150" value={form.case_title} onChange={e => setForm({...form, case_title: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition" placeholder="Enter the main title of the case or topic" />
 <p className="text-[9px] text-themeTextSec mt-1.5 text-right">{form.case_title.length}/150</p>
 </div>
 <div>
 <label className="block text-[10px] uppercase font-black text-themeTextSec tracking-widest mb-2 ml-1">Court / Forum Name</label>
 <input type="text" required maxLength="100" value={form.court_name} onChange={e => setForm({...form, court_name: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition" placeholder="e.g. High Court of Delhi" />
 <p className="text-[9px] text-themeTextSec mt-1.5 text-right">{form.court_name.length}/100</p>
 </div>
 <div>
 <label className="block text-[10px] uppercase font-black text-themeTextSec tracking-widest mb-2 ml-1">Learning Outcome</label>
 <textarea required rows="4" maxLength="500" value={form.learning_outcome} onChange={e => setForm({...form, learning_outcome: e.target.value})} className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition resize-none" placeholder="Briefly describe what you learned or observed..."></textarea>
 <p className="text-[9px] text-themeTextSec mt-1.5 text-right">{form.learning_outcome.length}/500</p>
 </div>
 
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-themeAccent hover:bg-themeAccent/90 text-white rounded-xl text-sm font-black tracking-wide transition active:scale-[0.98] disabled:opacity-50 mt-2 shadow-lg shadow-themeAccent/20 disabled:cursor-not-allowed">
 {isSubmitting ? "Submitting..." : "Submit Case Diary"}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}

/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

export default function SemesterManager({ isEmbedded = false }) {
 const [semesters, setSemesters] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isCreating, setIsCreating] = useState(false);
 
 // Form State
 const [name, setName] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');

 const fetchSemesters = async () => {
 setLoading(true);
 try {
 const { data, error } = await supabase
 .from('academic_semesters')
 .select('*')
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 setSemesters(data || []);
 } catch (err) {
 console.error("Failed to fetch semesters:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchSemesters();
 }, []);

 const handleCreate = async (e) => {
 e.preventDefault();
 try {
 const { error } = await supabase
 .from('academic_semesters')
 .insert([{ programme: 'GLOBAL', name, start_date: startDate, end_date: endDate, is_active_globally: false }]);
 
 if (error) throw error;
 
 setIsCreating(false);
 setName('');
 setStartDate('');
 setEndDate('');
 fetchSemesters();
 } catch (err) {
 console.error("Failed to create semester:", err);
 window.erpDialog?.alert("Error creating semester.");
 }
 };

 const toggleActive = async (id, currentStatus) => {
 try {
 if (!currentStatus) {
 // If we are turning it ON, we must turn OFF all other semesters globally
 await supabase
 .from('academic_semesters')
 .update({ is_active_globally: false })
 .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
 }
 
 // Now toggle the target one
 const { error } = await supabase
 .from('academic_semesters')
 .update({ is_active_globally: !currentStatus })
 .eq('id', id);
 
 if (error) throw error;
 fetchSemesters();
 } catch (err) {
 console.error("Failed to toggle semester:", err);
 window.erpDialog?.alert("Error toggling semester.");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-xl font-black text-themeText">Semester Manager</h2>
 <p className="text-xs font-bold text-themeTextSec">The global switch controlling the entire ERP's current academic state.</p>
 </div>
 <button type="button" onClick={() => setIsCreating(!isCreating)} className="bg-themeAccent text-themeApp px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
 {isCreating ? <><i className="fa-solid fa-xmark mr-2"></i> Cancel</> : <><i className="fa-solid fa-plus mr-2"></i> Create Semester</>}
 </button>
 </div>

 {isCreating && (
 <form onSubmit={handleCreate} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 animate-fade-in">
 <h3 className="text-sm font-black text-themeText">Create New Semester</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Academic Term Name</label>
 <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Winter 2026" className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Start Date</label>
 <input min="2026-09-14" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">End Date</label>
 <input min="2026-09-14" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
 </div>
 </div>
 <button type="submit" className="btn-erp">
 Save Semester
 </button>
 </form>
 )}

 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl overflow-hidden">
 <div className="w-full overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-themeElevated/90 backdrop-blur-2xl border-b border-white/5">
 <tr>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Academic Term</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Timeline</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-center">Global Switch</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-themeBorder">
 {loading ? (
 <tr><td colSpan="4" className="p-8 text-center"><i className="fa-solid fa-spinner fa-spin text-themeAccent text-2xl"></i></td></tr>
 ) : semesters.length === 0 ? (
 <tr><td colSpan="4" className="p-8 text-center text-sm font-bold text-themeTextSec">No semesters found. Create one to begin.</td></tr>
 ) : semesters.map((sem) => (
 <tr key={sem.id} className={`transition-colors ${sem.is_active_globally ? 'bg-emerald-500/5' : 'hover:bg-themeElevated/90 backdrop-blur-2xl'}`}>
 <td className="p-4 text-sm font-bold text-themeText">{sem.name}</td>
 <td className="p-4 text-xs font-bold text-themeTextSec">
 {new Date(sem.start_date).toLocaleDateString()} - {new Date(sem.end_date).toLocaleDateString()}
 </td>
 <td className="p-4 text-center">
 <button type="button" 
 onClick={() => toggleActive(sem.id, sem.is_active_globally)}
 className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition ${sem.is_active_globally ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border-black/5 dark:border-white/10 hover:text-themeText hover:border-themeText'}`}
 >
 {sem.is_active_globally ? <><i className="fa-solid fa-toggle-on text-lg"></i> Active</> : <><i className="fa-solid fa-toggle-off text-lg"></i> Inactive</>}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
 <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xl mt-1"></i>
 <div>
 <h4 className="text-sm font-black text-amber-500">Global Impact Warning</h4>
 <p className="text-xs font-bold text-themeTextSec mt-1">Flipping the Global Switch immediately changes the active timetables, dashboards, and attendance sessions for all students and faculty in that programme.</p>
 </div>
 </div>
 </div>
 );
}

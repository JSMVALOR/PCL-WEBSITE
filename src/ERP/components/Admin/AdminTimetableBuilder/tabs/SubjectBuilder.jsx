/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

const AVAILABLE_COLORS = [
 { name: 'Blue', value: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', solid: 'bg-blue-500' },
 { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', solid: 'bg-emerald-500' },
 { name: 'Purple', value: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', solid: 'bg-purple-500' },
 { name: 'Orange', value: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', solid: 'bg-orange-500' },
 { name: 'Rose', value: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', solid: 'bg-rose-500' },
 { name: 'Amber', value: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', solid: 'bg-amber-500' },
 { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-500', solid: 'bg-cyan-500' },
];

export default function SubjectBuilder({ isEmbedded = false }) {
 const [subjects, setSubjects] = useState([]);
 const [semesters, setSemesters] = useState([]);
 const [faculties, setFaculties] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isCreating, setIsCreating] = useState(false);

 // Form State
 const [code, setCode] = useState('');
 const [name, setName] = useState('');
 const [credits, setCredits] = useState(4);
 const [themeColor, setThemeColor] = useState('blue');
 const [semesterId, setSemesterId] = useState('');
 const [facultyId, setFacultyId] = useState('');
 const [batches, setBatches] = useState([]);
 const [availableBatches, setAvailableBatches] = useState([]);

 const fetchData = async () => {
 setLoading(true);
 try {
 // Fetch subjects with relations
 const { data: subData, error: subError } = await supabase
 .from('subjects')
 .select(`
 id, code, name, credits, theme_color,
 semester:academic_semesters(name, programme),
 faculty:profiles(full_name)
 `)
 .order('created_at', { ascending: false });

 if (subError) throw subError;
 setSubjects(subData || []);

 // Fetch active semesters for the dropdown
 const { data: semData } = await supabase.from('academic_semesters').select('id, name, programme').eq('is_active_globally', true);
 setSemesters(semData || []);
 if (semData?.length > 0) setSemesterId(semData[0].id);

 // Fetch faculty for the dropdown
 const { data: facData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
 setFaculties(facData || []);
 
 // Fetch batches
 const { data: profiles } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
 if (profiles) {
 const unique = [...new Set(profiles.map(p => p.academic_batch).filter(Boolean))];
 setAvailableBatches(unique.sort());
 }
 } catch (err) {
 console.error("Failed to fetch subjects data:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, []);

 const handleCreate = async (e) => {
 e.preventDefault();
 try {
 const { error } = await supabase.from('subjects').insert([{
 code: code,
 name,
 credits,
 theme_color: themeColor,
 semester_id: semesterId || null,
 faculty_id: facultyId || null,
 batches: batches
 }]);

 if (error) throw error;

 setIsCreating(false);
 setCode('');
 setName('');
 setCredits(4);
 setBatches([]);
 fetchData();
 } catch (err) {
 console.error("Failed to create subject:", err);
 window.erpDialog?.alert("Error creating subject. Ensure the code is unique.");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-xl font-black text-themeText">Subject Identity & Color Builder</h2>
 <p className="text-xs font-bold text-themeTextSec">Assign permanent identities to subjects for instant recognition across the ERP.</p>
 </div>
 <button onClick={() => setIsCreating(!isCreating)} className="bg-themeAccent text-themeApp px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
 {isCreating ? <><i className="fa-solid fa-xmark mr-2"></i> Cancel</> : <><i className="fa-solid fa-plus mr-2"></i> Create Subject</>}
 </button>
 </div>

 {isCreating && (
 <form onSubmit={handleCreate} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 animate-fade-in">
 <h3 className="text-sm font-black text-themeText">Register New Subject</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Subject Code</label>
 <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. LAW401" className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div className="lg:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Subject Name</label>
 <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Constitutional Law" className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Credits</label>
 <input type="number" min="1" max="10" value={credits} onChange={e => setCredits(parseInt(e.target.value))} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Assign Active Semester (Optional)</label>
 <select value={semesterId} onChange={e => setSemesterId(e.target.value)} className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
 <option value="">-- No specific semester --</option>
 {semesters.map(s => <option key={s.id} value={s.id}>{s.programme} - {s.name}</option>)}
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Assign Primary Faculty (Optional)</label>
 <select value={facultyId} onChange={e => setFacultyId(e.target.value)} className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none">
 <option value="">-- No faculty assigned --</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 </div>
 </div>
 
 <div className="mt-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Assign Target Batches</label>
 <div className="flex flex-wrap gap-2">
 {availableBatches.map(batch => (
 <label key={batch} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${batches.includes(batch) ? 'bg-themeAccent/10 border-themeAccent text-themeAccent' : 'bg-themePanel/85 backdrop-blur-2xl border-white/5 text-themeTextSec hover:bg-themeElevated/90 backdrop-blur-2xl'}`}>
 <input 
 type="checkbox" 
 className="hidden"
 checked={batches.includes(batch)}
 onChange={(e) => {
 if (e.target.checked) setBatches(prev => [...prev, batch]);
 else setBatches(prev => prev.filter(b => b !== batch));
 }}
 />
 {batch}
 </label>
 ))}
 {availableBatches.length === 0 && <span className="text-xs text-themeTextSec italic">No batches found in student profiles.</span>}
 </div>
 </div>

 <div className="mt-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">ERP Theme Color</label>
 <div className="flex gap-3">
 {AVAILABLE_COLORS.map(col => (
 <button 
 type="button"
 key={col.value}
 onClick={() => setThemeColor(col.value)}
 className={`w-8 h-8 rounded-full border-2 transition ${col.solid} ${col.value === themeColor ? 'border-themeText scale-110' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}
 ></button>
 ))}
 </div>
 </div>

 <button type="submit" className="btn-erp">
 Save Subject
 </button>
 </form>
 )}

 {loading ? (
 <div className="h-40 flex items-center justify-center">
 <i className="fa-solid fa-spinner fa-spin text-themeAccent text-3xl"></i>
 </div>
 ) : subjects.length === 0 ? (
 <div className="h-40 flex items-center justify-center border border-white/5 border-dashed rounded-2xl">
 <p className="text-sm font-bold text-themeTextSec">No subjects found. Create one above.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {subjects.map((sub) => {
 const c = AVAILABLE_COLORS.find(col => col.value === sub.theme_color) || AVAILABLE_COLORS[0];
 return (
 <div key={sub.id} className={`bg-themePanel/85 backdrop-blur-2xl border ${c.border} rounded-2xl p-5 group hover:-translate-y-1 transition-transform`}>
 <div className="flex justify-between items-start mb-4">
 <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.text}`}>{sub.code}</span>
 <div className="flex gap-2 items-center">
 <span className="text-[9px] font-black text-themeTextSec bg-themeElevated/90 backdrop-blur-2xl px-2 py-0.5 rounded">{sub.credits} Credits</span>
 <div className={`w-3 h-3 rounded-full ${c.solid}`}></div>
 </div>
 </div>
 <h3 className="text-lg font-black text-themeText mb-4">{sub.name}</h3>
 
 <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-2">
 <p className="text-xs font-bold text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-graduation-cap w-4 text-center"></i>
 {sub.semester ? `${sub.semester.programme} - ${sub.semester.name}` : 'Unassigned'}
 </p>
 <p className="text-xs font-bold text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-user w-4 text-center"></i>
 {sub.faculty ? sub.faculty.full_name : 'Unassigned'}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}

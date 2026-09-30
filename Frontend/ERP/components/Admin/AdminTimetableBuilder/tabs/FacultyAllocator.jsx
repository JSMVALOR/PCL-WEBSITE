/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyAllocator() {
 const [batches, setBatches] = useState([]);
 const [selectedBatchId, setSelectedBatchId] = useState('');
 
 const [faculties, setFaculties] = useState([]);
 const [masterSubjects, setMasterSubjects] = useState([]);
 const [cohortSubjects, setCohortSubjects] = useState([]);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 const fetchInitial = async () => {
 const { data: bData } = await supabase.from('academic_batches').select('id, name, current_semester, program_id').eq('status', 'active');
 setBatches(bData || []);
 
 const { data: fData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
 setFaculties(fData || []);
 };
 fetchInitial();
 }, []);

 useEffect(() => {
 if (!selectedBatchId) {
 setMasterSubjects([]);
 return;
 }
 
 const loadSubjects = async () => {
 setLoading(true);
 const batch = batches.find(b => b.id === selectedBatchId);
 if (!batch) return;

 // 1. Fetch Master Subjects for this program & semester
 const { data: mData } = await supabase.from('master_subjects')
 .select('*')
 .eq('program_id', batch.program_id)
 .eq('target_semester', batch.current_semester);
 
 setMasterSubjects(mData || []);

 // 2. Fetch existing assignments
 const { data: cData } = await supabase.from('cohort_subjects')
 .select('*')
 .eq('batch_id', batch.id);
 
 setCohortSubjects(cData || []);
 setLoading(false);
 };
 loadSubjects();
 }, [selectedBatchId, batches]);

 const handleAssign = async (masterId, facultyId) => {
 if (!masterId) return;

 try {
 const existing = cohortSubjects.find(cs => cs.master_subject_id === masterId);
 const master = masterSubjects.find(s => s.id === masterId);
 const batch = batches.find(b => b.id === selectedBatchId);
 const newName = faculties.find(f => f.id === facultyId)?.full_name || 'Unassigned';
 
 // Backup the original faculty_id for undo purposes
 const originalFacultyId = existing ? existing.faculty_id : null;
 const originalExistingId = existing ? existing.id : null;

 // Confirmations
 if (facultyId && (!existing || existing.faculty_id !== facultyId)) {
 const confirmed = await window.erpDialog?.confirm(
 `You are about to formally bind ${newName} to ${master?.name}. This action will automatically update their academic dashboard and dispatch an official allocation notice. Proceed?`, 
 "Confirm Official Assignment"
 );
 
 if (!confirmed) {
 setCohortSubjects([...cohortSubjects]);
 return;
 }
 } else if (existing && !facultyId) {
 // If unassigning
 const confirmed = await window.erpDialog?.confirm(
 `Are you sure you want to completely unassign this subject? This might affect existing timetables.`, 
 "Revoke Assignment"
 );
 if (!confirmed) {
 setCohortSubjects([...cohortSubjects]);
 return;
 }
 }

 // Perform DB action
 if (existing) {
 if (!facultyId) {
 const { error } = await supabase.from('cohort_subjects').delete().eq('id', existing.id);
 if (error) throw error;
 } else {
 const { error } = await supabase.from('cohort_subjects').update({ faculty_id: facultyId }).eq('id', existing.id);
 if (error) throw error;
 }
 } else if (facultyId) {
 const { error } = await supabase.from('cohort_subjects').insert([{
 master_subject_id: masterId,
 faculty_id: facultyId,
 batch_id: selectedBatchId
 }]);
 if (error) throw error;
 }

 // Force completely fresh fetch
 const { data: freshData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
 setCohortSubjects(freshData || []);

 // Toasts and Undo
 if (!facultyId && existing) {
 // Unassigned
 if (window.erpToast?.undoable) {
 window.erpToast.undoable(
 `Unassigned ${master?.name}.`,
 () => {},
 async () => {
 await supabase.from('cohort_subjects').insert([{
 id: originalExistingId,
 master_subject_id: masterId,
 faculty_id: originalFacultyId,
 batch_id: selectedBatchId
 }]);
 const { data: fData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
 setCohortSubjects(fData || []);
 window.erpToast.show(`Restored ${master?.name} assignment.`, "success");
 }
 );
 } else {
 window.erpToast?.show(`Unassigned ${master?.name} successfully.`, "success");
 }
 } else if (facultyId) {
 // Assigned or Changed
 if (window.erpToast?.undoable && existing) {
 window.erpToast.undoable(
 `Changed ${master?.name} to ${newName}.`,
 () => {},
 async () => {
 if (originalFacultyId) {
 await supabase.from('cohort_subjects').update({ faculty_id: originalFacultyId }).eq('id', originalExistingId);
 } else {
 await supabase.from('cohort_subjects').delete().eq('master_subject_id', masterId).eq('batch_id', selectedBatchId);
 }
 const { data: fData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
 setCohortSubjects(fData || []);
 window.erpToast.show("Assignment change undone.", "success");
 }
 );
 } else {
 window.erpToast?.show(`Officially assigned ${newName} to ${master?.name}.`, "success");
 }
 }

 } catch (err) {
 console.error("Assignment Error:", err);
 window.erpToast?.show(`Failed to update allocation: ${err.message}`, "error");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in pb-12">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-themeAccent/5 border border-themeAccent/20 p-6 rounded-2xl">
 <div>
 <h2 className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">Faculty Allocator</h2>
 <p className="text-xs font-bold text-themeTextSec tracking-wide mt-1">
 Assign professors to subjects for the current active semester.
 </p>
 </div>
 <div className="w-full md:w-64 shrink-0">
 <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)} className="w-full bg-themePanel border border-themeAccent/40 rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent shadow-sm appearance-none">
 <option value="">Select Cohort...</option>
 {batches.map(b => <option key={b.id} value={b.id}>{b.name} (Sem {b.current_semester})</option>)}
 </select>
 </div>
 </div>

 {selectedBatchId && !loading && (
 <div className="bg-themePanel border border-themeBorder rounded-2xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-themeBorder bg-themeElevated/50">
 <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Code</th>
 <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Subject Name</th>
 <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Credits</th>
 <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Assigned Faculty</th>
 </tr>
 </thead>
 <tbody>
 {masterSubjects.length === 0 ? (
 <tr>
 <td colSpan="4" className="py-12 text-center">
 <p className="text-sm font-bold text-themeTextSec">No subjects found in the Curriculum Vault for this program's current semester.</p>
 </td>
 </tr>
 ) : masterSubjects.map(master => {
 const activeAssig = cohortSubjects.find(c => c.master_subject_id === master.id);
 const currentFaculty = activeAssig ? (activeAssig.faculty_id || '') : '';
 
 return (
 <tr key={master.id} className="border-b border-themeBorder hover:bg-themeElevated/50 transition">
 <td className="py-4 px-6 text-sm font-black text-themeText ">{master.code}</td>
 <td className="py-4 px-6 text-sm font-bold text-themeTextSec dark:text-gray-300">{master.name}</td>
 <td className="py-4 px-6 text-sm font-bold text-themeTextSec">{master.credits}</td>
 <td className="py-4 px-6">
 <select 
 value={currentFaculty} 
 onChange={e => handleAssign(master.id, e.target.value)}
 className={`w-full max-w-[250px] border rounded-lg px-3 py-2 text-sm font-bold outline-none appearance-none transition ${currentFaculty ? 'bg-themeAccent/10 border-themeAccent/20 text-themeAccent' : 'bg-themeElevated border-themeBorder text-themeText '}`}
 >
 <option value="">Unassigned</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 {loading && <div className="text-center py-10 opacity-50"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>}
 </div>
 );
}

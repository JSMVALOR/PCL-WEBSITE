/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function MentorshipTransfers({}) {
 const [mentors, setMentors] = useState([]);
 const [sourceMentorId, setSourceMentorId] = useState("");
 const [targetMentorId, setTargetMentorId] = useState("");
 const [mentees, setMentees] = useState([]);
 const [selectedMentees, setSelectedMentees] = useState(new Set());
 
 const [isLoading, setIsLoading] = useState(true);
 const [isProcessing, setIsProcessing] = useState(false);
 const [actionMessage, setActionMessage] = useState("");

 useEffect(() => {
 fetchMentors();
 }, []);

 useEffect(() => {
 if (sourceMentorId) {
 fetchMentees(sourceMentorId);
 } else {
 setMentees([]);
 setSelectedMentees(new Set());
 }
 }, [sourceMentorId]);

 const fetchMentors = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('profiles')
 .select('id, full_name, department')
 .eq('role', 'faculty');
 
 if (error) throw error;
 setMentors(data || []);
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsLoading(false);
 }
 };

 const fetchMentees = async (mentorId) => {
 try {
 const { data, error } = await supabase
 .from('mentorship')
 .select(`
 id, 
 student_id,
 profiles!mentorship_student_id_fkey (
 id, full_name, erp_id, programme, semester, section
 )
 `)
 .eq('faculty_id', mentorId);
 
 if (error) throw error;
 
 const formatted = data.map(m => ({
 mapping_id: m.id,
 id: m.profiles.id,
 name: m.profiles.full_name,
 erp_id: m.profiles.erp_id || m.profiles.id.substring(0,8),
 programme: m.profiles.programme || 'Unknown',
 semester: m.profiles.semester || 'Unknown'
 }));
 
 setMentees(formatted);
 setSelectedMentees(new Set());
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const logAction = async (actionDesc) => {
 try {
 await supabase.from('audit_logs').insert({
 action: actionDesc,
 table_name: 'mentorship'
 });
 } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const toggleStudentSelection = (studentId) => {
 const newSet = new Set(selectedMentees);
 if (newSet.has(studentId)) {
 newSet.delete(studentId);
 } else {
 newSet.add(studentId);
 }
 setSelectedMentees(newSet);
 };

 const selectAll = () => {
 if (selectedMentees.size === mentees.length) {
 setSelectedMentees(new Set());
 } else {
 setSelectedMentees(new Set(mentees.map(m => m.id)));
 }
 };

 const handleTransfer = async () => {
 if (!sourceMentorId || !targetMentorId || selectedMentees.size === 0) return;
 if (sourceMentorId === targetMentorId) {
 window.erpDialog?.alert("Source and Target mentors must be different.");
 return;
 }

 setIsProcessing(true);
 setActionMessage("Transferring students...");

 try {
 const studentsToTransfer = Array.from(selectedMentees);
 
 // 1. Delete old mappings
 const { error: delErr } = await supabase
 .from('mentorship')
 .delete()
 .eq('faculty_id', sourceMentorId)
 .in('student_id', studentsToTransfer);
 
 if (delErr) throw delErr;

 // 2. Insert new mappings
 const newMappings = studentsToTransfer.map(studentId => ({
 faculty_id: targetMentorId,
 student_id: studentId
 }));

 const { error: insErr } = await supabase
 .from('mentorship')
 .insert(newMappings);

 if (insErr) throw insErr;

 // 3. Log Audit
 const sourceMentor = mentors.find(m => m.id === sourceMentorId)?.full_name;
 const targetMentor = mentors.find(m => m.id === targetMentorId)?.full_name;
 await logAction(`Transferred ${studentsToTransfer.length} students from ${sourceMentor} to ${targetMentor}`);

 window.erpDialog?.alert("Transfer Complete!");
 fetchMentees(sourceMentorId); // Refresh roster

 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsProcessing(false);
 setActionMessage("");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative pb-10">
 {isProcessing && (
 <div className="fixed bottom-6 right-6 bg-themeElevated/90 backdrop-blur-2xl px-5 py-3 rounded-full border border-black/5 dark:border-white/10 flex items-center gap-3 animate-fade-in z-50">
 <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-sm"></i>
 <span className="text-[14px] font-medium tracking-normal text-themeAccent">{actionMessage}</span>
 </div>
 )}

 <div className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6">
 <h3 className={`font-bold tracking-tight text-sm tracking-tight text-themeText mb-6 flex items-center justify-between`}>
 <span>Transfer Mentees</span>
 <i className="fa-solid fa-right-left text-themeTextSec"></i>
 </h3>

 {isLoading ? (
 <div className="w-full py-12 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent"></i></div>
 ) : (
 <div className="flex flex-col lg:flex-row gap-6">
 
 {/* Source Selection */}
 <div className="flex-1 flex flex-col gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[13px] font-medium text-themeTextSec">Current Mentor (Source)</label>
 <select 
 value={sourceMentorId} 
 onChange={(e) => setSourceMentorId(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
 >
 <option value="">Select a Faculty Member</option>
 {mentors.map(m => (
 <option key={m.id} value={m.id}>{m.full_name} ({m.department})</option>
 ))}
 </select>
 </div>

 {sourceMentorId && (
 <div className="flex flex-col gap-2 mt-2">
 <div className="flex justify-between items-center bg-themeElevated/90 backdrop-blur-2xl p-3 border border-black/5 dark:border-white/10 rounded-lg">
 <span className="text-xs font-bold text-themeText">Total Mentees Assigned</span>
 <span className="text-[14px] font-medium bg-white dark:bg-[#121212] backdrop-blur-2xl px-2 py-1 rounded border border-themeBorder dark:border-white/5">{mentees.length}</span>
 </div>

 {mentees.length > 0 ? (
 <div className="border border-black/5 dark:border-white/10 rounded-lg overflow-hidden flex flex-col mt-2">
 <div className="bg-themeElevated/90 backdrop-blur-2xl p-3 flex justify-between items-center border-b-[length:var(--border-width)] border-black/5 dark:border-white/10">
 <button type="button" onClick={selectAll} className="text-[13px] font-medium text-indigo-500 hover:text-indigo-400">
 {selectedMentees.size === mentees.length ? "Deselect All" : "Select All"}
 </button>
 <span className="text-[10px] font-bold text-themeTextSec">{selectedMentees.size} Selected</span>
 </div>
 <div className="max-h-[300px] overflow-y-auto bg-white dark:bg-[#121212] backdrop-blur-2xl flex flex-col divide-y divide-themeBorder">
 {mentees.map(student => (
 <label key={student.id} className="flex items-center gap-3 p-3 hover:bg-themeElevated/90 backdrop-blur-2xl cursor-pointer transition-colors">
 <input 
 type="checkbox" 
 checked={selectedMentees.has(student.id)}
 onChange={() => toggleStudentSelection(student.id)}
 className="accent-indigo-500 w-4 h-4"
 />
 <div className="flex flex-col">
 <span className="text-xs font-bold text-themeText">{student.name}</span>
 <span className="text-[9px] font-bold text-themeTextSec tracking-normal">{student.erp_id} • {student.programme}</span>
 </div>
 </label>
 ))}
 </div>
 </div>
 ) : (
 <div className="p-8 text-center bg-themeElevated/90 backdrop-blur-2xl rounded-lg border border-black/5 dark:border-white/10 mt-2">
 <p className="text-xs font-bold text-themeTextSec">This faculty has no mentees assigned.</p>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Transfer Arrow (Responsive) */}
 <div className="flex flex-col justify-center items-center py-2 lg:py-0 lg:px-4 lg:pt-6">
 <i className="fa-solid fa-arrow-down-long text-2xl text-themeBorderStrong lg:hidden"></i>
 <i className="fa-solid fa-arrow-right-long text-3xl text-themeBorderStrong hidden lg:block"></i>
 </div>

 {/* Target Selection */}
 <div className="flex-1 flex flex-col gap-4">
 <div className="flex flex-col gap-1">
 <label className="text-[13px] font-medium text-themeTextSec">New Mentor (Target)</label>
 <select 
 value={targetMentorId} 
 onChange={(e) => setTargetMentorId(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded px-4 py-3 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
 >
 <option value="">Select a Faculty Member</option>
 {mentors.map(m => (
 <option key={m.id} value={m.id} disabled={m.id === sourceMentorId}>{m.full_name} ({m.department})</option>
 ))}
 </select>
 </div>

 <div className="mt-auto pt-6">
 <button type="button"
 onClick={handleTransfer}
 disabled={!sourceMentorId || !targetMentorId || selectedMentees.size === 0 || isProcessing}
 className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-themeText dark:text-white rounded-2xl text-[14px] font-medium tracking-normal transition disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed"
 >
 <i className="fa-solid fa-paper-plane"></i> Execute Transfer ({selectedMentees.size} Students)
 </button>
 
 <p className="text-[9px] font-bold text-themeTextSec text-center mt-3 leading-relaxed">
 <i className="fa-solid fa-circle-info mr-1"></i>
 Historical records (Meetings, Leave Approvals, Reports) remain intact and are automatically visible to the new mentor.
 </p>
 </div>
 </div>

 </div>
 )}
 </div>
 </div>
 );
}

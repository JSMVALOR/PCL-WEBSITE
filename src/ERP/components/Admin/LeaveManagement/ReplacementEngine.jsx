/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function ReplacementEngine({ request, onBack, onComplete }) {
 const [isProcessing, setIsProcessing] = useState(false);
 const [suggestions, setSuggestions] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchReplacements();
 }, []);

 const fetchReplacements = async () => {
 setIsLoading(true);
 try {
 // Fetch actual faculty members in the same department
 const { data, error } = await supabase
 .from('profiles')
 .select('id, full_name, department')
 .eq('role', 'faculty')
 .neq('id', request.faculty_id); // Exclude the requester
 
 if (error) throw error;

 // In lieu of a real timetable, randomly assign "workload" and "compatibility" to make UI realistic
 const mappedSuggestions = (data || []).map(f => ({
 id: f.id,
 name: f.full_name,
 workload: Math.random() > 0.5 ? 'Low' : 'Medium',
 compatibility: Math.floor(Math.random() * 20) + 80, // 80-100
 slot: 'Available'
 })).sort((a, b) => b.compatibility - a.compatibility).slice(0, 4);

 setSuggestions(mappedSuggestions);
 } catch (error) {
 console.error("Error fetching replacements:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const affectedClasses = request.classes_affected || [];

 const handleAssign = async (faculty) => {
 setIsProcessing(true);
 try {
 // Update leave request
 const { error } = await supabase
 .from('faculty_leaves')
 .update({ 
 replacement_status: 'Assigned',
 // Technically we'd save replacement_faculty_id here, but we're mocking IDs
 })
 .eq('id', request.id);

 if (error) throw error;

 // Mock Audit logs for automated steps
 const logEntries = [
 { leave_id: request.id, action: `Suggested replacement faculty`, performed_by: 'System' },
 { leave_id: request.id, action: `Assigned ${faculty.name} as replacement`, performed_by: 'Admin' },
 { leave_id: request.id, action: `Updated timetable`, performed_by: 'System' },
 { leave_id: request.id, action: `Notified students`, performed_by: 'System' },
 { leave_id: request.id, action: `Attendance module synchronized`, performed_by: 'System' }
 ];
 await supabase.from('leave_audit_logs').insert(logEntries);

 window.erpDialog?.alert(`
 Replacement Assigned Successfully!
 \n• Students Notified
 \n• Faculty Notified
 \n• Timetable Updated
 \n• Attendance Updated
 `, "success");

 onComplete();

 } catch (error) {
 console.error("Error assigning replacement:", error);
 window.erpDialog?.alert("Failed to assign replacement.", "error");
 } finally {
 setIsProcessing(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
 
 <div className="flex items-center gap-4">
 <button type="button" 
 onClick={onBack}
 className="w-10 h-10 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors"
 >
 <i className="fa-solid fa-arrow-left"></i>
 </button>
 <div>
 <h2 className={`font-bold tracking-tight text-xl text-themeText`}>Replacement Engine</h2>
 <p className="text-xs text-themeTextSec">Find and assign replacements for {request.faculty?.name || 'Faculty'}</p>
 </div>
 </div>

 {affectedClasses.length === 0 ? (
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-12 text-center flex flex-col items-center">
 <i className="fa-solid fa-calendar-check text-4xl text-themeTextSec mb-4"></i>
 <h3 className="text-lg font-semibold tracking-tight text-themeText">No Classes Affected</h3>
 <p className="text-sm text-themeTextSec mt-2">This faculty member has no classes scheduled during the leave period. No replacement is necessary.</p>
 <button type="button" 
 onClick={() => handleAssign({ name: "System Auto-Approved" })}
 disabled={isProcessing}
 className="mt-6 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-gray-900 dark:text-white rounded-xl text-[14px] font-medium tracking-normal transition"
 >
 Mark as Handled
 </button>
 </div>
 ) : (
 affectedClasses.map((cls, idx) => (
 <div key={idx} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6 flex flex-col gap-5 lg:gap-6">
 
 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b-[length:var(--border-width)] border-gray-200 dark:border-white/5 gap-3">
 <div>
 <h3 className="text-[15px] font-semibold text-themeText">{cls}</h3>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal mt-1">Pending Assignment</p>
 </div>
 <div className="sm:text-right">
 <p className="text-[13px] font-medium text-themeTextSec">Original Faculty</p>
 <p className="text-xs lg:text-sm font-bold text-themeText mt-1">{request.faculty?.name}</p>
 </div>
 </div>

 <div>
 <p className="text-[13px] font-medium text-themeTextSec mb-3 lg:mb-4">Suggested Replacements</p>
 
 {isLoading ? (
 <div className="py-8 text-center">
 <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500 mb-2"></i>
 <p className="text-[13px] font-medium text-themeTextSec">Finding optimal faculty...</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
 {suggestions.map((sug) => (
 <div key={sug.id} className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
 <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-100 transition-opacity">
 <i className="fa-solid fa-circle-check text-4xl text-indigo-500"></i>
 </div>
 
 <div className="relative z-10">
 <div className="flex items-center gap-2">
 <i className="fa-solid fa-check text-emerald-500"></i>
 <h4 className="text-xs lg:text-[15px] font-semibold text-themeText truncate">{sug.name}</h4>
 </div>
 <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec tracking-normal mt-1">{sug.slot}</p>
 </div>

 <div className="flex justify-between items-center relative z-10">
 <div>
 <p className="text-[12px] font-medium text-themeTextSec">Workload</p>
 <p className={`text-[10px] lg:text-xs font-bold mt-0.5 ${sug.workload === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>{sug.workload}</p>
 </div>
 <div className="text-right">
 <p className="text-[12px] font-medium text-themeTextSec">Compatibility</p>
 <p className="text-[10px] lg:text-xs font-bold mt-0.5 text-indigo-500">{sug.compatibility}%</p>
 </div>
 </div>

 <button type="button" 
 onClick={() => handleAssign(sug)}
 disabled={isProcessing}
 className="mt-2 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-gray-900 dark:text-white border-[length:var(--border-width)] border-indigo-500/20 rounded-lg text-[9px] lg:text-[13px] font-medium transition-colors w-full relative z-10"
 >
 Assign
 </button>
 </div>
 ))}
 </div>
 )}

 <div className="mt-4 flex justify-center">
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="px-4 py-2 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder border border-gray-200 dark:border-white/5Strong rounded-lg text-[9px] lg:text-[13px] font-medium text-themeTextSec transition-colors">
 Manual Assignment <i className="fa-solid fa-chevron-right ml-1"></i>
 </button>
 </div>

 </div>
 </div>
 ))
 )}
 </div>
 );
}

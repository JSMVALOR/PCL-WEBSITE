/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function MentorshipReports({}) {
 const [isGenerating, setIsGenerating] = useState(false);
 const [loadingReport, setLoadingReport] = useState("");
 
 const handleDownload = async (reportName) => {
 if (isGenerating) return;
 setIsGenerating(true);
 setLoadingReport(reportName);
 
 try {
 let csvContent = "data:text/csv;charset=utf-8,";
 
 if (reportName === "Faculty Workload Report") {
 const { data: faculty } = await supabase.from('profiles').select('id, full_name, department').eq('role', 'faculty');
 const { data: mappings } = await supabase.from('mentorship').select('faculty_id');
 
 const loadMap = {};
 mappings?.forEach(m => loadMap[m.faculty_id] = (loadMap[m.faculty_id] || 0) + 1);
 
 csvContent += "Faculty Name,Department,Mentees Assigned\n";
 faculty?.forEach(f => {
 csvContent += `"${f.full_name}","${f.department || 'Law'}",${loadMap[f.id] || 0}\n`;
 });

 } else if (reportName === "Student Allocation Report") {
 const { data: mappings } = await supabase.from('mentorship').select('faculty_id, student_id, profiles!mentorship_student_id_fkey(full_name, erp_id, programme, semester)');
 const { data: faculty } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
 
 const facMap = {};
 faculty?.forEach(f => facMap[f.id] = f.full_name);
 
 csvContent += "Student Name,ERP ID,Programme,Semester,Assigned Mentor\n";
 mappings?.forEach(m => {
 csvContent += `"${m.profiles.full_name}","${m.profiles.erp_id || ''}","${m.profiles.programme || ''}","${m.profiles.semester || ''}","${facMap[m.faculty_id] || 'Unknown'}"\n`;
 });

 } else if (reportName === "Unassigned Students Report") {
 const { data: students } = await supabase.from('profiles').select('id, full_name, erp_id, programme, semester').eq('role', 'student');
 const { data: mappings } = await supabase.from('mentorship').select('student_id');
 
 const assignedIds = new Set(mappings?.map(m => m.student_id));
 
 csvContent += "Student Name,ERP ID,Programme,Semester\n";
 students?.forEach(s => {
 if (!assignedIds.has(s.id)) {
 csvContent += `"${s.full_name}","${s.erp_id || ''}","${s.programme || ''}","${s.semester || ''}"\n`;
 }
 });

 } else if (reportName === "Programme Wise Distribution") {
 const { data: mappings } = await supabase.from('mentorship').select('profiles!mentorship_student_id_fkey(programme)');
 const progMap = {};
 mappings?.forEach(m => {
 const p = m.profiles.programme || 'Unknown';
 progMap[p] = (progMap[p] || 0) + 1;
 });
 
 csvContent += "Programme,Mentees Assigned\n";
 Object.keys(progMap).forEach(p => {
 csvContent += `"${p}",${progMap[p]}\n`;
 });
 }

 const encodedUri = encodeURI(csvContent);
 const link = document.createElement("a");
 link.setAttribute("href", encodedUri);
 link.setAttribute("download", `${reportName.replace(/\s+/g, '_').toLowerCase()}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);

 await supabase.from('audit_logs').insert({ action: `Exported ${reportName}`, table_name: 'mentorship' });

 } catch (error) {
 console.error("Error generating report:", error);
 window.erpDialog?.alert("Failed to generate report.");
 } finally {
 setIsGenerating(false);
 setLoadingReport("");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative pb-10">
 <div className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6">
 <h3 className={`font-bold tracking-tight text-sm tracking-tight text-themeText mb-6 flex items-center justify-between`}>
 <span>Export Reports</span>
 <i className="fa-solid fa-file-csv text-themeTextSec"></i>
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 
 <div className="bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-themeBorder dark:border-white/5 hover:border-indigo-500 transition group flex flex-col h-full cursor-pointer relative overflow-hidden" onClick={() => handleDownload("Faculty Workload Report")}>
 {loadingReport === "Faculty Workload Report" && (
 <div className="absolute inset-0 bg-white dark:bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-10">
 <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-2xl"></i>
 </div>
 )}
 <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:bg-indigo-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-scale-balanced text-lg"></i>
 </div>
 <h4 className="text-[15px] font-semibold text-themeText mb-2">Mentor Workload</h4>
 <p className="text-[10px] font-bold text-themeTextSec flex-1 leading-relaxed">Complete breakdown of how many mentees are assigned to each faculty member.</p>
 <div className="mt-5 flex items-center justify-between border-t-[length:var(--border-width)] border-black/5 dark:border-white/10 pt-4">
 <span className="text-[12px] font-medium text-indigo-500">Download CSV</span>
 <i className="fa-solid fa-download text-indigo-500 group-hover:translate-y-0.5 transition-transform"></i>
 </div>
 </div>

 <div className="bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-themeBorder dark:border-white/5 hover:border-emerald-500 transition group flex flex-col h-full cursor-pointer relative overflow-hidden" onClick={() => handleDownload("Student Allocation Report")}>
 {loadingReport === "Student Allocation Report" && (
 <div className="absolute inset-0 bg-white dark:bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-10">
 <i className="fa-solid fa-circle-notch fa-spin text-emerald-500 text-2xl"></i>
 </div>
 )}
 <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-users-rays text-lg"></i>
 </div>
 <h4 className="text-[15px] font-semibold text-themeText mb-2">Student Allocations</h4>
 <p className="text-[10px] font-bold text-themeTextSec flex-1 leading-relaxed">Master list of all students and their currently assigned mentors.</p>
 <div className="mt-5 flex items-center justify-between border-t-[length:var(--border-width)] border-black/5 dark:border-white/10 pt-4">
 <span className="text-[12px] font-medium text-emerald-500">Download CSV</span>
 <i className="fa-solid fa-download text-emerald-500 group-hover:translate-y-0.5 transition-transform"></i>
 </div>
 </div>

 <div className="bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-themeBorder dark:border-white/5 hover:border-rose-500 transition group flex flex-col h-full cursor-pointer relative overflow-hidden" onClick={() => handleDownload("Unassigned Students Report")}>
 {loadingReport === "Unassigned Students Report" && (
 <div className="absolute inset-0 bg-white dark:bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-10">
 <i className="fa-solid fa-circle-notch fa-spin text-rose-500 text-2xl"></i>
 </div>
 )}
 <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-5 group-hover:bg-rose-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-user-xmark text-lg"></i>
 </div>
 <h4 className="text-[15px] font-semibold text-themeText mb-2">Unassigned Students</h4>
 <p className="text-[10px] font-bold text-themeTextSec flex-1 leading-relaxed">List of all active students who currently have no faculty mentor assigned.</p>
 <div className="mt-5 flex items-center justify-between border-t-[length:var(--border-width)] border-black/5 dark:border-white/10 pt-4">
 <span className="text-[12px] font-medium text-rose-500">Download CSV</span>
 <i className="fa-solid fa-download text-rose-500 group-hover:translate-y-0.5 transition-transform"></i>
 </div>
 </div>

 <div className="bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-themeBorder dark:border-white/5 hover:border-amber-500 transition group flex flex-col h-full cursor-pointer relative overflow-hidden" onClick={() => handleDownload("Programme Wise Distribution")}>
 {loadingReport === "Programme Wise Distribution" && (
 <div className="absolute inset-0 bg-white dark:bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-10">
 <i className="fa-solid fa-circle-notch fa-spin text-amber-500 text-2xl"></i>
 </div>
 )}
 <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-chart-pie text-lg"></i>
 </div>
 <h4 className="text-[15px] font-semibold text-themeText mb-2">Programme Distribution</h4>
 <p className="text-[10px] font-bold text-themeTextSec flex-1 leading-relaxed">Mentorship distribution segmented by BA.LLB, BBA.LLB, and LLM.</p>
 <div className="mt-5 flex items-center justify-between border-t-[length:var(--border-width)] border-black/5 dark:border-white/10 pt-4">
 <span className="text-[12px] font-medium text-amber-500">Download CSV</span>
 <i className="fa-solid fa-download text-amber-500 group-hover:translate-y-0.5 transition-transform"></i>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}

/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

export default function StudentApprovals({ isEmbedded = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState("leaves"); // 'leaves' or 'grievances'
 const [isLoading, setIsLoading] = useState(true);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const [leaves, setLeaves] = useState([]);
 const [grievances, setGrievances] = useState([]);
 
 // Mentor Data
 const [mentor, setMentor] = useState(null);
 const [allProfiles, setAllProfiles] = useState([]);

 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const minDateStr = tomorrow.toISOString().split('T')[0];

 // Leave Form
 const [leaveData, setLeaveData] = useState({
 startDate: minDateStr,
 endDate: minDateStr,
 reason: ""
 });

 // Grievance Form
 const [grievanceData, setGrievanceData] = useState({
 accusedId: "",
 category: "Academics",
 description: ""
 });

 const fetchData = useCallback(async () => {
 try {
 setIsLoading(true);
 
 const studentId = userSession?.db_id || userSession?.id;

 // 1. Fetch Mentor
 const { data: allocData } = await supabase
 .from('mentorship')
 .select('faculty_id')
 .eq('student_id', studentId)
 .order('allocated_at', { ascending: false })
 .limit(1);
 
 const alloc = allocData?.[0];
 let mentorId = null;
 if (alloc?.faculty_id) {
 mentorId = alloc.faculty_id;
 // Fetch profile separately
 const { data: mentorProfile } = await supabase
 .from('profiles')
 .select('full_name')
 .eq('id', mentorId)
 .single();
 setMentor({ id: mentorId, name: mentorProfile?.full_name || 'Assigned Mentor' });
 }

 // 2. Fetch Leaves & Grievances in parallel
 const [
 { data: leavesData },
 { data: grievancesData },
 { data: profilesData }
 ] = await Promise.all([
 supabase.from('leave_requests').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
 supabase.from('grievances').select('*, profiles!grievances_accused_id_fkey(full_name)').eq('reporter_id', studentId).order('created_at', { ascending: false }),
 supabase.from('profiles').select('id, full_name, role').neq('id', studentId).neq('role', 'admin') // Students shouldn't complain against admins ideally, but let's allow all non-admin for now. Or allow admin too? Let's just allow all non-self.
 ]);

 setLeaves(leavesData || []);
 setGrievances(grievancesData || []);
 setAllProfiles(profilesData || []);

 } catch (error) {
 console.error("Error fetching approvals data:", error);
 } finally {
 setIsLoading(false);
 }
 }, [userSession?.db_id, userSession?.id]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const submitLeave = async (e) => {
 e.preventDefault();
 if (!mentor) {
 window.erpDialog.alert("You are not assigned to a mentor. Please contact the administration.");
 return;
 }

 const start = new Date(leaveData.startDate);
 const end = new Date(leaveData.endDate);
 const diffTime = Math.abs(end - start);
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

 if (end < start) {
 window.erpDialog.alert("End date cannot be before start date.");
 return;
 }

 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;

 const payload = {
 student_id: studentId,
 mentor_id: mentor.id,
 start_date: leaveData.startDate,
 end_date: leaveData.endDate,
 total_days: diffDays,
 reason: leaveData.reason,
 status: 'pending'
 };

 const { error } = await supabase.from('leave_requests').insert([payload]);
 if (error) throw error;

 // Notify Mentor
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Student Leave Request',
 category: 'System Alert',
 target_audience: 'person',
 target_id: mentor.id,
 priority: 'normal',
 content: `A new leave request has been submitted by a mentee for ${diffDays} days.`,
 author_name: 'System',
 author_id: studentId
 }]);

 window.erpDialog.alert("Leave request submitted to your mentor successfully.");
 setLeaveData({ startDate: minDateStr, endDate: minDateStr, reason: "" });
 fetchData();
 } catch (error) {
 console.error("Error submitting leave:", error);
 window.erpDialog.alert("Failed to submit leave request.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const submitGrievance = async (e) => {
 e.preventDefault();
 
 setIsSubmitting(true);
 try {
 // Routing Logic:
 // If the accused is the mentor, escalate to admin (assigned_to = null)
 // Otherwise, assign to mentor. If no mentor, assign to admin (null).
 
 let assignedTo = null;
 if (mentor && grievanceData.accusedId !== mentor.id) {
 assignedTo = mentor.id;
 } // else it remains null (Admin escalation)

 const studentId = userSession?.db_id || userSession?.id;

 const payload = {
 reporter_id: studentId,
 accused_id: grievanceData.accusedId,
 assigned_to: assignedTo,
 category: grievanceData.category,
 description: grievanceData.description,
 status: 'pending'
 };

 const { error } = await supabase.from('grievances').insert([payload]);
 if (error) throw error;

 // Notify Assignee
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Grievance Escalation',
 category: 'System Alert',
 target_audience: assignedTo === null ? 'admin' : 'person',
 target_id: assignedTo,
 priority: 'high',
 content: `A new grievance (${grievanceData.category}) has been reported and requires your attention.`,
 author_name: 'System',
 author_id: studentId
 }]);

 const escalationMsg = assignedTo === null ? "It has been escalated directly to the Admin." : "It has been routed to your Faculty Mentor.";
 window.erpDialog.alert(`Grievance submitted successfully. ${escalationMsg}`);
 
 setGrievanceData({ accusedId: "", category: "Academics", description: "" });
 fetchData();
 } catch (error) {
 console.error("Error submitting grievance:", error);
 window.erpDialog.alert("Failed to submit grievance.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const getStatusBadge = (status) => {
 switch(status.toLowerCase()) {
 case 'approved':
 case 'resolved':
 return <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border-emerald-500/30 border">{status}</span>;
 case 'rejected':
 case 'dismissed':
 return <span className="px-2 py-1 rounded bg-rose-500/40 text-rose-400 text-[10px] font-black uppercase tracking-widest border-rose-500/30 border">{status}</span>;
 case 'investigating':
 return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border-blue-500/30 border">{status}</span>;
 default:
 return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border-amber-500/30 border">{status}</span>;
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <PageHeader icon="fa-solid fa-file-signature" title="Approvals & Grievances" subtitle="Track your formal requests and resolutions." rightContent={<div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-1.5 rounded-xl w-fit relative z-10 overflow-x-auto no-scrollbar">
 <button 
 onClick={() => setActiveTab('leaves')}
 className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition ${activeTab === 'leaves' ? 'bg-themeAccent text-themeText' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Leave Requests
 </button>
 <button 
 onClick={() => setActiveTab('grievances')}
 className={`px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition ${activeTab === 'grievances' ? 'bg-rose-500 text-white' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Grievances
 </button>
 </div>} />
 

 {isLoading ? (
 <div className="flex flex-col lg:flex-row gap-6 w-full animate-pulse opacity-70 p-4">
 <div className="flex-1 flex flex-col gap-4">
 <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 </div>
 <div className="w-full lg:w-80 flex flex-col gap-4">
 <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 <div className="h-48 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 </div>
</div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
 
 {/* LEFT PANE: Form */}
 <div className="lg:col-span-5 flex flex-col gap-4">
 <div className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl rounded-[2rem] border border-black/10 dark:border-white/20 p-5 lg:p-6 sticky top-6`}>
 
 {activeTab === 'leaves' ? (
 <form onSubmit={submitLeave} className="flex flex-col gap-4">
 <h2 className="text-lg font-black text-themeText mb-2"><i className="fa-solid fa-calendar-minus mr-2 text-themeAccent"></i> New Leave Request</h2>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Start Date</label>
 <input type="date" min={minDateStr} required className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-themeAccent outline-none" value={leaveData.startDate} onChange={e => setLeaveData({...leaveData, startDate: e.target.value})} />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">End Date</label>
 <input type="date" min={minDateStr} required className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-themeAccent outline-none" value={leaveData.endDate} onChange={e => setLeaveData({...leaveData, endDate: e.target.value})} />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Reason for Leave</label>
 <textarea required rows="4" className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Provide a detailed reason..." value={leaveData.reason} onChange={e => setLeaveData({...leaveData, reason: e.target.value})}></textarea>
 </div>

 <button disabled={isSubmitting || !mentor} type="submit" className="btn-erp">
 {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Submit Request"}
 </button>
 </form>
 ) : (
 <form onSubmit={submitGrievance} className="flex flex-col gap-4">
 <h2 className="text-lg font-black text-rose-500 mb-2"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Report Grievance</h2>
 
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Accused Individual</label>
 <select required className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.accusedId} onChange={e => setGrievanceData({...grievanceData, accusedId: e.target.value})}>
 <option value="" disabled>Select the individual...</option>
 {allProfiles.map(p => (
 <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
 ))}
 </select>
 {mentor && grievanceData.accusedId === mentor.id && (
 <p className="text-[10px] text-rose-500 mt-1.5 font-semibold bg-rose-500/10 p-2 rounded border border-rose-500/20"><i className="fa-solid fa-circle-info mr-1"></i> You are reporting your mentor. This will be escalated directly to the Admin.</p>
 )}
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Category</label>
 <select required className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.category} onChange={e => setGrievanceData({...grievanceData, category: e.target.value})}>
 <option>Academics</option>
 <option>Harassment</option>
 <option>Mentorship Issue</option>
 <option>Disciplinary</option>
 <option>Other</option>
 </select>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Description</label>
 <textarea required rows="4" className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none resize-none" placeholder="Provide full details of the incident..." value={grievanceData.description} onChange={e => setGrievanceData({...grievanceData, description: e.target.value})}></textarea>
 </div>

 <button disabled={isSubmitting} type="submit" className="w-full bg-rose-500 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-lg hover:bg-rose-600 transition-colors mt-2 disabled:opacity-50">
 {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Submit Grievance"}
 </button>
 </form>
 )}

 </div>
 </div>

 {/* RIGHT PANE: History Ledger */}
 <div className="lg:col-span-7 flex flex-col gap-4">
 <div className="flex justify-between items-end mb-1">
 <h2 className="text-base lg:text-lg font-black text-themeText tracking-tight">{activeTab === 'leaves' ? 'Leave History' : 'Grievance History'}</h2>
 </div>

 <div className="flex flex-col gap-3">
 {activeTab === 'leaves' ? (
 leaves.length === 0 ? (
 <div className="w-full py-16 border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] text-center px-4">
 <i className={`fa-solid fa-bed text-4xl lg:text-5xl text-themeTextSec opacity-50 mb-4`}></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>No Leave Requests</h3>
 <p className={`${theme.text.secondary} text-[10px] lg:text-xs mt-2 max-w-xs font-bold uppercase tracking-widest opacity-80`}>You haven't requested any leaves.</p>
</div>
 ) : (
 leaves.map(req => (
 <div key={req.id} className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl rounded-[2rem] border border-black/10 dark:border-white/20 p-4 flex flex-col gap-3`}>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-black text-themeText mb-0.5">{req.start_date} to {req.end_date}</p>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{req.total_days} Day(s)</p>
 </div>
 {getStatusBadge(req.status)}
 </div>
 <p className="text-xs text-themeTextSec font-medium border-l-2 border-black/5 dark:border-white/10 pl-3 py-1">{req.reason}</p>
 {req.admin_remarks && (
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-2.5 rounded-lg border border-black/5 dark:border-white/10 mt-1">
 <p className="text-[9px] font-black uppercase tracking-widest text-themeAccent mb-1">Faculty Remarks</p>
 <p className="text-xs text-themeText">{req.admin_remarks}</p>
 </div>
 )}
 </div>
 ))
 )
 ) : (
 grievances.length === 0 ? (
 <div className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl rounded-[2rem] border border-black/10 dark:border-white/20 p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No grievances reported.</p>
 </div>
 ) : (
 grievances.map(grievance => (
 <div key={grievance.id} className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl rounded-[2rem] border-rose-500/20 border p-4 flex flex-col gap-3`}>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{grievance.category}</p>
 <p className="text-xs font-bold text-themeText">Against: {grievance.profiles?.full_name}</p>
 </div>
 {getStatusBadge(grievance.status)}
 </div>
 <p className="text-xs text-themeTextSec font-medium border-l-2 border-rose-500/30 pl-3 py-1">{grievance.description}</p>
 {grievance.resolution_notes && (
 <div className="bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 mt-1">
 <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Resolution Notes</p>
 <p className="text-xs text-themeText">{grievance.resolution_notes}</p>
 </div>
 )}
 </div>
 ))
 )
 )}
 </div>
 </div>

 </div>
 )}
 </div>
 </div>
 );
}
/* © 2026 JSM VALOR. All Rights Reserved. */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import { sendSystemEmail } from '../../../lib/EmailService';
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

export default function FacultyApprovals({ isEmbedded = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState("mentee_leaves"); // 'mentee_leaves', 'mentee_grievances', 'report_grievance'
 const [isLoading, setIsLoading] = useState(true);
 const [isProcessing, setIsProcessing] = useState(false);

 // Data
 const [leaves, setLeaves] = useState([]);
 const [grievances, setGrievances] = useState([]);
 const [internships, setInternships] = useState([]);
 const [allProfiles, setAllProfiles] = useState([]);

 // Faculty Grievance Form (Goes to Admin)
 const [grievanceData, setGrievanceData] = useState({ accusedId: "",
 category: "Academics",
 description: ""
 });

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 try {
 setIsLoading(true);

  // Fetch mentees of this faculty
  const { data: menteeData } = await supabase.from('mentorship').select('student_id').eq('faculty_id', userSession.db_id);
  const menteeIds = (menteeData || []).map(m => m.student_id).filter(Boolean);

  const [
  { data: leavesData },
  { data: grievancesData },
  { data: internshipsData },
  { data: profilesData }
  ] = await Promise.all([
  // Fetch leaves from mentees
  menteeIds.length > 0
    ? supabase.from('leave_requests')
      .select('*, profiles!leave_requests_student_id_fkey(full_name, erp_id)')
      .in('student_id', menteeIds)
      .order('created_at', { ascending: false })
    : Promise.resolve({ data: [] }),
  
  // Fetch grievances assigned to this faculty
  supabase.from('grievances')
  .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name, role), accused:profiles!grievances_accused_id_fkey(full_name, role)')
  .eq('assigned_to', userSession.db_id)
  .order('created_at', { ascending: false }),
  
  // Fetch internships from mentees
  menteeIds.length > 0
    ? supabase.from('noc_requests')
      .select('*')
      .in('student_id', menteeIds)
      .order('applied_on', { ascending: false })
    : Promise.resolve({ data: [] }),

  // Fetch profiles for the "Report Grievance" dropdown
  supabase.from('profiles').select('id, full_name, role').neq('id', userSession.db_id).neq('role', 'admin')
  ]);

 setLeaves(leavesData || []);
 setGrievances(grievancesData || []);
 setInternships(internshipsData || []);
 setAllProfiles(profilesData || []);

 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsLoading(false);
 }
 };

 const handleLeaveAction = async (leaveId, newStatus, remarks = "") => {
 setIsProcessing(true);
 try {
 const leave = leaves.find(l => l.id === leaveId);

 const { error } = await supabase
 .from('leave_requests')
 .update({ status: newStatus, admin_remarks: remarks, reviewed_at: new Date().toISOString() })
 .eq('id', leaveId);
 
 if (error) throw error;


 // Notify the student
 if (leave) {
 await supabase.from('admin_notices').insert({
 title: `Leave Request ${newStatus.toUpperCase()}`,
 content: `Your leave request for ${new Date(leave.created_at).toLocaleDateString()} has been ${newStatus}. ${remarks ? `Remarks: ${remarks}` : ''}`,
 author_id: userSession.db_id,
 target_audience: ['person'],
 target_id: leave.profiles?.erp_id
 });
 
 // Fire LEAVE_APPROVED or LEAVE_REJECTED emails
 (async () => {
    try {
        const studentId = leave.student_id;
        const { data: student } = await supabase.from('profiles').select('full_name, email').eq('id', studentId).single();
        const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', studentId).maybeSingle();
        let parentEmail = null;
        if (mapping && mapping.parent_id) {
            const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).maybeSingle();
            parentEmail = parent?.email;
        }

        const template = newStatus === 'approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
        const params = {
            student_name: student?.full_name || 'Student',
            leave_type: leave.leave_type || 'Leave',
            start_date: leave.start_date,
            end_date: leave.end_date,
            reason: remarks || '',
            approved_by: userSession.name,
            rejected_by: userSession.name,
            portal_link: window.location.origin + '/login'
        };

        if (student?.email) sendSystemEmail(template, { ...params, to_email: student.email }).catch(e=>e);
        if (parentEmail) sendSystemEmail(template, { ...params, to_email: parentEmail }).catch(e=>e);
    } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 })();


 // SYNC TO ATTENDANCE ENGINE IF APPROVED
 if (newStatus === 'approved' && leave.student_id) {
 const { data: profile } = await supabase.from('profiles').select('academic_batch').eq('id', leave.student_id).single();
 if (profile?.academic_batch) {
 const start = new Date(leave.start_date);
 const end = new Date(leave.end_date);
 const daysOfWeek = [];
 for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
 daysOfWeek.push(d.toLocaleDateString('en-US', { weekday: 'long' }));
 }
 
 const { data: slots } = await supabase
 .from('class_schedule')
 .select('id')
 .eq('batch', profile.batch || profile.academic_batch)
 .in('day_of_week', [...new Set(daysOfWeek)]);

 if (slots && slots.length > 0) {
 // (Attendance records are handled by the attendance engine natively; no need to prepopulate legacy table)
 }
 }
 }
 }

 window.erpDialog.alert(`Leave request has been ${newStatus}.`);
 fetchData();
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsProcessing(false);
 }
 };

 const handleGrievanceAction = async (grievanceId, newStatus, notes = "") => {
 setIsProcessing(true);
 try {
 const { error } = await supabase
 .from('grievances')
 .update({ status: newStatus, 
 resolution_notes: notes, 
 resolved_at: newStatus === 'resolved' || newStatus === 'dismissed' ? new Date().toISOString() : null 
 })
 .eq('id', grievanceId);
 
 if (error) throw error;
 window.erpDialog.alert(`Grievance marked as ${newStatus}.`);
 fetchData();
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsProcessing(false);
 }
 };

 const handleInternshipAction = async (id, action) => {
 setIsProcessing(true);
 let newStatus = action === 'approve' ? 'approved_by_mentor' : action === 'forward' ? 'forwarded_to_admin' : 'rejected';
 try {
 const { error } = await supabase.from('noc_requests').update({ status: newStatus }).eq('id', id);
 if (error) throw error;
 window.erpDialog.alert(`Internship application ${newStatus.replace(/_/g, ' ')}.`);
 fetchData();
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally { setIsProcessing(false); }
 };

 const submitFacultyGrievance = async (e) => {
 e.preventDefault();
 setIsProcessing(true);
 try {
 // Faculty grievances always go to admin (assigned_to = null triggers admin policies)
 const payload = {
 reporter_id: userSession.db_id,
 accused_id: grievanceData.accusedId,
 assigned_to: null, 
 category: grievanceData.category,
 description: grievanceData.description,
 status: 'pending'
 };

 const { error } = await supabase.from('grievances').insert([payload]);
 if (error) throw error;

 window.erpDialog.alert("Grievance submitted successfully. It has been escalated directly to the Admin.");
 setGrievanceData({ accusedId: "", category: "Academics", description: "" });
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsProcessing(false);
 }
 };

 const getStatusBadge = (status) => {
 if (!status) return null;
 switch(status.toLowerCase()) {
 case 'approved':
 case 'resolved':
 return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{status}</span>;
 case 'rejected':
 case 'dismissed':
 return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20">{status}</span>;
 case 'investigating':
 return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">{status}</span>;
 default:
 return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">{status}</span>;
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 
 {/* Header */}
 <PageHeader icon="fa-solid fa-stamp" title="Approvals & Disciplinary" subtitle="Manage mentee leave requests and investigate grievances." rightContent={<div className="flex bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-1.5 rounded-xl border border-themeBorder dark:border-white/5 w-fit relative z-10 overflow-x-auto max-w-full">
 <button type="button" 
 onClick={() => setActiveTab('mentee_leaves')}
 className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-[15px] font-semibold tracking-normal transition ${activeTab === 'mentee_leaves' ? 'bg-themeAccent text-themeText' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Mentee Leaves
 </button>
 <button type="button" 
 onClick={() => setActiveTab('mentee_grievances')}
 className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-[15px] font-semibold tracking-normal transition ${activeTab === 'mentee_grievances' ? 'bg-amber-500 text-neutral-900' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Mentee Grievances
 </button>
 <button type="button" 
 onClick={() => setActiveTab('mentee_internships')}
 className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-[15px] font-semibold tracking-normal transition ${activeTab === 'mentee_internships' ? 'bg-blue-500 text-white' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Mentee Internships
 </button>
 <button type="button" 
 onClick={() => setActiveTab('report_grievance')}
 className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-[15px] font-semibold tracking-normal transition ${activeTab === 'report_grievance' ? 'bg-rose-500 text-themeText dark:text-white' : 'text-themeTextSec hover:text-themeText'}`}
 >
 Report Grievance
 </button>
 </div>} />

 {/* Tabs */}
 

 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-20 opacity-50">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
 <span className="text-[15px] font-semibold tracking-normal text-themeText">Loading Ledgers...</span>
 </div>
 ) : (
 <div className="relative z-10">
 
 {activeTab === 'mentee_leaves' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {leaves.length === 0 ? (
 <div className={`col-span-full bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No leave requests pending from mentees.</p>
 </div>
 ) : (
 leaves.map(req => (
 <div key={req.id} className={`bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-5 flex flex-col gap-4 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-themeAccent"></div>
 <div className="flex justify-between items-start pl-2">
 <div>
 <p className="text-[15px] font-semibold text-themeText mb-0.5">{req.profiles?.full_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">{req.start_date} to {req.end_date}</p>
 </div>
 {getStatusBadge(req.status)}
 </div>
 
 <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
 <p className="text-xs text-themeText italic">"{req.reason}"</p>
 </div>

 {req.status === 'pending' ? (
 <div className="flex gap-2 mt-auto">
 <SlideCommit
                label="Slide to Approve"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={() => handleLeaveAction(req.id, 'approved', 'Approved by mentor')}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 <button type="button" onClick={() => {
 const reason = window.prompt("Reason for rejection:");
 if(reason) handleLeaveAction(req.id, 'rejected', reason);
 }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
 </div>
 ) : (
 <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Your Remarks</p>
 <p className="text-xs text-themeText">{req.admin_remarks || "N/A"}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'mentee_grievances' && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {grievances.length === 0 ? (
 <div className={`col-span-full bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No active grievances assigned to you.</p>
 </div>
 ) : (
 grievances.map(g => (
 <div key={g.id} className={`bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-5 flex flex-col gap-4 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
 
 <div className="flex justify-between items-start pl-2">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">{g.category}</span>
 </div>
 <p className="text-xs font-bold text-themeText mt-2">Reporter: {g.reporter?.full_name}</p>
 <p className="text-xs font-bold text-rose-400">Against: {g.accused?.full_name} ({ g.accused?.role})</p>
 </div>
 {getStatusBadge(g.status)}
 </div>

 <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
 <p className="text-xs text-themeText">"{g.description}"</p>
 </div>

 {g.status === 'pending' || g.status === 'investigating' ? (
 <div className="flex flex-wrap gap-2 mt-auto">
 {g.status === 'pending' && (
 <button type="button" onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={isProcessing} className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Start Investigation</button>
 )}
 <button type="button" onClick={() => {
 const notes = window.prompt("Resolution details:");
 if(notes) handleGrievanceAction(g.id, 'resolved', notes);
 }} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Resolve</button>
 <button type="button" onClick={() => {
 const notes = window.prompt("Reason for dismissal:");
 if(notes) handleGrievanceAction(g.id, 'dismissed', notes);
 }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Dismiss</button>
 </div>
 ) : (
 <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Resolution Notes</p>
 <p className="text-xs text-themeText">{g.resolution_notes || "N/A"}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'mentee_internships' && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {internships.length === 0 ? (
 <div className={`col-span-full bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No active internship applications from mentees.</p>
 </div>
 ) : (
 internships.map(i => {
 const student = allProfiles.find(p => p.id === i.student_id);
 return (
 <div key={i.id} className={`bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl  p-5 flex flex-col gap-4 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 
 <div className="flex justify-between items-start pl-2">
 <div>
 <p className="text-xs font-bold text-themeText mb-1">Student: {student?.full_name || 'Unknown'}</p>
 <p className="text-sm font-black text-themeText">{i.company_name}</p>
 <p className="text-xs text-themeTextSec">{i.duration}</p>
 </div>
 {getStatusBadge(i.status)}
 </div>

 <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
 <a href={i.offer_letter_path} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-2">
 <i className="fa-brands fa-google-drive"></i> View Offer Letter / Details
 </a>
 </div>

 {i.status === 'pending_mentor' ? (
 <div className="flex flex-wrap gap-2 mt-auto">
 <button type="button" onClick={() => handleInternshipAction(i.id, 'approve')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Approve</button>
 <button type="button" onClick={() => handleInternshipAction(i.id, 'forward')} disabled={isProcessing} className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Fwd to Admin</button>
 <button type="button" onClick={() => handleInternshipAction(i.id, 'reject')} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
 </div>
 ) : (
 <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Status Overview</p>
 <p className="text-xs text-themeText capitalize">{i.status.replace(/_/g, ' ')}</p>
 </div>
 )}
 </div>
 )})
 )}
 </div>
 )}

 {activeTab === 'report_grievance' && (
 <div className="max-w-2xl mx-auto">
 <form onSubmit={submitFacultyGrievance} className={`bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl rounded-themePanel border-rose-500/30 border p-6 lg:p-8 flex flex-col gap-5`}>
 <div>
 <h2 className="text-xl font-semibold tracking-tight text-rose-500 mb-1"><i className="fa-solid fa-gavel mr-2"></i> Report Misconduct</h2>
 <p className="text-xs text-themeTextSec">Grievances filed by Faculty are immediately escalated to the Administration.</p>
 </div>
 
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-1.5">Accused Individual (Student or Colleague)</label>
 <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.accusedId} onChange={e => setGrievanceData({ ...grievanceData, accusedId: e.target.value})}>
 <option value="" disabled>Select the individual...</option>
 {allProfiles.map(p => (
 <option key={p.id} value={p.id}>{p.full_name} ({ p.role.toUpperCase()})</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-1.5">Category</label>
 <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.category} onChange={e => setGrievanceData({ ...grievanceData, category: e.target.value})}>
 <option>Disciplinary</option>
 <option>Academic Misconduct</option>
 <option>Harassment</option>
 <option>Other</option>
 </select>
 </div>

 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-1.5">Description of Incident</label>
 <textarea required rows="5" className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none resize-none" placeholder="Provide full details. The administration will review this confidentially." value={grievanceData.description} onChange={e => setGrievanceData({ ...grievanceData, description: e.target.value})}></textarea>
 </div>

 <button disabled={isProcessing} type="submit" className="w-full bg-rose-500 text-themeText dark:text-white font-black tracking-normal text-sm py-4 rounded-lg hover:bg-rose-600 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
 {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Submit to Administration"}
 </button>
 </form>
 </div>
 )}

 </div>
 )}
 </div>
 </div>
 );
}
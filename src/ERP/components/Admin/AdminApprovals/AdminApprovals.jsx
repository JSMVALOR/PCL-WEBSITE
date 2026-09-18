/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminApprovals({}) {
 const [facultyLeaves, setFacultyLeaves] = useState([]);
  const handleLeaveAction = ({ isEmbedded = false }) => {};
  const [activeTab, setActiveTab] = useState("profile_updates"); // 'faculty_leaves', 'escalated_grievances'
 const [isLoading, setIsLoading] = useState(true);
 const [isProcessing, setIsProcessing] = useState(false);

 // Data
 const [timetableRequests, setTimetableRequests] = useState([]);
 const [grievances, setGrievances] = useState([]);
 const [pendingDocuments, setPendingDocuments] = useState([]);
 const [profileUpdates, setProfileUpdates] = useState([]);

 const fetchData = useCallback(async () => {
 try {
 setIsLoading(true);

 const [
 { data: timetableData },
 { data: grievancesData },
 { data: documentsData },
 { data: profileUpdatesData }
 ] = await Promise.all([
 supabase.from('timetable_requests').select('*, faculty:profiles(full_name), subject:subjects(name)').order('created_at', { ascending: false }),
 supabase.from('grievances').select('*, reporter:profiles!grievances_reporter_id_fkey(full_name, role), accused:profiles!grievances_accused_id_fkey(full_name, role)').is('assigned_to', null).order('created_at', { ascending: false }),
 supabase.from('student_documents').select('*, profiles(full_name, erp_id)').eq('status', 'pending').order('created_at', { ascending: false }),
 supabase.from('profile_update_requests').select('*, profiles(full_name, erp_id)').eq('status', 'pending').order('created_at', { ascending: false })
 ]);

 
 setTimetableRequests(timetableData || []);
 setGrievances(grievancesData || []);
 setPendingDocuments(documentsData || []);
 setProfileUpdates(profileUpdatesData || []);

 } catch (error) {
 console.error("Error fetching admin approvals data:", error);
 } finally {
 setIsLoading(false);
 }
 }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


 const handleTimetableAction = async (id, newStatus, requestDetails = null) => {
        setIsProcessing(true);
        try {
            // 1. Mark the request as Approved/Rejected
            const { error } = await supabase
                .from('timetable_requests')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;

            // 2. If Approved and it's a Reschedule, actually modify the class_schedule master grid!
            if (newStatus === 'Approved' && requestDetails && requestDetails.request_type === 'Reschedule' && requestDetails.schedule_id) {
                // Calculate the new day of the week from the requested_date
                const newDayOfWeek = new Date(requestDetails.requested_date).getDay();
                
                const { error: schedError } = await supabase
                    .from('class_schedule')
                    .update({
                        day_of_week: newDayOfWeek,
                        start_time: requestDetails.requested_start_time,
                        end_time: requestDetails.requested_end_time
                    })
                    .eq('id', requestDetails.schedule_id);
                
                if (schedError) throw schedError;
            }

            window.erpDialog?.alert(`Timetable request marked as ${newStatus} ${newStatus === 'Approved' ? 'and slot reassigned.' : ''}`);
            fetchData();
        } catch (error) {
            console.error("Error updating timetable request:", error);
            window.erpDialog?.alert("Failed to process timetable request.");
        } finally {
            setIsProcessing(false);
        }
    };

 const handleGrievanceAction = async (grievanceId, newStatus, notes = "") => {
 setIsProcessing(true);
 try {
 const { error } = await supabase
 .from('grievances')
 .update({ 
 status: newStatus, 
 resolution_notes: notes, 
 resolved_at: newStatus === 'resolved' || newStatus === 'dismissed' ? new Date().toISOString() : null 
 })
 .eq('id', grievanceId);
 
 if (error) throw error;

 // Notify Requester
 const grievanceData = error ? null : (await supabase.from('grievances').select('reporter_id, category').eq('id', grievanceId).single()).data;
 if (grievanceData && grievanceData.reporter_id) {
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: `Grievance Update`,
 category: 'System Alert',
 target_audience: 'person',
 target_id: grievanceData.reporter_id,
 priority: 'high',
 content: `Your grievance regarding ${grievanceData.category} has been marked as ${newStatus}.`,
 author_name: 'Admin',
 author_id: null
 }]);
 }
 window.erpDialog.alert(`Escalated grievance marked as ${newStatus}.`);
 fetchData();
 } catch (error) {
 console.error("Error updating grievance:", error);
 window.erpDialog.alert("Failed to process grievance.");
 } finally {
 setIsProcessing(false);
 }
 };

 const handleDocumentAction = async (docId, newStatus) => {
 setIsProcessing(true);
 try {
 const { error } = await supabase
 .from('student_documents')
 .update({ status: newStatus })
 .eq('id', docId);
 
 if (error) throw error;

 // Notify Requester
 const docData = error ? null : (await supabase.from('student_documents').select('profile_id, document_type').eq('id', docId).single()).data;
 if (docData && docData.profile_id) {
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: `Document ${newStatus}`,
 category: 'System Alert',
 target_audience: 'person',
 target_id: docData.profile_id,
 priority: 'normal',
 content: `Your uploaded document (${docData.document_type}) has been ${newStatus}.`,
 author_name: 'Admin',
 author_id: null
 }]);
 }
 window.erpDialog.alert(`Document marked as ${newStatus}.`);
 fetchData();
 } catch (error) {
 console.error("Error updating document:", error);
 window.erpDialog.alert("Failed to process document verification.");
 } finally {
 setIsProcessing(false);
 }
 };

 const handleDocumentPreview = async (filePath) => {
 if (!filePath) return;
 if (filePath.startsWith('http')) {
 window.open(filePath, '_blank');
 return;
 }
 try {
 const { data, error } = await supabase.storage.from('digital_locker_vault').createSignedUrl(filePath, 60);
 if (error) throw error;
 if (data?.signedUrl) {
 window.open(data.signedUrl, '_blank');
 }
 } catch (e) {
 console.error(e);
 window.erpDialog?.alert("Failed to load document preview.");
 }
 };

 const handleProfileUpdateAction = async (request, newStatus, remarks = "") => {
 setIsProcessing(true);
 try {
 if (newStatus === 'approved') {
 // Apply changes to profiles table
 const { error: profileError } = await supabase
 .from('profiles')
 .update({
 phone: request.requested_changes?.phone,
 blood_group: request.requested_changes?.blood_group,
 dob: request.requested_changes?.dob,
 avatar_url: request.requested_changes?.avatar_url,
 questionnaire_data: request.requested_changes?.questionnaire_data
 })
 .eq('id', request.student_id);
 
 if (profileError) throw profileError;
 }

 const { error: updateError } = await supabase
 .from('profile_update_requests')
 .update({ status: newStatus, admin_remarks: remarks })
 .eq('id', request.id);
 
 if (updateError) throw updateError;

 // Notify Requester
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: `Profile Update ${newStatus}`,
 category: 'System Alert',
 target_audience: 'person',
 target_id: request.student_id,
 priority: 'normal',
 content: `Your profile update request has been ${newStatus}. ${remarks ? 'Remarks: ' + remarks : ''}`,
 author_name: 'Admin',
 author_id: null
 }]);

 window.erpDialog.alert(`Profile update request marked as ${newStatus}.`);
 fetchData();
 } catch (error) {
 console.error("Error updating profile request:", error);
 window.erpDialog.alert("Failed to process profile update request.");
 } finally {
 setIsProcessing(false);
 }
 };

 const getStatusBadge = (status) => {
 switch(status?.toLowerCase()) {
 case 'approved':
 case 'resolved':
 return <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[13px] font-medium border-emerald-500/30 border">{status}</span>;
 case 'rejected':
 case 'dismissed':
 return <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-[13px] font-medium border-rose-500/30 border">{status}</span>;
 case 'investigating':
 return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[13px] font-medium border-blue-500/30 border">{status}</span>;
 default:
 return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[13px] font-medium border-amber-500/30 border">{status || 'pending'}</span>;
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 {/* Header and Tabs */}
 <PageHeader icon="fa-solid fa-scale-balanced" title="Central Approvals Center" subtitle="Manage student profile changes, mentor requests, faculty leaves, and document verifications." />
 
 {/* Tabs */}
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themePanel/85 backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium">
 <button type="button" 
 onClick={() => setActiveTab('profile_updates')}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${activeTab === 'profile_updates' ? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'}`}
 >
 Profile & Mentors
 </button>
 <button type="button" 
 onClick={() => setActiveTab('timetable_reschedules')}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${activeTab === 'timetable_reschedules' ? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'}`}
 >
 Timetable Reschedules
 </button>
 <button type="button" 
 onClick={() => setActiveTab('escalated_grievances')}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${activeTab === 'escalated_grievances' ? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'}`}
 >
 Escalated Grievances
 </button>
 <button type="button" 
 onClick={() => setActiveTab('document_verification')}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${activeTab === 'document_verification' ? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'}`}
 >
 Document Verification
 </button>
 </div>


 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-20 opacity-50">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
 <span className="text-[15px] font-semibold tracking-normal text-themeText">Loading Secure Ledgers...</span>
 </div>
 ) : (
 <div className="relative z-10">
 
 {activeTab === 'faculty_leaves' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {facultyLeaves.length === 0 ? (
 <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border border-gray-200 dark:border-white/5 p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No pending leave requests from Faculty.</p>
 </div>
 ) : (
 facultyLeaves.map(req => (
 <div key={req.id} className={`${theme.layout.panel} rounded-themePanel border border-gray-200 dark:border-white/5 p-5 flex flex-col gap-4 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-themeAccent"></div>
 <div className="flex justify-between items-start pl-2">
 <div>
 <p className="text-[15px] font-semibold text-themeText mb-0.5">{req.faculty_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">{req.start_date} to {req.end_date}</p>
 </div>
 {getStatusBadge(req.status)}
 </div>
 
 <div className="flex gap-2">
 <span className="bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 px-2.5 py-1 rounded text-[12px] font-medium text-themeTextSec">{req.leave_type}</span>
 <span className="bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 px-2.5 py-1 rounded text-[12px] font-medium text-themeTextSec">{req.total_days} Days</span>
 </div>

 <div className="bg-themeElevated/90 backdrop-blur-2xl p-3 rounded-lg border border-gray-200 dark:border-white/5">
 <p className="text-xs text-themeText italic">"{req.reason}"</p>
 </div>

 {req.status === 'pending' ? (
 <div className="flex gap-2 mt-auto">
 <button type="button" onClick={() => handleLeaveAction(req.id, 'approved', 'Approved by Administration')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-gray-900 dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Approve</button>
 <button type="button" onClick={async () => { const reason = await window.erpDialog.prompt("Reason for rejection:", "Input Required");
 if(reason) handleLeaveAction(req.id, 'rejected', reason);
 }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
 </div>
 ) : (
 <div className="mt-auto border-t-theme border-black/5 dark:border-white/10 pt-3">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Admin Remarks</p>
 <p className="text-xs text-themeText">{req.admin_remarks || "N/A"}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'escalated_grievances' && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {grievances.length === 0 ? (
 <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border border-gray-200 dark:border-white/5 p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No escalated grievances require admin attention.</p>
 </div>
 ) : (
 grievances.map(g => (
 <div key={g.id} className={"bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl border-rose-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden"}>
 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
 
 <div className="flex justify-between items-start pl-2">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="text-[13px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Escalated: {g.category}</span>
 </div>
 <p className="text-xs font-bold text-themeText mt-2">Reporter: {g.reporter?.full_name} ({g.reporter?.role})</p>
 <p className="text-xs font-bold text-rose-400">Against: {g.accused?.full_name} ({g.accused?.role})</p>
 </div>
 {getStatusBadge(g.status)}
 </div>

 <div className="bg-themeElevated/90 backdrop-blur-2xl p-3 rounded-lg border border-gray-200 dark:border-white/5">
 <p className="text-xs text-themeText">"{g.description}"</p>
 </div>

 {g.status === 'pending' || g.status === 'investigating' ? (
 <div className="flex flex-wrap gap-2 mt-auto">
 {g.status === 'pending' && (
 <button type="button" onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={isProcessing} className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-gray-900 dark:text-white border border-blue-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Start Investigation</button>
 )}
 <button type="button" onClick={async () => { const notes = await window.erpDialog.prompt("Resolution details:", "Input Required");
 if(notes) handleGrievanceAction(g.id, 'resolved', notes);
 }} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-gray-900 dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Resolve</button>
 <button type="button" onClick={async () => { const notes = await window.erpDialog.prompt("Reason for dismissal:", "Input Required");
 if(notes) handleGrievanceAction(g.id, 'dismissed', notes);
 }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Dismiss</button>
 </div>
 ) : (
 <div className="mt-auto border-t-theme border-black/5 dark:border-white/10 pt-3">
 <p className="text-[12px] font-medium text-themeTextSec mb-1">Admin Resolution Notes</p>
 <p className="text-xs text-themeText">{g.resolution_notes || "N/A"}</p>
 </div>
 )}
 </div>
 ))
 )}
 </div>
 )}
 {activeTab === 'document_verification' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {pendingDocuments.length === 0 ? (
 <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border border-gray-200 dark:border-white/5 p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No pending documents require verification.</p>
 </div>
 ) : (
 pendingDocuments.map(doc => (
 <div key={doc.id} className={"bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl border-blue-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden"}>
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 
 <div className="flex justify-between items-start pl-2">
 <div>
 <p className="text-[15px] font-semibold text-themeText line-clamp-1" title={doc.document_name}>{doc.document_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec mt-0.5">{doc.profiles?.full_name} ({doc.profiles?.erp_id})</p>
 </div>
 {getStatusBadge(doc.status)}
 </div>

 <div className="flex gap-2">
 <span className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-2.5 py-1 rounded text-[12px] font-medium text-themeTextSec">{doc.document_type}</span>
 <span className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-2.5 py-1 rounded text-[12px] font-medium text-themeTextSec">{doc.file_size_kb} KB</span>
 </div>

 <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t-theme border-black/5 dark:border-white/10">
 <button type="button" 
 onClick={() => handleDocumentPreview(doc.file_path)} 
 disabled={isProcessing} 
 className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] hover:opacity-80 text-themeText py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors mb-2"
 >
 Preview Document
 </button>
 <div className="flex w-full gap-2">
 <button type="button" onClick={() => handleDocumentAction(doc.id, 'verified')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-gray-900 dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Verify</button>
 <button type="button" onClick={() => handleDocumentAction(doc.id, 'rejected')} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'profile_updates' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {profileUpdates.length === 0 ? (
 <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border border-gray-200 dark:border-white/5 p-8 text-center opacity-60`}>
 <p className="text-sm font-semibold text-themeTextSec">No pending profile update requests.</p>
 </div>
 ) : (
 profileUpdates.map(req => (
 <div key={req.id} className={"bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl border-amber-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden"}>
 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
 
 <div className="flex justify-between items-start pl-2">
 <div>
 <p className="text-[15px] font-semibold text-themeText mb-0.5">{req.profiles?.full_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">{req.profiles?.erp_id}</p>
 </div>
 {getStatusBadge(req.status)}
 </div>
 
 <div className="bg-themeElevated/90 backdrop-blur-2xl p-3 rounded-lg border border-gray-200 dark:border-white/5">
 <p className="text-[13px] font-medium text-themeTextSec mb-2 border-b border-black/5 dark:border-white/10 pb-1">Requested Changes</p>
 <ul className="text-xs text-themeText flex flex-col gap-1.5">
 {req.requested_changes?.phone && <li><span className="text-themeTextSec">Phone:</span> {req.requested_changes.phone}</li>}
 {req.requested_changes?.blood_group && <li><span className="text-themeTextSec">Blood:</span> {req.requested_changes.blood_group}</li>}
 {req.requested_changes?.dob && <li><span className="text-themeTextSec">DOB:</span> {req.requested_changes.dob}</li>}
 {req.requested_changes?.avatar_url && <li><span className="text-themeTextSec">Avatar:</span> <a href={req.requested_changes.avatar_url} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">View New Image</a></li>}
 {req.requested_changes?.questionnaire_data?.currentAddress && <li><span className="text-themeTextSec">Address:</span> {req.requested_changes.questionnaire_data.currentAddress}</li>}
 {req.requested_changes?.questionnaire_data?.emergencyName && <li><span className="text-themeTextSec">Emergency:</span> {req.requested_changes.questionnaire_data.emergencyName}</li>}
 </ul>
 </div>

 <div className="flex gap-2 mt-auto">
 <button type="button" onClick={() => handleProfileUpdateAction(req, 'approved', 'Approved by Administration')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-gray-900 dark:text-white border border-emerald-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Approve</button>
 <button type="button" onClick={async () => { const remarks = await window.erpDialog.prompt("Reason for rejection:", "Input Required");
 if(remarks) handleProfileUpdateAction(req, 'rejected', remarks);
 }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 py-2 rounded-lg text-[14px] font-medium tracking-normal transition-colors">Reject</button>
 </div>
 </div>
 ))
 )}
 </div>
 )}

 </div>
 )}
 </div>
 </div>
 );
}
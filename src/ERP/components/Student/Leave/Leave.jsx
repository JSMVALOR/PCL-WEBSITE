/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function Leave({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- MAIN STATE ---
 const sessionKey = userSession?.db_id ? `leave_cache_${userSession.db_id}` : null;
 
 const [leaveRequests, setLeaveRequests] = useState(() => {
 if (!sessionKey) return [];
 const cached = sessionStorage.getItem(sessionKey);
 return cached ? JSON.parse(cached) : [];
 });

 // --- MODAL & FORM STATE ---
 const [showRequestModal, setShowRequestModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

 const [leaveType, setLeaveType] = useState("Medical Leave");
 const [fromDate, setFromDate] = useState("");
 const [toDate, setToDate] = useState("");
 const [reason, setReason] = useState("");

 
 const [documentUrl, setDocumentUrl] = useState('');
  const fileInputRef = useRef(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [blackouts, setBlackouts] = useState(() => {
    const cached = sessionStorage.getItem(`stu_blackouts`);
    return cached ? JSON.parse(cached) : [];
  });

 // --- DATA SYNC ENGINE ---
 const fetchLeaveHistory = async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;
 
 try {
 const { data, error } = await supabase
 .from('leave_requests')
 .select('*')
 .eq('student_id', studentId)
 .order('created_at', { ascending: false });

 if (error) throw error;
 
 const fetchedData = data || [];
 setLeaveRequests(fetchedData);
 
 if (sessionKey) {
 sessionStorage.setItem(sessionKey, JSON.stringify(fetchedData));
 }
 } catch (error) {
 console.error("Failed to sync leave history:", error);
 }
 };

 useEffect(() => {
 fetchLeaveHistory();
 }, [userSession]);

 // --- SUBMISSION ENGINE ---
 const handleRequestSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setStatusMessage({ type: "", text: "" });

 try {
 const studentId = userSession?.db_id || userSession?.id;
 
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        throw new Error("End date cannot be before start date.");
      }
      
      // Blackout Dates check
      for (const b of blackouts) {
        const bStart = new Date(b.start_date);
        const bEnd = new Date(b.end_date);
        bStart.setHours(0,0,0,0);
        bEnd.setHours(23,59,59,999);
        
        if (
            (start >= bStart && start <= bEnd) || 
            (end >= bStart && end <= bEnd) || 
            (start <= bStart && end >= bEnd)
        ) {
            throw new Error(`Leaves are locked during this period: ${b.title}`);
        }
      }


 // Calculate exact days
 const diffTime = Math.abs(end - start);
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

 let filePath = null;

 // Store Google Drive link directly
 if (documentUrl) {
 if (!documentUrl.includes('drive.google.com')) {
 throw new Error("Please enter a valid Google Drive link.");
 }
 filePath = documentUrl;
 }

 // Generate Request ID
 const reqId = `LR-${Math.floor(1000 + Math.random() * 9000)}`;

 // Write to Ledger
 const { error: dbError } = await supabase
 .from('leave_requests')
 .insert({
    student_id: studentId,
    start_date: fromDate,
    end_date: toDate,
    total_days: diffDays,
    reason: reason,
    status: 'pending',
    // mentor_id will be mapped if the student has a mentor in the mentorship table, 
    // but for this legacy component we will let the DB or mentor fetch handle it 
    // or just leave it null for Admin review.
});

 if (dbError) throw dbError;

 // Notify Admin
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Leave Request',
 category: 'System Alert',
 target_audience: 'admin',
 priority: 'normal',
 content: `A new leave request (${leaveType}) has been submitted for ${diffDays} days.`,
 author_name: userSession?.name || 'System',
 author_id: studentId
 }]);

 setStatusMessage({ type: "success", text: "Leave application routed to administration." });
 fetchLeaveHistory();

 setTimeout(() => {
 setShowRequestModal(false);
 setStatusMessage({ type: "", text: "" });
 setFromDate(""); setToDate(""); setReason(""); setDocumentUrl('');
 }, 2000);

 } catch (error) {
 console.error("Leave submission failed:", error);
 setStatusMessage({ type: "error", text: error.message || "Failed to submit application." });
 } finally {
 setIsSubmitting(false);
 }
 };

 // --- SECURE DOWNLOAD ENGINE ---
 const downloadProof = async (filePath) => {
 if (filePath && filePath.startsWith('http')) {
 window.open(filePath, '_blank');
 } else {
 // Legacy fallback if old files exist
 try {
 const { data, error } = await supabase.storage.from('administrative_vault').createSignedUrl(filePath, 60);
 if (error) throw error;
 window.open(data.signedUrl, '_blank');
 } catch (err) {
 window.erpDialog?.alert("Unable to access the secure document.");
 }
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 <PageHeader 
 icon="fa-solid fa-calendar-minus"
 title="Leave Applications"
 subtitle="Apply for academic leave. Approved leaves protect your attendance record."
 rightContent={
 <button
 onClick={() => setShowRequestModal(true)}
 className="w-full lg:w-auto bg-amber-500 hover:bg-amber-400 text-[#050505] px-6 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition active:scale-95 flex justify-center items-center gap-2"
 >
 <i className="fa-solid fa-paper-plane"></i> New Request
 </button>
 }
 />

 {/* 2. Important Notice */}
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-4 lg:p-5 rounded-[2rem] flex items-start gap-3 lg:gap-4">
 <i className="fa-solid fa-circle-exclamation text-themeAccent text-base lg:text-lg mt-0.5"></i>
 <p className="text-[10px] lg:text-xs font-medium text-themeAccent/80 leading-relaxed">
 <span className="font-black text-themeAccent uppercase tracking-widest block mb-1">Policy Requirement</span>
 Medical leaves exceeding 2 days require a valid medical certificate. Official Duty leaves require prior approval proof from the faculty-in-charge.
 </p>
 </div>

 {/* 3. Leave History List */}
 <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}><i className="fa-solid fa-clock-rotate-left text-themeTextSec opacity-70 mr-2"></i> Request History</h2>

 {leaveRequests.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border-theme border-dashed border-black/10 dark:border-white/20 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">No Leave Records</h3>
 <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1 lg:mt-2">You have a clean attendance record.</p>
 </div>
 ) : (
 leaveRequests.map((leave) => (
 <div key={leave.id} className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] p-5 lg:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 group`}>

 <div className="flex-1 w-full">
 <div className="flex items-center gap-3 mb-2 lg:mb-3">
 <span className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-2.5 py-1 rounded-md `}>
 {leave.request_id}
 </span>
 </div>
 <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors mb-2 leading-tight">{leave.leave_type}</h3>

 <div className={`flex flex-wrap items-center gap-2 lg:gap-4 text-[10px] lg:text-xs font-semibold ${theme.text.secondary} mb-3`}>
 <span className="flex items-center gap-1.5 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-3 py-1.5 rounded-lg w-full sm:w-auto"><i className="fa-regular fa-calendar text-themeTextSec opacity-70"></i> {new Date(leave.from_date).toLocaleDateString('en-GB')} &rarr; {new Date(leave.to_date).toLocaleDateString('en-GB')}</span>
 <span className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-lg text-themeText font-bold w-full sm:w-auto">{leave.days} Days</span>
 </div>

 {leave.admin_remarks && (
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-3 rounded-[2rem] mt-2 w-full">
 <p className="text-[9px] lg:text-[10px] font-bold text-rose-200"><span className="text-rose-500 uppercase tracking-widest font-black mr-2">Admin Remarks:</span> {leave.admin_remarks}</p>
 </div>
 )}
 </div>

 <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 border-t-theme lg:border-t-0 lg:border-l-theme border-black/10 dark:border-white/20 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
 <div className="flex w-full justify-between lg:flex-col lg:justify-start lg:items-end gap-3">
 <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2 border-theme ${leave.status === 'approved' ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-emerald-400 border-black/5 dark:border-white/10' :
 leave.status === 'rejected' ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-rose-400 border-black/5 dark:border-white/10' :
 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeAccent border-black/5 dark:border-white/10 '
 }`}>
 {leave.status === 'approved' && <i className="fa-solid fa-check"></i>}
 {leave.status === 'rejected' && <i className="fa-solid fa-xmark"></i>}
 {leave.status === 'pending' && <i className="fa-solid fa-clock"></i>}
 {leave.status}
 </span>
 <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest text-right`}>
 Action by: <span className="text-themeText">{leave.approver_name}</span>
 </p>
 </div>
 {leave.document_path && (
 <button onClick={() => downloadProof(leave.document_path)} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 py-2 lg:py-1.5 rounded-lg border border-black/5 dark:border-white/10 w-full lg:w-auto">
 <i className="fa-solid fa-paperclip"></i> View Proof
 </button>
 )}
 </div>
 </div>
 ))
 )}
 </div>

 {/* 4. NEW LEAVE MODAL */}
 {showRequestModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 max-h-[90vh] flex flex-col">

 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-5 lg:p-6 text-themeText relative border-b-theme border-black/10 dark:border-white/20 shrink-0">
 <div className="absolute top-0 right-0 w-48 h-48 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText">Apply for Leave</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.secondary} font-medium`}>This request will be routed to your assigned mentor or HOD.</p>
 </div>
 <button onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeTextSec hover:text-themeText hover:bg-neutral-800 border border-black/5 dark:border-white/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 </div>

 <div className="overflow-y-auto no-scrollbar flex-1">
 <form onSubmit={handleRequestSubmit} className="p-5 lg:p-6 flex flex-col gap-5 lg:gap-6">

 {statusMessage.text && (
 <div className={`p-4 rounded-[2rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-theme animate-fade-in ${statusMessage.type === "success" ? "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10 text-emerald-400" : "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10 text-rose-400"
 }`}>
 <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check-circle" : "fa-triangle-exclamation"}`}></i>
 {statusMessage.text}
 </div>
 )}

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Leave Category</label>
 <div className="relative">
 <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition appearance-none cursor-pointer">
 <option value="Medical Leave">Medical Leave</option>
 <option value="Official Duty">Official Duty (Moot, Sports, etc.)</option>
 <option value="Personal Leave">Personal / Family Leave</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none"></i>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 lg:gap-5">
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>From Date</label>
 <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-3 lg:px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition [color-scheme:dark]" required />
 </div>
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>To Date</label>
 <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-3 lg:px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition [color-scheme:dark]" required />
 </div>
 </div>

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Reason for Leave</label>
 <textarea
 rows="3"
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder="Please provide specific details..."
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition resize-none placeholder:text-neutral-600"
 required
 ></textarea>
 </div>

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Supporting Document (Optional)</label>
 <input
 type="file"
 ref={fileInputRef}
 onChange={e => {
 const file = e.target.files[0];
 if (file && file.size > 5 * 1024 * 1024) {
 window.erpDialog.alert("File size exceeds 5MB limit. Please upload a smaller file.");
 e.target.value = null;
 return;
 }
 setDocumentFile(file);
 }}
 className="hidden"
 accept=".pdf,.jpg,.png"
 />
 <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-black/5 dark:border-white/10 hover:border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 transition-colors rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
 <i className="fa-solid fa-cloud-arrow-up text-2xl lg:text-3xl text-neutral-600 group-hover:text-themeAccent mb-2 lg:mb-3 transition-colors"></i>
 <p className="text-[10px] lg:text-xs font-bold text-themeText">{documentFile ? documentFile.name : "Upload Medical Cert. or Proof"}</p>
 <p className="text-[9px] lg:text-[10px] font-medium text-themeTextSec opacity-70 mt-1">PDF, JPG or PNG (Max 5MB)</p>
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting || !fromDate || !toDate || !reason}
 className={`w-full mt-2 py-4 rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex justify-center items-center gap-2 overflow-hidden group shrink-0 ${isSubmitting || !fromDate || !toDate || !reason
 ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-neutral-600 cursor-not-allowed border border-black/10 dark:border-white/20'
 : 'bg-amber-500 text-[#050505] hover:bg-amber-400 active:scale-[0.98]'
 }`}
 >
 {!isSubmitting && fromDate && toDate && reason && (
 <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
 )}
 {isSubmitting ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
 ) : (
 <><i className="fa-solid fa-paper-plane"></i> Submit Application</>
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
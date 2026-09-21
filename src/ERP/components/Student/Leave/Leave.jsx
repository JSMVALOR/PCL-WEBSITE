/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";


// ═══════════════════════════════════════════════════════════════
// INLINE CALENDAR
// ═══════════════════════════════════════════════════════════════
const InlineCalendar = ({ value, onChange, minDate, maxDate, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currDate, setCurrDate] = useState(value ? new Date(value) : new Date());
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const year = currDate.getFullYear();
    const month = currDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const days = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const handleSelect = (date) => {
        onChange(new Date(date - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white hover:border-amber-500 cursor-pointer transition flex items-center justify-between"
            >
                {value ? new Date(value).toLocaleDateString('en-GB') : placeholder}
                <i className="fa-solid fa-calendar text-themeTextSec dark:text-white/30 pointer-events-none"></i>
            </div>
            {isOpen && (
                <div className="absolute z-[100] top-full mt-2 left-0 w-full bg-white dark:bg-themePanel border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => setCurrDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors text-themeText dark:text-white">
                            <i className="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span className="text-sm font-bold text-themeText dark:text-white tracking-tight">
                            {currDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={() => setCurrDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 transition-colors text-themeText dark:text-white">
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                            <div key={d} className="text-[10px] font-bold text-themeTextSec dark:text-white/40 text-center">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((date, i) => {
                            if (!date) return <div key={i} className="aspect-square"></div>;
                            const isSelected = value && new Date(value).getDate() === date.getDate() && new Date(value).getMonth() === date.getMonth();
                            const isPast = minDate && date < new Date(minDate);
                            const isFuture = maxDate && date > new Date(maxDate);
                            const disabled = isPast || isFuture;
                            
                            return (
                                <button 
                                    key={i} 
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleSelect(date)}
                                    className={`aspect-square flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                                        isSelected 
                                        ? 'bg-amber-500 text-black shadow-md scale-105 z-10' 
                                        : disabled 
                                            ? 'text-themeTextSec dark:text-white/20 opacity-50 cursor-not-allowed'
                                            : 'text-themeText dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Leave({ isEmbedded = false, }) {
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

    const handleWithdraw = async (id) => {
        if (!window.confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            const { error } = await supabase.from('leave_requests').delete().eq('id', id);
            if (error) throw error;
            window.erpDialog?.alert("Leave request withdrawn successfully.");
            fetchLeaveHistory();
        } catch (err) {
            console.error(err);
            window.erpDialog?.alert("Failed to withdraw leave: " + (err?.message || err?.details || JSON.stringify(err)));
        }
    };

    const handleRequestSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setStatusMessage({ type: "", text: "" });

 try {
 const studentId = userSession?.db_id || userSession?.id;
 
      if (!fromDate || !toDate) {
        throw new Error("Please select both dates.");
      }
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) {
        throw new Error("End date cannot be before start date.");
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

    // 1. Fetch Student's Mentor
    const { data: mentorData } = await supabase.from('mentorship').select('faculty_id').eq('student_id', studentId).maybeSingle();
    const activeMentorId = mentorData?.faculty_id || null;

    // Write to Ledger
     const { error: dbError } = await supabase
     .from('leave_requests')
     .insert({ student_id: studentId,
         faculty_id: activeMentorId,
         leave_type: leaveType,
         request_id: reqId,
         start_date: fromDate,
         end_date: toDate,
         from_date: fromDate,
         to_date: toDate,
         days: diffDays,
         reason: reason,
         status: 'pending'
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
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>

 <PageHeader 
 icon="fa-solid fa-calendar-minus"
 title="Leave Applications"
 subtitle="Apply for academic leave. Approved leaves protect your attendance record."
 rightContent={
 <button type="button"
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
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">No Leave Records</h3>
 <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1 lg:mt-2">You have a clean attendance record.</p>
 </div>
 ) : (
  leaveRequests.map((leave) => (
  <div key={leave.id} className={`bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] p-5 lg:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 group`}>

  <div className="flex-1 w-full">
  {leave.request_id && (
  <div className="flex items-center gap-3 mb-2 lg:mb-3">
  <span className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-2.5 py-1 rounded-md `}>
  {leave.request_id}
  </span>
  </div>
  )}
  <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors mb-2 leading-tight">{leave.leave_type || 'Leave Request'}</h3>

  <div className={`flex flex-wrap items-center gap-2 lg:gap-4 text-[10px] lg:text-xs font-semibold ${theme.text.secondary} mb-3`}>
  <span className="flex items-center gap-1.5 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] px-3 py-1.5 rounded-lg w-full sm:w-auto"><i className="fa-regular fa-calendar text-themeTextSec opacity-70"></i> {leave.from_date ? new Date(leave.from_date).toLocaleDateString('en-GB') : leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-GB') : '—'} &rarr; {leave.to_date ? new Date(leave.to_date).toLocaleDateString('en-GB') : leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-GB') : '—'}</span>
  <span className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-lg text-themeText font-bold w-full sm:w-auto">{leave.days || (() => { const s = new Date(leave.start_date || leave.from_date); const e = new Date(leave.end_date || leave.to_date); return Math.ceil(Math.abs(e - s) / 86400000) + 1; })()} Days</span>
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
 {leave.reviewed_at && (
 <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest text-right`}>
 Reviewed: <span className="text-themeText">{new Date(leave.reviewed_at).toLocaleDateString('en-GB')}</span>
 </p>
 )}
 </div>
 {leave.document_path && (
 <button type="button" onClick={() => downloadProof(leave.document_path)} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 py-2 lg:py-1.5 rounded-lg border border-black/5 dark:border-white/10 w-full lg:w-auto">
 <i className="fa-solid fa-paperclip"></i> View Proof
 </button>
 )}
 {leave.status === 'pending' && (
 <button type="button" onClick={() => handleWithdraw(leave.id)} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-400/80 flex items-center justify-center gap-1.5 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 lg:py-1.5 rounded-lg border border-rose-500/20 w-full lg:w-auto mt-2 lg:mt-0">
 <i className="fa-solid fa-trash-can"></i> Withdraw
 </button>
 )}
 </div>
 </div>
  ))
 )}
 </div>

 {/* 4. NEW LEAVE MODAL */}
 {showRequestModal && (
 <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
 <div className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col max-h-[90vh]">
 
 <div className="p-6 border-b border-white/[0.08] shrink-0 flex justify-between items-start bg-[#161616]">
 <div>
 <h3 className="text-xl font-black tracking-tight mb-1 text-themeText dark:text-white">Apply for Leave</h3>
 <p className="text-[10px] text-themeTextSec dark:text-white/50 font-bold uppercase tracking-widest">Routed to your mentor or HOD.</p>
 </div>
 <button type="button" onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>

 <div className="overflow-y-auto no-scrollbar flex-1 bg-white dark:bg-[#121212]">
 <form onSubmit={handleRequestSubmit} className="p-6 flex flex-col gap-6">

 {statusMessage.text && (
 <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border ${statusMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
 <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check" : "fa-triangle-exclamation"}`}></i>
 {statusMessage.text}
 </div>
 )}

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Leave Category</label>
 <div className="relative">
 <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition appearance-none cursor-pointer">
 <option value="Medical Leave">Medical Leave</option>
 <option value="Official Duty">Official Duty (Moot, Sports, etc.)</option>
 <option value="Personal Leave">Personal / Family Leave</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec dark:text-white/30 pointer-events-none text-xs"></i>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">From Date</label>
 <InlineCalendar value={fromDate} onChange={(d) => { setFromDate(d); if(toDate && new Date(d) > new Date(toDate)) setToDate(d); }} minDate={new Date(new Date().setDate(new Date().getDate() - 7))} placeholder="dd/mm/yyyy" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">To Date</label>
 <InlineCalendar value={toDate} onChange={setToDate} minDate={fromDate || new Date()} placeholder="dd/mm/yyyy" />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Reason for Leave</label>
 <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide specific details..." className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 outline-none transition resize-none placeholder:text-themeTextSec dark:text-white/30" required></textarea>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Supporting Document (Optional)</label>
 <input type="file" ref={fileInputRef} onChange={e => {
 const file = e.target.files[0];
 if (file && file.size > 5 * 1024 * 1024) {
 window.erpDialog.alert("File size exceeds 5MB limit. Please upload a smaller file.");
 e.target.value = null;
 return;
 }
 setDocumentFile(file);
 }} className="hidden" accept=".pdf,.jpg,.png" />
 <div onClick={() => fileInputRef.current.click()} className="bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 hover:border-amber-500/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
 <div className="w-12 h-12 rounded-full bg-white/5 text-themeTextSec dark:text-white/50 group-hover:text-amber-500 flex items-center justify-center mb-3 transition-colors">
 <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
 </div>
 <p className="text-xs font-bold text-themeText dark:text-white mb-1">Upload Medical Cert. or Proof</p>
 <p className="text-[10px] font-medium text-themeTextSec dark:text-white/30 uppercase tracking-widest">PDF, JPG or PNG (Max 5MB)</p>
 {documentFile && (
 <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold flex items-center gap-2">
 <i className="fa-solid fa-file-check"></i> {documentFile.name}
 </div>
 )}
 </div>
 </div>

 <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-4 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
 {isSubmitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <><i className="fa-solid fa-paper-plane"></i> Submit Application</>}
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
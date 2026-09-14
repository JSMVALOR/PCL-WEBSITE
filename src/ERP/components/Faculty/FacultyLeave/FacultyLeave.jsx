/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyLeave({ isEmbedded = false }) {
 const { userSession } = useERP();

 const [leaveHistory, setLeaveHistory] = useState(() => {
 const cached = sessionStorage.getItem(`fac_leaveHistory_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [leavePolicies, setLeavePolicies] = useState(() => {
 const cached = sessionStorage.getItem(`fac_leavePolicies`);
 return cached ? JSON.parse(cached) : [];
 });
 const [blackouts, setBlackouts] = useState(() => {
    const cached = sessionStorage.getItem(`fac_blackouts`);
    return cached ? JSON.parse(cached) : [];
  });
  const [facultyList, setFacultyList] = useState(() => {
 const cached = sessionStorage.getItem(`fac_facultyList`);
 return cached ? JSON.parse(cached) : [];
 });
 
 const [showRequestModal, setShowRequestModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Form State
 const [leaveTypeId, setLeaveTypeId] = useState("");
 const [fromDate, setFromDate] = useState("");
 const [toDate, setToDate] = useState("");
 const [reason, setReason] = useState("");
 const [substituteId, setSubstituteId] = useState("");

 // --- DATA SYNC ENGINE ---
 const fetchLeaveData = async () => {
 if (!userSession?.db_id) return;
 try {
 const [leavesRes, policiesRes, facultyRes] = await Promise.all([
 supabase
 .from('faculty_leaves')
 .select('*, leave_policy:leave_policies(name, color_theme), replacement:profiles!faculty_leaves_replacement_faculty_id_fkey(full_name)')
 .eq('faculty_id', userSession.db_id)
 .order('created_at', { ascending: false }),
 supabase.from('leave_policies').select('*').eq('is_active', true).order('name'),
 supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'faculty').neq('id', userSession.db_id).order('full_name')
 ]);

 if (leavesRes.error) throw leavesRes.error;
 if (policiesRes.error) throw policiesRes.error;
 if (facultyRes.error) throw facultyRes.error;

 if (leavesRes.data) {
 setLeaveHistory(leavesRes.data);
 sessionStorage.setItem(`fac_leaveHistory_${userSession.db_id}`, JSON.stringify(leavesRes.data));
 }
 if (policiesRes.data) {
 setLeavePolicies(policiesRes.data);
 sessionStorage.setItem(`fac_leavePolicies`, JSON.stringify(policiesRes.data));
 }
 if (facultyRes.data) {
 setFacultyList(facultyRes.data);
 sessionStorage.setItem(`fac_facultyList`, JSON.stringify(facultyRes.data));
 }

 if (policiesRes.data?.length > 0 && !leaveTypeId) {
 setLeaveTypeId(policiesRes.data[0].id);
 }
 } catch (error) {
 console.error("Failed to fetch leave data:", error);
 }
 };

 useEffect(() => {
 fetchLeaveData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [userSession]);

 // --- SUBMIT ENGINE ---
 const handleRequestSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);

 try {
 
      const start = new Date(fromDate);
      const end = new Date(toDate);
      if (start > end) throw new Error("End date cannot be before start date.");
      
      // Blackout Dates check
      for (const b of blackouts) {
        const bStart = new Date(b.start_date);
        const bEnd = new Date(b.end_date);
        bStart.setHours(0,0,0,0);
        bEnd.setHours(23,59,59,999);
        
        // If either the requested start or end falls inside the blackout period, or if the request engulfs the blackout period
        if (
            (start >= bStart && start <= bEnd) || 
            (end >= bStart && end <= bEnd) || 
            (start <= bStart && end >= bEnd)
        ) {
            throw new Error(`Leaves are locked during this period: ${b.title}`);
        }
      }


 const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

 const payload = {
 faculty_id: userSession.db_id,
 leave_type_id: leaveTypeId,
 start_date: fromDate,
 end_date: toDate,
 total_days: diffDays,
 reason: reason,
 status: 'Pending',
 replacement_faculty_id: substituteId || null,
 replacement_status: substituteId ? 'Pending' : 'Not Required'
 };

 const { error } = await supabase.from('faculty_leaves').insert([payload]);

 if (error) throw error;

 await fetchLeaveData();
 setShowRequestModal(false);
 setFromDate(""); setToDate(""); setReason(""); setSubstituteId("");
 } catch (error) {
 window.erpDialog?.alert(error.message || "Failed to submit leave request.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const getStatusColor = (status) => {
 switch(status?.toLowerCase()) {
 case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
 case 'cancelled': return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
 default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 }
 };

 const getThemeColorClass = (color) => {
 const map = {
 'amber': 'text-amber-500 bg-amber-500/10',
 'emerald': 'text-emerald-500 bg-emerald-500/10',
 'indigo': 'text-indigo-500 bg-indigo-500/10',
 'blue': 'text-blue-500 bg-blue-500/10',
 'rose': 'text-rose-500 bg-rose-500/10'
 };
 return map[color] || 'text-themeAccent bg-themeAccent/10';
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 {/* Header */}
 {!isEmbedded && (
 <PageHeader rightContent={<button onClick={() => setShowRequestModal(true)} className="px-4 py-2 bg-themeAccent text-white rounded-lg hover:bg-themeAccent/90 transition-colors">Apply for Leave</button>}  
 icon="fa-solid fa-plane-departure"
 title="Time Off & Leaves"
 subtitle="Request and track your faculty leaves."
 />
 )}

 {/* History Ledger */}
 <div className="flex flex-col gap-4">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}>Leave Ledger</h2>

 {leaveHistory.length === 0 ? (
 <div className="w-full py-20 lg:py-24 border-2 border-dashed border-themeBorder rounded-2xl flex flex-col items-center justify-center bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] opacity-70 px-4 text-center">
 <div className="w-20 h-20 bg-themeElevated rounded-full flex items-center justify-center mb-4">
 <i className="fa-solid fa-plane-slash text-3xl lg:text-4xl text-themeTextSec"></i>
 </div>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Leave Requests</h3>
 <p className={`text-xs lg:text-sm font-bold ${theme.text.muted} mt-2`}>You haven't applied for any leaves yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
 {leaveHistory.map((leave) => (
 <div key={leave.id} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] p-5 lg:p-6 rounded-2xl flex flex-col justify-between gap-4 hover:border-black/10 dark:hover:border-white/20 transition-colors">
 <div>
 <div className="flex justify-between items-start mb-4">
 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getThemeColorClass(leave.leave_policy?.color_theme)}`}>
 <i className="fa-solid fa-tag"></i> {leave.leave_policy?.name || 'Unknown Type'}
 </div>
 <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5 border ${getStatusColor(leave.status)}`}>
 {leave.status === 'Approved' && <i className="fa-solid fa-check"></i>}
 {leave.status === 'Rejected' && <i className="fa-solid fa-xmark"></i>}
 {leave.status === 'Pending' && <i className="fa-regular fa-clock"></i>}
 {leave.status === 'Cancelled' && <i className="fa-solid fa-ban"></i>}
 {leave.status}
 </span>
 </div>
 <p className="text-sm text-themeText leading-relaxed mb-4 italic opacity-80">"{leave.reason}"</p>
 
 <div className="grid grid-cols-2 gap-3 mb-4">
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-3 rounded-xl flex flex-col gap-1">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Duration</span>
 <span className="text-sm font-black text-themeText">{new Date(leave.start_date).toLocaleDateString('en-GB')} - {new Date(leave.end_date).toLocaleDateString('en-GB')}</span>
 </div>
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-3 rounded-xl flex flex-col gap-1">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Total Days</span>
 <span className="text-sm font-black text-themeText">{leave.total_days} Days</span>
 </div>
 </div>
 </div>

 {leave.replacement_faculty_id && (
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-3 rounded-xl flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-8 h-8 rounded-full bg-themeAccent/10 text-themeAccent flex items-center justify-center shrink-0">
 <i className="fa-solid fa-user-shield text-xs"></i>
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Requested Substitute</p>
 <p className="text-xs font-black text-themeText truncate">{leave.replacement?.full_name || 'Loading...'}</p>
 </div>
 </div>
 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${leave.replacement_status === 'Assigned' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : leave.replacement_status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'}`}>
 {leave.replacement_status}
 </span>
 </div>
 )}
 {leave.admin_remarks && (
 <div className="mt-2 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
 <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Admin Remarks</p>
 <p className="text-xs text-themeText font-medium">{leave.admin_remarks}</p>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Request Modal */}
 {showRequestModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-themePanel w-full max-w-lg rounded-2xl overflow-hidden border border-themeBorder flex flex-col max-h-[90vh]">
 <div className="p-5 lg:p-6 text-themeText border-b border-themeBorder flex justify-between items-start shrink-0 bg-themeElevated/50 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
 <div className="min-w-0 pr-4 relative z-10">
 <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText truncate">Apply for Time Off</h3>
 <p className={`text-[10px] lg:text-xs text-themeTextSec font-medium truncate`}>All requests require master admin approval.</p>
 </div>
 <button onClick={() => setShowRequestModal(false)} className="relative z-10 w-8 h-8 rounded-full bg-themeElevated hover:bg-rose-500 hover:text-white text-themeTextSec transition-colors flex items-center justify-center shrink-0 border border-themeBorder">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 <form onSubmit={handleRequestSubmit} className="p-5 lg:p-6 flex flex-col gap-4 lg:gap-5 overflow-y-auto no-scrollbar bg-themePanel">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">Leave Policy</label>
 <div className="relative">
 <select required value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none appearance-none cursor-pointer focus:border-themeAccent transition-colors">
 <option value="" disabled>Select Leave Policy</option>
 {leavePolicies.map(p => (
 <option key={p.id} value={p.id}>{p.name} (Max: {p.annual_limit} days)</option>
 ))}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">From Date</label>
 <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors [color-scheme:dark]" required />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">To Date</label>
 <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors [color-scheme:dark]" required />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">Suggest a Substitute (Optional)</label>
 <div className="relative">
 <select value={substituteId} onChange={(e) => setSubstituteId(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none appearance-none cursor-pointer focus:border-themeAccent transition-colors">
 <option value="">No Substitute Suggested</option>
 {facultyList.map(f => (
 <option key={f.id} value={f.id}>{f.full_name} ({f.erp_id})</option>
 ))}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
 </div>
 <p className="text-[9px] text-themeTextSec mt-1.5 ml-1 italic">Suggesting a substitute expedites the approval process for classes.</p>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1">Reason & Remarks</label>
 <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide reason and any class adjustment details..." className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none resize-none focus:border-themeAccent transition-colors" required></textarea>
 </div>

 <button type="submit" disabled={isSubmitting || !fromDate || !toDate || !reason || !leaveTypeId} className={`w-full py-3.5 mt-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition flex justify-center items-center gap-2 ${isSubmitting || !fromDate || !toDate || !reason || !leaveTypeId ? 'bg-themeElevated text-themeTextSec opacity-50 cursor-not-allowed' : 'bg-themeAccent hover:bg-themeAccent/90 text-white hover:-translate-y-0.5'}`}>
 {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane text-base lg:text-lg"></i> Submit Application</>}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
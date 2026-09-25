/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyLeave({ isEmbedded = false, }) {
    const { userSession } = useERP();

    const [leaveHistory, setLeaveHistory] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NEW STATES
    const [isSingleDay, setIsSingleDay] = useState(true);
    const [editingLeaveId, setEditingLeaveId] = useState(null);


    // Form State
    const [leaveType, setLeaveType] = useState("Casual Leave (CL)");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");
    const [substituteId, setSubstituteId] = useState("");
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
    const today = new Date().toISOString().split("T")[0];

    // Calculate Balances
    const currentMonth = new Date().getMonth() + 1;
    const accruedCL = currentMonth;
    
    let usedCL = 0;
    let usedOD = 0;
    let usedWinter = 0;
    let usedSummer = 0;
    
    leaveHistory.forEach(l => {
        if (l.status === 'approved' || l.status === 'pending') {
            const s = new Date(l.from_date);
            const e = new Date(l.to_date);
            const days = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
            
            if (l.leave_type === "Casual Leave (CL)") usedCL += days;
            else if (l.leave_type === "On Duty (OD)") usedOD += days;
            else if (l.leave_type === "Winter Vacation") usedWinter += days;
            else if (l.leave_type === "Summer Vacation") usedSummer += days;
        }
    });



    const handleWithdraw = async (id) => {
        if (!confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            const { error } = await supabase.from('faculty_leaves').delete().eq('id', id);
            if (error) throw error;
            fetchLeaveData();
            if (window.erpDialog) window.erpDialog.alert("Leave request withdrawn successfully.", "success");
            else alert("Leave request withdrawn successfully.");
        } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
    };

    const handleEdit = (leave) => {
        setLeaveType(leave.leave_type);
        setFromDate(leave.from_date);
        setToDate(leave.to_date);
        setReason(leave.reason || "");
        setSubstituteId(leave.replacement_faculty_id || "");
        setIsSingleDay(leave.from_date === leave.to_date);
        setEditingLeaveId(leave.id);
        setShowRequestModal(true);
    };

    const resetForm = () => {
        setLeaveType("Casual Leave (CL)");
        setFromDate("");
        setToDate("");
        setReason("");
        setSubstituteId("");
        setIsSingleDay(true);
        setEditingLeaveId(null);
        setStatusMessage({ type: "", text: "" });
    };

    const openNewRequest = () => {
        resetForm();
        setShowRequestModal(true);
    };

    const fetchLeaveData = async () => {
        if (!userSession?.db_id) return;
        try {
            const { data: history } = await supabase
                .from('faculty_leaves')
                .select('*')
                .eq('faculty_id', userSession.db_id)
                ;
            
            if (history) setLeaveHistory(history);

            const { data: facList } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .eq('role', 'faculty')
                .neq('id', userSession.db_id);
            
            if (facList) setFacultyList(facList);
        } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
    };

    useEffect(() => {
        fetchLeaveData();
    }, [userSession]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: "", text: "" });

        const finalToDate = isSingleDay ? fromDate : toDate;
        
        if (!leaveType || !fromDate || (!isSingleDay && !toDate) || !reason) {
            setStatusMessage({ type: "error", text: "Please fill in all required fields." });
            setIsSubmitting(false);
            return;
        }
        
        // HR Clubbing Rule Validation
        const start = new Date(fromDate);
        const end = new Date(finalToDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Advanced Leave Policy Enforcement
        let usedDays = 0;
        leaveHistory.forEach(l => {
            if (l.leave_type === leaveType && (l.status === 'approved' || l.status === 'pending')) {
                const s = new Date(l.from_date);
                const e = new Date(l.to_date);
                usedDays += Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
            }
        });

        if (leaveType === "Casual Leave (CL)") {
            if (diffDays > 2) {
                setStatusMessage({ type: "error", text: "HR Rule: Maximum 2 Casual Leaves can be combined." });
                setIsSubmitting(false); return;
            }
            const accruedCL = new Date().getMonth() + 1; // 1 per month based on calendar year
            if (usedDays + diffDays > accruedCL) {
                setStatusMessage({ type: "error", text: `HR Rule: Insufficient balance. Accrued: ${accruedCL}, Used/Requested: ${usedDays}.` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "On Duty (OD)") {
            if (usedDays + diffDays > 30) {
                setStatusMessage({ type: "error", text: `HR Rule: OD limit exceeded. Max 30 days/year. Used: ${usedDays}.` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "Winter Vacation") {
            if (usedDays + diffDays > 15) {
                setStatusMessage({ type: "error", text: `HR Rule: Winter Vacation limit exceeded. Max 15 days/year.` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "Summer Vacation") {
            if (usedDays + diffDays > 15) {
                setStatusMessage({ type: "error", text: `HR Rule: Summer Vacation limit exceeded. Max 15 days/year.` });
                setIsSubmitting(false); return;
            }
        } else if (leaveType === "Earned Leave (EL)") {
            // EL is tracked manually via HR backend for encashment, but we allow requesting it.
            // A warning can be placed that it requires 1 year of employment.
            const currentMonth = new Date().getMonth() + 1;
            if (currentMonth !== 5 && currentMonth !== 6) {
                // If they want to ENCASH it, it's May-June. If they want to TAKE it, maybe anytime?
                // We'll just let Admin decide on approval, but warn them.
            }
        }

        try {
            const payload = {
                faculty_id: userSession.db_id,
                leave_type: leaveType,
                from_date: fromDate,
                to_date: finalToDate,
                days: Math.ceil(Math.abs(new Date(finalToDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1,
                reason: reason,
                status: 'pending',
                replacement_faculty_id: substituteId || null,
            };

            let error;
            if (editingLeaveId) {
                const { error: updErr } = await supabase.from('faculty_leaves').update(payload).eq('id', editingLeaveId);
                error = updErr;
            } else {
                const { error: insErr } = await supabase.from('faculty_leaves').insert([payload]);
                error = insErr;
            }
            if (error) throw error;

            setStatusMessage({ type: "success", text: editingLeaveId ? "Leave request updated successfully." : "Leave request submitted successfully." });
            fetchLeaveData();
            setTimeout(() => setShowRequestModal(false), 2000);
        } catch (error) {
            setStatusMessage({ type: "error", text: error.message || "Failed to submit request." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-themeAccent/30 ${!isEmbedded ? "min-h-screen bg-transparent text-themeText font-sans" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
                
                {!isEmbedded && (
                    <PageHeader 
                        icon="fa-solid fa-mug-hot" 
                        title="Leave Applications" 
                        subtitle="Request time off and assign substitutes to ensure academic continuity."
                        rightContent={
                            <button 
                                onClick={openNewRequest}
                                className="px-6 py-2.5 rounded-xl bg-themeAccent text-[var(--bg-color)] font-bold text-xs lg:text-sm hover:bg-themeAccent/90 transition-colors shadow-sm flex items-center gap-2 relative z-10 whitespace-nowrap"
                            >
                                <i className="fa-solid fa-paper-plane"></i> New Request
                            </button>
                        }
                    />
                )}

                {/* Leave History List */}
                <div className="flex flex-col gap-6 mt-4">
                    <h3 className="text-base lg:text-lg font-black tracking-tight text-themeText flex items-center gap-2 lg:gap-3">
                        <i className="fa-solid fa-clock-rotate-left text-themeTextSec text-base lg:text-lg"></i>
                        Request History
                    </h3>

                    {leaveHistory.length === 0 ? (
                        <div className="w-full py-20 lg:py-32 text-center flex flex-col items-center justify-center">
                            <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-600 mb-4 lg:mb-6"></i>
                            <h3 className="text-base lg:text-lg font-black text-themeText mb-1 lg:mb-2 tracking-tight">No Leave Records</h3>
                            <p className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest text-themeTextSec max-w-sm mx-auto`}>You have a clean attendance record.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {leaveHistory.map((leave) => (
                                <div key={leave.id} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-themeAccent/30 transition-colors group">
                                    <div className="flex items-start gap-3 lg:gap-4 w-full lg:w-auto">
                                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 ${
                                            leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                            leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            <i className={`fa-solid ${
                                                leave.status === 'approved' ? 'fa-check' :
                                                leave.status === 'rejected' ? 'fa-xmark' :
                                                'fa-hourglass-half'
                                            } text-base lg:text-lg`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-sm lg:text-base font-black text-themeText mb-1 flex items-center gap-2">
                                                {leave.leave_type}
                                                {leave.leave_type.includes('LOP') && (
                                                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Payroll Deduction</span>
                                                )}
                                            </h4>
                                            <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest">
                                                {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full lg:w-auto border-t lg:border-0 border-black/10 dark:border-white/10 pt-4 lg:pt-0 pl-0 lg:pl-6 lg:border-l flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest w-20">Admin Status:</span>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        
                                        {leave.status === 'pending' && (
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/5 w-full">
                                                <button onClick={() => handleEdit(leave)} className="flex-1 py-1.5 rounded-lg bg-themeAccent/10 text-themeAccent text-[10px] font-black uppercase tracking-widest hover:bg-themeAccent/20 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleWithdraw(leave.id)} className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-colors">
                                                    Withdraw
                                                </button>
                                            </div>
                                        )}

                                        {leave.replacement_faculty_id && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest w-20">Substitute:</span>
                                                <span className="text-[11px] font-bold text-themeText flex items-center gap-1.5">
                                                    <i className="fa-solid fa-user-tie text-themeAccent"></i> {leave.replacement?.full_name || 'Assigned'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODAL */}
 {showRequestModal && (
 <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-fade-in">
 <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl saturate-[1.8] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]">
 
 <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/[0.08] shrink-0 flex justify-between items-start bg-transparent">
 <div>
 <h3 className="text-xl font-black tracking-tight mb-1 text-themeText dark:text-white">New Leave Request</h3>
 <p className="text-[10px] text-themeTextSec dark:text-white/50 font-bold uppercase tracking-widest">Submit details to HOD for approval.</p>
 </div>
 <button type="button" onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>

 <div className="overflow-y-auto no-scrollbar flex-1 bg-transparent p-2">
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
 <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm appearance-none cursor-pointer">
 <option value="Casual Leave (CL)">Casual Leave (CL)</option>
 <option value="Earned Leave (EL)">Earned Leave (EL)</option>
 <option value="On Duty (OD)">On Duty (OD)</option>
 <option value="Winter Vacation">Winter Vacation</option>
 <option value="Summer Vacation">Summer Vacation</option>
 <option value="Loss of Pay (LOP)">Loss of Pay (LOP)</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec dark:text-white/30 pointer-events-none text-xs"></i>
 </div>
 

                            {leaveType && (
                                <div className="mt-2 text-xs font-medium text-themeTextSec dark:text-white/60 bg-black/5 dark:bg-white/5 p-3 rounded-xl flex items-center justify-between border border-black/5 dark:border-white/5">
                                    <span>Available Balance:</span>
                                    <span className="font-bold text-themeText dark:text-white">
                                        {(() => {
                                            let used = 0;
                                            leaveHistory.forEach(l => {
                                                if (l.leave_type === leaveType && (l.status === 'approved' || l.status === 'pending')) {
                                                    const s = new Date(l.from_date);
                                                    const e = new Date(l.to_date);
                                                    used += Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
                                                }
                                            });
                                            if (leaveType === 'Casual Leave (CL)') {
                                                const accrued = new Date().getMonth() + 1;
                                                return `${Math.max(0, accrued - used)} Days (Accrued: ${accrued}/12, Used: ${used})`;
                                            }
                                            if (leaveType === 'On Duty (OD)') return `${Math.max(0, 30 - used)} Days (Used: ${used}/30)`;
                                            if (leaveType === 'Winter Vacation' || leaveType === 'Summer Vacation') return `${Math.max(0, 15 - used)} Days (Used: ${used}/15)`;
                                            if (leaveType === 'Earned Leave (EL)') return `Rollover Based (Used: ${used})`;
                                            if (leaveType === 'Loss of Pay (LOP)') return `Unlimited (Used: ${used})`;
                                            return 'Unknown';
                                        })()}
                                    </span>
                                </div>
                            )}

</div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Start Date</label>
 <input type="date" min={today} max="2026-12-31" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm dark:[color-scheme:dark]" />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">End Date</label>
 <input type="date" max="2026-12-31" required value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate || today} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm dark:[color-scheme:dark]" />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Assign Substitute (Optional)</label>
 <div className="relative">
 <select value={substituteId} onChange={(e) => setSubstituteId(e.target.value)} className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm appearance-none cursor-pointer">
 <option value="">No substitute required</option>
 {facultyList.map(f => (
 <option key={f.id} value={f.id}>{f.full_name}</option>
 ))}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec dark:text-white/30 pointer-events-none text-xs"></i>
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Reason for Leave</label>
 <textarea required rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide details for HOD review..." className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl px-4 py-4 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all shadow-sm resize-none placeholder:text-themeTextSec dark:text-white/30"></textarea>
 </div>

 <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 rounded-2xl bg-amber-500 text-black font-black text-[13px] tracking-wide uppercase hover:bg-amber-400 hover:shadow-[0_0_20px_#f59e0b40] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed">
 {isSubmitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <><i className="fa-solid fa-paper-plane"></i> {editingLeaveId ? "Update Request" : "Submit Request"}</>}
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

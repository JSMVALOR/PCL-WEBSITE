/* © 2026 JSM VALOR. All Rights Reserved. */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generateBeautifulExcel } from '../../../../Shared/utils/ExcelExport';

export default function FacultyStudentProfile360({ mentee, onClose, onSchedule, onViewMarks }) {
 const [achievements, setAchievements] = useState(() => {
 const cached = sessionStorage.getItem(`profile360_achievements_${mentee?.id}`);
 return cached ? JSON.parse(cached) : [];
 });
 
 // For verifying achievements
 const [leaves, setLeaves] = useState([]);
 const [verifyingId, setVerifyingId] = useState(null);
 const [analytics, setAnalytics] = useState(null);
 const [attendance, setAttendance] = useState("Awaiting Data");
 const [remarks, setRemarks] = useState("");
 const [showVerifyModal, setShowVerifyModal] = useState(false);
 const [showCVModal, setShowCVModal] = useState(false);
 const [actionType, setActionType] = useState('verified'); // verified, rejected, revision_requested

 useEffect(() => {
 if (mentee?.id) {
 fetchAchievements();
 fetchLeaves();
 if (mentee.attendance_percentage !== undefined) {
     setAttendance(mentee.attendance_percentage + "%");
 }
 fetchAnalytics();
 }, [mentee]);

 const exportLeavesToCSV = async () => {
    if (!leaves.length) {
        window.erpDialog?.alert("No leaves to export.");
        return;
    }
    const title = "STUDENT LEAVE HISTORY";
    const metaData = [
        { label: "Student Name:", value: mentee.full_name },
        { label: "Student ID:", value: mentee.erp_id || "N/A" },
        { label: "Generated On:", value: new Date().toLocaleDateString() }
    ];
    const columns = ["ID", "Category", "Reason", "From Date", "To Date", "Status", "Requested At"];
    const rows = leaves.map(l => [
        l.id,
        l.category || "General",
        l.reason || "",
        l.from_date,
        l.to_date,
        l.status,
        new Date(l.created_at).toLocaleString()
    ]);
    
    await generateBeautifulExcel(title, metaData, columns, rows, `Leaves_${mentee.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
 };

 const fetchLeaves = async () => {
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('student_id', mentee.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setLeaves(data);
    } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const fetchAnalytics = async () => {
    // academic_analytics table doesn't exist, we use mentee.cgpa directly.
    setAnalytics({ cgpa: mentee?.cgpa || 0 });
 };


 const handleLeaveAction = async (leaveId, newStatus) => {
        try {
            if (!(await window.erpDialog?.confirm(`Are you sure you want to mark this leave as ${newStatus}?`))) return;
            const { error } = await supabase.from('leave_requests').update({ status: newStatus }).eq('id', leaveId);
            if (error) throw error;
            setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: newStatus } : l));
            window.erpDialog?.alert(`Leave has been ${newStatus}.`);
        } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
    };

 const fetchAchievements = async () => {
 try {
 const { data, error } = await supabase
 .from('student_achievements')
 .select('*')
 .eq('student_id', mentee.id)
 .order('date_achieved', { ascending: false });
 if (error) throw error;
 if (data) {
 setAchievements(data);
 sessionStorage.setItem(`profile360_achievements_${mentee.id}`, JSON.stringify(data));
 }
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const handleVerifySubmit = async () => {
 if (!verifyingId) return;
 try {
 const { error } = await supabase
 .from('student_achievements')
 .update({ 
 status: actionType, 
 mentor_remarks: remarks || null,
 is_verified: actionType === 'verified' // keep legacy flag in sync just in case
 })
 .eq('id', verifyingId);
 
 if (error) throw error;
 
 window.erpDialog?.alert(`Achievement marked as ${actionType}.`);
 fetchAchievements();
 setShowVerifyModal(false);
 setRemarks("");
 setVerifyingId(null);
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const openVerifyModal = (id, type) => {
 setVerifyingId(id);
 setActionType(type);
 setRemarks("");
 setShowVerifyModal(true);
 };

 const getStatusBadge = (status, isLegacyVerified) => {
 const s = (status || (isLegacyVerified ? 'verified' : 'pending')).toLowerCase();
 if (s === 'verified') return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><i className="fa-solid fa-check mr-1.5"></i> Verified</span>;
 if (s === 'rejected') return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20"><i className="fa-solid fa-xmark mr-1.5"></i> Rejected</span>;
 if (s === 'revision_requested') return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20"><i className="fa-solid fa-rotate-left mr-1.5"></i> Revision</span>;
 return <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20"><i className="fa-regular fa-clock mr-1.5"></i> Pending</span>;
 };

 const pendingCount = achievements.filter(a => (a.status || (a.is_verified ? 'verified' : 'pending')) === 'pending').length;

 return (
 <>
 <div className="w-full flex flex-col animate-fade-in">
 
 {/* Header Profile */}
 <div className="p-6 lg:p-8 bg-themePanel border-b border-themeBorder flex flex-col gap-6 relative overflow-hidden">
 <div className="absolute -right-10 -top-10 w-40 h-40 bg-themeAccent/10 rounded-full blur-3xl pointer-events-none"></div>
 
 <div className="flex justify-between items-start relative z-10">

 <div className="flex gap-2">
 <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('openMentorshipChat'))} className="px-4 py-2 rounded-lg bg-themeElevated border border-themeBorder text-[10px] font-black text-themeText tracking-normal hover:border-themeAccent transition-colors">
 <i className="fa-regular fa-envelope text-themeAccent mr-2"></i> Message
 </button>
 <button type="button" onClick={onSchedule} className="px-4 py-2 rounded-lg bg-themeElevated border border-themeBorder text-[10px] font-black text-themeText tracking-normal hover:border-themeAccent transition-colors">
 <i className="fa-solid fa-calendar-plus text-themeAccent mr-2"></i> Schedule
 </button>
 </div>
 </div>

 <div className="flex items-center gap-5 relative z-10">
 <div className="w-20 h-20 rounded-2xl bg-themeElevated border-2 border-themeBorder flex items-center justify-center text-themeAccent text-3xl font-semibold tracking-tight">
 {mentee.full_name?.charAt(0)?.toUpperCase()}
 </div>
 <div>
 <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-themeText tracking-tight mb-1">{mentee.full_name}</h2>
 <p className="text-xs font-bold text-themeTextSec tracking-normal flex items-center gap-3">
 <span><i className="fa-solid fa-id-card text-themeAccent/70 mr-1"></i> {mentee.erp_id}</span>
 <span className="w-1 h-1 rounded-full bg-themeBorderStrong"></span>
 <span className="text-emerald-500">Active Mentee</span>
 </p>
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-8 bg-themePanel/85 backdrop-blur-2xl">
 
 {/* Academic Snapshot (Mocked for future DB integration) */}
 <div>
 <h3 className="text-[15px] font-semibold tracking-normal text-themeTextSec mb-4 flex items-center gap-2">
 <i className="fa-solid fa-graduation-cap text-themeAccent"></i> Academic Snapshot & Reports
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-themePanel border border-themeBorder p-4 rounded-xl flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg"><i className="fa-solid fa-clipboard-user"></i></div>
 <div>
 <p className="text-2xl font-semibold tracking-tight text-themeText leading-none mb-1">{attendance}</p>
 <p className="text-[12px] font-medium text-themeTextSec">Overall Attendance</p>
 </div>
 </div>
 <div className="bg-themePanel border border-themeBorder p-4 rounded-xl flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg"><i className="fa-solid fa-chart-line"></i></div>
 <div>
 <p className="text-2xl font-semibold tracking-tight text-themeText leading-none mb-1">{analytics?.cgpa || 'N/A'}</p>
 <p className="text-[12px] font-medium text-themeTextSec">CGPA (Current)</p>
 </div>
 </div>
 
 {/* NEW: Marks and CV Buttons */}
 <button type="button" onClick={() => { if(onViewMarks) onViewMarks(); }} className="bg-themePanel border border-themeBorder p-4 rounded-xl flex items-center justify-between group hover:border-themeAccent transition">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg"><i className="fa-solid fa-marker"></i></div>
      <div className="text-left">
         <p className="text-[14px] font-semibold tracking-tight text-themeText leading-tight mb-0.5 group-hover:text-themeAccent transition">View Marks</p>
         <p className="text-[10px] font-medium text-themeTextSec">Internal & University</p>
      </div>
    </div>
    <i className="fa-solid fa-chevron-right text-themeTextSec"></i>
 </button>

 <button type="button" onClick={() => setShowCVModal(true)} className="bg-gradient-to-br from-amber-400 to-amber-600 text-black border border-amber-500/30 p-4 rounded-xl flex items-center justify-between group hover:brightness-110 transition shadow-lg shadow-amber-500/20">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/20 text-black flex shrink-0 items-center justify-center text-lg"><i className="fa-solid fa-file-pdf"></i></div>
      <div className="text-left">
         <p className="text-[14px] font-black tracking-tight leading-tight mb-0.5">Download CV</p>
         <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Auto-Generated</p>
      </div>
    </div>
    <i className="fa-solid fa-arrow-down text-black"></i>
 </button>
 </div>
 </div>

 {/* Mentee Quick Links */}
 <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
    <button type="button" onClick={() => setMenteeTab('leaves')} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 p-4 rounded-xl flex flex-col gap-2 items-start transition-colors text-left group">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg"><i className="fa-solid fa-plane-departure"></i></div>
        <div>
            <h4 className="text-[13px] font-black tracking-tight mb-0.5">Leave Approvals</h4>
            <p className="text-[10px] font-medium text-indigo-500/70">Manage time-off requests</p>
        </div>
    </button>
    <button type="button" onClick={() => setMenteeTab('grievances')} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 p-4 rounded-xl flex flex-col gap-2 items-start transition-colors text-left group">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg"><i className="fa-solid fa-scale-balanced"></i></div>
        <div>
            <h4 className="text-[13px] font-black tracking-tight mb-0.5">Grievance Record</h4>
            <p className="text-[10px] font-medium text-amber-500/70">View official reports</p>
        </div>
    </button>
    <button type="button" onClick={() => setMenteeTab('report')} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 p-4 rounded-xl flex flex-col gap-2 items-start transition-colors text-left group">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-lg"><i className="fa-solid fa-triangle-exclamation"></i></div>
        <div>
            <h4 className="text-[13px] font-black tracking-tight mb-0.5">Report Mentee</h4>
            <p className="text-[10px] font-medium text-rose-500/70">File disciplinary action</p>
        </div>
    </button>
 </div>

 {/* Pending Approvals / Achievements */}
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-[15px] font-semibold tracking-normal text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-trophy text-amber-500"></i> Achievement Portfolio
 </h3>
 {pendingCount > 0 && (
 <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md text-[12px] font-medium border border-amber-500/30">
 {pendingCount} Pending
 </span>
 )}
 </div>
 
 <div className="flex flex-col gap-4">
 {achievements.length === 0 ? (
 <div className="p-8 text-center bg-themePanel border border-dashed border-themeBorder rounded-xl">
 <p className="text-xs font-bold text-themeTextSec">No achievements logged by this student.</p>
 </div>
 ) : (
 achievements.map(a => {
 const status = a.status || (a.is_verified ? 'verified' : 'pending');
 const isPending = status === 'pending';
 return (
 <div key={a.id} className={`bg-themePanel border ${isPending ? 'border-amber-500/30' : 'border-themeBorder'} p-4 rounded-xl flex flex-col gap-3 group`}>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-[12px] font-medium text-themeAccent mb-1">{a.category}</p>
 <h4 className="text-sm lg:text-base font-bold text-themeText">{a.title}</h4>
 <p className="text-xs font-medium text-themeTextSec">{a.issuer} • {new Date(a.date_achieved).toLocaleDateString()}</p>
 </div>
 {getStatusBadge(a.status, a.is_verified)}
 </div>
 
 {isPending && (
 <div className="flex gap-2 mt-2 pt-3 border-t border-themeBorder">
 <button type="button" onClick={() => openVerifyModal(a.id, 'verified')} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-2 rounded-lg text-[13px] font-medium transition-colors">
 <i className="fa-solid fa-check mr-1"></i> Verify
 </button>
 <button type="button" onClick={() => openVerifyModal(a.id, 'revision_requested')} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 py-2 rounded-lg text-[13px] font-medium transition-colors">
 <i className="fa-solid fa-rotate-left mr-1"></i> Revise
 </button>
 <button type="button" onClick={() => openVerifyModal(a.id, 'rejected')} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-2 rounded-lg text-[13px] font-medium transition-colors">
 <i className="fa-solid fa-xmark mr-1"></i> Reject
 </button>
 </div>
 )}

 {a.proof_link && (
 <a href={a.proof_link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-themeTextSec hover:text-themeAccent flex items-center gap-1 w-fit mt-1">
 <i className="fa-solid fa-external-link"></i> View Attached Proof
 </a>
 )}
 {a.mentor_remarks && (
 <p className="text-xs font-medium text-themeTextSec bg-themePanel/85 backdrop-blur-2xl p-2 rounded border border-themeBorder mt-1 italic">
 Your remark: "{a.mentor_remarks}"
 </p>
 )}
 </div>
 )
 })
 )}
 </div>
 </div>
 </div>
 </div>



 {/* CV Auto-Generated Modal */}
 {showCVModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[105] flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-2xl rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh]">
 <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
 <h3 className="text-sm font-black tracking-tight text-themeText"><i className="fa-solid fa-file-pdf text-amber-500 mr-2"></i> Auto-Generated CV</h3>
 <div className="flex gap-2">
 <button type="button" onClick={() => window.print()} className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-print text-themeText"></i></button>
 <button type="button" onClick={() => setShowCVModal(false)} className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark text-themeText"></i></button>
 </div>
 </div>
 <div className="p-8 overflow-y-auto bg-white dark:bg-neutral-900 text-black dark:text-white" id="cv-printable-area">
 {/* Header */}
 <div className="border-b-2 border-amber-500 pb-4 mb-6">
 <h1 className="text-3xl font-black uppercase tracking-tight mb-1">{mentee.full_name}</h1>
 <p className="text-sm font-bold text-neutral-500 tracking-widest uppercase">ERP ID: {mentee.erp_id} | {mentee.programme || 'LAW PROGRAMME'}</p>
 </div>
 
 {/* Academics */}
 <div className="mb-6">
 <h2 className="text-lg font-black uppercase tracking-widest text-amber-500 mb-3"><i className="fa-solid fa-graduation-cap mr-2"></i>Academic Standing</h2>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
 <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Current CGPA</p>
 <p className="text-xl font-black">{analytics?.cgpa || 'N/A'}</p>
 </div>
 <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
 <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Overall Attendance</p>
 <p className="text-xl font-black">{attendance}</p>
 </div>
 </div>
 </div>

 {/* Achievements */}
 <div className="mb-6">
 <h2 className="text-lg font-black uppercase tracking-widest text-amber-500 mb-3"><i className="fa-solid fa-trophy mr-2"></i>Achievements & Extracurriculars</h2>
 {achievements.filter(a => a.status === 'verified' || a.is_verified).length === 0 ? (
 <p className="text-sm font-medium text-neutral-500 italic">No verified achievements on record.</p>
 ) : (
 <ul className="space-y-4">
 {achievements.filter(a => a.status === 'verified' || a.is_verified).map(a => (
 <li key={a.id} className="border-l-4 border-emerald-500 pl-4 py-1">
 <h4 className="text-base font-bold">{a.title}</h4>
 <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-0.5">{a.issuer} • {new Date(a.date_achieved).toLocaleDateString()}</p>
 </li>
 ))}
 </ul>
 )}
 </div>

 {/* Leaves/Discipline */}
 <div className="mb-6">
 <h2 className="text-lg font-black uppercase tracking-widest text-amber-500 mb-3"><i className="fa-solid fa-scale-balanced mr-2"></i>Disciplinary & Leave Record</h2>
 <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
 <p className="text-sm font-bold"><i className="fa-solid fa-plane-departure mr-2 text-indigo-500"></i> Approved Leaves: {leaves.filter(l => l.status === 'approved').length}</p>
 </div>
 </div>

 <div className="mt-12 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest pt-4 border-t border-neutral-200 dark:border-neutral-800">
 Generated by Prudentia ERP Mentorship Module
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Verify Modal */}
 {showVerifyModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
 <div className="bg-themePanel w-full max-w-sm rounded-xl overflow-hidden border border-themeBorder">
 <div className="p-5 border-b border-themeBorder">
 <h3 className="text-lg font-semibold tracking-tight text-themeText">Mark as {actionType}</h3>
 <p className="text-xs text-themeTextSec mt-1">Leave an optional remark for the student.</p>
 </div>
 <div className="p-5">
 <textarea 
 rows="3" 
 placeholder="E.g., Please upload the official certificate instead of the invitation letter..."
 value={remarks}
 onChange={e => setRemarks(e.target.value)}
 className="w-full bg-themeElevated border border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent resize-none"
 ></textarea>
 </div>
 <div className="p-5 border-t border-themeBorder bg-themePanel/85 backdrop-blur-2xl flex justify-end gap-3">
 <button type="button" onClick={() => setShowVerifyModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-themeTextSec hover:text-themeText">Cancel</button>
 <SlideCommit
                label="Slide to Confirm"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={handleVerifySubmit}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 </div>
 </div>
 </div>
 )}
 </>
 );
}

/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';

export default function FacultyStudentProfile360({ mentee, onClose, onSchedule }) {
 const [achievements, setAchievements] = useState(() => {
 const cached = sessionStorage.getItem(`profile360_achievements_${mentee?.id}`);
 return cached ? JSON.parse(cached) : [];
 });
 
 // For verifying achievements
 const [verifyingId, setVerifyingId] = useState(null);
 const [remarks, setRemarks] = useState("");
 const [showVerifyModal, setShowVerifyModal] = useState(false);
 const [actionType, setActionType] = useState('verified'); // verified, rejected, revision_requested

 useEffect(() => {
 if (mentee?.id) {
 fetchAchievements();
 }
 }, [mentee]);

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
 } catch (err) {
 console.error("Failed to fetch achievements:", err);
 }
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
 } catch (err) {
 console.error(err);
 window.erpDialog?.alert("Failed to update achievement status.");
 }
 };

 const openVerifyModal = (id, type) => {
 setVerifyingId(id);
 setActionType(type);
 setRemarks("");
 setShowVerifyModal(true);
 };

 const getStatusBadge = (status, isLegacyVerified) => {
 const s = (status || (isLegacyVerified ? 'verified' : 'pending')).toLowerCase();
 if (s === 'verified') return <Badge variant="success"><i className="fa-solid fa-check mr-1.5"></i> Verified</Badge>;
 if (s === 'rejected') return <Badge variant="destructive"><i className="fa-solid fa-xmark mr-1.5"></i> Rejected</Badge>;
 if (s === 'revision_requested') return <Badge variant="info"><i className="fa-solid fa-rotate-left mr-1.5"></i> Revision</Badge>;
 return <Badge variant="warning"><i className="fa-regular fa-clock mr-1.5"></i> Pending</Badge>;
 };

 const pendingCount = achievements.filter(a => (a.status || (a.is_verified ? 'verified' : 'pending')) === 'pending').length;

 return (
 <>
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose}></div>
 <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-themePanel/85 backdrop-blur-2xl z-[101] flex flex-col animate-slide-in-right border-l border-themeBorder">
 
 {/* Header Profile */}
 <div className="p-6 lg:p-8 bg-themePanel border-b border-themeBorder flex flex-col gap-6 relative overflow-hidden">
 <div className="absolute -right-10 -top-10 w-40 h-40 bg-themeAccent/10 rounded-full blur-3xl pointer-events-none"></div>
 
 <div className="flex justify-between items-start relative z-10">
 <button onClick={onClose} className="w-8 h-8 rounded-lg bg-themeElevated border border-themeBorder flex items-center justify-center text-themeTextSec hover:text-themeText hover:border-themeBorderStrong transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 <div className="flex gap-2">
 <button type="button" onClick={() => window.erpDialog.alert("Messages engine linking...")} className="px-4 py-2 rounded-lg bg-themeElevated border border-themeBorder text-[10px] font-black text-themeText uppercase tracking-widest hover:border-themeAccent transition-colors">
 <i className="fa-regular fa-envelope text-themeAccent mr-2"></i> Message
 </button>
 <button onClick={onSchedule} className="btn-erp">
 <i className="fa-solid fa-calendar-plus mr-2"></i> Schedule
 </button>
 </div>
 </div>

 <div className="flex items-center gap-5 relative z-10">
 <div className="w-20 h-20 rounded-2xl bg-themeElevated border-2 border-themeBorder flex items-center justify-center text-themeAccent text-3xl font-black">
 {mentee.full_name?.charAt(0)?.toUpperCase()}
 </div>
 <div>
 <h2 className="text-2xl lg:text-3xl font-black text-themeText tracking-tight mb-1">{mentee.full_name}</h2>
 <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest flex items-center gap-3">
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
 <h3 className="text-sm font-black uppercase tracking-widest text-themeTextSec mb-4 flex items-center gap-2">
 <i className="fa-solid fa-graduation-cap text-themeAccent"></i> Academic Snapshot
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-themePanel border border-themeBorder p-4 rounded-xl flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg"><i className="fa-solid fa-clipboard-user"></i></div>
 <div>
 <p className="text-2xl font-black text-themeText leading-none mb-1">87%</p>
 <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">Overall Attendance</p>
 </div>
 </div>
 <div className="bg-themePanel border border-themeBorder p-4 rounded-xl flex items-center gap-4">
 <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg"><i className="fa-solid fa-chart-line"></i></div>
 <div>
 <p className="text-2xl font-black text-themeText leading-none mb-1">7.8</p>
 <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">CGPA (Current)</p>
 </div>
 </div>
 </div>
 </div>

 {/* Pending Approvals / Achievements */}
 <div>
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-sm font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-trophy text-amber-500"></i> Achievement Portfolio
 </h3>
 {pendingCount > 0 && (
 <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-amber-500/30">
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
 <p className="text-[9px] font-black uppercase tracking-widest text-themeAccent mb-1">{a.category}</p>
 <h4 className="text-sm lg:text-base font-bold text-themeText">{a.title}</h4>
 <p className="text-xs font-medium text-themeTextSec">{a.issuer} • {new Date(a.date_achieved).toLocaleDateString()}</p>
 </div>
 {getStatusBadge(a.status, a.is_verified)}
 </div>
 
 {isPending && (
 <div className="flex gap-2 mt-2 pt-3 border-t border-themeBorder">
 <button onClick={() => openVerifyModal(a.id, 'verified')} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
 <i className="fa-solid fa-check mr-1"></i> Verify
 </button>
 <button onClick={() => openVerifyModal(a.id, 'revision_requested')} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
 <i className="fa-solid fa-rotate-left mr-1"></i> Revise
 </button>
 <button onClick={() => openVerifyModal(a.id, 'rejected')} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
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

 {/* Verify Modal */}
 {showVerifyModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
 <div className="bg-themePanel w-full max-w-sm rounded-xl overflow-hidden border border-themeBorder">
 <div className="p-5 border-b border-themeBorder">
 <h3 className="text-lg font-black text-themeText">Mark as {actionType}</h3>
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
 <button onClick={() => setShowVerifyModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-themeTextSec hover:text-themeText">Cancel</button>
 <button onClick={handleVerifySubmit} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white ${actionType === 'verified' ? 'bg-emerald-500' : actionType === 'rejected' ? 'bg-rose-500' : 'bg-blue-500'}`}>
 Confirm
 </button>
 </div>
 </div>
 </div>
 )}
 </>
 );
}

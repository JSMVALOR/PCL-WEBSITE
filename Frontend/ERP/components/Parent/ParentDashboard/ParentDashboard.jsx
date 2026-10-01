/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { useERP } from '../../../../ERP/context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';
import { getLocalAvatar } from '../../../utils/avatarUtils';

export default function ParentDashboard({ onLogout }) {
 const { userSession } = useERP();
 const [studentData, setStudentData] = useState(null);
 const [attendance, setAttendance] = useState([]);
 const [leaves, setLeaves] = useState([]);
 const [marks, setMarks] = useState([]);
 const [fees, setFees] = useState([]);
 const [assignments, setAssignments] = useState({ total: 0, completed: 0, list: [] });
 const [sendingEmail, setSendingEmail] = useState(false);
 const [emailData, setEmailData] = useState({ subject: '', message: '' });
 const [mentor, setMentor] = useState(null);
 const [activeModal, setActiveModal] = useState(null);
 const [viewMode, setViewMode] = useState('dashboard');
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 window.scrollTo(0, 0);
 fetchStudentData();
 }, []);

 const fetchStudentData = async () => {
 try {
 // SWR Caching - Instant Load
 const cacheKey = `parent_dashboard_${userSession?.id}`;
 const cachedData = sessionStorage.getItem(cacheKey);
 if (cachedData) {
 const parsed = JSON.parse(cachedData);
 setStudentData(parsed.student);
 setAttendance(parsed.attendance);
 setLeaves(parsed.leaves);
 setMarks(parsed.marks);
 setFees(parsed.fees);
 setAssignments(parsed.assignments);
 setMentor(parsed.mentor);
 setLoading(false);
 } else {
 setLoading(true);
 }

 const { data: mapping } = await supabase.from('parent_student_mappings').select('student_id').eq('parent_id', userSession.db_id || userSession.id).maybeSingle();
 
 let student = null;
 if (mapping && mapping.student_id) {
 const { data } = await supabase.from('profiles').select('*').eq('id', mapping.student_id).maybeSingle();
 student = data;
 } else {
 const { data } = await supabase.from('profiles').select('*').eq('role', 'student').limit(1).maybeSingle();
 student = data;
 }

 if (student) {
 // Parallel fetching for performance
 const [
 { data: att },
 { data: lvs },
 { data: mrk },
 { data: f },
 { data: asm },
 { data: mData }
 ] = await Promise.all([
 supabase.from('attendance_records').select('*, class_sessions(id, date, class_schedule(master_subjects(name, code)))').eq('student_id', student.id).order('marked_at', { ascending: false }),
 supabase.from('leave_requests').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
 supabase.from('marks_ledger').select('*, master_subjects(name, code)').eq('student_id', student.id),
 supabase.from('fee_ledger').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
 supabase.from('assignment_submissions').select('*, assignments(*)').eq('student_id', student.id),
 supabase.from('mentorship').select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, email, phone)').eq('student_id', student.id).maybeSingle()
 ]);

 const leavesList = lvs || [];
 let processedAtt = [];
 if (att) {
 processedAtt = att.map(r => {
 let finalStatus = r.status;
 if (r.status === 'absent' && lvs) {
 const date = r.class_sessions?.date;
 const hasApprovedLeave = lvs.some(l => l.status === 'approved' && l.start_date <= date && l.end_date >= date);
 if (hasApprovedLeave) finalStatus = 'exempt';
 }
 return { ...r, status: finalStatus };
 });
 }

 const marksList = mrk || [];
 const feesList = f || [];
 
 let asmData = { total: 0, completed: 0, list: [] };
 if (asm) {
 const completed = asm.filter(a => a.status === 'Graded' || a.status === 'Submitted').length;
 asmData = { total: asm.length || 0, completed, list: asm };
 }

 let mentorObj = null;
 if (mData && mData.profiles) {
 mentorObj = mData.profiles;
 }

 // Update state
 setStudentData(student);
 setAttendance(processedAtt);
 setLeaves(leavesList);
 setMarks(marksList);
 setFees(feesList);
 setAssignments(asmData);
 setMentor(mentorObj);

 // Update cache
 sessionStorage.setItem(cacheKey, JSON.stringify({
 student,
 attendance: processedAtt,
 leaves: leavesList,
 marks: marksList,
 fees: feesList,
 assignments: asmData,
 mentor: mentorObj
 }));
 }
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 setLoading(false);
 };

 useEffect(() => {
 if (!studentData) return;
 const channel = supabase.channel('parent-attendance-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${studentData.id}` }, () => { fetchStudentData(); }).subscribe();
 return () => { supabase.removeChannel(channel); };
 }, [studentData]);

 if (loading) return <div className="flex h-screen items-center justify-center text-themeText"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>;

 let presentCount = 0;
 let totalCount = 0;
 attendance.forEach(a => {
 if (a.status !== 'exempted') {
 totalCount++;
 if (a.status === 'present' || a.status === 'late') presentCount++;
 }
 });
 const attPercentage = totalCount === 0 ? 100 : Math.round((presentCount / totalCount) * 100);
 
 const activeLeaves = leaves.filter(l => l.status === 'approved' && new Date(l.end_date) >= new Date()).length;
 const pendingDues = fees.filter(f => f.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

 const handleSendEmail = async (e) => {
 e.preventDefault();
 if (!mentor) return;
 setSendingEmail(true);
 try {
 await fetch('/api/send-email', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 to_email: 'marvelswaroop118@gmail.com', // [TESTING OVERRIDE]
 subject: `Message from ${userSession?.name} (Parent of ${studentData?.full_name || "Student"}): ${emailData.subject}`,
 message_body: `<p>Dear ${mentor.full_name},</p><p>${emailData.message.replace(/\n/g, '<br/>')}</p><p>Regards,<br/>${userSession?.name}</p>`
 })
 });
 setActiveModal(null);
 setEmailData({ subject: '', message: '' });
 window.erpDialog?.alert("Message sent successfully!", "Success");
 } catch (error) { console.error(error); window.erpDialog?.alert("An error occurred. Please try again.", "Error"); } finally {
 setSendingEmail(false);
 }
 };

 return (
 <main className="min-h-screen bg-themeApp p-4 sm:p-8 font-sans selection:bg-themeAccent/20 text-themeText ">
 <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
 <div>
 <h1 className="text-[32px] font-semibold text-themeText tracking-tight font-sans">Parent Portal</h1>
 <p className="text-[15px] font-medium text-themeTextSec ">Welcome back, {userSession?.name}</p>
 </div>
 
 <div className="flex items-center gap-4 w-full sm:w-auto">
 <div className="flex bg-black/[0.03] dark:bg-themePanel/[0.04] p-1 rounded-xl backdrop-blur-xl border border-themeBorder w-full sm:w-auto">
 <button onClick={() => setViewMode('dashboard')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${viewMode === 'dashboard' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeApp'}`}>Overview</button>
 <button onClick={() => setViewMode('organization')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${viewMode === 'organization' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeApp'}`}>Directory</button>
 </div>
 <button onClick={onLogout} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors shrink-0">Logout</button>
 </div>
 </header>

 {viewMode === 'organization' ? (
 <OrganizationDirectory />
 ) : studentData ? (
 <div className="max-w-[1200px] mx-auto animate-fade-in flex flex-col gap-6">
 {studentData.is_debarred && (
 <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-6 flex items-center gap-4 text-rose-500">
 <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
 <div>
 <h3 className="font-bold text-lg">Debarment Notice</h3>
 <p className="text-sm opacity-90">{studentData.debarment_reason || 'This student has been debarred due to severe attendance shortage.'}</p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
 {/* Profile (8) */}
 <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[24px] p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
 <div className="w-28 h-28 rounded-[24px] bg-themeElevated flex items-center justify-center shrink-0 overflow-hidden">
 <img 
 src={
 studentData.profile_picture_url || getLocalAvatar(studentData.full_name) 
 ? (studentData.profile_picture_url || getLocalAvatar(studentData.full_name))
 : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.full_name || 'US')}&background=random&color=fff&rounded=true&bold=true`
 } 
 alt={studentData.full_name}
 className="w-full h-full object-cover" 
 />
 </div>
 <div className="flex flex-col text-center sm:text-left w-full">
 <span className="text-[13px] font-semibold text-themeAccent mb-1 px-3 py-1 bg-themeAccent/10 rounded-full w-fit mx-auto sm:mx-0">Enrolled Student</span>
 <h2 className="text-[32px] font-semibold tracking-tight">{studentData.full_name}</h2>
 <div className="grid grid-cols-2 gap-4 mt-4">
 <div className="bg-themeElevated rounded-2xl p-4 flex flex-col">
 <span className="text-[12px] font-medium text-themeTextSec ">ERP ID</span>
 <span className="text-[15px] font-semibold">{studentData.erp_id}</span>
 </div>
 <div className="bg-themeElevated rounded-2xl p-4 flex flex-col">
 <span className="text-[12px] font-medium text-themeTextSec ">Programme</span>
 <span className="text-[15px] font-semibold">{studentData.programme || 'Law'} &bull; Sem {studentData.semester || '1'}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Attendance (4) */}
 <div onClick={() => setActiveModal('attendance')} className="col-span-1 md:col-span-6 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-themeAccent/30 transition-colors relative group">
 <h3 className="absolute top-6 left-6 text-[15px] font-semibold flex items-center gap-2"><i className="fa-solid fa-chart-pie text-themeAccent"></i> Activity</h3>
 <button aria-label="Action button" className="absolute top-6 right-6 w-8 h-8 rounded-full bg-themeElevated flex items-center justify-center text-themeTextSec group-hover:bg-themeAccent/10 group-hover:text-themeAccent transition-colors"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
 <div className="relative w-36 h-36 mt-8 mb-4 drop-shadow-[0_4px_12px_rgba(0,122,255,0.3)]">
 <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
 <circle cx="50" cy="50" r="40" className="stroke-black/5 dark:stroke-white/10 fill-none" strokeWidth="8" />
 <circle cx="50" cy="50" r="40" className="stroke-[var(--theme-accent)] fill-none transition-all duration-1000 ease-out" strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * attPercentage) / 100 }} />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
 <span className="text-[32px] font-semibold tracking-tight">{attPercentage}<span className="text-lg">%</span></span>
 </div>
 </div>
 <span className="text-[13px] font-medium text-themeTextSec ">Overall Attendance</span>
 </div>

 {/* Marks (4) */}
 <div onClick={() => setActiveModal('marks')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#34C759]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0"><i className="fa-solid fa-graduation-cap text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">{(studentData.cgpa || 0).toFixed(2)}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Current CGPA</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>

 {/* Leaves (4) */}
 <div onClick={() => setActiveModal('leaves')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#FF9500]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center shrink-0"><i className="fa-solid fa-plane-departure text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">{activeLeaves}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Active Leaves</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>

 {/* Fees (4) */}
 <div onClick={() => setActiveModal('fees')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#AF52DE]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center shrink-0"><i className="fa-solid fa-file-invoice-dollar text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">₹{pendingDues.toLocaleString('en-IN')}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Pending Dues</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>
 
 {/* Assignments (6) */}
 <div onClick={() => setActiveModal('assignments')} className="col-span-1 md:col-span-3 lg:col-span-6 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[24px] p-6 cursor-pointer hover:border-[var(--theme-accent)]/30 transition-colors flex flex-col gap-4 relative group">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] flex items-center justify-center"><i className="fa-solid fa-book-open"></i></div>
 <h3 className="font-bold">Assignments</h3>
 </div>
 <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all"></i>
 </div>
 <div className="flex flex-col">
 <span className="text-3xl font-semibold">{assignments.completed} <span className="text-lg text-themeTextSec ">/ {assignments.total}</span></span>
 <span className="text-[13px] text-themeTextSec mt-1">Submitted</span>
 </div>
 </div>

 {/* Mentor (6) */}
 <div className="col-span-1 md:col-span-3 lg:col-span-6 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[24px] p-6 flex flex-col gap-4 relative group">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center"><i className="fa-solid fa-hands-holding-child"></i></div>
 <h3 className="font-bold">Assigned Mentor</h3>
 </div>
 {mentor ? (
 <div className="flex flex-col">
 <span className="text-xl font-semibold">{mentor.full_name}</span>
 <span className="text-[13px] text-themeTextSec mt-1"><i className="fa-solid fa-envelope mr-1"></i> {mentor.email}</span>
 <button onClick={() => setActiveModal('contact_mentor')} className="mt-4 px-4 py-2 bg-themeAccent/10 text-themeAccent font-bold text-[13px] rounded-lg w-fit hover:bg-themeAccent hover:text-themeApp transition-colors">
 <i className="fa-regular fa-paper-plane mr-2"></i> Contact Mentor
 </button>
 </div>
 ) : (
 <p className="text-sm text-themeTextSec ">No mentor assigned yet.</p>
 )}
 </div>

 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
 <i className="fa-solid fa-link-slash text-4xl mb-4"></i>
 <p>No student linked to this account.</p>
 </div>
 )}

 {/* Modals */}
 <AnimatePresence>
 {activeModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
 <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-themePanel w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl relative border border-themeBorder text-themeText ">
 <div className="p-6 border-b border-themeBorder flex justify-between items-center bg-themeElevated ">
 <h3 className="text-xl font-bold">
 {activeModal === 'attendance' && <><i className="fa-solid fa-calendar-check text-themeAccent mr-2"></i> Attendance Details</>}
 {activeModal === 'marks' && <><i className="fa-solid fa-graduation-cap text-[#34C759] mr-2"></i> Academic Marks</>}
 {activeModal === 'leaves' && <><i className="fa-solid fa-plane-departure text-[#FF9500] mr-2"></i> Leave History</>}
 {activeModal === 'fees' && <><i className="fa-solid fa-file-invoice-dollar text-[#AF52DE] mr-2"></i> Fee Invoices</>}
 {activeModal === 'assignments' && <><i className="fa-solid fa-book-open text-[var(--theme-accent)] mr-2"></i> Assignment Status</>}
 {activeModal === 'contact_mentor' && <><i className="fa-regular fa-paper-plane text-themeAccent mr-2"></i> Contact Mentor</>}
 </h3>
 <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 
 <div className="p-6 overflow-y-auto flex-1">
 {activeModal === 'attendance' && (
 <div className="space-y-3">
 {attendance.length === 0 ? <p className="text-themeTextSec text-sm">No attendance records found.</p> : attendance.map(a => (
 <div key={a.id} className="flex justify-between items-center p-4 rounded-2xl bg-themeElevated border border-themeBorder ">
 <div>
 <p className="text-sm font-bold">{new Date(a.class_sessions?.date || a.marked_at).toLocaleDateString()}</p>
 <p className="text-xs text-themeTextSec mt-1">{a.class_sessions?.subject || 'General'}</p>
 </div>
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${a.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : a.status === 'exempted' ? 'bg-blue-500/10 text-blue-500' : a.status === 'late' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {a.status}
 </span>
 </div>
 ))}
 </div>
 )}

 {activeModal === 'marks' && (
 <div className="space-y-4">
 {marks.length === 0 ? <p className="text-themeTextSec text-sm">No marks recorded yet.</p> : marks.map(m => (
 <div key={m.id} className="flex flex-col p-4 rounded-2xl bg-themeElevated border border-themeBorder gap-2">
 <div className="flex justify-between items-start">
 <h4 className="font-bold text-sm">{m.master_subjects?.name || 'Subject'}</h4>
 <span className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec bg-black/10 px-2 py-0.5 rounded">{m.assessment_type}</span>
 </div>
 <div className="flex items-end gap-2 mt-2">
 <span className="text-2xl font-black">{m.marks_obtained}</span>
 <span className="text-sm text-themeTextSec mb-1">/ {m.max_marks}</span>
 </div>
 </div>
 ))}
 </div>
 )}

 {activeModal === 'leaves' && (
 <div className="space-y-4">
 {leaves.length === 0 ? <p className="text-themeTextSec text-sm">No leave requests found.</p> : leaves.map(l => (
 <div key={l.id} className="flex flex-col p-4 rounded-2xl bg-themeElevated border border-themeBorder gap-3">
 <div className="flex justify-between items-center">
 <span className="text-xs font-bold uppercase tracking-widest text-[#FF9500]">{l.leave_type}</span>
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
 {l.status}
 </span>
 </div>
 <div>
 <p className="text-sm font-semibold">{new Date(l.start_date).toLocaleDateString()} &mdash; {new Date(l.end_date).toLocaleDateString()}</p>
 <p className="text-xs text-themeTextSec mt-1">{l.reason}</p>
 </div>
 </div>
 ))}
 </div>
 )}

 {activeModal === 'fees' && (
 <div className="space-y-4">
 {fees.length === 0 ? <p className="text-themeTextSec text-sm">No fee invoices found.</p> : fees.map(f => (
 <div key={f.id} className="flex flex-col p-4 rounded-2xl bg-themeElevated border border-themeBorder gap-3">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="font-bold text-sm">{f.title}</h4>
 <p className="text-xs text-themeTextSec mt-1">Due: {new Date(f.due_date).toLocaleDateString()}</p>
 </div>
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${f.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {f.status}
 </span>
 </div>
 <div className="text-xl font-black mt-2">
 ₹{Number(f.amount || 0).toLocaleString('en-IN')}
 </div>
 </div>
 ))}
 </div>
 )}

 {activeModal === 'assignments' && (
 <div className="space-y-4">
 {assignments.list.length === 0 ? <p className="text-themeTextSec text-sm">No assignments found.</p> : assignments.list.map(a => (
 <div key={a.id} className="flex flex-col p-4 rounded-2xl bg-themeElevated border border-themeBorder gap-2">
 <div className="flex justify-between items-start">
 <h4 className="font-bold text-sm pr-4">{a.assignments?.title || "Assignment"}</h4>
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shrink-0 ${a.submission_status === 'submitted' || a.submission_status === 'graded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
 {a.submission_status}
 </span>
 </div>
 <div className="flex justify-between items-center mt-2">
 <p className="text-xs font-medium text-themeTextSec ">Due: {new Date(a.assignments?.due_date || new Date()).toLocaleDateString()}</p>
 <span className="text-xs font-bold text-themeTextSec ">{a.assignments?.subject_code || ""}</span>
 </div>
 </div>
 ))}
 </div>
 )}

 {activeModal === 'contact_mentor' && (
 <form onSubmit={handleSendEmail} className="space-y-4">
 <div className="flex flex-col gap-1">
 <label className="text-[13px] font-semibold text-themeTextSec ">To</label>
 <input type="text" readOnly value={mentor?.full_name + ' <' + mentor?.email + '>'} className="w-full px-4 py-3 rounded-xl bg-themeElevated border border-themeBorder text-[15px] font-medium opacity-70 cursor-not-allowed" />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[13px] font-semibold text-themeTextSec ">Subject</label>
 <input type="text" required value={emailData.subject} onChange={e => setEmailData({...emailData, subject: e.target.value})} placeholder="E.g., Query regarding attendance" className="w-full px-4 py-3 rounded-xl bg-themeElevated border border-themeBorder text-[15px] font-medium outline-none focus:border-themeAccent/50 transition-colors" />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[13px] font-semibold text-themeTextSec ">Message</label>
 <textarea required value={emailData.message} onChange={e => setEmailData({...emailData, message: e.target.value})} placeholder="Write your message here..." rows="5" className="w-full px-4 py-3 rounded-xl bg-themeElevated border border-themeBorder text-[15px] font-medium outline-none focus:border-themeAccent/50 transition-colors resize-none"></textarea>
 </div>
 <button type="submit" disabled={sendingEmail} className="w-full mt-4 py-3 bg-themeAccent text-themeApp font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-themeAccent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
 {sendingEmail ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-regular fa-paper-plane"></i>}
 {sendingEmail ? 'Sending...' : 'Send Message'}
 </button>
 </form>
 )}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </main>
 );
}

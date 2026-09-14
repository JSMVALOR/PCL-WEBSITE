/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { GlassSurface } from "../../ui/GlassSurface";
import { Badge } from "../../ui/Badge";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyAttendance({ subjectContext }) {
 const { userSession } = useERP();
 
 // UI State
 const [activeTab, setActiveTab] = useState("today"); // today, window, analytics
 // Data State
 const [todayClasses, setTodayClasses] = useState(() => {
 const cached = sessionStorage.getItem(`fac_todayClasses_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [activeSession, setActiveSession] = useState(null); // The current class_sessions row
 const [enrolledStudents, setEnrolledStudents] = useState([]);
 const [attendanceRecords, setAttendanceRecords] = useState({}); // Maps student_id to status
 const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
 
 // QR State
 const [qrActive, setQrActive] = useState(false);
 const [qrToken, setQrToken] = useState(null);
 const [qrTimeLeft, setQrTimeLeft] = useState(0);

 const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

 useEffect(() => {
 if (userSession?.db_id) {
 fetchTodayClasses();
 }
 }, [userSession]);

 // Timer for QR
 useEffect(() => {
 let interval;
 if (qrActive && qrTimeLeft > 0) {
 interval = setInterval(() => {
 setQrTimeLeft(prev => {
 if (prev <= 1) {
 setQrActive(false);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);
 }
 return () => clearInterval(interval);
 }, [qrActive, qrTimeLeft]);

 const fetchTodayClasses = async () => {
 try {
 const currentDayInt = new Date().getDay(); // 0 (Sun) to 6 (Sat)
 
 // 1. Get today's timetable for this faculty (via subject join)
 const { data: schedule, error: schError } = await supabase
 .from('class_schedule')
 .select(`
 id, day_of_week, start_time, end_time, room, batch, semester,
 subject:subject_id!inner(id, name, code, faculty_id)
 `)
 .eq('subject.faculty_id', userSession.db_id)
 .eq('day_of_week', currentDayInt)
 .order('start_time', { ascending: true });

 if (schError) throw schError;

 // 2. See if sessions are already created for today
 const todayDate = new Date().toISOString().split('T')[0];
 const { data: sessions, error: sesError } = await supabase
 .from('class_sessions')
 .select('*')
 .eq('faculty_id', userSession.db_id)
 .eq('date', todayDate);
 
 if (sesError) throw sesError;

 // Map schedule to sessions
 const enrichedClasses = schedule.map(sch => {
 const existingSession = sessions.find(s => s.schedule_id === sch.id);
 return {
 ...sch,
 session: existingSession || null
 };
 });

 setTodayClasses(enrichedClasses || []);
 sessionStorage.setItem(`fac_todayClasses_${userSession.db_id}`, JSON.stringify(enrichedClasses || []));
 } catch (error) {
 console.error("Error fetching today classes:", error);
 window.erpDialog?.alert("Failed to load today's schedule.");
 }
 };

 const handleStartAttendance = async (classData) => {
 setIsSaving(true);
 try {
 const todayDate = new Date().toISOString().split('T')[0];
 let currentSession = classData.session;

 // Create session if it doesn't exist
 if (!currentSession) {
 const { data: newSession, error: insertError } = await supabase
 .from('class_sessions')
 .insert({
 schedule_id: classData.id,
 faculty_id: userSession.db_id,
 date: todayDate,
 status: 'ongoing',
 started_at: new Date().toISOString()
 })
 .select('*')
 .single();
 
 if (insertError) throw insertError;
 currentSession = newSession;
 }

 // Fetch Enrolled Students based on batch or elective
 let students = [];
 if (classData.subject?.is_elective) {
 // Fetch students who have this elective in their array
 const { data: electiveStudents, error: eleError } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id, roll_number')
 .eq('role', 'student')
 .contains('elective_subjects', [classData.subject.id])
 .order('roll_number');
 if (eleError) throw eleError;
 students = electiveStudents;
 } else {
 // Fetch students in the batch (text match)
 const { data: batchStudents, error: bError } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id, roll_number')
 .eq('role', 'student')
 .eq('academic_batch', classData.batch)
 .order('roll_number');
 if (bError) throw bError;
 students = batchStudents;
 }

 setEnrolledStudents(students || []);

 // Fetch existing attendance records
 const { data: existingRecords, error: recError } = await supabase
 .from('attendance_records')
 .select('*')
 .eq('session_id', currentSession.id);
 
 if (recError) throw recError;
 
 // Map records
 const recordMap = {};
 existingRecords.forEach(r => {
 recordMap[r.student_id] = r;
 });

 // Auto-create absent records for missing students locally first
 students.forEach(s => {
 if (!recordMap[s.id]) {
 recordMap[s.id] = {
 student_id: s.id,
 session_id: currentSession.id,
 status: 'absent',
 isNew: true
 };
 }
 });

 setAttendanceRecords(recordMap);
 setActiveSession({ ...currentSession, classData });
 setActiveTab("window");
 
 } catch (error) {
 console.error("Error starting attendance:", error);
 window.erpDialog?.alert("Failed to initialize attendance session.");
 } finally {
 setIsSaving(false);
 }
 };

 const updateAttendance = async (studentId, status) => {
 try {
 const currentRecord = attendanceRecords[studentId];
 
 // Optimistic update
 setAttendanceRecords(prev => ({
 ...prev,
 [studentId]: { ...prev[studentId], status, isNew: false }
 }));

 // Sync to DB
 const payload = {
 session_id: activeSession.id,
 student_id: studentId,
 status: status,
 marked_by: 'faculty',
 marked_at: new Date().toISOString()
 };

 const { error } = await supabase
 .from('attendance_records')
 .upsert(payload, { onConflict: 'session_id,student_id' });
 
 if (error) {
 // Revert optimistic update if failed
 setAttendanceRecords(prev => ({
 ...prev,
 [studentId]: currentRecord
 }));
 throw error;
 }

 } catch (error) {
 console.error("Failed to mark attendance:", error);
 }
 };

 const handleBulkMark = async (status) => {
 if (!window.erpDialog?.confirm(`Mark ALL currently displayed students as ${status.toUpperCase()}?`)) return;
 setIsSaving(true);
 try {
 const updates = filteredStudents.map(student => ({
 session_id: activeSession.id,
 student_id: student.id,
 status: status,
 marked_by: 'faculty',
 marked_at: new Date().toISOString()
 }));

 const { error } = await supabase.from('attendance_records').upsert(updates, { onConflict: 'session_id,student_id' });
 if (error) throw error;

 // Update local state
 const newRecords = { ...attendanceRecords };
 filteredStudents.forEach(s => {
 newRecords[s.id] = { ...newRecords[s.id], status, isNew: false };
 });
 setAttendanceRecords(newRecords);

 } catch (error) {
 console.error("Bulk mark failed:", error);
 window.erpDialog?.alert("Failed to perform bulk action.");
 } finally {
 setIsSaving(false);
 }
 };

 const generateQR = async () => {
 try {
 const token = Math.random().toString(36).substring(2, 10).toUpperCase();
 const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 secs

 const { error } = await supabase
 .from('class_sessions')
 .update({ qr_token: token, qr_expires_at: expiresAt })
 .eq('id', activeSession.id);
 
 if (error) throw error;

 setQrToken(token);
 setQrTimeLeft(60);
 setQrActive(true);
 
 } catch (error) {
 console.error("QR Generation failed:", error);
 }
 };
 
 const refreshLiveAttendance = async () => {
 try {
 const { data: existingRecords, error: recError } = await supabase
 .from('attendance_records')
 .select('*')
 .eq('session_id', activeSession.id);
 
 if (recError) throw recError;
 
 setAttendanceRecords(prev => {
 const next = { ...prev };
 existingRecords.forEach(r => {
 next[r.student_id] = r;
 });
 return next;
 });
 } catch (error) {
 console.error("Refresh failed:", error);
 }
 };

 const handleCloseSession = async () => {
 try {
 await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 setActiveSession(null);
 setEnrolledStudents([]);
 setAttendanceRecords({});
 setActiveTab("today");
 fetchTodayClasses();
 } catch (error) {
 console.error("Failed to close:", error);
 }
 };

 const filteredStudents = useMemo(() => {
 if (!searchQuery) return enrolledStudents;
 const q = searchQuery.toLowerCase();
 return enrolledStudents.filter(s => 
 s.full_name?.toLowerCase().includes(q) || 
 s.erp_id?.toLowerCase().includes(q) ||
 s.roll_number?.toLowerCase().includes(q)
 );
 }, [enrolledStudents, searchQuery]);

 const formatTime = (time) => time ? time.substring(0, 5) : '';

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12' : 'flex flex-col gap-4'}`}>
 
 {/* 1. HEADER (Liquid Glass) */}
 {(!subjectContext) && (
 <PageHeader 
 icon="fa-solid fa-user-check" 
 title="Attendance Engine" 
 subtitle="Manage automated class sessions, QR marking, and engagement analytics." 
 rightContent={
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar relative z-10">
 {[
 { id: "today", label: "Daily Sessions", icon: "fa-calendar-day" },
 { id: "window", label: "Active Window", icon: "fa-clipboard-check", disabled: !activeSession },
 { id: "analytics", label: "Risk Analytics", icon: "fa-chart-pie" }
 ].map((tab) => (
 <button
 key={tab.id}
 disabled={tab.disabled}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max disabled:opacity-30 disabled:cursor-not-allowed ${
 activeTab === tab.id
 ? 'bg-white dark:bg-white/10 backdrop-blur-[80px] text-themeText border border-black/10 dark:border-white/40 scale-100' 
 : 'text-themeTextSec opacity-80 hover:text-themeText hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? '' : 'opacity-70'}`}></i>
 {tab.label}
 </button>
 ))}
 </div>
 }
 />
 )}

 {/* 2. DYNAMIC CONTENT AREA */}
 <div className="flex-1 w-full relative min-h-[500px]">
 
 {/* TODAY'S CLASSES VIEW */}
 {activeTab === 'today' && (
 <div className="flex flex-col gap-6 animate-fade-in">
 {!subjectContext && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Today's Total</p>
 <h3 className="text-3xl font-black text-themeText">{todayClasses.length} <span className="text-base text-themeTextSec">Classes</span></h3>
 </div>
 <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Completed</p>
 <h3 className="text-3xl font-black text-emerald-500">{todayClasses.filter(c => c.session?.status === 'completed').length}</h3>
 </div>
 <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Pending/Ongoing</p>
 <h3 className="text-3xl font-black text-amber-500">{todayClasses.filter(c => c.session?.status !== 'completed').length}</h3>
 </div>
 </div>
 )}

 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-themeBorder rounded-2xl bg-themePanel/30 px-4">
 <i className="fa-solid fa-mug-hot text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Classes Scheduled Today</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Your timetable indicates you have a free day. Enjoy!</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
 <div key={cls.id} className="bg-themePanel rounded-2xl border border-themeBorder p-5 flex flex-col hover:border-themeAccent/50 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="bg-themeElevated px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
 <span className="bg-themeElevated px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">Room {cls.room}</span>
 </div>
 <h3 className="text-lg font-black text-themeText leading-tight">{cls.subject?.name}</h3>
 <p className="text-[10px] font-bold text-themeTextSec mt-1">{cls.batch} • Semester {cls.semester}</p>
 </div>
 {cls.session?.status === 'completed' ? (
 <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
 <i className="fa-solid fa-check"></i>
 </div>
 ) : cls.session?.status === 'ongoing' ? (
 <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
 <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
 </div>
 ) : null}
 </div>
 
 <div className="mt-auto pt-4 border-t border-themeBorder">
 {cls.session?.status === 'completed' ? (
 <button disabled type="button" className="w-full py-3 rounded-xl bg-themeElevated text-themeTextSec text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
 Session Completed
 </button>
 ) : (
 <button 
 onClick={() => handleStartAttendance(cls)}
 className="w-full py-3 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98]"
 >
 {cls.session?.status === 'ongoing' ? 'Resume Attendance' : 'Start Attendance Session'}
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ACTIVE WINDOW VIEW */}
 {activeTab === 'window' && activeSession && (
 <div className="flex flex-col xl:flex-row gap-6 animate-fade-in">
 {/* Left: Action Panel & QR */}
 <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
 <div className="bg-themePanel rounded-2xl border border-themeBorder p-6">
 <div className="mb-6">
 <h2 className="text-xl font-black text-themeText mb-1">{activeSession.classData?.subject?.name}</h2>
 <p className="text-xs font-bold text-themeTextSec">{activeSession.classData?.batch} • {filteredStudents.length} Students</p>
 </div>
 
 <div className="flex flex-col gap-3">
 <button onClick={() => handleBulkMark('present')} disabled={isSaving} className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98]">
 Mark All Present
 </button>
 <button onClick={() => handleBulkMark('absent')} disabled={isSaving} className="w-full py-3.5 rounded-xl bg-themeElevated hover:bg-rose-500/10 hover:text-rose-500 text-themeTextSec border border-themeBorder text-[10px] font-black uppercase tracking-widest transition">
 Mark All Absent
 </button>
 </div>
 </div>
 
 {/* QR Generator Card */}
 <div className="bg-themePanel rounded-2xl border border-themeBorder p-6 text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center text-xl mb-4">
 <i className="fa-solid fa-qrcode"></i>
 </div>
 <h3 className="text-lg font-black text-themeText mb-1">QR Auto-Attendance</h3>
 <p className="text-[10px] font-bold text-themeTextSec mb-5 max-w-[200px] mx-auto">Generate a 60-second live token. Students scan from their app to auto-mark.</p>
 
 {qrActive ? (
 <div className="bg-themeElevated border border-themeBorder p-4 rounded-xl flex flex-col items-center">
 <div className="text-3xl font-black text-themeText tracking-widest font-mono mb-2">{qrToken}</div>
 <div className="w-full bg-themePanel h-2 rounded-full overflow-hidden mb-2">
 <div className="h-full bg-indigo-500 transition ease-linear" style={{ width: `${(qrTimeLeft / 60) * 100}%` }}></div>
 </div>
 <p className="text-[10px] font-black uppercase text-themeTextSec">Expires in {qrTimeLeft}s</p>
 </div>
 ) : (
 <button onClick={generateQR} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98]">
 Generate Secure QR
 </button>
 )}
 </div>
 
 <button onClick={handleCloseSession} className="w-full py-4 rounded-2xl bg-themeElevated border border-themeBorder hover:border-themeAccent text-themeText text-xs font-black uppercase tracking-widest transition mt-auto flex items-center justify-center gap-2">
 <i className="fa-solid fa-lock"></i> Finalize & Lock Session
 </button>
 </div>
 
 {/* Right: Roster List */}
 <div className="w-full xl:w-2/3 flex flex-col h-[70vh] bg-themePanel rounded-2xl border border-themeBorder overflow-hidden flex-1">
 <div className="p-4 border-b border-themeBorder flex gap-3 bg-themePanel sticky top-0 z-10">
 <div className="relative flex-1">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input 
 type="text" 
 placeholder="Search by name, roll, or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-themeElevated border border-themeBorder rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent"
 />
 </div>
 <button onClick={refreshLiveAttendance} className="px-4 bg-themeElevated border border-themeBorder rounded-xl hover:text-themeText text-themeTextSec transition-colors" title="Sync live QR entries">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
 {filteredStudents.map((student, index) => {
 const record = attendanceRecords[student.id] || { status: 'absent' };
 return (
 <div key={student.id} className="flex items-center justify-between p-3 lg:p-4 hover:bg-themeElevated border-b border-themeBorder/50 last:border-0 rounded-xl transition-colors">
 <div className="flex items-center gap-4">
 <div className="w-8 text-center text-xs font-bold text-themeTextSec opacity-50">{index + 1}</div>
 <div>
 <p className="text-sm font-black text-themeText">{student.full_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">
 {student.roll_number || 'No Roll'} • {student.erp_id}
 </p>
 </div>
 </div>
 
 <div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorder shrink-0">
 <button 
 onClick={() => updateAttendance(student.id, 'present')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 record.status === 'present' 
 ? 'bg-emerald-600 text-white' 
 : 'text-themeTextSec hover:text-themeText'
 }`}
 >
 P
 </button>
 <button 
 onClick={() => updateAttendance(student.id, 'absent')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 record.status === 'absent' 
 ? 'bg-rose-500 text-white' 
 : 'text-themeTextSec hover:text-themeText'
 }`}
 >
 A
 </button>
 <button 
 onClick={() => updateAttendance(student.id, 'medical')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 record.status === 'medical' || record.status === 'approved_leave' 
 ? 'bg-amber-500 text-white' 
 : 'text-themeTextSec hover:text-themeText'
 }`}
 >
 M
 </button>
 </div>
 </div>
 );
 })}
 {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-sm font-bold">No students found.</div>
 )}
 </div>
 </div>
 </div>
 )}
 
 {/* RISK ANALYTICS VIEW */}
 {activeTab === 'analytics' && (
 <div className="py-24 text-center border-2 border-dashed border-themeBorder rounded-2xl bg-themePanel/30 px-4 animate-fade-in">
 <i className="fa-solid fa-chart-line text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">Analytics Engine Compiling...</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-sm mx-auto">This panel will aggregate data across all your subjects and automatically highlight students falling below the 75% engagement threshold.</p>
 </div>
 )}
 
 </div>
 </div>
 </div>
 );
}

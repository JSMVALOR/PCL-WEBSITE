/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import SwipeableRosterDeck from './SwipeableRosterDeck';
import { GlassSurface } from "../../ui/GlassSurface";
import { Badge } from "../../ui/Badge";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail, sendSystemWhatsApp } from '../../../../ERP/lib/EmailService';


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
 const [isSwipeMode, setIsSwipeMode] = useState(window.innerWidth < 1024);
 const [attendancePhase, setAttendancePhase] = useState("entry"); // entry, exit
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
 const currentDayInt = new Date().getDay();
        const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
        const currentDayStr = daysMap[currentDayInt]; // 0 (Sun) to 6 (Sat)
 
 // 1. Get today's timetable for this faculty (via subject join)
 const { data: schedule, error: schError } = await supabase
 .from('class_schedule')
 .select(`
 id, subject_id, day_of_week, start_time, end_time, room:academic_classrooms(name), batch,
 subject:master_subjects(id, name, code)
 `)
 .eq('faculty_id', userSession.db_id)
 .in('day_of_week', [currentDayStr, currentDayInt.toString()])
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
 .select('id, full_name, erp_id')
 .eq('role', 'student')
 .contains('elective_subjects', [classData.subject.id])
 .order('full_name');
 if (eleError) throw eleError;
 students = electiveStudents;
 } else {
 // Fetch students in the batch (text match)
 const { data: batchStudents, error: bError } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id')
 .eq('role', 'student')
 .eq('academic_batch', classData.batch)
 .order('full_name');
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
 entry_status: 'absent', exit_status: null,
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
 [studentId]: { ...prev[studentId], ...(status === 'arrived_late' ? { entry_status: 'late', exit_status: 'present' } : (attendancePhase === 'exit' && Object.values(prev).every(r => r.isNew)) ? { entry_status: 'present', exit_status: status } : attendancePhase === 'entry' ? { entry_status: status } : { exit_status: status }), isNew: false }
 }));

 // Sync to DB
 let payload;
   const isPhaseOneSkipped = Object.values(attendanceRecords).every(r => r.isNew);
   if (status === 'arrived_late') {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           entry_status: 'late',
           entry_marked_at: new Date().toISOString(),
           exit_status: 'present',
           exit_marked_at: new Date().toISOString(),
           marked_by: 'faculty'
       };
   } else if (attendancePhase === 'exit' && isPhaseOneSkipped) {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           entry_status: 'present',
           entry_marked_at: new Date().toISOString(),
           exit_status: status,
           exit_marked_at: new Date().toISOString(),
           marked_by: 'faculty'
       };
   } else {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           ...(attendancePhase === 'entry' ? { entry_status: status, entry_marked_at: new Date().toISOString() } : { exit_status: status, exit_marked_at: new Date().toISOString() }),
           marked_by: 'faculty'
       };
   }

 
            // HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for ${activeSession.subject} on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }

        const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', payload.session_id).eq('student_id', payload.student_id);
            let error;
            if (existing && existing.length > 0) {
                const { error: updErr } = await supabase.from('attendance_records').update(payload).eq('id', existing[0].id);
                error = updErr;
            } else {
                const { error: insErr } = await supabase.from('attendance_records').insert(payload);
                error = insErr;
            }
 
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
   ...(attendancePhase === 'entry' ? { entry_status: status, entry_marked_at: new Date().toISOString() } : { exit_status: status, exit_marked_at: new Date().toISOString() }),
   marked_by: 'faculty'
 }));

 
            // HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for ${activeSession.subject} on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }

        
            // Manual upsert for bulk
            let error = null;
            for (const payload of updates) {
                const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', payload.session_id).eq('student_id', payload.student_id);
                if (existing && existing.length > 0) {
                    const { error: updErr } = await supabase.from('attendance_records').update(payload).eq('id', existing[0].id);
                    if (updErr) error = updErr;
                } else {
                    const { error: insErr } = await supabase.from('attendance_records').insert(payload);
                    if (insErr) error = insErr;
                }
            }
 if (error) throw error;

 // Update local state
 const newRecords = { ...attendanceRecords };
 filteredStudents.forEach(s => {
 newRecords[s.id] = { ...newRecords[s.id], ...(attendancePhase === 'entry' ? { entry_status: status } : { exit_status: status }), isNew: false };
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

 
    useEffect(() => {
        if (!activeSession?.id) return;
        
        const channel = supabase
            .channel('faculty-attendance-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${activeSession.id}` },
                (payload) => {
                    const newRecord = payload.new;
                    if (newRecord && newRecord.student_id) {
                        setAttendanceRecords(prev => ({
                            ...prev,
                            [newRecord.student_id]: {
                                status: newRecord.status,
                                isNew: false,
                                marked_by: newRecord.marked_by
                            }
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeSession?.id]);

    const filteredStudents = useMemo(() => {
 if (!searchQuery) return enrolledStudents;
 const q = searchQuery.toLowerCase();
 return enrolledStudents.filter(s => 
 s.full_name?.toLowerCase().includes(q) || 
 s.erp_id?.toLowerCase().includes(q) ||
 s.roll_number?.toLowerCase()?.includes(q)
 );
 }, [enrolledStudents, searchQuery]);

 const formatTime = (time) => time ? time.substring(0, 5) : '';

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full w-full mx-auto flex flex-col gap-8 pb-12' : 'flex flex-col gap-4'}`}>
 
 {/* 1. HEADER (Liquid Glass) */}
 {(!subjectContext) && (
 <PageHeader 
 icon="fa-solid fa-user-check" 
 title="Attendance Engine" 
 subtitle="Manage automated class sessions, QR marking, and engagement analytics." 
 rightContent={
 <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-[calc(100vw-32px)] lg:w-fit gap-1">
 {[
 { id: "today", label: "Daily Sessions", icon: "fa-calendar-day" },
 { id: "window", label: "Active Window", icon: "fa-clipboard-check", disabled: !activeSession },
 { id: "analytics", label: "Risk Analytics", icon: "fa-chart-pie" }
 ].map((tab) => (
 <button type="button"
 key={tab.id}
 disabled={tab.disabled}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 min-w-[110px] px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${activeTab === tab.id ? "bg-white dark:bg-[#2C2C2E] shadow-sm border border-black/5 dark:border-white/5 text-gray-900 dark:text-white" : "text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
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
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center">
 <span className="text-4xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{todayClasses.length}</span>
 <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider mt-1">Total</span>
 </div>
 <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <span className="text-4xl font-semibold tracking-tight text-emerald-500 relative z-10">{todayClasses.filter(c => c.session?.status === 'completed').length}</span>
 <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider mt-1 relative z-10">Done</span>
 </div>
 <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <span className="text-4xl font-semibold tracking-tight text-amber-500 relative z-10">{todayClasses.filter(c => c.session?.status !== 'completed').length}</span>
 <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider mt-1 relative z-10">Live</span>
 </div>
 </div>
 )}

 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 border-dashed">
 <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6"><i className="fa-solid fa-mug-hot text-3xl text-gray-400 dark:text-white/30"></i></div>
 <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">No Classes Today</h3>
 <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">Your timetable indicates you have a free day. Enjoy!</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
 <div key={cls.id} className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/5 p-5 flex flex-col hover:border-black/10 dark:hover:border-white/10 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
 <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">Room {cls.room?.name || "TBD"}</span>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">{cls.subject?.name}</h3>
 <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 mt-1">{cls.batch} • Semester {cls.semester}</p>
 </div>
 {cls.session?.status === 'completed' ? (
        <button type="button" onClick={() => handleStartAttendance(cls)} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-xl text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 text-[13px] font-medium transition active:scale-[0.98]">
            View Completed Session
        </button>
    ) : (
 <button type="button" 
 onClick={() => handleStartAttendance(cls)}
                                                    className={`w-full py-3 rounded-xl text-[13px] font-medium transition ${cls.session?.status === 'completed' ? 'bg-white/10 text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-themeAccent hover:bg-themeAccent/90 text-gray-900 dark:text-white active:scale-[0.98]'}`}
 >
 {cls.session?.status === 'completed' ? 'Session Locked (Completed)' : cls.session?.status === 'ongoing' ? 'Resume Attendance' : 'Start Attendance Session'}
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
 <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">
 {/* Left: Action Panel & QR */}
 <div className="w-full xl:w-[32%] flex flex-col gap-6 shrink-0">
 <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="mb-8">
 <div className="flex flex-col gap-2 mb-2">
    <h2 className="text-2xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight">{activeSession.classData?.subject?.name}</h2>
    <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border border-black/5 dark:border-white/5 shadow-inner w-fit">
        <button type="button" onClick={() => setAttendancePhase('entry')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${attendancePhase === 'entry' ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/70'}`}>Phase 1: Entry</button>
        <button type="button" onClick={() => setAttendancePhase('exit')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${attendancePhase === 'exit' ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/70'}`}>Phase 2: Exit</button>
    </div>
</div>
 <div className="flex items-center gap-2">
 <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-[#8E8E93]">{activeSession.classData?.batch}</span>
 <span className="text-[12px] font-medium text-[#8E8E93]">{filteredStudents.length} Students</span>
 </div>
 
 <div className="mt-6 grid grid-cols-2 gap-2">
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Present (inc. Late)</p>
         <p className="text-xl font-semibold text-emerald-500">{Object.values(attendanceRecords).filter(r => ['present', 'late'].includes(attendancePhase === 'entry' ? r.entry_status : r.exit_status)).length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Absent</p>
         <p className="text-xl font-semibold text-rose-500">{Object.values(attendanceRecords).filter(r => (attendancePhase === 'entry' ? r.entry_status : r.exit_status) === 'absent').length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Medical</p>
         <p className="text-xl font-semibold text-amber-500">{Object.values(attendanceRecords).filter(r => (attendancePhase === 'entry' ? r.entry_status : r.exit_status) === 'medical').length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider mb-1">OTP Scans</p>
         <p className="text-xl font-semibold text-[#AF52DE]">{Object.values(attendanceRecords).filter(r => r.marked_by === 'student_qr').length}</p>
     </div>
 </div>
 
 </div>
 
 <div className="flex flex-col gap-3">
 {activeSession.status === 'completed' && (
     <div className="bg-amber-500/10 text-amber-500 text-[12px] font-bold p-3 rounded-xl text-center border border-amber-500/20">
         <i className="fa-solid fa-lock mr-2"></i>This session is finalized. Records are locked.
     </div>
 )}
 <button type="button" onClick={() => handleBulkMark('present')} disabled={isSaving || activeSession.status === 'completed'} className={`w-full py-4 rounded-xl text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] ${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
 Mark All Present
 </button>
 <button type="button" onClick={() => handleBulkMark('absent')} disabled={isSaving || activeSession.status === 'completed'} className={`w-full py-4 rounded-xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] ${activeSession.status === 'completed' ? 'bg-transparent text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-[#1C1C1E] dark:text-[#F2F2F7]'}`}>
 Mark All Absent
 </button>
 </div>
 </div>
 
 {/* Whiteboard OTP Generator */}
 <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-6 lg:p-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="absolute top-0 right-0 w-40 h-40 bg-[#AF52DE]/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
 <div className="w-14 h-14 mx-auto rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/20 text-[#AF52DE] flex items-center justify-center text-xl mb-4 relative z-10">
 <i className="fa-solid fa-expand"></i>
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] mb-2 relative z-10">Whiteboard OTP</h3>
 <p className="text-[12px] font-medium text-[#8E8E93] mb-6 max-w-[220px] mx-auto relative z-10 leading-relaxed">Display this live code for students to mark themselves present.</p>
 
 {qrActive ? (
 <div className="bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 p-5 rounded-2xl flex flex-col items-center shadow-sm relative z-10">
 <div className="text-4xl font-semibold tracking-widest text-[#1C1C1E] dark:text-[#F2F2F7] font-mono mb-4">{qrToken}</div>
 <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-3">
 <div className="h-full bg-[#AF52DE] transition-all ease-linear" style={{ width: `${(qrTimeLeft / 60) * 100}%` }}></div>
 </div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">{qrTimeLeft}s Remaining</p>
 </div>
 ) : (
 <button type="button" onClick={generateQR} disabled={activeSession.status === 'completed'} className={`w-full py-4 rounded-xl text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 ${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-[#AF52DE] hover:bg-[#9B49C4] text-white shadow-lg shadow-[#AF52DE]/20'}`}>
 Generate Live OTP
 </button>
 )}
 </div>
 
 <button type="button" onClick={handleCloseSession} disabled={activeSession.status === 'completed'} className={`w-full py-4.5 rounded-2xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] mt-auto flex items-center justify-center gap-2 ${activeSession.status === 'completed' ? 'bg-transparent text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7]'}`}>
 <i className="fa-solid fa-lock text-[12px]"></i> Finalize & Lock Session
 </button>
 </div>
 
 {/* Right: Roster List */}
 <div className="flex-1 flex flex-col h-[750px] bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="p-5 lg:p-6 border-b border-black/5 dark:border-white/5 flex gap-4 bg-black/[0.02] dark:bg-white/[0.02] sticky top-0 z-10">
 <div className="relative flex-1">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]"></i>
 <input 
 type="text" 
 placeholder="Search by name, roll, or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-[14px] font-medium text-[#1C1C1E] dark:text-[#F2F2F7] outline-none focus:border-[#007AFF] shadow-sm transition-colors placeholder-[#8E8E93]"
 />
 </div>
 <button type="button" onClick={refreshLiveAttendance} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-xl hover:text-[#007AFF] text-[#8E8E93] shadow-sm transition-all hover:scale-105 active:scale-95" title="Sync live OTP entries">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
 {filteredStudents.map((student, index) => {
 const record = attendanceRecords[student.id] || { entry_status: 'absent', exit_status: null };
 return (
 <div key={student.id} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors border-b border-black/5 dark:border-white/5 last:border-0 group">
 <div className="flex items-center gap-4">
 <div className="w-8 text-center text-[12px] font-bold text-[#8E8E93] opacity-60">{index + 1}</div>
 <div>
 <p className="text-[16px] font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight mb-0.5">{student.full_name}</p>
 <p className="text-[12px] font-medium text-[#8E8E93]">
 {student.erp_id}
 </p>
 </div>
 </div>
 
 {/* Segmented Control */}
 <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 shrink-0">
 {attendancePhase === 'entry' ? (
   <>
     <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-10 h-8 lg:w-12 lg:h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>P</button>
     <button type="button" onClick={() => updateAttendance(student.id, 'absent')} disabled={activeSession.status === 'completed'} className={`w-10 h-8 lg:w-12 lg:h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'absent' ? 'bg-white dark:bg-[#2C2C2E] text-rose-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>A</button>
     <button type="button" onClick={() => updateAttendance(student.id, 'medical')} disabled={activeSession.status === 'completed'} className={`w-10 h-8 lg:w-12 lg:h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'medical' || record.entry_status === 'approved_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>M</button>
   </>
 ) : (
   <>
     
    {(() => {
    // Check if the entire class is untouched (Phase 1 was completely forgotten)
    const isPhaseOneSkipped = Object.values(attendanceRecords).every(r => r.isNew);
    
    if (isPhaseOneSkipped) {
        return (
            <>
                <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-16 h-8 lg:w-20 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>Stayed</button>
                <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-16 h-8 lg:w-20 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>Left Early</button>
            </>
        );
    }
    
    if (record.entry_status === 'present' || record.entry_status === 'late') {
        return (
            <>
                <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-16 h-8 lg:w-20 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-[#2C2C2E] text-emerald-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>Stayed</button>
                <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-16 h-8 lg:w-20 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-[#2C2C2E] text-amber-500 shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}>Left Early</button>
            </>
        );
    }
    
    if (record.entry_status === 'absent') {
        return (
            <button type="button" onClick={() => updateAttendance(student.id, 'arrived_late')} className="w-[128px] lg:w-[160px] h-8 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-[#8E8E93] hover:text-amber-500 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-[#2C2C2E] hover:shadow-sm transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5">
                Mark as Arrived Late
            </button>
        );
    }
    
    return (
        <div className="w-[128px] lg:w-[160px] h-8 lg:h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-[#8E8E93] opacity-50 bg-black/5 dark:bg-white/5 cursor-not-allowed">
            Medical Leave
        </div>
    );
})()}
   </>
 )}
 </div>
 </div>
 );
 })}
 {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-[#8E8E93] text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* RISK ANALYTICS VIEW */}
 {activeTab === 'analytics' && (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-chart-line text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-gray-900 dark:text-white font-black">Analytics Engine Compiling...</h3>
 <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-sm mx-auto">This panel will aggregate data across all your subjects and automatically highlight students falling below the 75% engagement threshold.</p>
 </div>
 )}
 
 </div>
 </div>
 </div>
 );
}

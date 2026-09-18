/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
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
 s.roll_number?.toLowerCase().includes(q)
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
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar relative z-10">
 {[
 { id: "today", label: "Daily Sessions", icon: "fa-calendar-day" },
 { id: "window", label: "Active Window", icon: "fa-clipboard-check", disabled: !activeSession },
 { id: "analytics", label: "Risk Analytics", icon: "fa-chart-pie" }
 ].map((tab) => (
 <button type="button"
 key={tab.id}
 disabled={tab.disabled}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max disabled:opacity-30 disabled:cursor-not-allowed ${
 activeTab === tab.id
 ? 'bg-white dark:bg-white/10 backdrop-blur-[80px] text-gray-900 dark:text-white border border-black/10 dark:border-white/40 scale-100' 
 : 'text-gray-500 dark:text-white/50 opacity-80 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
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
 <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-5 flex flex-col">
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-1">Today's Total</p>
 <h3 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{todayClasses.length} <span className="text-base text-gray-500 dark:text-white/50">Classes</span></h3>
 </div>
 <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-5 flex flex-col">
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-1">Completed</p>
 <h3 className="text-3xl font-semibold tracking-tight text-emerald-500">{todayClasses.filter(c => c.session?.status === 'completed').length}</h3>
 </div>
 <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-5 flex flex-col">
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-1">Pending/Ongoing</p>
 <h3 className="text-3xl font-semibold tracking-tight text-amber-500">{todayClasses.filter(c => c.session?.status !== 'completed').length}</h3>
 </div>
 </div>
 )}

 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-mug-hot text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-gray-900 dark:text-white font-black">No Classes Scheduled Today</h3>
 <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">Your timetable indicates you have a free day. Enjoy!</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
 <div key={cls.id} className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-5 flex flex-col hover:border-gray-200 dark:border-white/5Accent/50 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="bg-gray-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
 <span className="bg-gray-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">Room {cls.room}</span>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">{cls.subject?.name}</h3>
 <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 mt-1">{cls.batch} • Semester {cls.semester}</p>
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
 
 <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5Border">
 {cls.session?.status === 'completed' ? (
 <button disabled type="button" className="w-full py-3 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-white/50 text-[13px] font-medium cursor-not-allowed">
 Session Completed
 </button>
 ) : (
 <button type="button" 
 onClick={() => { if (cls.session?.status !== 'completed') handleStartAttendance(cls); }}
                                                    disabled={cls.session?.status === 'completed'}
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
 <div className="flex flex-col xl:flex-row gap-6 animate-fade-in">
 {/* Left: Action Panel & QR */}
 <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
 <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-6">
 <div className="mb-6">
 <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-1">{activeSession.classData?.subject?.name}</h2>
 <p className="text-xs font-bold text-gray-500 dark:text-white/50">{activeSession.classData?.batch} • {filteredStudents.length} Students</p>
 </div>
 
 <div className="flex flex-col gap-3">
 <button type="button" onClick={() => handleBulkMark('present')} disabled={isSaving} className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-900 dark:text-white text-[13px] font-medium transition active:scale-[0.98]">
 Mark All Present
 </button>
 <button type="button" onClick={() => handleBulkMark('absent')} disabled={isSaving} className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] hover:bg-rose-500/10 hover:text-rose-500 text-gray-500 dark:text-white/50 border border-gray-200 dark:border-white/5Border text-[13px] font-medium transition">
 Mark All Absent
 </button>
 </div>
 </div>
 
 {/* QR Generator Card */}
 <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border p-6 text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center text-xl mb-4">
 <i className="fa-solid fa-qrcode"></i>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-1">QR Auto-Attendance</h3>
 <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 mb-5 max-w-[200px] mx-auto">Generate a 60-second live token. Students scan from their app to auto-mark.</p>
 
 {qrActive ? (
 <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border p-4 rounded-xl flex flex-col items-center">
 <div className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white tracking-widest font-mono mb-2">{qrToken}</div>
 <div className="w-full bg-white dark:bg-[#121212] h-2 rounded-full overflow-hidden mb-2">
 <div className="h-full bg-indigo-500 transition ease-linear" style={{ width: `${(qrTimeLeft / 60) * 100}%` }}></div>
 </div>
 <p className="text-[10px] font-black uppercase text-gray-500 dark:text-white/50">Expires in {qrTimeLeft}s</p>
 </div>
 ) : (
 <button type="button" onClick={generateQR} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-gray-900 dark:text-white text-[13px] font-medium transition active:scale-[0.98]">
 Generate Secure QR
 </button>
 )}
 </div>
 
 <button type="button" onClick={handleCloseSession} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border hover:border-gray-200 dark:border-white/5Accent text-gray-900 dark:text-white text-[14px] font-medium tracking-normal transition mt-auto flex items-center justify-center gap-2">
 <i className="fa-solid fa-lock"></i> Finalize & Lock Session
 </button>
 </div>
 
 {/* Right: Roster List */}
 <div className="w-full xl:w-2/3 flex flex-col h-[70vh] bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/5Border overflow-hidden flex-1">
 <div className="p-4 border-b border-gray-200 dark:border-white/5Border flex gap-3 bg-white dark:bg-[#121212] sticky top-0 z-10">
 <div className="relative flex-1">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50"></i>
 <input 
 type="text" 
 placeholder="Search by name, roll, or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent"
 />
 </div>
 <button type="button" onClick={refreshLiveAttendance} className="px-4 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border rounded-xl hover:text-gray-900 dark:text-white text-gray-500 dark:text-white/50 transition-colors" title="Sync live QR entries">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
 {filteredStudents.map((student, index) => {
 const record = attendanceRecords[student.id] || { status: 'absent' };
 return (
 <div key={student.id} className="flex items-center justify-between p-3 lg:p-4 hover:bg-gray-100 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-white/5Border/50 last:border-0 rounded-xl transition-colors">
 <div className="flex items-center gap-4">
 <div className="w-8 text-center text-xs font-bold text-gray-500 dark:text-white/50 opacity-50">{index + 1}</div>
 <div>
 <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{student.full_name}</p>
 <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-normal">
 {student.roll_number || 'No Roll'} • {student.erp_id}
 </p>
 </div>
 </div>
 
 <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-xl border border-gray-200 dark:border-white/5Border shrink-0">
 <button type="button" 
 onClick={() => updateAttendance(student.id, 'present')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[13px] font-medium transition ${
 record.status === 'present' 
 ? 'bg-emerald-600 text-gray-900 dark:text-white' 
 : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white'
 }`}
 >
 P
 </button>
 <button type="button" 
 onClick={() => updateAttendance(student.id, 'absent')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[13px] font-medium transition ${
 record.status === 'absent' 
 ? 'bg-rose-500 text-gray-900 dark:text-white' 
 : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white'
 }`}
 >
 A
 </button>
 <button type="button" 
 onClick={() => updateAttendance(student.id, 'medical')}
 className={`px-3 lg:px-4 py-2 rounded-lg text-[13px] font-medium transition ${
 record.status === 'medical' || record.status === 'approved_leave' 
 ? 'bg-amber-500 text-gray-900 dark:text-white' 
 : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white'
 }`}
 >
 M
 </button>
 </div>
 </div>
 );
 })}
 {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-gray-500 dark:text-white/50 text-sm font-bold">No students found.</div>
 )}
 </div>
 </div>
 </div>
 )}
 
 {/* RISK ANALYTICS VIEW */}
 {activeTab === 'analytics' && (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
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

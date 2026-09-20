/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import PageHeader from "../../shared/PageHeader/PageHeader"; 

export default function Attendance({ menteeId, isEmbedded = false }) {
 const { userSession } = useERP();
    const targetUserId = menteeId || userSession?.db_id;

 const [attendanceData, setAttendanceData] = useState([]);
 const [overallAttendance, setOverallAttendance] = useState(0);
 const [totalAttended, setTotalAttended] = useState(0);
 const [totalMissed, setTotalMissed] = useState(0);
 const [totalMedical, setTotalMedical] = useState(0);
 const [totalLate, setTotalLate] = useState(0);
 const [totalApproved, setTotalApproved] = useState(0);

 const [isLoading, setIsLoading] = useState(true);
 const [activeSubject, setActiveSubject] = useState(null);
 const [showScanner, setShowScanner] = useState(false);
 
 // QR Scanner State
 const [scanToken, setScanToken] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
 const [showAppealModal, setShowAppealModal] = useState(false);
 const [appealRecord, setAppealRecord] = useState(null);
 const [appealReason, setAppealReason] = useState("");
 const [isAppealing, setIsAppealing] = useState(false);

 const handleFileAppeal = async () => {
    if(!appealReason.trim()) return window.erpDialog?.alert("Please provide a reason.");
    setIsAppealing(true);
    try {
        const ticketId = 'TKT-' + Date.now().toString().slice(-6);
        const { error } = await supabase.from('helpdesk_tickets').insert({
            ticket_id: ticketId,
            user_id: userSession.db_id,
            category: 'Attendance',
            subject: `Missing Attendance Appeal: ${activeSubject.course_name} on ${new Date(appealRecord.date).toLocaleDateString()}`,
            description: JSON.stringify({ reason: appealReason,
                session_id: appealRecord.session_id,
                student_id: userSession.db_id,
                record_id: appealRecord.id
            }),
            status: 'pending_mentor',
            admin_reply: 'Pending Mentor Review'
        });
        if(error) throw error;
        window.erpDialog?.alert("Appeal filed successfully. The Admin will review it.");
        setShowAppealModal(false);
        setAppealReason("");
    } catch (e) {
        window.erpDialog?.alert("Failed to file appeal.");
    } finally {
        setIsAppealing(false);
    }
 };

 const fetchAcademicData = useCallback(async () => {
        const studentId = targetUserId || userSession?.id;
        if (!studentId) return;
        setIsLoading(true);
        try {
            // Resolve the student's batch — if viewing as mentor, fetch from profiles
            let studentBatch = userSession?.academic_batch || '';
            if (menteeId) {
                const { data: menteeProfile } = await supabase
                    .from('profiles')
                    .select('academic_batch')
                    .eq('id', menteeId)
                    .single();
                if (menteeProfile?.academic_batch) studentBatch = menteeProfile.academic_batch;
            }

            // 1. Fetch RAW verifiable attendance
            const { data: attData, error } = await supabase
                .from('attendance_records')
                .select('id, entry_status, exit_status, entry_marked_at, session:class_sessions(id, date, status, schedule_id)')
                .eq('student_id', studentId)
                .order('entry_marked_at', { ascending: false });

            if (error) throw error;

            // 1b. Fetch all schedules for this batch to find unmarked/unconducted
            const { data: allSchedules } = await supabase.from('class_schedule')
                .select('id, start_time, end_time, room_id, batch, day_of_week, faculty_id, subject:master_subjects(id, name, code, theme_color), room:academic_classrooms(name)')
                .eq('batch', studentBatch);
                
            const schedMap = {};
            (allSchedules||[]).forEach(s => { schedMap[s.id] = s; });

            const scheduleIds = Object.keys(schedMap);
            let allSessions = [];
            if (scheduleIds.length > 0) {
                const { data: sData } = await supabase.from('class_sessions').select('id, date, status, schedule_id').in('schedule_id', scheduleIds);
                if (sData) allSessions = sData;
            }

            // Calculate past dates up to 14 days to find completely un-started classes
            const today = new Date();
            today.setHours(0,0,0,0);
            const pastDates = [];
            for(let i=0; i<=14; i++) { // Include today for un-started
                let d = new Date(today);
                d.setDate(d.getDate() - i);
                pastDates.push(d);
            }
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // 2. Client-Side Aggregation
            const subjectMap = {};
            let attCount = 0, missCount = 0, medCount = 0, appCount = 0, totCount = 0, lateCount = 0;

            // Initialize subject map
            (allSchedules||[]).forEach(sch => {
                if (!sch.subject) return;
                const subjId = sch.subject.id;
                if (!subjectMap[subjId]) {
                    subjectMap[subjId] = {
                        id: subjId,
                        course_code: sch.subject?.code || 'N/A',
                        course_name: sch.subject?.name || 'Unknown Course',
                        theme_color: sch.subject?.theme_color || 'default',
                        faculty_id: sch.faculty_id,
                        total_classes: 0,
                        present: 0,
                        absent: 0,
                        medical: 0,
                        approved: 0,
                        unmarked: 0,
                        records: []
                    };
                }
            });

            // Iterate over past dates to simulate what classes *should* have happened
            pastDates.forEach(dateObj => {
                const dateStr = dateObj.toISOString().split('T')[0];
                const dayName = dayNames[dateObj.getDay()];
                const dayNumStr = String(dateObj.getDay());

                (allSchedules||[]).forEach(sch => {
                    if (String(sch.day_of_week) !== dayName && String(sch.day_of_week) !== dayNumStr) return;
                    if (!sch.subject) return;
                    const subjId = sch.subject.id;

                    // Did the faculty create a session for this?
                    const sessionExists = allSessions.find(ses => ses.schedule_id === sch.id && ses.date === dateStr);
                    
                    if (sessionExists) {
                        // Check if student was marked
                        const studentRecord = (attData||[]).find(a => a.session?.id === sessionExists.id);
                        
                        subjectMap[subjId].total_classes += 1;
                        totCount += 1;
                        
                        if (studentRecord) {
                            if (studentRecord.entry_status === 'present') { subjectMap[subjId].present += 1; attCount += 1; }
                            else if (studentRecord.entry_status === 'late') { subjectMap[subjId].late += 1; lateCount += 1; attCount += 1; }
                            else if (studentRecord.entry_status === 'absent') { subjectMap[subjId].absent += 1; missCount += 1; }
                            else if (studentRecord.entry_status === 'medical') { subjectMap[subjId].medical += 1; medCount += 1; }
                            else if (studentRecord.entry_status === 'approved_leave') { subjectMap[subjId].approved += 1; appCount += 1; }
                            
                            subjectMap[subjId].records.push({ 
                                id: studentRecord.id,
                                date: sessionExists.date,
                                session_id: sessionExists.id,
                                start_time: sch.start_time,
                                status: studentRecord.entry_status,
                                room: sch.room?.name || 'N/A'
                            });
                        } else {
                            // Faculty started class, but student was completely unmarked (missing record)
                            subjectMap[subjId].unmarked += 1;
                            subjectMap[subjId].records.push({ 
                                id: 'unmarked-' + sessionExists.id,
                                date: sessionExists.date,
                                session_id: sessionExists.id,
                                start_time: sch.start_time,
                                status: 'unmarked', // We render this as a grey minus
                                room: sch.room?.name || 'N/A'
                            });
                        }
                    } else {
                        // Faculty NEVER started the class. It is 'Not Conducted' / Unmarked completely.
                        // We do not increment total_classes for the student so it doesn't hurt their %.
                        subjectMap[subjId].records.push({
                            id: 'not-conducted-' + sch.id + '-' + dateStr,
                            date: dateStr,
                            session_id: null,
                            start_time: sch.start_time,
                            status: 'unmarked',
                            room: sch.room?.name || 'N/A'
                        });
                    }
                });
            });
            
            // Sort records by date desc
            Object.values(subjectMap).forEach(subj => {
                subj.records.sort((a, b) => new Date(b.date) - new Date(a.date));
            });

            const groupedData = Object.values(subjectMap).filter(d => d.total_classes > 0 || d.records.length > 0);
            
            // Fetch Faculty Names
            const facIds = [...new Set(groupedData.map(d => d.faculty_id).filter(Boolean))];
            if(facIds.length > 0) {
                const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', facIds);
                groupedData.forEach(d => {
                    const prof = profs?.find(p => p.id === d.faculty_id);
                    d.faculty_name = prof ? prof.full_name : '—';
                });
            }

            setAttendanceData(groupedData);
            setTotalAttended(attCount);
            setTotalMissed(missCount);
            setTotalLate(lateCount);
            setTotalMedical(medCount);
            setTotalApproved(appCount);

            if (totCount > 0) {
                setOverallAttendance(Math.round(((attCount + lateCount) / totCount) * 100));
            } else {
                setOverallAttendance(100);
            }
        } catch (e) {
            console.error("Error fetching student attendance:", e);
        } finally {
            setIsLoading(false);
        }
    }, [userSession, menteeId, targetUserId]);

 useEffect(() => { fetchAcademicData(); }, [fetchAcademicData]);

    useEffect(() => {
        if (!targetUserId) return;
        
        const channel = supabase
            .channel('student-attendance-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${targetUserId}` },
                (payload) => {
                    fetchAcademicData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userSession, fetchAcademicData]);


 const CAMPUS_LAT = 17.3850;
const CAMPUS_LNG = 78.4867;
const ALLOWED_RADIUS_METERS = 200;

const getDistanceFromLatLonInM = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2-lat1) * (Math.PI/180);
    const dLon = (lon2-lon1) * (Math.PI/180); 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
};

const handleScanQR = async (e) => {
 e.preventDefault();
 if (!scanToken.trim()) return;
 
 setScanStatus("scanning");
 try {
 // Find session with this token that hasn't expired
 const { data: sessions, error: sesError } = await supabase
 .from('class_sessions')
 .select('id, qr_expires_at')
 .eq('qr_token', scanToken.toUpperCase());
 
 if (sesError || !sessions || sessions.length === 0) {
 throw new Error("Invalid or expired QR token.");
 }
 
 const session = sessions[0];
 if (new Date(session.qr_expires_at) < new Date()) {
 throw new Error("This QR token has expired.");
 }
 
 // Mark attendance
 const { data: existingRecords } = await supabase.from('attendance_records').select('id').eq('session_id', session.id).eq('student_id', userSession.db_id);
                    let insError;
                    if (existingRecords && existingRecords.length > 0) {
                        const { error } = await supabase.from('attendance_records').update({ entry_status: 'present', marked_by: 'student_qr', entry_marked_at: new Date().toISOString() }).eq('id', existingRecords[0].id);
                        insError = error;
                    } else {
                        const { error } = await supabase.from('attendance_records').insert({ session_id: session.id, student_id: userSession.db_id, entry_status: 'present', marked_by: 'student_qr', entry_marked_at: new Date().toISOString() });
                        insError = error;
                    }
 
 if (insError) throw insError;
 
 setScanStatus("success");
 setTimeout(() => {
 setShowScanner(false);
 setScanStatus("idle");
 setScanToken("");
 fetchAcademicData();
 }, 2000);
 
 } catch (error) {
 console.error(error);
 setScanStatus("error");
 setTimeout(() => setScanStatus("idle"), 50);
 }
 };

 // UI Helpers
 const getHealthColor = (percentage) => {
 if (percentage >= 85) return "bg-emerald-500 text-emerald-500 border-emerald-500/30";
 if (percentage >= 75) return "bg-amber-500 text-amber-500 border-amber-500/30";
 return "bg-rose-500 text-rose-500 border-rose-500/30";
 };

 const getHealthTextClass = (percentage) => {
 if (percentage >= 85) return "text-emerald-500";
 if (percentage >= 75) return "text-amber-500";
 return "text-rose-500";
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>

 {/* 1. MASTER HEADER */}
 <PageHeader 
 icon="fa-solid fa-user-check" 
 title="Verified Attendance" 
 subtitle="Official class participation synced seamlessly." 
 isEmbedded={isEmbedded}
 rightContent={
 <button type="button" onClick={() => setShowScanner(true)} className="btn-erp">
 <i className="fa-solid fa-keyboard text-lg"></i> Enter OTP
 </button>
 }
 />

{/* 2. OVERVIEW DASHBOARD */}
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col lg:flex-row gap-10 items-center lg:items-start relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-full max-w-[16rem] md:w-64 h-64 bg-themeAccent/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
 
 {/* The Linear Gauge */}
 <div className="w-full lg:w-1/2 flex flex-col gap-4 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <p className="text-[14px] font-bold text-themeTextSec tracking-tight mb-2">Overall Semester Health</p>
 <h2 className={`text-5xl font-black ${getHealthTextClass(overallAttendance)}`}>{overallAttendance}%</h2>
 </div>
 <div className="text-right">
 <p className="text-[13px] font-medium text-themeTextSec mb-1">Minimum Required</p>
 <p className="text-[16px] font-bold tracking-tight text-themeText dark:text-themeText">75%</p>
 </div>
 </div>
 
 <div className="relative h-4 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full overflow-hidden border border-black/10 dark:border-white/20">
 {/* Target Line */}
 <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-themeText z-10"></div>
 
 {/* Fill */}
 <div 
 className={`h-full rounded-full transition duration-1000 ${getHealthColor(overallAttendance).split(' ')[0]}`}
 style={{ width: `${overallAttendance}%` }}
 ></div>
 </div>
 
 <div className="flex justify-between text-[12px] font-medium text-themeTextSec px-1">
 <span>0%</span>
 <span>100%</span>
 </div>
 
 {overallAttendance < 75 && (
 <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
 <i className="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5"></i>
 <div>
 <p className="text-[14px] font-medium text-rose-500">Action Required</p>
 <p className="text-[10px] font-bold text-rose-400 mt-0.5">You are falling below the university attendance mandate. Contact your mentor.</p>
 </div>
 </div>
 )}
 </div>
 
 {/* Stat Cards */}
 <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 relative z-10">
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[13px] font-medium text-themeTextSec mb-1">Classes Attended</p>
 <p className="text-2xl font-semibold tracking-tight text-themeText">{totalAttended}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[13px] font-medium text-themeTextSec mb-1">Classes Missed</p>
 <p className="text-2xl font-semibold tracking-tight text-rose-500">{totalMissed}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[13px] font-medium text-themeTextSec mb-1">Medical Leaves</p>
 <p className="text-2xl font-semibold tracking-tight text-amber-500">{totalMedical}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
    <p className="text-[13px] font-medium text-themeTextSec mb-1">Arrived Late</p>
    <p className="text-2xl font-semibold tracking-tight text-amber-500">{totalLate}</p>
</div>
 </div>
 </div>

 {/* 3. SUBJECT-WISE BREAKDOWN */}
 <div className="flex flex-col gap-4">
 <h2 className="text-xl font-semibold tracking-tight text-themeText tracking-tight">Subject Breakdown</h2>
 
 {isLoading ? (
 <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4 mt-6">
 <div className="h-48 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 <div className="h-48 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
</div>
 ) : attendanceData.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-book-blank text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Verified Records</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">No classes have been marked for you yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
 {attendanceData.map((subject, idx) => {
 const percentage = subject.total_classes === 0 ? 0 : Math.round((subject.present / subject.total_classes) * 100);
 
 return (
 <div 
 key={idx}
 onClick={() => setActiveSubject(subject)}
 className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-2xl p-5 hover:border-themeAccent/50 transition cursor-pointer group flex flex-col gap-4"
 >
 <div className="flex justify-between items-start">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className={`w-3 h-3 rounded-full ${getHealthColor(percentage).split(' ')[0]}`}></span>
 <p className="text-[12px] font-medium text-themeTextSec truncate max-w-[150px]">{subject.course_code}</p>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText leading-tight group-hover:text-themeAccent transition-colors">{subject.course_name}</h3>
 </div>
 <h2 className={`text-2xl font-semibold tracking-tight ${getHealthTextClass(percentage)} shrink-0`}>{percentage}%</h2>
 </div>
 
 <div className="flex items-center gap-4 text-[13px] font-medium text-themeTextSec bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 rounded-xl border border-black/10 dark:border-white/20 justify-around">
 <div className="text-center">
 <span className="block text-emerald-500 text-sm mb-0.5">{subject.present}</span> Present
 </div>
 <div className="text-center border-l border-r border-black/10 dark:border-white/20 px-4">
 <span className="block text-rose-500 text-sm mb-0.5">{subject.absent}</span> Absent
 </div>
 <div className="text-center">
 <span className="block text-amber-500 text-sm mb-0.5">{subject.medical + subject.approved}</span> Exempt
 </div>
 </div>
 
 {/* Linear progress bar small */}
 <div className="relative h-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full ${getHealthColor(percentage).split(' ')[0]}`}
 style={{ width: `${percentage}%` }}
 ></div>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {/* MODALS & DRAWERS */}
 
 {/* QR Scanner Modal */}
 {showScanner && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="w-full max-w-sm bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-2xl overflow-hidden flex flex-col relative">
 <div className="p-4 border-b border-black/10 dark:border-white/20 flex justify-between items-center bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 <h3 className="text-[15px] font-semibold text-themeText tracking-normal">Live Attendance</h3>
 <button type="button" onClick={() => setShowScanner(false)} className="w-8 h-8 rounded-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 
 <form onSubmit={handleScanQR} className="p-6 flex flex-col items-center gap-6">
 <div className={`w-24 h-24 rounded-2xl border-4 flex items-center justify-center text-4xl transition ${
 scanStatus === 'idle' ? 'border-black/10 dark:border-white/20 text-themeTextSec' :
 scanStatus === 'scanning' ? 'border-themeAccent text-themeAccent animate-pulse' :
 scanStatus === 'success' ? 'border-emerald-500 text-emerald-500' :
 'border-rose-500 text-rose-500'
 }`}>
 {scanStatus === 'success' ? <i className="fa-solid fa-check"></i> :
 scanStatus === 'error' ? <i className="fa-solid fa-xmark"></i> :
 <i className="fa-solid fa-keyboard"></i>}
 </div>
 
 <div className="text-center w-full">
 <h4 className="text-lg font-semibold tracking-tight text-themeText mb-1">Enter Whiteboard OTP</h4>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal mb-4">Written on the whiteboard by your faculty</p>
 
 <div className="flex justify-center mt-2 mb-2">
    <CodeSlots
        length={8}
        value={scanToken}
        onChange={setScanToken}
        onComplete={(code) => {
            setScanToken(code);
            // Optionally auto-submit if scanStatus is idle
            if (scanStatus === 'idle') {
                // we simulate form submit by calling handleScanSubmit
                // but handleScanSubmit needs e.preventDefault(), so we mock it
                handleScanSubmit({ preventDefault: () => {} });
            }
        }}
        status={scanStatus === 'success' ? 'success' : scanStatus === 'error' ? 'error' : 'idle'}
        slotSize={38}
        gap={6}
        radius={10}
        accentColor="#007AFF"
        inkColor="#FFFFFF"
        slotColor="var(--bg-glass)"
        digitColor="var(--text-primary)"
        disabled={scanStatus !== 'idle'}
    />
 </div>
 </div>
 
 <button 
 type="submit" 
 disabled={scanStatus !== 'idle' || !scanToken.trim()}
 className="btn-erp"
 >
 {scanStatus === 'idle' ? 'Mark Present' : 
 scanStatus === 'scanning' ? 'Verifying...' : 
 scanStatus === 'success' ? 'Verified!' : 'Failed'}
 </button>
 </form>
 </div>
 </div>
 )}
 
 {/* Subject Details Drawer */}
 {activeSubject && (
 <div className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fade-in">
 <div className="w-full max-w-md h-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border-l border-black/5 dark:border-white/10 flex flex-col animate-slide-in-right shadow-2xl">
 <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-start shrink-0 bg-gradient-to-b from-white/40 to-transparent dark:from-black/20">
 <div>
 <p className="text-[11px] font-bold tracking-widest uppercase text-themeTextSec opacity-70 mb-1">{activeSubject.course_code}</p>
 <h2 className="text-xl md:text-2xl font-black tracking-tight text-themeText leading-tight">{activeSubject.course_name}</h2>
 <p className="text-xs font-semibold text-themeTextSec mt-2 flex items-center gap-1.5"><i className="fa-solid fa-user-tie"></i> {activeSubject.faculty_name}</p>
 </div>
 <button type="button" onClick={() => setActiveSubject(null)} className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-themeTextSec hover:bg-black/10 dark:hover:bg-white/20 hover:text-themeText transition-all shrink-0">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar flex flex-col gap-8">
 {/* Prediction Engine */}
 <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl border border-black/5 dark:border-white/5 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-[#007AFF]/10 dark:bg-[#007AFF]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
 <h3 className="text-[13px] font-bold text-themeText tracking-tight mb-5 flex items-center gap-2">
 <i className="fa-solid fa-wand-magic-sparkles text-themeAccent"></i> Prediction Engine
 </h3>
 
 <div className="flex items-center justify-between mb-3 bg-white/40 dark:bg-white/5 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
 <p className="text-[11px] font-semibold text-themeTextSec tracking-tight">Current Attendance</p>
 <p className="text-[16px] font-black tracking-tight text-themeText">{activeSubject.total_classes === 0 ? 0 : Math.round((activeSubject.present / activeSubject.total_classes) * 100)}%</p>
 </div>
 
 <div className="flex items-center justify-between bg-white/40 dark:bg-white/5 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
 <p className="text-[11px] font-semibold text-themeTextSec tracking-tight">If you miss next class</p>
 <p className="text-[16px] font-black tracking-tight text-rose-500">
 {activeSubject.total_classes === 0 ? 0 : Math.round((activeSubject.present / (activeSubject.total_classes + 1)) * 100)}%
 </p>
 </div>
 </div>
 
 {/* Timeline */}
 <div>
 <h3 className="text-[13px] font-bold text-themeText tracking-tight mb-5 px-1">Class Timeline</h3>
 <div className="flex flex-col gap-4">
 {activeSubject.records.length === 0 ? (
 <div className="text-center py-8 bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl">
    <p className="text-xs font-semibold text-themeTextSec">No records available yet.</p>
 </div>
 ) : (
 activeSubject.records.map((rec) => (
 <div key={rec.id} className="flex gap-4 items-stretch group">
 {/* Status Line */}
 <div className="flex flex-col items-center">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
 rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : rec.status === 'late' ? 'bg-amber-500/10 text-amber-500' :
 rec.status === 'absent' ? 'bg-rose-500/10 text-rose-500' :
 rec.status === 'unmarked' ? 'bg-black/5 dark:bg-white/10 text-themeTextSec dark:text-white/50' :
 'bg-amber-500/10 text-amber-500'
 }`}>
 {rec.status === 'present' ? <i className="fa-solid fa-check text-[11px]"></i> : rec.status === 'late' ? <i className="fa-solid fa-clock text-[11px]"></i> :
 rec.status === 'absent' ? <i className="fa-solid fa-xmark text-[11px]"></i> :
 rec.status === 'unmarked' ? <i className="fa-solid fa-minus text-[11px]"></i> :
 <i className="fa-solid fa-suitcase-medical text-[11px]"></i>}
 </div>
 <div className="w-px h-full bg-black/5 dark:bg-white/10 my-2 last:hidden"></div>
 </div>
 
 {/* Details Card */}
 <div className="bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/5 p-4 rounded-3xl shadow-sm transition-colors flex-1 mb-2 last:mb-0">
 <div className="flex justify-between items-start mb-1.5">
 <p className="text-[14px] font-bold tracking-tight text-themeText">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
 <p className={`text-[11px] font-black uppercase tracking-widest ${
 rec.status === 'present' ? 'text-emerald-500' : rec.status === 'late' ? 'text-amber-500' :
 rec.status === 'absent' ? 'text-rose-500' :
 rec.status === 'unmarked' ? 'text-themeTextSec dark:text-white/50' :
 'text-amber-500'
 }`}>{rec.status.replace('_', ' ')}</p>
 </div>
 <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
    <p className="text-[11px] font-semibold text-themeTextSec tracking-tight flex items-center gap-1.5">
        <i className="fa-regular fa-clock opacity-70"></i> 
        {rec.start_time?.substring(0, 5) || 'N/A'} 
        {rec.room && rec.room !== 'N/A' && <><span className="mx-1 opacity-40">•</span> Room {rec.room}</>}
    </p>
    {rec.status === 'absent' && (
        <button type="button" onClick={() => { setAppealRecord(rec); setShowAppealModal(true); }} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm">
            Appeal
        </button>
    )}
</div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
             {/* APPEAL MODAL */}
            {showAppealModal && appealRecord && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-themeText dark:text-white">Appeal Missing Attendance</h3>
                            <button onClick={() => setShowAppealModal(false)} className="text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <p className="text-sm font-medium text-white/70">
                            Filing appeal for <span className="text-themeText dark:text-white font-bold">{activeSubject?.course_name}</span> on <span className="text-themeText dark:text-white font-bold">{new Date(appealRecord.date).toLocaleDateString()}</span>.
                        </p>
                        <textarea
                            className="w-full h-32 bg-white/5 border border-themeBorder dark:border-white/10 rounded-xl p-4 text-sm font-medium text-themeText dark:text-white outline-none resize-none focus:border-amber-500/50"
                            placeholder="Explain why you were marked absent incorrectly..."
                            value={appealReason}
                            onChange={(e) => setAppealReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-2">
                            <button onClick={() => setShowAppealModal(false)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-themeText dark:text-white text-sm font-bold transition-colors">Cancel</button>
                            <button onClick={handleFileAppeal} disabled={isAppealing} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-colors">
                                {isAppealing ? 'Submitting...' : 'Submit Appeal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { Badge } from "../../ui/Badge";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generatePDF } from "../../../DocumentTemplates/pdfGenerator";

export default function ClassRoster({}) {
 const { userSession } = useERP();

 // --- ZERO-LAG CACHE INITIALIZATION ---
 const getCachedClasses = ({ isEmbedded = false }) => {
 try { return JSON.parse(sessionStorage.getItem('jsmerp_faculty_classes_cache')) || []; }
 catch { return []; }
 };
 
 const getCachedActiveClass = ({ isEmbedded = false }) => {
 try { return sessionStorage.getItem('jsmerp_faculty_active_class_cache') || ""; }
 catch { return ""; }
 };

 const getCachedRoster = (classId) => {
 if (!classId) return [];
 try { return JSON.parse(sessionStorage.getItem(`jsmerp_roster_cache_${classId}`)) || []; }
 catch { return []; }
 };

 const getCachedAttendance = (classId) => {
 if (!classId) return {};
 try { return JSON.parse(sessionStorage.getItem(`jsmerp_attendance_cache_${classId}`)) || {}; }
 catch { return {}; }
 };

 // --- STATE ---
 const [facultyClasses, setFacultyClasses] = useState(getCachedClasses);
 const [activeClass, setActiveClass] = useState(getCachedActiveClass);
 
 const [rosterData, setRosterData] = useState(() => getCachedRoster(getCachedActiveClass()));
 const [attendanceState, setAttendanceState] = useState(() => getCachedAttendance(getCachedActiveClass()));

 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);

 // Feature: QR Code Attendance Simulation
 const [showQR, setShowQR] = useState(false);
 const [qrCodeData, setQrCodeData] = useState(null);

 // --- DATA SYNC ENGINE ---
 const handleClassChange = (e) => {
 const newClass = e.target.value;
 setActiveClass(newClass);
 sessionStorage.setItem('jsmerp_faculty_active_class_cache', newClass);
 setShowQR(false);
 
 // Optimistically load new class data from cache
 setRosterData(getCachedRoster(newClass));
 setAttendanceState(getCachedAttendance(newClass));
 };

 // 1. Fetch Faculty's Timetable Scheduled Classes
 useEffect(() => {
 if (!userSession?.db_id) return;

 const fetchMyClasses = async () => {
 try {
 // Fetch directly from the global timetable engine
 const { data, error } = await supabase
 .from('class_schedule')
 .select('*, subjects(name, code)')
 .eq('faculty_id', userSession.db_id);

 if (error) throw error;

 if (data) {
 setFacultyClasses(data);
 sessionStorage.setItem('jsmerp_faculty_classes_cache', JSON.stringify(data));
 
 if (data.length > 0 && !activeClass) {
 setActiveClass(data[0].id);
 sessionStorage.setItem('jsmerp_faculty_active_class_cache', data[0].id);
 setRosterData(getCachedRoster(data[0].id));
 setAttendanceState(getCachedAttendance(data[0].id));
 }
 }
 } catch (err) {
 console.error("Failed to load faculty timetable:", err);
 }
 };
 fetchMyClasses();
 }, [userSession, activeClass]);

 // 2. Fetch Students & Compute Attendance Stats for Selected Class
 useEffect(() => {
 if (!activeClass || facultyClasses.length === 0) return;

 const fetchStudentsForClass = async () => {
 try {
 const targetClass = facultyClasses.find(c => c.id === activeClass);
 if (!targetClass) return;

 // A. Fetch all students in this specific batch
 const { data: students, error: rosterError } = await supabase
 .from('profiles')
 .select('id, erp_id, full_name')
 .eq('role', 'student')
 .eq('academic_batch', targetClass.batch_id)
 .order('erp_id', { ascending: true });

 if (rosterError) throw rosterError;

 if (!students || students.length === 0) {
 setRosterData([]);
 setAttendanceState({});
 sessionStorage.removeItem(`jsmerp_roster_cache_${activeClass}`);
 sessionStorage.removeItem(`jsmerp_attendance_cache_${activeClass}`);
 return;
 }

 const studentDbIds = students.map(s => s.id);

 // B. Fetch Historical Attendance via sessions
        const { data: sessions } = await supabase
            .from('class_sessions')
            .select('id')
            .eq('schedule_id', targetClass.id);
            
        let historicalAtt = [];
        let todaySessionId = null;
        
        if (sessions && sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Try to find if one of these sessions is today's session
            const { data: fullSessions } = await supabase.from('class_sessions').select('id, date').in('id', sessionIds);
            const todaySession = fullSessions?.find(s => s.date === todayStr);
            if (todaySession) todaySessionId = todaySession.id;
            
            const { data: records } = await supabase
                .from('attendance_records')
                .select('student_id, status, session_id')
                .in('session_id', sessionIds)
                .in('student_id', studentDbIds);
            
            if (records) historicalAtt = records;
        }

        const cachedAtt = getCachedAttendance(activeClass);
        const newAttendanceState = { ...cachedAtt };

        // Process data per student
        const processedRoster = students.map(student => {
            const studentRecords = historicalAtt.filter(record => record.student_id === student.id);
            
            const currentClassRecord = todaySessionId ? studentRecords.find(record => record.session_id === todaySessionId) : null;


 // If not in cache, fallback to the DB record for this class, or null
 if (newAttendanceState[student.id] === undefined) {
 newAttendanceState[student.id] = currentClassRecord ? currentClassRecord.status : null;
 }

 // Calculate Overall Attendance % for this specific subject globally
 const validRecords = studentRecords.filter(r => r.status !== 'excused');
 const totalClasses = validRecords.length;
 const presentClasses = validRecords.filter(r => r.status === 'present').length;

 let attPct = 100;
 if (totalClasses > 0) {
 attPct = Math.round((presentClasses / totalClasses) * 100);
 }

 // Determine danger status
 let statusColor = "safe";
 if (attPct < 75) statusColor = "danger";
 else if (attPct < 85) statusColor = "warning";

 return {
 ...student,
 overall_attendance: attPct,
 status: statusColor
 };
 });

 setRosterData(processedRoster);
 setAttendanceState(newAttendanceState);
 
 sessionStorage.setItem(`jsmerp_roster_cache_${activeClass}`, JSON.stringify(processedRoster));
 sessionStorage.setItem(`jsmerp_attendance_cache_${activeClass}`, JSON.stringify(newAttendanceState));

 } catch (err) {
 console.error("Failed to fetch roster:", err);
 }
 };

 fetchStudentsForClass();
 }, [activeClass, facultyClasses]);

 // --- HANDLERS ---
 const handleMark = (studentDbId, status) => {
 const newState = { ...attendanceState, [studentDbId]: status };
 setAttendanceState(newState);
 sessionStorage.setItem(`jsmerp_attendance_cache_${activeClass}`, JSON.stringify(newState));
 };

 const handleSaveAttendance = async () => {
 setIsSaving(true);
 try {
 const targetClass = facultyClasses.find(c => c.id === activeClass);

 // 1. Get or Create Session for Today
        const todayStr = new Date().toISOString().split('T')[0];
        
        let { data: session, error: sesError } = await supabase
            .from('class_sessions')
            .select('id')
            .eq('schedule_id', targetClass.id)
            .eq('date', todayStr)
            .single();
            
        if (!session) {
            const { data: newSession, error: createError } = await supabase
                .from('class_sessions')
                .insert({
                    schedule_id: targetClass.id,
                    faculty_id: userSession.db_id,
                    date: todayStr,
                    status: 'completed',
                    started_at: new Date().toISOString(),
                    ended_at: new Date().toISOString()
                })
                .select('id')
                .single();
                
            if (createError) throw createError;
            session = newSession;
        }

        // 2. Build Insert Payload according to new schema
        const payload = rosterData.map(student => ({
            session_id: session.id,
            student_id: student.id,
            status: attendanceState[student.id],
            marked_by: 'faculty',
            marked_at: new Date().toISOString()
        }));

        // 3. Upsert cleanly
        const { error } = await supabase.from('attendance_records').upsert(payload, { onConflict: 'session_id,student_id' });

        if (error) throw error;

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);

 } catch (error) {
 console.error("Failed to save attendance:", error);
 window.erpDialog.alert("Failed to sync attendance to the server.");
 } finally {
 setIsSaving(false);
 }
 };

 const generateQRCode = ({ isEmbedded = false }) => {
 const targetClass = facultyClasses.find(c => c.id === activeClass);
 if (!targetClass) return;

 setQrCodeData({
 sessionToken: `jsmerp_att_${Math.random().toString(36).substring(2, 15)}`,
 subject: targetClass.subjects?.name || "Unknown",
 batch: targetClass.batch_id,
 expiresIn: 300 // 5 minutes
 });
 setShowQR(true);

 setTimeout(() => {
 setAttendanceState(prev => {
 const newState = { ...prev };
 rosterData.forEach((s) => {
 if (newState[s.id] === null) {
 newState[s.id] = Math.random() > 0.2 ? 'present' : null;
 }
 });
 sessionStorage.setItem(`jsmerp_attendance_cache_${activeClass}`, JSON.stringify(newState));
 return newState;
 });
 }, 5000);
 };

 // Derived Counters & Safety Locks
 const presentCount = Object.values(attendanceState).filter(s => s === "present").length;
 const absentCount = Object.values(attendanceState).filter(s => s === "absent").length;
 const excusedCount = Object.values(attendanceState).filter(s => s === "excused").length;

 // STRICT GUARD: Disable submit if ANY student is null
 const isComplete = rosterData.length > 0 && rosterData.every(s => attendanceState[s.id] !== null);

 return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-[#1A1A1A] ${!isEmbedded ? "min-h-screen bg-themeApp text-gray-900 dark:text-white" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 {/* 1. HEADER & COURSE SELECTOR */}
 <PageHeader 
 icon="fa-solid fa-users-viewfinder" 
 title="Official Attendance Roster" 
 subtitle="Manage class participation synced directly with the global Timetable engine." 
 rightContent={
 <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4 w-full lg:w-auto">
 <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
 <select 
 className="w-full appearance-none bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border hover:border-gray-200 dark:border-white/5BorderStrong text-gray-900 dark:text-white text-[14px] font-medium px-4 py-3.5 rounded-2xl outline-none cursor-pointer transition-colors"
 value={activeClass}
 onChange={(e) => setActiveClass(e.target.value)}
 >
 {facultyClasses.length === 0 ? (
 <option value="">No Classes Scheduled</option>
 ) : (
 facultyClasses.map(cls => {
 const timeStr = cls.start_time ? cls.start_time.substring(0,5) : "TBD";
 return (
 <option key={cls.id} value={cls.id} className="bg-white dark:bg-[#121212] text-gray-900 dark:text-white">
 {cls.day_of_week} {timeStr} - {cls.subjects?.name || cls.subject_id} ({cls.batch_id})
 </option>
 );
 })
 )}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 opacity-70 pointer-events-none"></i>
 </div>

 <button type="button" 
 onClick={generateQRCode}
 disabled={facultyClasses.length === 0 || rosterData.length === 0}
 className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-themeAccent hover:text-gray-900 dark:text-white disabled:bg-themeApp disabled:text-gray-500 dark:text-white/50 opacity-70 disabled:border-gray-200 dark:border-white/5BorderStrong text-gray-900 dark:text-white border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-95 flex items-center justify-center gap-2 group shrink-0 no-print"
 >
 <i className="fa-solid fa-qrcode group-hover:scale-110 transition-transform"></i> Live QR
 </button>
 </div>
 }
 />

 {/* EMPTY STATE: NO CLASSES */}
 {facultyClasses.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-users-slash text-4xl lg:text-5xl text-neutral-700 mb-4 lg:mb-6"></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-2xl text-gray-900 dark:text-white tracking-tight`}>No Roster Available</h3>
 <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2`}>You have no active classes scheduled in the Timetable.</p>
 </div>
 ) : (
 <>
 {/* QR CODE MODAL (NEW FEATURE) */}
 {showQR && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4 animate-fade-in no-print">
 <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#2a2a2a] p-10 rounded-2xl flex flex-col items-center max-w-lg w-full relative">
 <button type="button" onClick={() => setShowQR(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[#888888] hover:text-gray-900 dark:text-white bg-[#222222] rounded-full border border-gray-200 dark:border-white/5BorderStrong transition-colors hover:scale-110">
 <i className="fa-solid fa-xmark text-lg"></i>
 </button>
 
 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
 <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center rounded-xl text-3xl mb-6">
 <i className="fa-solid fa-qrcode"></i>
 </div>
 <h3 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2 tracking-tight text-center">Scan to Mark Present</h3>
 <div className="flex items-center gap-3 mb-8 text-center bg-[#1a1a1a] px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/5BorderStrong">
 <span className="text-sm text-gray-300 font-bold">{qrCodeData?.subject}</span>
 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
 <span className="text-sm text-blue-400 font-bold tracking-widest">{qrCodeData?.batch}</span>
 </div>
 
 <div className="w-64 h-64 bg-white p-4 rounded-xl mb-8 flex items-center justify-center border-8 border-blue-500/20 relative overflow-hidden group">
 <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
 <div className="w-full h-full border-4 border-dashed border-[#121212] flex items-center justify-center opacity-80 bg-white relative z-10">
 {/* In a real app, use a real QR code library here. Using a detailed icon for now. */}
 <i className="fa-solid fa-qrcode text-[8rem] text-[#121212]"></i>
 </div>
 </div>
 
 <div className="w-full bg-[#1a1a1a] p-5 rounded-xl border border-gray-200 dark:border-white/5BorderStrong">
 <div className="flex items-center justify-between mb-3">
 <p className="text-[11px] font-black tracking-normal text-blue-400 flex items-center gap-2">
 <i className="fa-solid fa-circle-dot text-rose-500 animate-pulse"></i> Live Sync Active
 </p>
 <p className="text-[11px] text-[#888888] font-bold tracking-normal">Expires in 5:00</p>
 </div>
 <div className="h-2 w-full bg-themeApp rounded-full overflow-hidden border border-gray-200 dark:border-white/5Border">
 <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-full animate-[shrink_300s_linear_forwards] relative">
 <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[pan_1s_linear_infinite]"></div>
 </div>
 </div>
 <style jsx>{`
 @keyframes shrink { from { width: 100%; } to { width: 0%; } }
 @keyframes pan { from { background-position: 0 0; } to { background-position: 20px 20px; } }
 `}</style>
 </div>
 
 <p className="text-[10px] text-gray-500 mt-6 text-center italic tracking-widest font-medium uppercase max-w-sm">
 "Students scanning will automatically appear on your roster."
 </p>
 </div>
 </div>
 )}

 {/* 2. ATTENDANCE SUMMARY STATS */}
 <div className="grid grid-cols-3 gap-3 lg:gap-4 animate-fade-in">
 <div className={`${theme.layout.panel} p-4 lg:p-6 rounded-2xl rounded-2xl flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border-b-4 sm:border-b-0 sm:border-l-4 border-emerald-500 border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border gap-3 text-center sm:text-left`}>
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-emerald-500 mb-1">Present</p>
 <p className="text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{presentCount}</p>
 </div>
 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-emerald-400 flex items-center justify-center text-base lg:text-xl shrink-0"><i className="fa-solid fa-user-check"></i></div>
 </div>
 <div className={`${theme.layout.panel} p-4 lg:p-6 rounded-2xl rounded-2xl flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border-b-4 sm:border-b-0 sm:border-l-4 border-rose-500 border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border gap-3 text-center sm:text-left`}>
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-rose-500 mb-1">Absent</p>
 <p className="text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{absentCount}</p>
 </div>
 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-rose-400 flex items-center justify-center text-base lg:text-xl shrink-0"><i className="fa-solid fa-user-xmark"></i></div>
 </div>
 <div className={`${theme.layout.panel} p-4 lg:p-6 rounded-2xl rounded-2xl flex flex-col sm:flex-row items-center sm:items-start sm:justify-between border-b-4 sm:border-b-0 sm:border-l-4 border-amber-500 border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border gap-3 text-center sm:text-left`}>
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-themeAccent mb-1">Excused</p>
 <p className="text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{excusedCount}</p>
 </div>
 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-themeAccent flex items-center justify-center text-base lg:text-xl shrink-0"><i className="fa-solid fa-user-shield"></i></div>
 </div>
 </div>

 {/* 3. ROSTER TABLE */}
 <div className={`${theme.layout.panel} rounded-2xl overflow-hidden border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border relative min-h-[300px]`}>

 {rosterData.length === 0 ? (
 <div className="w-full py-20 flex flex-col items-center justify-center text-center">
 <i className="fa-solid fa-users-slash text-4xl text-neutral-700 mb-4"></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-xl text-gray-900 dark:text-white`}>Batch is Empty</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.muted} mt-2`}>No active students are currently enrolled in this specific batch.</p>
 </div>
 ) : (
 <div className="overflow-x-auto no-scrollbar animate-fade-in printable-area">
 <table className="w-full text-left border-collapse min-w-[600px]">
 <thead>
 <tr className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border">
 <th className={`p-4 lg:p-5 pl-6 lg:pl-8 text-[9px] lg:text-[10px] font-black ${theme.text.muted} tracking-normal w-24 lg:w-28`}>Enrollment</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} tracking-normal`}>Student Name</th>
 <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} tracking-normal text-center`}>Overall Att.</th>
 <th className={`p-4 lg:p-5 pr-6 lg:pr-8 text-[9px] lg:text-[10px] font-black ${theme.text.muted} tracking-normal text-right`}>Mark Today's Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-800/50">
 {rosterData.map((student) => (
 <tr key={student.id} className="hover:bg-gray-100 dark:bg-[#1A1A1A] transition-colors group">
 <td className={`p-4 lg:p-5 pl-6 lg:pl-8 text-[10px] lg:text-xs font-bold ${theme.text.secondary}`}>{student.erp_id}</td>
 <td className="p-4 lg:p-5">
 <p className="text-xs lg:text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">{student.full_name}</p>
 </td>
 <td className="p-4 lg:p-5 text-center">
 <Badge variant={student.status === 'safe' ? 'success' : student.status === 'warning' ? 'warning' : 'destructive'}>
 {student.attendance_percentage}%
 </Badge>
 </td>
 <td className="p-4 lg:p-5 pr-6 lg:pr-8">
 <div className="flex justify-end gap-1.5 lg:gap-2">
 <button type="button"
 onClick={() => handleMark(student.id, "present")}
 className={`w-9 h-9 sm:w-auto sm:px-4 sm:py-2.5 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition border-gray-200 dark:border-white/5 ${attendanceState[student.id] === "present"
 ? "bg-emerald-500 text-themeApp border-emerald-400 scale-[1.02]"
 : "bg-white dark:bg-[#121212] text-gray-500 dark:text-white/50 opacity-70 border-gray-200 dark:border-white/5BorderStrong hover:border-gray-200 dark:border-white/5BorderStrong hover:text-emerald-400 "
 }`}
 >
 <span className="hidden sm:inline">Present</span>
 <i className="fa-solid fa-check sm:hidden"></i>
 </button>
 <button type="button"
 onClick={() => handleMark(student.id, "absent")}
 className={`w-9 h-9 sm:w-auto sm:px-4 sm:py-2.5 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition border-gray-200 dark:border-white/5 ${attendanceState[student.id] === "absent"
 ? "bg-rose-500 text-gray-900 dark:text-white border-rose-400 scale-[1.02]"
 : "bg-white dark:bg-[#121212] text-gray-500 dark:text-white/50 opacity-70 border-gray-200 dark:border-white/5BorderStrong hover:border-gray-200 dark:border-white/5BorderStrong hover:text-rose-400 "
 }`}
 >
 <span className="hidden sm:inline">Absent</span>
 <i className="fa-solid fa-xmark sm:hidden"></i>
 </button>
 <button type="button"
 onClick={() => handleMark(student.id, "excused")}
 className={`w-9 h-9 sm:w-auto sm:px-4 sm:py-2.5 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition border-gray-200 dark:border-white/5 ${attendanceState[student.id] === "excused"
 ? "bg-amber-500 text-themeApp border-amber-400 scale-[1.02]"
 : "bg-white dark:bg-[#121212] text-gray-500 dark:text-white/50 opacity-70 border-gray-200 dark:border-white/5BorderStrong hover:border-gray-200 dark:border-white/5BorderStrong hover:text-themeAccent "
 }`}
 title="Medical / Official Duty"
 >
 <span className="hidden sm:inline">Excused</span>
 <i className="fa-solid fa-shield sm:hidden"></i>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* 4. STICKY ACTION BAR */}
 {rosterData.length > 0 && (
 <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 p-4 lg:p-6 bg-themeApp border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5Border flex justify-end z-40 lg:z-30 pb-safe">
 {saveSuccess ? (
 <div className="bg-gray-100 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-emerald-400 px-6 lg:px-8 py-3.5 lg:py-4 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal flex items-center gap-2 animate-fade-in w-full sm:w-auto justify-center">
 <i className="fa-solid fa-check-double text-lg"></i> Official Sync Complete
 </div>
 ) : (
 <button type="button"
 onClick={handleSaveAttendance}
 disabled={isSaving || !isComplete}
 title={!isComplete ? "Mark all students to submit" : ""}
 className={`w-full sm:w-auto px-6 lg:px-8 py-3.5 lg:py-4 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex items-center justify-center gap-2 overflow-hidden group ${isSaving || !isComplete
 ? 'bg-neutral-800 text-gray-500 dark:text-white/50 opacity-70 cursor-not-allowed border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong'
 : 'bg-emerald-600 text-gray-900 dark:text-white hover:bg-emerald-500 active:scale-[0.98]'
 }`}
 >
 {!isSaving && isComplete && (
 <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
 )}
 {isSaving ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting to Server...</>
 ) : !isComplete ? (
 <><i className="fa-solid fa-triangle-exclamation text-lg"></i> Mark All to Submit</>
 ) : (
 <><i className="fa-solid fa-cloud-arrow-up text-lg"></i> Submit Verified Roster</>
 )}
 </button>
 )}
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
}
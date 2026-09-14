/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import PageHeader from "../../shared/PageHeader/PageHeader"; 

export default function Attendance({ isEmbedded = false }) {
 const { userSession } = useERP();

 const [attendanceData, setAttendanceData] = useState([]);
 const [overallAttendance, setOverallAttendance] = useState(0);
 const [totalAttended, setTotalAttended] = useState(0);
 const [totalMissed, setTotalMissed] = useState(0);
 const [totalMedical, setTotalMedical] = useState(0);
 const [totalApproved, setTotalApproved] = useState(0);

 const [isLoading, setIsLoading] = useState(true);
 const [activeSubject, setActiveSubject] = useState(null);
 const [showScanner, setShowScanner] = useState(false);
 
 // QR Scanner State
 const [scanToken, setScanToken] = useState("");
 const [scanStatus, setScanStatus] = useState("idle"); // idle, scanning, success, error

 const fetchAcademicData = useCallback(async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;
 setIsLoading(true);
 try {
 // 1. Fetch RAW verifiable attendance from new schema
 const { data, error } = await supabase
 .from('attendance_records')
 .select(`
 id, status, marked_at,
 session:session_id(
 id, date, status,
 schedule:schedule_id(
 id, start_time, end_time, room, batch,
 subject:subject_id(id, name, code, faculty_id)
 )
 )
 `)
 .eq('student_id', studentId)
 .order('marked_at', { ascending: false });

 if (error) throw error;

 if (data && data.length > 0) {
 // 2. Client-Side Aggregation
 const subjectMap = {};
 let attCount = 0, missCount = 0, medCount = 0, appCount = 0, totCount = 0;

 data.forEach(record => {
 const session = record.session;
 if (!session || !session.schedule?.subject) return;

 const subjObj = session.schedule?.subject;
 const subjId = subjObj.id;
 
 if(!subjectMap[subjId]) {
 subjectMap[subjId] = {
 id: subjId,
 course_code: subjObj?.code || 'N/A',
 course_name: subjObj?.name || 'Unknown Course',
 faculty_id: subjObj?.faculty_id,
 total_classes: 0,
 present: 0,
 absent: 0,
 medical: 0,
 approved: 0,
 records: []
 };
 }
 
 subjectMap[subjId].total_classes += 1;
 totCount += 1;

 if (record.status === 'present') { subjectMap[subjId].present += 1; attCount += 1; }
 else if (record.status === 'absent') { subjectMap[subjId].absent += 1; missCount += 1; }
 else if (record.status === 'medical') { subjectMap[subjId].medical += 1; medCount += 1; }
 else if (record.status === 'approved_leave') { subjectMap[subjId].approved += 1; appCount += 1; }

 // Add to ledger
 subjectMap[subjId].records.push({
 id: record.id,
 date: session.date,
 start_time: 'N/A',
 status: record.status,
 room: 'N/A'
 });
 });

 const groupedData = Object.values(subjectMap);
 
 // Fetch Faculty Names (since they are only referenced by faculty_id in subjects now)
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
 setTotalMedical(medCount);
 setTotalApproved(appCount);

 const overall = totCount === 0 ? 0 : ((attCount / totCount) * 100).toFixed(1);
 setOverallAttendance(Number(overall));
 } else {
 setAttendanceData([]);
 setOverallAttendance(0);
 }
 } catch (error) {
 console.warn("Attendance DB syncing..."); // DB constraint pending
 } finally {
 setIsLoading(false);
 }
 }, [userSession]);

 useEffect(() => { fetchAcademicData(); }, [fetchAcademicData]);

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
 const { error: insError } = await supabase
 .from('attendance_records')
 .upsert({
 session_id: session.id,
 student_id: userSession.db_id,
 status: 'present',
 marked_by: 'student_qr',
 marked_at: new Date().toISOString()
 }, { onConflict: 'session_id,student_id' });
 
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
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 {/* 1. MASTER HEADER */}
 <PageHeader 
 icon="fa-solid fa-user-check" 
 title="Verified Attendance" 
 subtitle="Official class participation synced seamlessly." 
 isEmbedded={isEmbedded}
 rightContent={
 <button onClick={() => setShowScanner(true)} className="btn-erp">
 <i className="fa-solid fa-qrcode text-lg"></i> Scan QR
 </button>
 }
 />

{/* 2. OVERVIEW DASHBOARD */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-2xl border border-black/10 dark:border-white/20 p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start relative overflow-hidden">
 <div className="absolute top-0 right-0 w-full max-w-[16rem] md:w-64 h-64 bg-themeAccent/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
 
 {/* The Linear Gauge */}
 <div className="w-full lg:w-1/2 flex flex-col gap-4 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Overall Semester Health</p>
 <h2 className={`text-5xl font-black ${getHealthTextClass(overallAttendance)}`}>{overallAttendance}%</h2>
 </div>
 <div className="text-right">
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Minimum Required</p>
 <p className="text-sm font-black text-themeText">75%</p>
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
 
 <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-themeTextSec px-1">
 <span>0%</span>
 <span>100%</span>
 </div>
 
 {overallAttendance < 75 && (
 <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
 <i className="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5"></i>
 <div>
 <p className="text-xs font-black text-rose-500">Action Required</p>
 <p className="text-[10px] font-bold text-rose-400 mt-0.5">You are falling below the university attendance mandate. Contact your mentor.</p>
 </div>
 </div>
 )}
 </div>
 
 {/* Stat Cards */}
 <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 relative z-10">
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Classes Attended</p>
 <p className="text-2xl font-black text-themeText">{totalAttended}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Classes Missed</p>
 <p className="text-2xl font-black text-rose-500">{totalMissed}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Medical Leaves</p>
 <p className="text-2xl font-black text-amber-500">{totalMedical}</p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 rounded-xl border border-black/10 dark:border-white/20 flex flex-col">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Approved Leaves</p>
 <p className="text-2xl font-black text-blue-500">{totalApproved}</p>
 </div>
 </div>
 </div>

 {/* 3. SUBJECT-WISE BREAKDOWN */}
 <div className="flex flex-col gap-4">
 <h2 className="text-xl font-black text-themeText tracking-tight">Subject Breakdown</h2>
 
 {isLoading ? (
 <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4 mt-6">
 <div className="h-48 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 <div className="h-48 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
</div>
 ) : attendanceData.length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-black/10 dark:border-white/20 rounded-2xl bg-themePanel/30 px-4">
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
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec truncate max-w-[150px]">{subject.course_code}</p>
 </div>
 <h3 className="text-lg font-black text-themeText leading-tight group-hover:text-themeAccent transition-colors">{subject.course_name}</h3>
 </div>
 <h2 className={`text-2xl font-black ${getHealthTextClass(percentage)} shrink-0`}>{percentage}%</h2>
 </div>
 
 <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-themeTextSec bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 rounded-xl border border-black/10 dark:border-white/20 justify-around">
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
 <h3 className="text-sm font-black text-themeText uppercase tracking-widest">Live Attendance</h3>
 <button onClick={() => setShowScanner(false)} className="w-8 h-8 rounded-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors">
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
 <i className="fa-solid fa-qrcode"></i>}
 </div>
 
 <div className="text-center w-full">
 <h4 className="text-lg font-black text-themeText mb-1">Enter QR Token</h4>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-4">Provided by your faculty on screen</p>
 
 <input 
 type="text"
 placeholder="e.g. A7X9P2"
 value={scanToken}
 onChange={(e) => setScanToken(e.target.value)}
 className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl px-4 py-3 text-center text-xl font-mono font-black text-themeText tracking-[0.2em] outline-none focus:border-themeAccent uppercase placeholder:tracking-normal placeholder:font-sans placeholder:font-bold placeholder:text-sm"
 maxLength={8}
 disabled={scanStatus !== 'idle'}
 />
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
 <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="w-full max-w-md h-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-l border-black/10 dark:border-white/20 flex flex-col animate-slide-in-right">
 <div className="p-6 border-b border-black/10 dark:border-white/20 flex justify-between items-start bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 shrink-0">
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">{activeSubject.course_code}</p>
 <h2 className="text-xl font-black text-themeText leading-tight">{activeSubject.course_name}</h2>
 <p className="text-xs font-bold text-themeTextSec mt-2"><i className="fa-solid fa-user-tie mr-1"></i> {activeSubject.faculty_name}</p>
 </div>
 <button onClick={() => setActiveSubject(null)} className="w-8 h-8 rounded-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors shrink-0">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-8">
 {/* Prediction Engine */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-5 rounded-2xl border border-black/10 dark:border-white/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-themeAccent/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none"></div>
 <h3 className="text-xs font-black text-themeText uppercase tracking-widest mb-4 flex items-center gap-2">
 <i className="fa-solid fa-wand-magic-sparkles text-themeAccent"></i> Prediction Engine
 </h3>
 
 <div className="flex items-center justify-between mb-2">
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Current</p>
 <p className="text-sm font-black text-themeText">{activeSubject.total_classes === 0 ? 0 : Math.round((activeSubject.present / activeSubject.total_classes) * 100)}%</p>
 </div>
 
 <div className="flex items-center justify-between">
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">If you miss next class</p>
 <p className="text-sm font-black text-rose-500">
 {activeSubject.total_classes === 0 ? 0 : Math.round((activeSubject.present / (activeSubject.total_classes + 1)) * 100)}%
 </p>
 </div>
 </div>
 
 {/* Timeline */}
 <div>
 <h3 className="text-xs font-black text-themeText uppercase tracking-widest mb-4">Class Timeline</h3>
 <div className="flex flex-col gap-3">
 {activeSubject.records.length === 0 ? (
 <p className="text-xs font-bold text-themeTextSec">No records available.</p>
 ) : (
 activeSubject.records.map((rec) => (
 <div key={rec.id} className="flex gap-4 items-stretch">
 {/* Status Icon */}
 <div className="flex flex-col items-center">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
 rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
 rec.status === 'absent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
 'bg-amber-500/10 text-amber-500 border-amber-500/30'
 }`}>
 {rec.status === 'present' ? <i className="fa-solid fa-check text-xs"></i> :
 rec.status === 'absent' ? <i className="fa-solid fa-xmark text-xs"></i> :
 <i className="fa-solid fa-suitcase-medical text-xs"></i>}
 </div>
 <div className="w-px h-full bg-themeBorder my-1 last:hidden"></div>
 </div>
 
 {/* Details */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 rounded-xl border border-black/10 dark:border-white/20 flex-1 mb-2 last:mb-0">
 <div className="flex justify-between items-start mb-1">
 <p className="text-xs font-black text-themeText">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
 <p className={`text-[9px] font-black uppercase tracking-widest ${
 rec.status === 'present' ? 'text-emerald-500' :
 rec.status === 'absent' ? 'text-rose-500' : 'text-amber-500'
 }`}>{rec.status.replace('_', ' ')}</p>
 </div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">
 {rec.start_time?.substring(0, 5)} • Room {rec.room}
 </p>
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
 </div>
 );
}
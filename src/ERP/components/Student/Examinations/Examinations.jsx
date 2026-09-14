/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { Badge } from "../../ui/Badge";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generateCalendarICS } from "../../../lib/calendarGenerator";
import PageHeader from "../../shared/PageHeader/PageHeader";

// --- CACHE HELPERS ---
const CK = { exams: 'exam_upcoming', marks: 'exam_marks', grades: 'exam_grades', analytics: 'exam_analytics' };
const readCache = (key, fallback) => {
 try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
 catch { return fallback; }
};
const writeCache = (key, data) => {
 try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export default function Examinations({ isEmbedded = false }) {
 const { userSession } = useERP();
 const [view, setView] = useState("grades");

 // --- INSTANT STATE FROM CACHE ---
 const [upcomingExams, setUpcomingExams] = useState(() => readCache(CK.exams, []));
 const [internalMarks, setInternalMarks] = useState(() => readCache(CK.marks, []));
 const [finalGrades, setFinalGrades] = useState(() => readCache(CK.grades, []));
 const [analytics, setAnalytics] = useState(() => readCache(CK.analytics, null));

 // --- PARALLEL BACKGROUND FETCH ---
 const fetchAll = useCallback(async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;

 // Fire all 4 fetches simultaneously
 const [examsRes, marksRes, historyRes, analyticsRes] = await Promise.allSettled([
 supabase.from('upcoming_exams_view').select('*').eq('student_id', studentId).order('exam_date', { ascending: true }),
 supabase.from('student_internal_marks_view').select('*').eq('student_id', studentId),
 supabase.from('student_academic_history').select('*').eq('student_id', studentId).order('semester_name', { ascending: false }),
 supabase.from('student_semester_analytics').select('*').eq('student_id', studentId).order('declared_on', { ascending: false }).limit(1).single()
 ]);

 // Process exams
 if (examsRes.status === 'fulfilled' && examsRes.value.data) {
 const formatted = examsRes.value.data.map(exam => {
 const dateObj = new Date(exam.exam_date);
 const daysLeft = Math.max(0, Math.ceil((dateObj.getTime() - Date.now()) / 86400000));
 return {
 ...exam,
 dateStr: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
 dayStr: dateObj.toLocaleDateString('en-GB', { weekday: 'long' }),
 daysLeft
 };
 });
 setUpcomingExams(formatted);
 writeCache(CK.exams, formatted);
 }

 // Process internal marks
 if (marksRes.status === 'fulfilled' && marksRes.value.data) {
 setInternalMarks(marksRes.value.data);
 writeCache(CK.marks, marksRes.value.data);
 }

 // Process grades
 if (historyRes.status === 'fulfilled' && historyRes.value.data?.length > 0) {
 const hd = historyRes.value.data;
 const latestSemester = hd[0].semester_name;
 const mapped = hd.filter(h => h.semester_name === latestSemester).map(g => {
 let points = 0;
 if (g.grade === 'O') points = 10;
 else if (g.grade === 'A+') points = 9;
 else if (g.grade === 'A') points = 8;
 else if (g.grade === 'B+') points = 7;
 else if (g.grade === 'B') points = 6;
 return { subject: g.course_name, code: g.course_code, credits: g.credits, grade: g.grade, points };
 });
 setFinalGrades(mapped);
 writeCache(CK.grades, mapped);
 }

 // Process analytics
 if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
 setAnalytics(analyticsRes.value.data);
 writeCache(CK.analytics, analyticsRes.value.data);
 }
 }, [userSession]);

 useEffect(() => { fetchAll(); }, [fetchAll]);

 // --- UI HELPERS ---
 const getGradeColor = (grade) => {
 switch (grade) {
 case "O": return "text-[var(--primary-color)] bg-white/50 dark:bg-transparent bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 case "A+": return "text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 case "A": return "text-emerald-500 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 case "B+": return "text-blue-400 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 case "B": return "text-[var(--primary-color)] bg-white/50 dark:bg-transparent bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 default: return "text-themeTextSec bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10";
 }
 };

 const getUrgencyTheme = (days) => {
 if (days <= 7) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
 if (days <= 14) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
 return "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeTextSec border-black/10 dark:border-white/20";
 };

 const getRankSuffix = (i) => {
 let j = i % 10, k = i % 100;
 if (j === 1 && k !== 11) return i + "st";
 if (j === 2 && k !== 12) return i + "nd";
 if (j === 3 && k !== 13) return i + "rd";
 return i + "th";
 };

 const handleExportICS = () => {
 if (upcomingExams.length === 0) return;
 const events = upcomingExams.map(exam => {
 const [startTime, endTime] = exam.time_window.split(' - ');
 const startDate = new Date(exam.exam_date);
 const [startHr, startMin] = startTime.match(/\d+/g);
 startDate.setHours(startTime.includes('PM') && startHr !== '12' ? parseInt(startHr) + 12 : parseInt(startHr), parseInt(startMin), 0);
 const endDate = new Date(exam.exam_date);
 const [endHr, endMin] = endTime.match(/\d+/g);
 endDate.setHours(endTime.includes('PM') && endHr !== '12' ? parseInt(endHr) + 12 : parseInt(endHr), parseInt(endMin), 0);
 return {
 title: `${exam.subject} Exam`,
 description: `Course Code: ${exam.code} | Seat: ${exam.seat}`,
 location: exam.room,
 startDate,
 endDate
 };
 });
 generateCalendarICS("Exam_Schedule", events);
 };

 const TABS = [
 { id: 'schedule', label: 'Admit Card', icon: 'fa-calendar-check' },
 { id: 'marks', label: 'Internal Assessment', icon: 'fa-chart-pie' },
 { id: 'grades', label: 'Grades & Analytics', icon: 'fa-ranking-star' }
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 {/* ═══════════════ HEADER & TABS ═══════════════ */}
 <PageHeader 
 icon="fa-solid fa-file-pen" 
 title="Examinations Hub" 
 subtitle="Manage your schedules, analytics, and official scorecards." 
 isEmbedded={isEmbedded}
 rightContent={
 <div className="flex p-1.5 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] w-full md:w-auto overflow-x-auto no-scrollbar min-w-max">
 {TABS.map((tab) => (
 <button type="button"
 key={tab.id}
 onClick={() => setView(tab.id)}
 className={`flex-1 md:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 ${view === tab.id
 ? "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-[var(--primary-color)] bg-white/50 dark:bg-transparent border border-black/5 dark:border-white/10"
 : "text-themeTextSec opacity-80 hover:text-themeText"
 }`}
 >
 <i className={`fa-solid ${tab.icon}`}></i> <span className="hidden sm:inline">{tab.label}</span>
 </button>
 ))}
 </div>
 }
 />

 {/* ═══════════════ VIEW: ADMIT CARD / SCHEDULE ═══════════════ */}
 {view === "schedule" && (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">

 {/* Hall Ticket Banner */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-6 lg:p-8 rounded-[2rem] border border-black/10 dark:border-white/20 text-themeText gap-6 relative overflow-hidden">
 <div className="absolute right-0 top-0 w-full max-w-[16rem] md:w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>

 <div className="flex items-center gap-4 lg:gap-5 relative z-10">
 <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[2rem] border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 flex items-center justify-center shrink-0">
 <i className="fa-solid fa-qrcode text-2xl lg:text-3xl text-themeTextSec opacity-80"></i>
 </div>
 <div>
 <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent border-theme border-emerald-500/20 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-1.5 inline-block">Authorized</span>
 <h3 className="font-black text-xl lg:text-2xl text-themeText tracking-tight leading-tight">Official Hall Ticket</h3>
 <p className={`text-[10px] lg:text-xs font-medium ${theme.text.muted} mt-1`}>{userSession?.academic_batch} Examinations</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
 <button type="button" onClick={handleExportICS} disabled={upcomingExams.length === 0} className="flex-1 md:flex-none px-6 py-3.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeText border border-black/5 dark:border-white/10 rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
 <i className="fa-solid fa-calendar-plus text-blue-400"></i> Sync Calendar
 </button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} disabled={upcomingExams.length === 0} className="flex-1 md:flex-none px-6 py-3.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-[#050505] rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
 <i className="fa-solid fa-download"></i> Admit Card
 </button>
 </div>
 </div>

 {/* Exam Cards Grid */}
 {upcomingExams.length === 0 ? (
 <div className="w-full py-20 lg:py-24 border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] border border-black/5 dark:border-white/10 text-center px-4">
 <i className="fa-regular fa-calendar-check text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>No Upcoming Exams</h3>
 <p className={`${theme.text.secondary} text-xs lg:text-sm mt-1 lg:mt-2`}>Your examination schedule has not been published yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
 {upcomingExams.map((exam, i) => (
 <div key={i} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] flex flex-col justify-between gap-5 lg:gap-6 hover:border-black/5 dark:border-white/10 transition duration-300 border border-black/10 dark:border-white/20`}>
 <div className="flex justify-between items-start">
 <div className="flex flex-col items-center justify-center bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] w-14 h-14 lg:w-16 lg:h-16 shrink-0">
 <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-80 uppercase tracking-widest">{exam.dateStr.split(' ')[1]}</span>
 <span className="text-lg lg:text-xl font-black text-themeText -mt-0.5">{exam.dateStr.split(' ')[0]}</span>
 </div>
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest border-theme ${getUrgencyTheme(exam.daysLeft)}`}>
 {exam.daysLeft === 0 ? 'Today' : `T-${exam.daysLeft} Days`}
 </span>
 </div>

 <div>
 <p className="text-[9px] lg:text-[10px] font-black text-themeTextSec opacity-80 uppercase tracking-widest mb-1">{exam.code}</p>
 <h3 className="text-base lg:text-lg font-black text-themeText tracking-tight leading-tight mb-4">{exam.subject}</h3>

 <div className="space-y-2 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 lg:p-4 rounded-[2rem] border border-black/10 dark:border-white/20">
 <p className="flex justify-between items-center text-[11px] lg:text-xs font-bold text-themeText">
 <span className="text-themeTextSec opacity-80 flex items-center gap-2"><i className="fa-regular fa-clock w-3 lg:w-4"></i> Time</span>
 {exam.time_window}
 </p>
 <p className="flex justify-between items-center text-[11px] lg:text-xs font-bold text-themeText">
 <span className="text-themeTextSec opacity-80 flex items-center gap-2"><i className="fa-solid fa-location-dot w-3 lg:w-4"></i> Venue</span>
 {exam.room}
 </p>
 <p className="flex justify-between items-center text-[11px] lg:text-xs font-bold text-[var(--primary-color)] bg-white/50 dark:bg-transparent">
 <span className="text-themeTextSec opacity-80 flex items-center gap-2"><i className="fa-solid fa-chair w-3 lg:w-4"></i> Seat</span>
 {exam.seat}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ═══════════════ VIEW: INTERNAL MARKS ═══════════════ */}
 {view === "marks" && (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
 {internalMarks.length === 0 ? (
 <div className="w-full py-20 lg:py-24 border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] border border-black/5 dark:border-white/10 text-center px-4">
 <i className="fa-solid fa-chart-pie text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>No Internal Marks</h3>
 <p className={`${theme.text.secondary} text-xs lg:text-sm mt-1 lg:mt-2`}>Faculty members have not published any assessment scores yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
 {internalMarks.map((mark, i) => {
 const percentage = (mark.score / mark.total) * 100;
 const avgPercentage = (mark.average / mark.total) * 100;
 const highestPercentage = (mark.highest / mark.total) * 100;

 return (
 <div key={i} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] flex flex-col gap-5 lg:gap-6 hover:border-black/5 dark:border-white/10 transition-colors border border-black/10 dark:border-white/20`}>

 <div className="flex justify-between items-start gap-3">
 <div className="flex-1">
 <span className="px-2.5 py-1 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeTextSec border border-black/10 dark:border-white/20 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-2 inline-block">
 {mark.type}
 </span>
 <h3 className="text-base lg:text-lg font-black text-themeText tracking-tight leading-tight">{mark.subject}</h3>
 <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-80 uppercase tracking-widest mt-1">{mark.code}</p>
 </div>
 <div className="text-right bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 lg:px-4 py-2 rounded-[2rem] border border-black/10 dark:border-white/20 shrink-0">
 <span className={`text-xl lg:text-2xl font-black ${mark.score === mark.highest ? 'text-[var(--primary-color)] bg-white/50 dark:bg-transparent' : 'text-themeText'}`}>{mark.score}</span>
 <span className="text-xs lg:text-sm font-bold text-neutral-600">/{mark.total}</span>
 </div>
 </div>

 <div className="flex items-center gap-2 bg-blue-500/10 border-theme border-blue-500/20 px-3 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400">
 <i className="fa-solid fa-ranking-star"></i> Subject Rank: {getRankSuffix(mark.rank_number)}
 </div>

 <div className="space-y-4 lg:space-y-5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-4 lg:p-5 rounded-[2rem] border border-black/10 dark:border-white/20">
 {/* Your Score Bar */}
 <div>
 <div className="flex justify-between text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1.5">
 <span className={mark.score === mark.highest ? 'text-[var(--primary-color)] bg-white/50 dark:bg-transparent' : 'text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent'}>Your Score</span>
 <span className="text-themeText">{percentage.toFixed(0)}%</span>
 </div>
 <div className="h-1.5 lg:h-2 w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full overflow-hidden border border-black/10 dark:border-white/20">
 <div className={`h-full rounded-full transition duration-1000 ${mark.score === mark.highest ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }}></div>
 </div>
 </div>

 {/* Comparison Section */}
 <div className="pt-2 border-t-theme border-black/10 dark:border-white/20">
 <div className="flex justify-between text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-2">
 <span className="text-themeTextSec opacity-80">Class Avg: {mark.average}</span>
 <span className="text-rose-500">Highest: {mark.highest}</span>
 </div>
 <div className="h-1 lg:h-1.5 w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full overflow-hidden border border-black/10 dark:border-white/20 relative">
 <div className="absolute inset-y-0 left-0 bg-neutral-600 rounded-full" style={{ width: `${avgPercentage}%` }}></div>
 <div className="absolute inset-y-0 w-1 bg-rose-500 z-10" style={{ left: `${highestPercentage}%` }}></div>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* ═══════════════ VIEW: GRADES & ANALYTICS ═══════════════ */}
 {view === "grades" && (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
 {!analytics ? (
 <div className="w-full py-20 lg:py-24 border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-[80px] border border-black/5 dark:border-white/10 text-center px-4">
 <i className="fa-solid fa-ranking-star text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>No Finalized Grades</h3>
 <p className={`${theme.text.secondary} text-xs lg:text-sm mt-1 lg:mt-2`}>The Controller of Examinations has not finalized your semester transcript yet.</p>
 </div>
 ) : (
 <>
 {/* Analytics Banner */}
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-6 lg:p-8 relative overflow-hidden border border-black/10 dark:border-white/20 text-themeText">
 <div className="absolute right-0 top-0 w-full max-w-[16rem] md:w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>

 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative z-10">
 <div>
 <Badge variant="default" className="mb-2 lg:mb-3">{analytics.semester_name} Finalized</Badge>
 <h2 className="text-2xl lg:text-4xl font-black tracking-tight mb-1">Academic Profile</h2>
 <p className={`${theme.text.muted} text-xs lg:text-sm font-medium`}>Declared on {new Date(analytics.declared_on).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
 <div className="bg-transparent p-3 lg:p-4 rounded-[2rem] border border-black/5 dark:border-white/10 text-center">
 <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-80 mb-1">SGPA</p>
 <p className="text-xl lg:text-2xl font-black text-[var(--primary-color)] bg-white/50 dark:bg-transparent">{analytics.sgpa?.toFixed(2)}</p>
 </div>
 <div className="bg-transparent p-3 lg:p-4 rounded-[2rem] border border-black/5 dark:border-white/10 text-center">
 <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-80 mb-1">CGPA</p>
 <p className="text-xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent">{analytics.cgpa?.toFixed(2)}</p>
 </div>
 <div className="bg-transparent p-3 lg:p-4 rounded-[2rem] border border-black/5 dark:border-white/10 text-center">
 <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-80 mb-1">Class Rank</p>
 <p className="text-xl lg:text-2xl font-black text-themeText">#{analytics.class_rank} <span className="text-[10px] lg:text-xs text-neutral-600">/{analytics.class_total}</span></p>
 </div>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 lg:p-4 rounded-[2rem] border border-black/5 dark:border-white/10 text-center">
 <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Batch Rank</p>
 <p className="text-xl lg:text-2xl font-black text-blue-400">#{analytics.batch_rank} <span className="text-[10px] lg:text-xs opacity-50">/{analytics.batch_total}</span></p>
 </div>
 </div>
 </div>
 </div>

 {/* Subject Ledger + SGPA Calculation */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
 {/* Subject Ledger Table */}
 <div className={`lg:col-span-2 ${theme.layout.panel} rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col`}>
 <div className="p-5 lg:p-6 border-b-theme border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 <h3 className="text-base lg:text-lg font-black text-themeText">Subject Ledger</h3>
 </div>
 {finalGrades.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
 <i className="fa-solid fa-table-list text-3xl text-neutral-700 mb-3"></i>
 <p className={`${theme.text.muted} text-xs`}>Subject grades will appear here once declared.</p>
 </div>
 ) : (
 <div className="overflow-x-auto flex-1">
 <table className="w-full text-left border-collapse min-w-[500px]">
 <thead>
 <tr className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-b-theme border-black/10 dark:border-white/20">
 <th className={`p-4 pl-5 lg:pl-6 text-[8px] lg:text-[9px] font-black ${theme.text.muted} uppercase tracking-widest`}>Course</th>
 <th className={`p-4 text-[8px] lg:text-[9px] font-black ${theme.text.muted} uppercase tracking-widest text-center`}>Credits (C)</th>
 <th className={`p-4 text-[8px] lg:text-[9px] font-black ${theme.text.muted} uppercase tracking-widest text-center`}>Grade Pt (G)</th>
 <th className={`p-4 pr-5 lg:pr-6 text-[8px] lg:text-[9px] font-black ${theme.text.muted} uppercase tracking-widest text-right`}>Final Grade</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-800/50 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 {finalGrades.map((item, i) => (
 <tr key={i} className="hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 transition-colors group">
 <td className="p-4 pl-5 lg:pl-6">
 <p className="text-[8px] lg:text-[9px] font-bold text-themeTextSec opacity-80 uppercase tracking-widest mb-0.5">{item.code}</p>
 <p className="text-xs lg:text-sm font-black text-themeText group-hover:text-[var(--primary-color)] bg-white/50 dark:bg-transparent transition-colors truncate">{item.subject}</p>
 </td>
 <td className="p-4 text-xs lg:text-sm font-bold text-themeTextSec text-center">{item.credits}</td>
 <td className="p-4 text-xs lg:text-sm font-bold text-themeTextSec text-center">{item.points}</td>
 <td className="p-4 pr-5 lg:pr-6 text-right">
 <span className={`inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg text-xs lg:text-sm font-black border-theme ${getGradeColor(item.grade)}`}>
 {item.grade}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* SGPA Calculation Sidebar */}
 <div className={`${theme.layout.panel} rounded-[2rem] p-5 lg:p-6 border border-black/10 dark:border-white/20 flex flex-col justify-between`}>
 <div>
 <div className="flex items-center gap-3 mb-5 lg:mb-6">
 <div className="w-10 h-10 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-[var(--primary-color)] bg-white/50 dark:bg-transparent shrink-0">
 <i className="fa-solid fa-calculator"></i>
 </div>
 <h3 className="text-base lg:text-lg font-black text-themeText">SGPA Calculation</h3>
 </div>

 <p className="text-[10px] lg:text-[11px] font-medium text-themeTextSec mb-5 lg:mb-6 leading-relaxed">
 Your Semester Grade Point Average is calculated by dividing the total grade points earned by the total credits attempted.
 </p>

 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] border border-black/10 dark:border-white/20 p-4 lg:p-5 space-y-3 lg:space-y-4">
 <div className="flex justify-between items-center text-xs lg:text-sm">
 <span className="font-bold text-themeTextSec opacity-80">Σ (Credits × Points)</span>
 <span className="font-black text-themeText">{analytics.total_grade_points}</span>
 </div>
 <div className="h-px w-full bg-neutral-800"></div>
 <div className="flex justify-between items-center text-xs lg:text-sm">
 <span className="font-bold text-themeTextSec opacity-80">Σ (Total Credits)</span>
 <span className="font-black text-themeText">{analytics.total_credits_earned}</span>
 </div>
 <div className="h-px w-full bg-neutral-800"></div>
 <div className="flex justify-between items-center text-sm lg:text-base pt-1">
 <span className="font-black text-[var(--primary-color)] bg-white/50 dark:bg-transparent uppercase tracking-widest text-[9px] lg:text-[10px]">Result SGPA</span>
 <span className="font-black text-[var(--primary-color)] bg-white/50 dark:bg-transparent">{(analytics.total_grade_points / analytics.total_credits_earned).toFixed(2)}</span>
 </div>
 </div>
 </div>

 <div className="mt-5 lg:mt-6 pt-5 lg:pt-6 border-t-theme border-black/10 dark:border-white/20">
 <div className="flex justify-between items-end mb-2">
 <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-80">Percentile</p>
 <p className="text-base lg:text-lg font-black text-themeText">Top {100 - analytics.percentile}%</p>
 </div>
 <div className="h-1.5 lg:h-2 w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full overflow-hidden border border-black/10 dark:border-white/20">
 <div className="h-full rounded-full bg-gradient-to-r from-themeAccent to-emerald-500 transition duration-1000" style={{ width: `${analytics.percentile}%` }}></div>
 </div>
 </div>
 </div>
 </div>
 </>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
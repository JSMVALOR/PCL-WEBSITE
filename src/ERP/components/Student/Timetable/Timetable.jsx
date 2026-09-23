/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import { generateCalendarICS } from "../../../lib/calendarGenerator";
import WeeklyChart from "../../shared/WeeklyChart";
import WeeklyList from "../../shared/WeeklyList";
import SubjectFlipCard from "../../shared/SubjectFlipCard";
import PageHeader from "../../shared/PageHeader/PageHeader";

const SUBJECT_COLORS = {
 blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500' },
 emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500' },
 purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500' },
 orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500' },
 rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500' },
 amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500' },
 gray: { bg: 'bg-white/10 backdrop-blur-[80px] border border-white/20', text: 'text-themeTextSec dark:text-white/50', border: 'border-white/20', solid: 'bg-themeBorderStrong' }
};

export default function Timetable({ isEmbedded = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('today');
 const [selectedLecture, setSelectedLecture] = useState(null);
 const [currentTime, setCurrentTime] = useState(new Date());

 const [schedule, setSchedule] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchSchedule = async () => {
        if (!userSession?.academic_batch) return;
        setLoading(true);
        try {
            const batchStringName = userSession.academic_batch;

 const { data, error } = await supabase
 .from('class_schedule')
 .select(`
 id, batch, day_of_week, start_time, end_time,
 subject:master_subjects(name, theme_color, credits),
 room:academic_classrooms(name),
 faculty:profiles(full_name)
 `)
 .eq('batch', batchStringName);

 if (error) throw error;

 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
 const nowTime = new Date();
 const currentMins = nowTime.getHours() * 60 + nowTime.getMinutes();
 
 const formatted = (data || []).map(s => {
 const sTime = s.start_time.slice(0, 5);
 const eTime = s.end_time.slice(0, 5);
 
 // Calculate past/current/upcoming status dynamically based on time
 const sMins = parseInt(sTime.split(':')[0]) * 60 + parseInt(sTime.split(':')[1]);
 const eMins = parseInt(eTime.split(':')[0]) * 60 + parseInt(eTime.split(':')[1]);
 
 let status = 'upcoming';
 if (currentMins >= eMins) status = 'past';
 else if (currentMins >= sMins && currentMins < eMins) status = 'current';

 // Sync cohort color for generic subjects
 let cohortColor = 'blue';
 const bName = batchStringName.toUpperCase();
 if (bName.includes('BA LLB')) cohortColor = 'rose';
 else if (bName.includes('BBA LLB')) cohortColor = 'emerald';
 else if (bName.includes('LLM')) cohortColor = 'purple';
 else if (bName.includes('LLB')) cohortColor = 'blue';

 return {
 id: s.id,
 day: daysMap[s.day_of_week] || s.day_of_week,
 time: sTime,
 endTime: eTime,
 subject: s.subject?.name || 'Unknown',
 color: s.subject?.theme_color || cohortColor,
 credits: s.subject?.credits || 4,
 room: s.room?.name || 'TBA',
 faculty: s.faculty?.full_name || 'TBA',
 status
 };
 });

 // Sort by time
 formatted.sort((a, b) => {
 const tA = parseInt(a.time.replace(':', ''));
 const tB = parseInt(b.time.replace(':', ''));
 return tA - tB;
 });

 setSchedule(formatted);
 } catch (err) {
 console.error("Failed to fetch schedule:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchSchedule();
 }, [userSession?.batch_id]);

 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 60000);
 return () => clearInterval(timer);
 }, []);

    const exportCalendar = () => {
        const header = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//PCL ERP//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        ].join("\r\n");

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCodes = { 'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA' };

        const getNextDate = (dayName, timeStr) => {
            const today = new Date();
            const currentDay = today.getDay();
            const targetDay = dayNames.indexOf(dayName);
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd < 0) daysToAdd += 7;
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysToAdd);
            const [h, m] = timeStr.split(':');
            nextDate.setHours(parseInt(h), parseInt(m), 0, 0);
            return nextDate;
        };

        const formatIcsDate = (date) => {
            const pad = (n) => n < 10 ? '0' + n : n;
            return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
        };

        const body = schedule.map(curr => {
            const uid = Math.random().toString(36).substring(2) + "@jsmerp.com";
            const dtStamp = formatIcsDate(new Date()) + "Z";
            const startDate = getNextDate(curr.day, curr.time);
            const endDate = getNextDate(curr.day, curr.endTime);
            
            const dtStart = formatIcsDate(startDate);
            const dtEnd = formatIcsDate(endDate);

            // RRULE for Saturday vs other days
            let rrule = `FREQ=WEEKLY;BYDAY=${dayCodes[curr.day]}`;
            if (curr.day === 'Saturday') {
                // Classes only on 1st, 3rd, 5th Saturday (2nd and 4th are holidays)
                rrule = `FREQ=MONTHLY;BYDAY=1SA,3SA,5SA`;
            }

            return [
                "BEGIN:VEVENT",
                `UID:${uid}`,
                `DTSTAMP:${dtStamp}`,
                `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
                `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
                `RRULE:${rrule}`,
                `SUMMARY:${curr.subject}`,
                `DESCRIPTION:Faculty: ${curr.faculty}`,
                `LOCATION:${curr.room}`,
                "END:VEVENT"
            ].join("\r\n");
        }).join("\r\n");

        const footer = "\r\nEND:VCALENDAR";
        const icsContent = `${header}\r\n${body}${footer}`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Timetable_${userSession?.academic_batch || 'Export'}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.erpDialog?.alert("Calendar Exported!", "You can now import this .ics file into Google Calendar or Apple Calendar.");
    };

 const renderTodayTimeline = () => {
 // Fallback to Monday if it's Sunday, just so the demo isn't empty, otherwise use exact today
 const actualDayNum = new Date().getDay();
 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
 let currentDayName = daysMap[actualDayNum];
 

 const todayClasses = schedule.filter(c => c.day === currentDayName);

 if (loading) {
 return <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4 mt-6">
 <div className="h-48 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5"></div>
 <div className="h-48 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5"></div>
</div>;
 }

 if (todayClasses.length === 0) {
 return (
 <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4 mt-8">
 <i className="fa-regular fa-calendar text-4xl mb-4 text-themeTextSec dark:text-white/50"></i>
 <p className="text-sm font-bold text-themeTextSec dark:text-white/50">No classes scheduled for today.</p>
 </div>
 );
 }

 return (
 <div className="flex flex-col relative py-4">
 <div className="absolute left-[72px] right-0 h-px bg-themeAccent z-10 flex items-center top-[30%] opacity-50">
 <div className="absolute -left-16 text-[10px] font-black tracking-widest text-[var(--primary-color)] bg-white/50 dark:bg-transparent bg-transparent pr-2">
 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-themeAccent -ml-1"></div>
 </div>

 {todayClasses.map((lec) => {
 const c = SUBJECT_COLORS[lec.color] || SUBJECT_COLORS.gray;
 const isPast = lec.status === 'past';
 const isCurrent = lec.status === 'current';
 
 return (
 <div key={lec.id} className={`flex gap-6 relative group ${isPast ? 'opacity-40 grayscale-[50%]' : ''}`}>
 <div className="w-16 flex flex-col items-end shrink-0 pt-4">
 <span className="text-[14px] font-medium text-themeText dark:text-white">{lec.time}</span>
 <span className="text-[9px] font-bold text-themeTextSec dark:text-white/50">{lec.endTime}</span>
 </div>
 
 <div className="relative w-px bg-themeBorder flex-col flex items-center">
 <div className={`w-3 h-3 rounded-full border-[3px] border-themeBorder dark:border-white/5App z-10 mt-4 transition-colors ${isCurrent ? c.solid + ' animate-pulse' : 'bg-themeBorderStrong group-hover:' + c.solid}`}></div>
 </div>

 <div className="flex-1 pb-8 pt-2">
 <div 
 onClick={() => setSelectedLecture(lec)}
 className={`w-full rounded-3xl p-6 border transition-all cursor-pointer shadow-sm ${isCurrent ? `${c.bg} ${c.border} scale-[1.02] shadow-md` : 'bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:-translate-y-0.5 hover:shadow-md'}`}
 >
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-2">
 <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${c.solid}`}></div>
 <h3 className={`text-[17px] font-black tracking-tight ${isCurrent ? c.text : 'text-themeText dark:text-white'}`}>{lec.subject}</h3>
 </div>
 <span className="text-[11px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/10 backdrop-blur-3xl px-3 py-1.5 rounded-xl text-themeTextSec dark:text-white/70 border border-black/5 dark:border-white/5">{lec.room}</span>
 </div>
 <div className="flex items-center gap-5 mt-4 border-t border-black/5 dark:border-white/5 pt-4">
 <span className="text-[12px] font-bold text-themeTextSec dark:text-white/60 flex items-center gap-1.5"><i className="fa-regular fa-user opacity-70"></i> {lec.faculty}</span>
 <span className="text-[12px] font-bold text-themeTextSec dark:text-white/60 flex items-center gap-1.5"><i className="fa-regular fa-clock opacity-70"></i> 60m</span>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
 };

 const renderWeeklyGrid = () => {
 const uniqueSubjects = [];
 const seen = new Set();
 schedule.forEach(c => {
 if (!seen.has(c.subject)) {
 seen.add(c.subject);
 uniqueSubjects.push({
 subject: c.subject,
 faculty: c.faculty,
 color: c.color,
 nextClass: { day: c.day, time: c.time, endTime: c.endTime, room: c.room }
 });
 }
 });

 return (
 <div className="flex flex-col gap-8 animate-fade-in w-full">
 <div>
 <h3 className="text-[13px] font-medium text-themeTextSec dark:text-white/50 mb-4">Enrolled Subjects Overview</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
 {uniqueSubjects.map((s, i) => (
 <SubjectFlipCard 
 key={i}
 subject={s.subject}
 faculty={s.faculty}
 color={s.color}
 nextClass={s.nextClass}
 />
 ))}
 </div>
 </div>
 {loading ? (
 <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4 mt-6">
 <div className="h-48 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5"></div>
 <div className="h-48 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-black/5 dark:border-white/5"></div>
</div>
 ) : schedule.length === 0 ? (
 <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-calendar-xmark text-4xl mb-4 text-themeTextSec dark:text-white/50"></i>
 <p className="text-sm font-bold text-themeTextSec dark:text-white/50">No timetable published for your batch yet.</p>
 </div>
 ) : (
 <WeeklyList 
 schedule={schedule} 
 onLectureClick={(lecture) => setSelectedLecture(lecture)} 
 role="student"
 />
 )}
 </div>
 );
 };

 const renderCalendar = () => (
 <div className="flex flex-col gap-4 animate-fade-in">
 <div className="bg-white/10 backdrop-blur-[80px] border border-white/20 rounded-[2rem] rounded-2xl p-6 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText dark:text-white tracking-tight">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
 <p className="text-xs font-bold text-themeTextSec dark:text-white/50">Academic Calendar</p>
 </div>
 <div className="flex gap-2">
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-[80px] border border-white/20 text-themeText dark:text-white hover:bg-themeBorder transition-colors"><i className="fa-solid fa-chevron-left text-xs"></i></button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-[80px] border border-white/20 text-themeText dark:text-white hover:bg-themeBorder transition-colors"><i className="fa-solid fa-chevron-right text-xs"></i></button>
 </div>
 </div>

 <div className="grid gap-4">
 <div className="bg-white/10 backdrop-blur-[80px] border border-white/20 rounded-[2rem] rounded-2xl p-5 flex items-center gap-6">
 <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center shrink-0">
 <span className="text-[14px] font-medium tracking-normal text-purple-500">Aug</span>
 <span className="text-xl font-semibold tracking-tight text-purple-500">19</span>
 </div>
 <div className="flex-1">
 <h4 className="text-base font-black text-themeText dark:text-white">CAT II Examinations</h4>
 <p className="text-xs font-bold text-themeTextSec dark:text-white/50 mt-1">Continuous Assessment Test II begins for all semesters.</p>
 </div>
 <span className="px-3 py-1 rounded-full text-[13px] font-medium bg-white/10 backdrop-blur-[80px] border border-white/20 text-themeTextSec dark:text-white/50 border border-themeBorder dark:border-white/5">Exam</span>
 </div>
 </div>
 </div>
 );

 const LectureSideSheet = ({ isEmbedded = false }) => {
 if (!selectedLecture) return null;
 const c = SUBJECT_COLORS[selectedLecture.color] || SUBJECT_COLORS.gray;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedLecture(null)}></div>
 <div className="relative w-full max-w-md bg-themeApp border border-themeBorder rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
 <div className={`${c.bg} p-6 border-b ${c.border} relative overflow-hidden`}>
 <div className={`absolute top-0 right-0 w-48 h-48 ${c.solid} opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`}></div>
 <div className="flex justify-between items-start mb-6 relative z-10">
 <span className={`px-2 py-1 rounded-full text-[12px] font-medium bg-transparent/80 backdrop-blur-md ${c.text} border ${c.border}`}>{selectedLecture.day}, {selectedLecture.time} - {selectedLecture.endTime}</span>
 <button type="button" onClick={() => setSelectedLecture(null)} className="w-8 h-8 rounded-full bg-black/10 hover:bg-gray-50 dark:bg-black/20 text-themeText dark:text-white flex items-center justify-center transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 <h2 className={`text-2xl font-semibold tracking-tight tracking-tight mb-2 ${c.text} relative z-10`}>{selectedLecture.subject}</h2>
 <div className="flex items-center gap-4 text-xs font-bold text-themeTextSec dark:text-white/50 relative z-10">
 <span className="flex items-center gap-1.5"><i className="fa-regular fa-user"></i> {selectedLecture.faculty}</span>
 <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {selectedLecture.room}</span>
 </div>
 </div>

 <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
 <div className="grid grid-cols-2 gap-3">
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="bg-white/10 backdrop-blur-[80px] border border-white/20 rounded-[2rem] hover:border-themeBorder dark:border-white/5Accent py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-themeText dark:text-white transition">
 <i className="fa-solid fa-book-open text-[var(--primary-color)] bg-white/50 dark:bg-transparent"></i> Syllabus
 </button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="bg-white/10 backdrop-blur-[80px] border border-white/20 rounded-[2rem] hover:border-themeBorder dark:border-white/5Accent py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-themeText dark:text-white transition">
 <i className="fa-solid fa-folder-open text-[var(--primary-color)] bg-white/50 dark:bg-transparent"></i> Material
 </button>
 </div>

 <div>
 <h3 className="text-[13px] font-medium text-themeTextSec dark:text-white/50 mb-4">Subject Workspace</h3>
 <div className="bg-white/10 backdrop-blur-[80px] border border-white/20 rounded-[2rem] rounded-2xl p-4 flex justify-between items-center">
 <div className="flex flex-col gap-1">
 <span className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Credits</span>
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-white">{selectedLecture.credits || 4}</span>
 </div>
 <div className="w-px h-8 bg-themeBorderStrong"></div>
 <div className="flex flex-col gap-1 items-center">
 <span className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Attendance</span>
 <span className="text-xl font-semibold tracking-tight text-emerald-500">--</span>
 </div>
 <div className="w-px h-8 bg-themeBorderStrong"></div>
 <div className="flex flex-col gap-1 items-end">
 <span className="text-[13px] font-medium text-themeTextSec dark:text-white/50">Today</span>
 <span className="text-[15px] font-semibold text-themeText dark:text-white">Module 1</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-white" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-8 lg:gap-12 ${!isEmbedded ? "p-4 sm:p-6 lg:p-10 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 <PageHeader 
 icon="fa-solid fa-calendar-days" 
 title="Academic Planning" 
 subtitle="Your official schedule and subject workspaces." 
 isEmbedded={isEmbedded}
 rightContent={
 <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-fit gap-1">
 {['Today', 'Week'].map(tab => (
 <button type="button" 
 key={tab}
 onClick={() => setActiveTab(tab.toLowerCase())}
 className={`min-w-[110px] px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.toLowerCase() ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
 >
 {tab}
 </button>
 ))}
 </div>
 }
 />

 <div className="w-full flex flex-col lg:flex-row gap-8 items-start mt-4">
 <div className={`flex-1 w-full pb-4 ${activeTab === 'week' ? 'overflow-x-auto' : ''}`}>
 {activeTab === 'today' && renderTodayTimeline()}
 {activeTab === 'week' && (
 <>
 {renderWeeklyGrid()}
 <div className="lg:hidden w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4 mt-8">
 <i className="fa-solid fa-desktop text-3xl text-themeTextSec dark:text-white/50 mb-4"></i>
 <h3 className="text-[15px] font-semibold text-themeText dark:text-white mb-1">Desktop Recommended</h3>
 <p className="text-xs font-bold text-themeTextSec dark:text-white/50">The weekly timetable chart requires a larger screen. Please use a tablet or desktop, or switch to the 'Today' timeline view.</p>
 </div>
 </>
 )}
 {activeTab === 'calendar' && renderCalendar()}
 {activeTab === 'changes' && (
 <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-code-compare text-4xl mb-4 text-themeTextSec dark:text-white/50"></i>
 <p className="text-sm font-bold text-themeTextSec dark:text-white/50">No recent timetable changes.</p>
 </div>
 )}
 </div>

 <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 sticky top-32">
 <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] rounded-[2rem] border border-black/5 dark:border-white/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden group">
 <div className="absolute -right-12 -top-12 w-32 h-32 bg-themeAccent/10 rounded-full blur-3xl group-hover:bg-themeAccent/20 transition-colors"></div>
 <h3 className="text-[13px] font-bold text-themeTextSec dark:text-white/50 mb-4">Daily Academic Pulse</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 {(() => {
   const dMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
   const todayCount = schedule.filter(c => c.day === dMap[new Date().getDay()]).length;
   return <span className="text-3xl font-semibold tracking-tight text-themeText dark:text-white">{todayCount}</span>;
 })()}
 <span className="text-[12px] font-medium text-themeTextSec dark:text-white/50">Today's Classes</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-3xl font-semibold tracking-tight text-emerald-500">{schedule.length}</span>
 <span className="text-[12px] font-medium text-themeTextSec dark:text-white/50">Weekly Total</span>
 </div>
 <div className="col-span-2 pt-4 border-t border-themeBorder dark:border-white/5 mt-2">
 <p className="text-[13px] font-medium text-themeTextSec dark:text-white/50 mb-2">Next Up</p>
 {(() => {
   const dMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
   const todayName = dMap[new Date().getDay()];
   const upcoming = schedule.find(s => s.day === todayName && s.status === 'upcoming');
   return upcoming ? (
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
 <div>
 <p className="text-[15px] font-semibold text-themeText dark:text-white">{upcoming.subject}</p>
 <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{upcoming.room} at {upcoming.time}</p>
 </div>
 </div>
   ) : (
 <p className="text-xs font-bold text-themeTextSec dark:text-white/50">No upcoming classes today.</p>
   );
 })()}
 </div>
 </div>
 </div>

 <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] rounded-[2rem] border border-black/5 dark:border-white/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden">
 <h3 className="text-[13px] font-bold text-themeTextSec dark:text-white/50 mb-4">Personal Calendar Sync</h3>
 <p className="text-xs font-semibold text-themeTextSec dark:text-white/50 mb-4 leading-relaxed">
 Sync official updates, extra classes, and holidays directly to your Apple or Google Calendar.
 </p>
 <button type="button" onClick={exportCalendar} className="w-full py-4 bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/20 text-themeText dark:text-themeText text-[13px] font-bold tracking-tight rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
 <i className="fa-regular fa-calendar-plus text-[var(--primary-color)] bg-white/50 dark:bg-transparent"></i> Export as .ICS
 </button>
 </div>
 </div>
 </div>
 </div>

 <LectureSideSheet />
 </div>
 );
}
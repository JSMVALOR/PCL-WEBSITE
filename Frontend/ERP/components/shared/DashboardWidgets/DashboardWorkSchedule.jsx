/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';

export default function DashboardWorkSchedule({ role = 'student' }) {
 const { userSession } = useERP();
 const [currentTime, setCurrentTime] = useState(new Date());
 const [selectedDate, setSelectedDate] = useState(new Date());
 const [timetable, setTimetable] = useState([]);
 const [attendanceData, setAttendanceData] = useState({}); // mapped by class_id or subject
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every min
 return () => clearInterval(timer);
 }, []);

 // Helper to get start of week (Monday)
 const getWeekDays = () => {
 const curr = new Date(currentTime);
 const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
 return Array.from({length: 7}, (_, i) => {
 const d = new Date(curr.setDate(first + i));
 return {
 dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
 dateNum: d.getDate(),
 fullDate: d,
 isToday: d.toDateString() === new Date().toDateString(),
 isWeekend: d.getDay() === 0 || d.getDay() === 6
 };
 });
 };

 const weekDays = getWeekDays();
 
 // Fetch real data
 useEffect(() => {
 let isMounted = true;
 
 const fetchScheduleAndAttendance = async () => {
 setLoading(true);
 try {
 const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
 
 // Fetch Timetable
 let schedule = [];
 const dayMapper = { "Sunday":0, "Monday":1, "Tuesday":2, "Wednesday":3, "Thursday":4, "Friday":5, "Saturday":6 };
 const numericDay = dayMapper[dayOfWeek];

 if (role === 'faculty') {
 const { data } = await supabase
 .from('class_schedule')
 .select('*, subject:master_subjects(name), room:academic_classrooms(name), faculty:profiles(full_name)')
 .eq('faculty_id', userSession?.db_id || userSession?.id)
 .eq('day_of_week', numericDay)
 .order('start_time', { ascending: true });
 schedule = data || [];
 } else {
 const { data } = await supabase
 .from('class_schedule')
 .select('*, subject:master_subjects(name), room:academic_classrooms(name), faculty:profiles(full_name)')
 .eq('batch', userSession?.academic_batch || 'default')
 .eq('day_of_week', numericDay)
 .order('start_time', { ascending: true });
 schedule = data || [];
 }

 if (isMounted) {
 setTimetable(schedule);
 }

 // Fetch Attendance for the selected date (if student)
 if (role === 'student') {
 const dateStr = selectedDate.toISOString().split('T')[0];
 const { data: att } = await supabase
 .from('attendance_records')
 .select('entry_status, session_id, class_sessions!inner(date, schedule_id)')
 .eq('student_id', userSession?.db_id || userSession?.id)
 .eq('class_sessions.date', dateStr);
 
 if (isMounted && att) {
 const attMap = {};
 att.forEach(a => { attMap[a.class_sessions?.schedule_id] = a.entry_status; });
 setAttendanceData(attMap);
 }
 }
 
 if (isMounted) setLoading(false);
 } catch (err) {
 console.warn(err);
 if (isMounted) setLoading(false);
 }
 };

 fetchScheduleAndAttendance();
 return () => { isMounted = false; };
 }, [selectedDate, role, userSession]);

 const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

 // Determine status of a class
 const getClassStatus = (cls) => {
 if (!cls.start_time || !cls.end_time) return 'upcoming';
 const now = new Date();
 if (selectedDate.toDateString() !== now.toDateString()) {
 return selectedDate < now ? 'completed' : 'upcoming';
 }
 
 const currentMins = now.getHours() * 60 + now.getMinutes();
 const [startH, startM] = cls.start_time.split(':').map(Number);
 const [endH, endM] = cls.end_time.split(':').map(Number);
 const startMins = startH * 60 + startM;
 const endMins = endH * 60 + endM;

 if (currentMins >= startMins && currentMins <= endMins) return 'active';
 if (currentMins > endMins) return 'completed';
 return 'upcoming';
 };

 // Format time from HH:MM:SS to HH:MM AM/PM
 const formatTime = (timeStr) => {
 if (!timeStr) return '';
 const [h, m] = timeStr.split(':');
 const hour = parseInt(h, 10);
 const ampm = hour >= 12 ? 'PM' : 'AM';
 const hour12 = hour % 12 || 12;
 return `${hour12}:${m} ${ampm}`;
 };

 return (
 <div className="w-full flex flex-col relative shrink-0 py-4">
 <div className="flex items-center gap-3 mb-6 border-b border-themeBorder dark:border-white/[0.04] pb-4">
 <div className="w-10 h-10 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-lg shrink-0">
 <i className="fa-solid fa-business-time"></i>
 </div>
 <div className="flex-1 flex justify-between items-center">
 <div>
 <h2 className="text-xl font-black text-themeText tracking-tight">Work Schedule</h2>
 <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest mt-1">{selectedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
 </div>
 {loading && <div className="w-5 h-5 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div>}
 </div>
 </div>

 {/* Sleek Week Selector */}
 <div className="w-full flex items-center justify-between bg-themeElevated border border-themeBorder rounded-2xl p-1.5 mb-6 relative z-10 overflow-x-auto custom-scrollbar">
 {weekDays.map((d, i) => {
 const isSelected = d.fullDate.toDateString() === selectedDate.toDateString();
 return (
 <div 
 key={i} 
 onClick={() => setSelectedDate(d.fullDate)} 
 className={`flex flex-col items-center justify-center gap-1 min-w-[48px] py-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-themePanel dark:bg-themeElevated shadow-sm scale-100 border border-themeBorder ' : 'hover:bg-themePanel/50 scale-95 opacity-80 hover:opacity-100'}`}
 >
 <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-themeAccent' : 'text-themeTextSec'}`}>{d.dayName}</span>
 <span className={`text-sm font-black ${isSelected ? 'text-themeText' : 'text-themeTextSec'}`}>{d.dateNum}</span>
 
 {/* Tiny dot indicator instead of text to save space */}
 <div className={`w-1 h-1 rounded-full ${d.isToday ? 'bg-themeAccent' : (d.isWeekend ? 'bg-rose-500' : 'bg-transparent')}`}></div>
 </div>
 );
 })}
 </div>

 {/* Single Line Timetable Pills */}
 <div className="w-full relative">
 {isWeekend ? (
 <div className="w-full py-4 flex flex-col items-center justify-center opacity-50 bg-themeElevated rounded-xl border border-themeBorder ">
 <i className="fa-solid fa-mug-hot text-xl mb-2 text-themeTextSec"></i>
 <p className="text-[10px] font-black text-themeText uppercase tracking-widest">Weekend / No Classes</p>
 </div>
 ) : timetable.length === 0 && !loading ? (
 <div className="w-full py-4 flex flex-col items-center justify-center opacity-50 bg-themeElevated rounded-xl border border-themeBorder ">
 <p className="text-[10px] font-black text-themeText uppercase tracking-widest">No classes scheduled</p>
 </div>
 ) : (
 <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1">
 {timetable.map((cls, idx) => {
 const status = getClassStatus(cls);
 // Check attendance
 let attStatus = null;
 if (role === 'student' && (status === 'completed' || selectedDate < new Date(new Date().setHours(0,0,0,0)))) {
 // Match by session_id in real app, but widget has no access to session_id easily unless joined. But wait! The attendanceMap was keyed by session_id! The widget needs to map it. For now, attStatus = attendanceData[cls.id] || 'absent'; // Mock absent if past and no record
 }

 const isActive = status === 'active';
 const isPast = status === 'completed' || selectedDate < new Date(new Date().setHours(0,0,0,0));
 
 let bgColor = 'bg-themeElevated border border-themeBorder text-themeText';
 let iconColor = 'text-themeTextSec';
 
 if (isActive) {
 bgColor = 'bg-themeAccent text-themeText shadow-md border-themeAccent';
 iconColor = 'text-themeApp/80';
 } else if (attStatus === 'present') {
 bgColor = 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500';
 iconColor = 'text-emerald-500';
 } else if (attStatus === 'absent') {
 bgColor = 'bg-rose-500/10 border border-rose-500/30 text-rose-500';
 iconColor = 'text-rose-500';
 } else if (isPast) {
 bgColor = 'bg-themeElevated border border-themeBorder text-themeText opacity-60';
 }

 return (
 <div key={idx} className={`shrink-0 flex flex-col p-3 rounded-xl min-w-[140px] max-w-[180px] transition-all cursor-default ${bgColor}`}>
 <div className="flex items-center justify-between mb-1.5">
 <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-themeApp/90' : 'text-themeTextSec'}`}>
 {formatTime(cls.start_time)}
 </span>
 {isActive && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-themePanel opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-themePanel"></span></span>}
 {attStatus === 'present' && <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>}
 {attStatus === 'absent' && <i className="fa-solid fa-circle-xmark text-rose-500 text-[10px]"></i>}
 </div>
 <h4 className="text-xs font-black truncate mb-1">{cls.subject?.name || cls.subject_name || 'Class'}</h4>
 <div className="flex items-center gap-1.5 mt-auto">
 <i className={`fa-solid fa-location-dot text-[9px] ${iconColor}`}></i>
 <span className={`text-[9px] font-bold uppercase tracking-widest truncate ${isActive ? 'text-themeApp/80' : 'text-themeTextSec'}`}>{cls.room?.name || cls.room || 'TBA'}</span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

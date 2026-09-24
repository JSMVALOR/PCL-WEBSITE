/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveCalendar({}) {
 const [currentMonth, setCurrentMonth] = useState(new Date());
 const [leaves, setLeaves] = useState([]);
 const [isLoading, setIsLoading] = useState(false);

 useEffect(() => {
 fetchLeavesForMonth();
 }, [currentMonth]);

 const fetchLeavesForMonth = async () => {
 setIsLoading(true);
 try {
 // Fetch leaves spanning this month
 const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
 const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();
 
 const { data } = await supabase
 .from('faculty_leaves')
 .select('id, start_date, end_date, leave_type')
 .eq('status', 'Approved')
 .gte('end_date', startOfMonth)
 .lte('start_date', endOfMonth);

 setLeaves(data || []);
 } catch (error) {
 console.error("Error fetching calendar leaves:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
 const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

 // Calendar logic
 const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
 const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

 const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
 const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
 const monthName = currentMonth.toLocaleString('default', { month: 'long' });
 const year = currentMonth.getFullYear();

 const renderCalendarGrid = () => {
 const days = [];
 
 // Blank days before 1st
 for (let i = 0; i < firstDay; i++) {
 days.push(<div key={`blank-${i}`} className="min-h-[100px] border border-black/[0.04] dark:border-white/[0.08]/50 bg-black/5 dark:bg-white/5/30 rounded-xl"></div>);
 }

 // Days of month
 for (let day = 1; day <= daysInMonth; day++) {
 const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
 
 // Check if any leaves fall on this day
 const leavesOnDay = leaves.filter(l => {
 return dateStr >= l.start_date && dateStr <= l.end_date;
 });

 const isToday = new Date().toISOString().split('T')[0] === dateStr;

 days.push(
 <div key={day} className={`min-h-[80px] lg:min-h-[100px] border-[length:var(--border-width)] rounded-xl p-1.5 lg:p-2 transition relative flex flex-col gap-1 overflow-hidden group
 ${isToday ? 'border-indigo-500 bg-indigo-500/5' : 'border-themeBorder dark:border-white/5 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8]/85 backdrop-blur-2xl hover:bg-black/5 dark:bg-white/5/90 backdrop-blur-2xl hover:border-black/5 dark:border-white/10'}
 `}>
 <div className="flex justify-between items-center mb-0.5 lg:mb-1">
 <span className={`text-[10px] lg:text-[14px] font-medium ${isToday ? 'text-indigo-500' : 'text-themeTextSec'} group-hover:text-themeText transition-colors w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500/10' : ''}`}>{day}</span>
 </div>

 <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] lg:max-h-[80px] no-scrollbar">
 {leavesOnDay.map(leave => (
 <div key={leave.id} className={`text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded truncate bg-${leave.leave_type || 'blue'}-500/10 text-${leave.leave_type || 'blue'}-500 hover:bg-${leave.leave_type || 'blue'}-500 hover:text-themeText dark:text-white transition-colors cursor-default`}>
 {'Faculty' || 'Faculty'}
 </div>
 ))}
 </div>
 </div>
 );
 }

 return days;
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 
 <div className="flex flex-col md:flex-row items-center justify-between bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-4 lg:p-5 gap-4">
 <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto justify-between md:justify-start">
 <button type="button" onClick={prevMonth} className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong flex items-center justify-center text-themeText hover:text-indigo-500 transition-colors">
 <i className="fa-solid fa-chevron-left"></i>
 </button>
 <h2 className={`font-bold tracking-tight text-lg lg:text-xl text-themeText min-w-[140px] lg:w-48 text-center`}>{monthName} {year}</h2>
 <button type="button" onClick={nextMonth} className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong flex items-center justify-center text-themeText hover:text-indigo-500 transition-colors">
 <i className="fa-solid fa-chevron-right"></i>
 </button>
 </div>

 <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4 text-[9px] lg:text-xs font-bold text-themeTextSec">
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Medical</div>
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Casual</div>
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Conference</div>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-3 mb-2">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="text-center text-[13px] font-medium text-themeTextSec">
 {day}
 </div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-3 relative">
 {isLoading && (
 <div className="absolute inset-0 z-10 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8]/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
 <span className="text-[15px] font-semibold tracking-normal text-themeText">Loading Calendar...</span>
 </div>
 )}
 {renderCalendarGrid()}
 </div>

 </div>
 );
}

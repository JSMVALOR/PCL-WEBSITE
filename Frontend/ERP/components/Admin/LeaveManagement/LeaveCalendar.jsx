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
 .select('id, from_date, to_date, leave_type, faculty_id')
 .eq('status', 'approved')
 .gte('to_date', startOfMonth)
 .lte('from_date', endOfMonth);

 // Enrich with faculty names
 let enriched = data || [];
 if (enriched.length > 0) {
  const uniqueIds = [...new Set(enriched.map(l => l.faculty_id).filter(Boolean))];
  if (uniqueIds.length > 0) {
   const { data: facultyList } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', uniqueIds);
   const nameMap = {};
   (facultyList || []).forEach(f => nameMap[f.id] = f.full_name);
   enriched = enriched.map(l => ({ ...l, faculty_name: nameMap[l.faculty_id] || 'Faculty' }));
  }
 }

 setLeaves(enriched);
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
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
 days.push(<div key={`blank-${i}`} className="min-h-[60px] md:min-h-[100px] border border-themeBorder dark:border-white/[0.08]/50 bg-themeElevated /30 rounded-xl"></div>);
 }

 // Days of month
 for (let day = 1; day <= daysInMonth; day++) {
 const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
 
 // Check if any leaves fall on this day
 const leavesOnDay = leaves.filter(l => {
 return dateStr >= l.from_date && dateStr <= l.to_date;
 });

 const isToday = new Date().toISOString().split('T')[0] === dateStr;

 days.push(
 <div key={day} className={`min-h-[50px] md:min-h-[80px] lg:min-h-[60px] md:min-h-[100px] border-[length:var(--border-width)] rounded-xl p-1.5 lg:p-2 transition relative flex flex-col gap-1 overflow-hidden group
 ${isToday ? 'border-indigo-500 bg-indigo-500/5' : 'border-themeBorder bg-themePanel shadow-sm/85 backdrop-blur-2xl hover:bg-themeElevated /90 backdrop-blur-2xl hover:border-themeBorder '}
 `}>
 <div className="flex justify-between items-center mb-0.5 lg:mb-1">
 <span className={`text-[10px] lg:text-[14px] font-medium ${isToday ? 'text-indigo-500' : 'text-themeTextSec'} group-hover:text-themeText transition-colors w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500/10' : ''}`}>{day}</span>
 </div>

 <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] lg:max-h-[80px] no-scrollbar">
 {leavesOnDay.map(leave => {
  const colorMap = { 'Medical Leave': '#f59e0b', 'Casual Leave': '#10b981', 'Conference Leave': '#6366f1', 'Maternity Leave': '#ec4899', 'Earned Leave': '#8b5cf6' };
  const c = colorMap[leave.leave_type] || '#6366f1';
  return (
  <div key={leave.id} className="text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded truncate cursor-default"
   style={{ backgroundColor: `${c}15`, color: c }}>
   {leave.faculty_name || 'Faculty'}
  </div>
  );
 })}
 </div>
 </div>
 );
 }

 return days;
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 
 <div className="flex flex-col md:flex-row items-center justify-between bg-themePanel shadow-sm border border-themeBorder rounded-[2rem] p-4 lg:p-5 gap-4">
 <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto justify-between md:justify-start">
 <button aria-label="Action button" type="button" onClick={prevMonth} className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-themeBorder dark:border-white/[0.08]Strong flex items-center justify-center text-themeText hover:text-indigo-500 transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
 <h2 className={`font-bold tracking-tight text-lg lg:text-xl text-themeText min-w-[140px] lg:w-48 text-center`}>{monthName} {year}</h2>
 <button aria-label="Action button" type="button" onClick={nextMonth} className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-themeBorder dark:border-white/[0.08]Strong flex items-center justify-center text-themeText hover:text-indigo-500 transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
 </div>

 <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-4 text-[9px] lg:text-xs font-bold text-themeTextSec">
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Medical</div>
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Casual</div>
 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Conference</div>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-1 md:gap-3 mb-2">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="text-center text-[13px] font-medium text-themeTextSec">
 {day}
 </div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1 md:gap-3 relative">
 {isLoading && (
 <div className="absolute inset-0 z-10 bg-themePanel shadow-sm/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
 <span className="text-[15px] font-semibold tracking-normal text-themeText">Loading Calendar...</span>
 </div>
 )}
 {renderCalendarGrid()}
 </div>

 </div>
 );
}

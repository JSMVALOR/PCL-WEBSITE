/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
 { id: 'I', start: '09:00', end: '09:45', label: 'I', timeLabel: '9:00 - 9:45', type: 'class' },
 { id: 'II', start: '09:50', end: '10:35', label: 'II', timeLabel: '9:50 - 10:35', type: 'class' },
 { id: 'B1', start: '10:35', end: '10:50', label: 'SHORT BREAK', timeLabel: '10:35 - 10:50', type: 'break' },
 { id: 'III', start: '10:50', end: '11:35', label: 'III', timeLabel: '10:50 - 11:35', type: 'class' },
 { id: 'IV', start: '11:40', end: '12:25', label: 'IV', timeLabel: '11:40 - 12:25', type: 'class' },
 { id: 'B2', start: '12:25', end: '13:25', label: 'LUNCH BREAK', timeLabel: '12:25 - 1:25', type: 'break' },
 { id: 'V', start: '13:25', end: '14:10', label: 'V', timeLabel: '1:25 - 2:10', type: 'class' },
 { id: 'VI', start: '14:15', end: '15:00', label: 'VI', timeLabel: '2:15 - 3:00', type: 'class' },
 { id: 'VII', start: '15:05', end: '15:50', label: 'VII', timeLabel: '3:05 - 3:50', type: 'class' }
];

const SUBJECT_COLORS = {
 slate: { bg: 'bg-slate-500/10 dark:bg-slate-400/10', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-500/20 dark:border-slate-400/20', solid: 'bg-slate-500 dark:bg-slate-400', shadow: 'shadow-slate-500/20 dark:shadow-slate-400/20' },
 zinc: { bg: 'bg-zinc-500/10 dark:bg-zinc-400/10', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-500/20 dark:border-zinc-400/20', solid: 'bg-zinc-500 dark:bg-zinc-400', shadow: 'shadow-zinc-500/20 dark:shadow-zinc-400/20' },
 red: { bg: 'bg-red-500/10 dark:bg-red-400/10', text: 'text-red-700 dark:text-red-300', border: 'border-red-500/20 dark:border-red-400/20', solid: 'bg-red-500 dark:bg-red-400', shadow: 'shadow-red-500/20 dark:shadow-red-400/20' },
 orange: { bg: 'bg-orange-500/10 dark:bg-orange-400/10', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500/20 dark:border-orange-400/20', solid: 'bg-orange-500 dark:bg-orange-400', shadow: 'shadow-orange-500/20 dark:shadow-orange-400/20' },
 amber: { bg: 'bg-amber-500/10 dark:bg-amber-400/10', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/20 dark:border-amber-400/20', solid: 'bg-amber-500 dark:bg-amber-400', shadow: 'shadow-amber-500/20 dark:shadow-amber-400/20' },
 yellow: { bg: 'bg-yellow-500/10 dark:bg-yellow-400/10', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-500/20 dark:border-yellow-400/20', solid: 'bg-yellow-500 dark:bg-yellow-400', shadow: 'shadow-yellow-500/20 dark:shadow-yellow-400/20' },
 lime: { bg: 'bg-lime-500/10 dark:bg-lime-400/10', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-500/20 dark:border-lime-400/20', solid: 'bg-lime-500 dark:bg-lime-400', shadow: 'shadow-lime-500/20 dark:shadow-lime-400/20' },
 green: { bg: 'bg-green-500/10 dark:bg-green-400/10', text: 'text-green-700 dark:text-green-300', border: 'border-green-500/20 dark:border-green-400/20', solid: 'bg-green-500 dark:bg-green-400', shadow: 'shadow-green-500/20 dark:shadow-green-400/20' },
 emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-400/10', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/20 dark:border-emerald-400/20', solid: 'bg-emerald-500 dark:bg-emerald-400', shadow: 'shadow-emerald-500/20 dark:shadow-emerald-400/20' },
 teal: { bg: 'bg-teal-500/10 dark:bg-teal-400/10', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500/20 dark:border-teal-400/20', solid: 'bg-teal-500 dark:bg-teal-400', shadow: 'shadow-teal-500/20 dark:shadow-teal-400/20' },
 cyan: { bg: 'bg-cyan-500/10 dark:bg-cyan-400/10', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500/20 dark:border-cyan-400/20', solid: 'bg-cyan-500 dark:bg-cyan-400', shadow: 'shadow-cyan-500/20 dark:shadow-cyan-400/20' },
 sky: { bg: 'bg-sky-500/10 dark:bg-sky-400/10', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-500/20 dark:border-sky-400/20', solid: 'bg-sky-500 dark:bg-sky-400', shadow: 'shadow-sky-500/20 dark:shadow-sky-400/20' },
 blue: { bg: 'bg-blue-500/10 dark:bg-blue-400/10', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/20 dark:border-blue-400/20', solid: 'bg-blue-500 dark:bg-blue-400', shadow: 'shadow-blue-500/20 dark:shadow-blue-400/20' },
 indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-400/10', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-500/20 dark:border-indigo-400/20', solid: 'bg-indigo-500 dark:bg-indigo-400', shadow: 'shadow-indigo-500/20 dark:shadow-indigo-400/20' },
 violet: { bg: 'bg-violet-500/10 dark:bg-violet-400/10', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-500/20 dark:border-violet-400/20', solid: 'bg-violet-500 dark:bg-violet-400', shadow: 'shadow-violet-500/20 dark:shadow-violet-400/20' },
 purple: { bg: 'bg-purple-500/10 dark:bg-purple-400/10', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/20 dark:border-purple-400/20', solid: 'bg-purple-500 dark:bg-purple-400', shadow: 'shadow-purple-500/20 dark:shadow-purple-400/20' },
 fuchsia: { bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-400/10', text: 'text-fuchsia-700 dark:text-fuchsia-300', border: 'border-fuchsia-500/20 dark:border-fuchsia-400/20', solid: 'bg-fuchsia-500 dark:bg-fuchsia-400', shadow: 'shadow-fuchsia-500/20 dark:shadow-fuchsia-400/20' },
 pink: { bg: 'bg-pink-500/10 dark:bg-pink-400/10', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-500/20 dark:border-pink-400/20', solid: 'bg-pink-500 dark:bg-pink-400', shadow: 'shadow-pink-500/20 dark:shadow-pink-400/20' },
 rose: { bg: 'bg-rose-500/10 dark:bg-rose-400/10', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/20 dark:border-rose-400/20', solid: 'bg-rose-500 dark:bg-rose-400', shadow: 'shadow-rose-500/20 dark:shadow-rose-400/20' },
};

export default function WeeklyChart({ schedule = [], onLectureClick, role = 'student', isDrawMode = false, onSlotClick, batchName = '', onSlotSwap }) {
 
 // Auto-detect if Sunday is needed
 const hasSundayClass = schedule.some(c => c.day === 'Sunday');
 const displayDays = hasSundayClass ? [...DAYS, 'Sunday'] : DAYS;

 const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

 const isLLB = batchName && (batchName.includes('LLB') || batchName.includes('LL.B.')) && !batchName.includes('B.A.') && !batchName.includes('BA') && !batchName.includes('B.B.A.') && !batchName.includes('BBA');
 const displaySlots = isLLB ? [
 { id: 'I', start: '09:00', end: '09:45', label: 'I', timeLabel: '9:00 - 9:45', type: 'class' },
 { id: 'II', start: '09:50', end: '10:35', label: 'II', timeLabel: '9:50 - 10:35', type: 'class' },
 { id: 'B1', start: '10:35', end: '10:50', label: 'SHORT BREAK', timeLabel: '10:35 - 10:50', type: 'break' },
 { id: 'III', start: '10:50', end: '11:35', label: 'III', timeLabel: '10:50 - 11:35', type: 'class' },
 { id: 'IV', start: '11:40', end: '12:25', label: 'IV', timeLabel: '11:40 - 12:25', type: 'class' },
 { id: 'V', start: '12:25', end: '13:20', label: 'V', timeLabel: '12:25 - 1:20', type: 'class' }
 ] : TIME_SLOTS;

 return (
 <div className="w-full overflow-x-auto custom-scrollbar pb-6">
 <div className="min-w-[1000px] bg-themeElevated/90 backdrop-blur-2xl rounded-[2rem] border border-themeBorder overflow-hidden relative shadow-sm">
 
 {/* Header Row: Time Slots */}
 <div className="flex bg-themePanel/90 border-b border-themeBorder relative z-20">
 <div className="w-32 shrink-0 border-r border-themeBorder flex items-center justify-center p-4 bg-themeElevated/60">
 <i className="fa-regular fa-clock text-themeTextSec text-lg"></i>
 </div>
 {displaySlots.map((slot, idx) => (
 <div key={slot.id} className={`${slot.type === 'break' ? 'w-16 bg-themeElevated ' : 'flex-1'} shrink-0 text-center py-3 px-2 border-r border-themeBorder last:border-r-0 flex flex-col justify-center items-center`}>
 {slot.type === 'break' ? (
 <span className="text-[10px] font-black tracking-widest text-themeTextSec rotate-180" style={{ writingMode: 'vertical-rl' }}>{slot.label}</span>
 ) : (
 <>
 <span className="text-xs font-black text-themeText uppercase">{slot.label}</span>
 <span className="text-[10px] font-bold text-themeTextSec mt-1">{slot.timeLabel}</span>
 </>
 )}
 </div>
 ))}
 </div>

 {/* Days Rows */}
 <div className="flex flex-col relative z-10">
 {displayDays.map((day, rowIdx) => {
 const isToday = day === currentDay;
 return (
 <div key={day} className={`flex border-b border-themeBorder last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-themePanel/[0.02] transition-colors ${isToday ? 'bg-amber-500/[0.03]' : ''}`}>
 {/* Day Label */}
 <div className="w-32 shrink-0 border-r border-themeBorder p-4 flex flex-col items-center justify-center relative">
 {isToday && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full"></div>}
 <span className={`text-sm font-black tracking-tight ${isToday ? 'text-amber-500' : 'text-themeText'}`}>{day}</span>
 {isToday && <span className="text-[9px] font-bold bg-amber-500 text-themeApp px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">Today</span>}
 </div>
 
 {/* Time Slots for the Day */}
 {displaySlots.map((slot, colIdx) => {
 if (slot.type === 'break') {
 return (
 <div key={`${day}-${slot.id}`} className="w-16 shrink-0 bg-themeElevated border-r border-themeBorder last:border-r-0"></div>
 );
 }

 // Find matching class
 const cls = schedule.find(c => {
 if (c.day !== day) return false;
 // Match if class start time falls within this slot, or slot falls within class
 return (c.time >= slot.start && c.time < slot.end) || (c.time <= slot.start && c.endTime > slot.start);
 });

 return (
 <div 
 key={`${day}-${slot.id}`} 
 className={`flex-1 shrink-0 border-r border-themeBorder last:border-r-0 p-2 flex flex-col ${isDrawMode ? 'cursor-pointer hover:bg-amber-500/10' : ''}`}
 onClick={() => {
 if (isDrawMode && onSlotClick) {
 onSlotClick(day, slot.start, slot.end);
 }
 }}
 onDragOver={(e) => {
 if (onSlotSwap) e.preventDefault();
 }}
 onDrop={(e) => {
 if (!onSlotSwap) return;
 e.preventDefault();
 const draggedId = e.dataTransfer.getData('text/plain');
 if (draggedId) {
 onSlotSwap(draggedId, day, slot.start, slot.end);
 }
 }}
 >
 {cls ? (
 <div 
 draggable={!!onSlotSwap}
 onDragStart={(e) => {
 if (onSlotSwap) {
 e.dataTransfer.setData('text/plain', cls.id || (cls.raw && cls.raw.id) || '');
 e.dataTransfer.effectAllowed = 'move';
 }
 }}
 onClick={(e) => {
 if (onLectureClick) {
 e.stopPropagation();
 onLectureClick(cls);
 }
 }}
 className={`h-full rounded-xl cursor-grab active:cursor-grabbing p-3 flex flex-col ${cls.isDraft ? 'border-2 border-dashed border-amber-500/50 bg-amber-500/5 opacity-80' : ''} ${cls.color ? (SUBJECT_COLORS[cls.color]?.bg + ' border border-themeBorder ') : 'bg-gray-100 border border-themeBorder '} ${!isDrawMode && !onSlotSwap ? 'cursor-pointer hover:scale-[1.02] transition-transform shadow-sm' : 'hover:scale-[1.02] transition-transform shadow-sm'}`}
 >
 <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${cls.color ? SUBJECT_COLORS[cls.color]?.text : 'text-themeText'}`}>{cls.subject}</h4>
 <div className="mt-auto pt-2 flex justify-between items-end">
 <div className="flex flex-col gap-0.5">
 {role !== 'faculty' && <span className="text-[9px] font-bold text-themeTextSec"><i className="fa-solid fa-user-tie mr-1 opacity-70"></i>{cls.faculty || 'TBD'}</span>}
 </div>
 {cls.isDraft && <i className="fa-solid fa-pen text-amber-500/50 text-xs"></i>}
 </div>
 </div>
 ) : (
 <div className="w-full h-full rounded-xl border border-dashed border-themeBorder flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
 {isDrawMode && <i className="fa-solid fa-plus text-amber-500/30 text-xl"></i>}
 </div>
 )}
 </div>
 );
 })}
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}

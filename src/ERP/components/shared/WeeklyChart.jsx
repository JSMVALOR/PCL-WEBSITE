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
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500', shadow: 'shadow-amber-500/20' } 
};

export default function WeeklyChart({ schedule = [], onLectureClick, role = 'student', isDrawMode = false, onSlotClick, batchName = '' }) {
    
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
            <div className="min-w-[1000px] bg-themeElevated/90 backdrop-blur-2xl rounded-[2rem] border border-black/10 dark:border-white/10 overflow-hidden relative shadow-sm">
                
                {/* Header Row: Time Slots */}
                <div className="flex bg-themePanel/90 border-b border-black/10 dark:border-white/10 relative z-20">
                    <div className="w-32 shrink-0 border-r border-black/10 dark:border-white/10 flex items-center justify-center p-4 bg-themeElevated/60">
                        <i className="fa-regular fa-clock text-themeTextSec text-lg"></i>
                    </div>
                    {displaySlots.map((slot, idx) => (
                        <div key={slot.id} className={`${slot.type === 'break' ? 'w-16 bg-black/5 dark:bg-white/5' : 'flex-1'} shrink-0 text-center py-3 px-2 border-r border-black/10 dark:border-white/10 last:border-r-0 flex flex-col justify-center items-center`}>
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
                            <div key={day} className={`flex border-b border-black/10 dark:border-white/10 last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${isToday ? 'bg-amber-500/[0.03]' : ''}`}>
                                {/* Day Label */}
                                <div className="w-32 shrink-0 border-r border-black/10 dark:border-white/10 p-4 flex flex-col items-center justify-center relative">
                                    {isToday && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full"></div>}
                                    <span className={`text-sm font-black tracking-tight ${isToday ? 'text-amber-500' : 'text-themeText'}`}>{day}</span>
                                    {isToday && <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">Today</span>}
                                </div>
                                
                                {/* Time Slots for the Day */}
                                {displaySlots.map((slot, colIdx) => {
                                    if (slot.type === 'break') {
                                        return (
                                            <div key={`${day}-${slot.id}`} className="w-16 shrink-0 bg-black/5 dark:bg-white/5 border-r border-black/10 dark:border-white/10 last:border-r-0"></div>
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
                                            className={`flex-1 shrink-0 border-r border-black/10 dark:border-white/10 last:border-r-0 p-2 flex flex-col ${isDrawMode ? 'cursor-pointer hover:bg-amber-500/10' : ''}`}
                                            onClick={() => {
                                                if (isDrawMode && onSlotClick) {
                                                    onSlotClick(day, slot.start, slot.end);
                                                }
                                            }}
                                        >
                                            {cls ? (
                                                <div 
                                                    onClick={(e) => {
                                                        if (onLectureClick) {
                                                            e.stopPropagation();
                                                            onLectureClick(cls);
                                                        }
                                                    }}
                                                    className={`h-full rounded-xl p-3 flex flex-col ${cls.isDraft ? 'border-2 border-dashed border-amber-500/50 bg-amber-500/5 opacity-80' : ''} ${cls.color ? (SUBJECT_COLORS[cls.color]?.bg + ' border border-black/5 dark:border-white/10') : 'bg-gray-100 dark:bg-white/5 border border-black/10 dark:border-white/10'} ${!isDrawMode ? 'cursor-pointer hover:scale-[1.02] transition-transform shadow-sm' : ''}`}
                                                >
                                                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${cls.color ? SUBJECT_COLORS[cls.color]?.text : 'text-themeText'}`}>{cls.subject}</h4>
                                                    <div className="mt-auto pt-2 flex justify-between items-end">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-bold text-themeTextSec"><i className="fa-solid fa-door-open mr-1 opacity-70"></i>{cls.room || 'TBD'}</span>
                                                            {role !== 'faculty' && <span className="text-[9px] font-bold text-themeTextSec"><i className="fa-solid fa-user-tie mr-1 opacity-70"></i>{cls.faculty || 'TBD'}</span>}
                                                        </div>
                                                        {cls.isDraft && <i className="fa-solid fa-pen text-amber-500/50 text-xs"></i>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full rounded-xl border border-dashed border-black/5 dark:border-white/5 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
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

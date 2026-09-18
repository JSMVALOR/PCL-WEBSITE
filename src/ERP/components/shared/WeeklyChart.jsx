/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 8; // 8:00 AM
const END_HOUR = 18; // 6:00 PM
const HOUR_HEIGHT = 75; // Increased for better spacing
const GRID_OFFSET_Y = 30; // Offset everything down

const SUBJECT_COLORS = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500', shadow: 'shadow-amber-500/20' } };

export default function WeeklyChart({ schedule = [], onLectureClick, role = 'student', isDrawMode = false, onSlotClick }) {
    
    // Check which days have classes to dynamically hide fully empty weekends if we want
    const hasSundayClass = schedule.some(c => c.day === 'Sunday');
    const displayDays = hasSundayClass ? DAYS : DAYS.slice(0, 6);

    // Generate times for the background grid slots (start of each hour)
    const hours = [];
    for (let i = START_HOUR; i < END_HOUR; i++) {
        hours.push(`${String(i).padStart(2, '0')}:00`);
    }

    // Generate time labels
    const timeLabels = [];
    for (let i = START_HOUR; i <= END_HOUR; i++) {
        const ampm = i >= 12 ? 'PM' : 'AM';
        const hour = i % 12 || 12;
        timeLabels.push(`${hour}:00 ${ampm}`);
    }

    const getBlockStyle = (startTimeStr, endTimeStr) => {
        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':');
            return parseInt(h, 10) * 60 + parseInt(m, 10);
        };

        const startMins = parseTime(startTimeStr);
        const endMins = parseTime(endTimeStr);
        const gridStartMins = START_HOUR * 60;

        const top = ((startMins - gridStartMins) / 60) * HOUR_HEIGHT + GRID_OFFSET_Y;
        const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

        return {
            top: `${top}px`,
            height: `${Math.max(height - 4, 30)}px`, // Subtracted 4px for padding between stacked classes
        };
    };

    return (
        <div className="bg-themePanel/80 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-xl flex flex-col w-full relative overflow-hidden">
            {/* Header Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-themeAccent/20 via-themeAccent to-themeAccent/20 z-50"></div>
            
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[900px] flex flex-col">
                    
                    {/* Header: Days */}
                    <div className="flex border-b border-gray-200 dark:border-white/5 bg-themeElevated/60 sticky top-0 z-40 backdrop-blur-xl">
                        <div className="w-24 shrink-0 border-r border-gray-200 dark:border-white/5 bg-themeElevated/60 sticky left-0 z-50 backdrop-blur-xl flex items-center justify-center">
                            <i className="fa-regular fa-clock text-themeTextSec opacity-50"></i>
                        </div>
                        
                        {displayDays.map(day => {
                            const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                            const isToday = day === todayDayName;
                            return (
                                <div key={day} className={`flex-1 py-5 text-center border-r border-gray-200 dark:border-white/5/30 last:border-r-0 relative group ${isToday ? 'bg-themeAccent/5' : ''}`}>
                                    <div className="absolute inset-0 bg-themeAccent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    <span className={`text-[11px] font-black tracking-normal drop-shadow-sm ${isToday ? 'text-themeAccent' : 'text-themeText'}`}>{day}</span>
                                    {isToday && <div className="mt-1"><span className="text-[7px] font-black tracking-normal bg-themeAccent text-gray-900 dark:text-white px-1.5 py-0.5 rounded-full">Today</span></div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid Body */}
                    <div className="flex relative bg-themeApp/30 w-full">
                        
                        {/* Y-Axis: Time Labels */}
                        <div className="w-24 shrink-0 border-r border-gray-200 dark:border-white/5 bg-themePanel/90 sticky left-0 z-30 shadow-[4px_0_15px_rgba(0,0,0,0.1)] backdrop-blur-md" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + GRID_OFFSET_Y * 2}px` }}>
                            {timeLabels.map((time, index) => (
                                <div 
                                    key={time} 
                                    className="absolute right-0 pr-4 w-full text-right flex items-center justify-end"
                                    style={{ top: `${index * HOUR_HEIGHT + GRID_OFFSET_Y - 9}px` }}
                                >
                                    <span className="text-[10px] font-bold text-themeTextSec tracking-widest uppercase">{time}</span>
                                </div>
                            ))}
                        </div>

                        {/* X-Axis: Columns Container */}
                        <div className="flex-1 flex relative">
                            
                            {/* Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none z-0">
                                {timeLabels.map((time, index) => (
                                    <div 
                                        key={`line-${index}`} 
                                        className="absolute w-full border-t border-gray-200 dark:border-white/5/20 border-dashed"
                                        style={{ top: `${index * HOUR_HEIGHT + GRID_OFFSET_Y}px` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Day Columns */}
                            {displayDays.map(day => {
                                const dayClasses = schedule.filter(c => c.day === day);
                                const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                                const isToday = day === todayDayName;
                                
                                return (
                                    <div key={day} className={`flex-1 border-r border-gray-200 dark:border-white/5/20 last:border-r-0 relative min-w-[120px] z-10 group/col hover:bg-themeElevated/10 transition-colors ${isToday ? 'bg-themeAccent/[0.03]' : ''}`}>
                                        {dayClasses.map(cls => {
                                            const style = getBlockStyle(cls.time, cls.endTime);
                                            const c = SUBJECT_COLORS[cls.color] || SUBJECT_COLORS.blue;

                                            return (
                                                <div 
                                                    key={cls.id}
                                                    onClick={() => !cls.isDraft && onLectureClick && onLectureClick(cls)}
                                                    className={`absolute inset-x-[4px] p-2.5 rounded-xl border backdrop-blur-md transition duration-300 cursor-pointer hover:-translate-y-1 hover:z-20 z-10 group/card overflow-hidden ${c.bg} ${cls.isDraft ? 'border-dashed border-2 opacity-80' : c.border} ${c.shadow} hover:shadow-lg`}
                                                    style={{
                                                        ...style,
                                                        ...(cls.isDraft ? {
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
                                                        } : {})
                                                    }}
                                                >
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.solid} opacity-80 group-hover/card:opacity-100 transition-opacity`}></div>
                                                    
                                                    <div className="pl-2.5 h-full flex flex-col justify-between">
                                                        <div>
                                                            <h4 className={`text-[14px] font-medium leading-tight ${c.text} drop-shadow-sm flex items-center gap-1.5`}>
                                                                {cls.subject}
                                                                {cls.isDraft && <i className="fa-solid fa-pen-ruler text-[8px] opacity-70" title="Draft"></i>}
                                                            </h4>
                                                            <p className="text-[10px] font-bold text-themeText mt-1 truncate opacity-90">{cls.time} - {cls.endTime}</p>
                                                        </div>
                                                        
                                                        {parseInt(style.height) >= 60 && (
                                                            <div className="mt-2 flex flex-col gap-1">
                                                                <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-location-dot opacity-70 w-3"></i> {cls.room}</span>
                                                                {(role === 'student' || role === 'admin') && cls.faculty && (
                                                                    <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-user opacity-70 w-3"></i> {cls.faculty}</span>
                                                                )}
                                                                {(role === 'faculty' || role === 'admin') && cls.semester && (
                                                                    <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-graduation-cap opacity-70 w-3"></i> {cls.semester}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

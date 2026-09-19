import React from 'react';

const SUBJECT_COLORS = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500' },
    gray: { bg: 'bg-themeElevated', text: 'text-themeTextSec', border: 'border-themeBorder', solid: 'bg-themeBorderStrong' }
};

export default function WeeklyList({ schedule, onLectureClick, role }) {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return (
        <div className="flex flex-col gap-10 animate-fade-in w-full pb-10">
            {daysOrder.map(day => {
                const dayClasses = schedule.filter(c => c.day === day);
                if (dayClasses.length === 0) return null;
                
                return (
                    <div key={day} className="flex flex-col relative">
                        {/* Day Header */}
                        <div className="sticky top-0 z-20 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl py-4 lg:py-5 border-b border-black/5 dark:border-white/5 mb-8 flex items-center justify-between shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
                            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] flex items-center gap-3">
                                {day}
                                <span className="text-[12px] font-bold px-3 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-[#8E8E93] tracking-tight">
                                    {dayClasses.length} {dayClasses.length === 1 ? 'Class' : 'Classes'}
                                </span>
                            </h2>
                        </div>
                        
                        {/* Day Timeline */}
                        <div className="flex flex-col relative">
                            <div className="absolute left-[72px] top-4 bottom-0 w-px bg-black/[0.04] dark:bg-white/[0.04] z-0"></div>
                            
                            {dayClasses.map((lec, idx) => {
                                const c = SUBJECT_COLORS[lec.color] || SUBJECT_COLORS.gray;
                                const isDraft = lec.isDraft;
                                
                                return (
                                    <div key={lec.id || idx} className={`flex gap-6 relative group ${isDraft ? 'opacity-70' : ''}`}>
                                        {/* Time Column */}
                                        <div className="w-16 flex flex-col items-end shrink-0 pt-5 relative z-10">
                                            <span className="text-[15px] font-bold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{lec.time}</span>
                                            <span className="text-[11px] font-medium text-[#8E8E93]">{lec.endTime}</span>
                                        </div>
                                        
                                        {/* Timeline Node */}
                                        <div className="relative w-px flex-col flex items-center z-10 pt-1">
                                            <div className={`w-3 h-3 rounded-full border-[4px] border-white dark:border-[#121212] shadow-sm mt-4 transition-colors ${isDraft ? 'bg-themeBorder' : c.solid} group-hover:scale-125`}></div>
                                        </div>
                                        
                                        {/* Card Column */}
                                        <div className="flex-1 pb-6 pt-2">
                                            <div 
                                                onClick={() => !isDraft && onLectureClick && onLectureClick(lec)}
                                                className={`w-full rounded-[1.5rem] p-6 border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer flex justify-between items-start relative overflow-hidden ${isDraft ? "bg-transparent border-dashed border-black/10 dark:border-white/10 opacity-70" : "bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl border-black/5 dark:border-white/5 hover:shadow-xl hover:scale-[1.01]"}`}
                                            >
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {!isDraft && <div className={`w-2 h-2 rounded-full shrink-0 ${c.solid}`}></div>}
                                                        <h3 className={`text-lg font-semibold tracking-tight ${isDraft ? "text-[#8E8E93]" : "text-[#1C1C1E] dark:text-[#F2F2F7]"} line-clamp-2 leading-snug mb-0.5`} title={lec.subject}>
                                                            {lec.subject ? lec.subject.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : ''}
                                                        </h3>
                                                        {isDraft && <i className="fa-solid fa-pen-ruler text-[10px] text-themeTextSec/50 ml-1" title="Draft"></i>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                        {lec.room && (
                                                            <span className="text-[12px] font-medium text-[#8E8E93] flex items-center gap-1.5"><i className="fa-solid fa-location-dot opacity-70"></i> {lec.room}</span>
                                                        )}
                                                        {(role === 'student' || role === 'admin') && lec.faculty && (
                                                            <span className="text-[12px] font-medium text-[#8E8E93] flex items-center gap-1.5"><i className="fa-solid fa-user opacity-70"></i> {lec.faculty}</span>
                                                        )}
                                                        {(role === 'faculty' || role === 'admin') && lec.semester && (
                                                            <span className="text-[12px] font-medium text-[#8E8E93] flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap opacity-70"></i> {lec.semester}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            
            {schedule.length === 0 && (
                <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4 mt-8">
                    <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6"><i className="fa-regular fa-calendar-xmark text-3xl text-gray-400 dark:text-white/30"></i></div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">No classes scheduled for this week.</h3><p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">Your timetable is completely clear.</p>
                </div>
            )}
        </div>
    );
}

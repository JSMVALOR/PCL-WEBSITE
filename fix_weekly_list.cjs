const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/shared/WeeklyList.jsx', 'utf8');

// Ensure we import useState
if (!code.includes("import React, { useState }")) {
    code = code.replace("import React from 'react';", "import React, { useState } from 'react';");
}

const renderReplacement = `
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Find the current day or default to Monday
    const todayNum = new Date().getDay();
    const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Monday' };
    const initialDay = daysMap[todayNum] || 'Monday';
    const [activeDay, setActiveDay] = useState(initialDay);
    
    // Filter classes for the active day
    const dayClasses = schedule.filter(c => c.day === activeDay);

    return (
        <div className="flex flex-col gap-6 animate-fade-in w-full pb-10">
            {/* Horizontal Day Tabs */}
            <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-full gap-1 snap-x">
                {daysOrder.map(day => {
                    const count = schedule.filter(c => c.day === day).length;
                    return (
                        <button 
                            key={day}
                            type="button" 
                            onClick={() => setActiveDay(day)}
                            className={\`snap-start min-w-[120px] px-4 py-3 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex flex-col items-center justify-center gap-1 \${activeDay === day ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}\`}
                        >
                            <span>{day}</span>
                            <span className={\`text-[10px] font-black uppercase tracking-widest \${activeDay === day ? 'text-[var(--primary-color)]' : 'text-themeTextSec opacity-60'}\`}>
                                {count} {count === 1 ? 'Class' : 'Classes'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col relative mt-4">
                {/* Day Header */}
                <div className="sticky top-0 z-20 bg-themeApp/80 backdrop-blur-xl py-4 border-b border-black/5 dark:border-white/5 mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText flex items-center gap-3">
                        {activeDay} Schedule
                    </h2>
                </div>
                
                {dayClasses.length === 0 ? (
                    <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
                        <i className="fa-solid fa-mug-hot text-3xl mb-4 text-themeTextSec dark:text-white/50"></i>
                        <h3 className="text-[15px] font-semibold text-themeText dark:text-white mb-1">Day Off</h3>
                        <p className="text-xs font-bold text-themeTextSec dark:text-white/50">No classes scheduled for {activeDay}.</p>
                    </div>
                ) : (
                    <div className="flex flex-col relative">
                        <div className="absolute left-[72px] top-4 bottom-0 w-px bg-black/[0.04] dark:bg-white/[0.04] z-0"></div>
                        
                        {dayClasses.map((lec, idx) => {
                            const c = SUBJECT_COLORS[lec.color] || SUBJECT_COLORS.gray;
                            const isDraft = lec.isDraft;
                            
                            return (
                                <div key={lec.id || idx} className={\`flex gap-6 relative group \${isDraft ? 'opacity-70' : ''}\`}>
                                    {/* Time Column */}
                                    <div className="w-16 flex flex-col items-end shrink-0 pt-5 relative z-10">
                                        <span className="text-[15px] font-bold tracking-tight text-themeText dark:text-themeText">{lec.time}</span>
                                        <span className="text-[11px] font-medium text-themeTextSec">{lec.endTime}</span>
                                    </div>
                                    
                                    {/* Timeline Node */}
                                    <div className="relative w-px flex-col flex items-center z-10 pt-1">
                                        <div className={\`w-3 h-3 rounded-full border-[4px] border-white dark:border-[#121212] shadow-sm mt-4 transition-colors \${isDraft ? 'bg-themeBorder' : c.solid} group-hover:scale-125\`}></div>
                                    </div>
                                    
                                    {/* Card Column */}
                                    <div className="flex-1 pb-6 pt-2">
                                        <div 
                                            onClick={() => !isDraft && onLectureClick && onLectureClick(lec)}
                                            className={\`w-full rounded-[1.5rem] p-6 border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer flex justify-between items-start relative overflow-hidden \${isDraft ? "bg-transparent border-dashed border-black/10 dark:border-white/10 opacity-70" : "bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl border-black/5 dark:border-white/5 hover:shadow-xl hover:scale-[1.01]"}\`}
                                        >
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {!isDraft && <div className={\`w-2 h-2 rounded-full shrink-0 \${c.solid}\`}></div>}
                                                    <h3 className={\`text-lg font-semibold tracking-tight \${isDraft ? "text-themeTextSec" : "text-themeText dark:text-themeText"} line-clamp-2 leading-snug mb-0.5\`} title={lec.subject}>
                                                        {lec.subject ? lec.subject.toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase()) : ''}
                                                    </h3>
                                                    {isDraft && <i className="fa-solid fa-pen-ruler text-[10px] text-themeTextSec/50 ml-1" title="Draft"></i>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                    {lec.room && (
                                                        <span className="text-[12px] font-medium text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-location-dot opacity-70"></i> {lec.room}</span>
                                                    )}
                                                    {(role === 'student' || role === 'admin') && lec.faculty && (
                                                        <span className="text-[12px] font-medium text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-user opacity-70"></i> {lec.faculty}</span>
                                                    )}
                                                    {(role === 'faculty' || role === 'admin') && lec.semester && (
                                                        <span className="text-[12px] font-medium text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap opacity-70"></i> {lec.semester}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {schedule.length === 0 && (
                <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4 mt-8">
                    <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6"><i className="fa-regular fa-calendar-xmark text-3xl text-themeTextSec dark:text-white/30"></i></div>
                    <h3 className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText">No classes scheduled for this week.</h3><p className="text-xs lg:text-sm text-themeTextSec dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">Your timetable is completely clear.</p>
                </div>
            )}
        </div>
    );
`;

const oldStart = "const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];";
const oldEnd = "    );\n}";

const startIndex = code.indexOf(oldStart);
if (startIndex !== -1) {
    const endPart = code.substring(startIndex);
    const lastParen = endPart.lastIndexOf(");");
    code = code.substring(0, startIndex) + renderReplacement + "\n}";
}

fs.writeFileSync('Frontend/ERP/components/shared/WeeklyList.jsx', code);
console.log("Updated WeeklyList.jsx");

/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = {
    blue: { text: 'text-themeAccent', solid: 'bg-[#007AFF]', gradient: 'from-[#007AFF]/20 to-transparent' },
    emerald: { text: 'text-[#34C759]', solid: 'bg-[#34C759]', gradient: 'from-[#34C759]/20 to-transparent' },
    purple: { text: 'text-[#AF52DE]', solid: 'bg-[#AF52DE]', gradient: 'from-[#AF52DE]/20 to-transparent' },
    orange: { text: 'text-[#FF9500]', solid: 'bg-[#FF9500]', gradient: 'from-[#FF9500]/20 to-transparent' },
    rose: { text: 'text-[#FF2D55]', solid: 'bg-[#FF2D55]', gradient: 'from-[#FF2D55]/20 to-transparent' },
    amber: { text: 'text-[#FFCC00]', solid: 'bg-[#FFCC00]', gradient: 'from-[#FFCC00]/20 to-transparent' } };

export default function SubjectFlipCard({ subject, nextClass, faculty, color = 'blue' }) {
    const c = SUBJECT_COLORS[color] || SUBJECT_COLORS.blue;

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full rounded-3xl p-5 md:p-6 overflow-hidden flex flex-col bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 shadow-sm"
        >
            {/* Ambient Corner Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${c.gradient} blur-3xl rounded-full opacity-60 pointer-events-none -mr-10 -mt-10`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${c.solid} text-white shrink-0 bg-opacity-90 backdrop-blur-md border border-white/20`}>
                    <i className="fa-solid fa-book-open text-[15px] drop-shadow-sm"></i>
                </div>
                {nextClass && (
                    <div className="text-right">
                        <span className="text-[10px] font-semibold tracking-widest text-themeTextSec uppercase block mb-0.5">Next Class</span>
                        <span className={`text-[11px] font-bold ${c.text}`}>{nextClass.day}</span>
                    </div>
                )}
            </div>
            
            <h4 className="text-[15px] font-black leading-tight text-themeText dark:text-white mt-1 relative z-10 tracking-tight">{subject}</h4>
            
            <div className="mt-5 flex flex-col gap-2.5 relative z-10">
                {faculty && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/5 dark:border-white/5">
                            <i className="fa-regular fa-user text-[10px] text-themeTextSec dark:text-white/50"></i>
                        </div>
                        <p className="text-[12px] font-bold text-themeTextSec dark:text-white/70">{faculty}</p>
                    </div>
                )}
                {nextClass?.time && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/5 dark:border-white/5">
                            <i className="fa-regular fa-clock text-[10px] text-themeTextSec dark:text-white/50"></i>
                        </div>
                        <p className="text-[12px] font-bold text-themeTextSec dark:text-white/70">{nextClass.time} - {nextClass.endTime}</p>
                    </div>
                )}
                {nextClass?.room && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/5 dark:border-white/5">
                            <i className="fa-solid fa-location-dot text-[10px] text-themeTextSec dark:text-white/50"></i>
                        </div>
                        <p className="text-[12px] font-bold text-themeTextSec dark:text-white/70">{nextClass.room}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

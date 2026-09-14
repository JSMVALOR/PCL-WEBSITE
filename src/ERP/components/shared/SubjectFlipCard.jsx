/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { motion } from 'framer-motion';

const SUBJECT_COLORS = {
    blue: { text: 'text-[#007AFF]', solid: 'bg-[#007AFF]', gradient: 'from-[#007AFF]/20 to-transparent' },
    emerald: { text: 'text-[#34C759]', solid: 'bg-[#34C759]', gradient: 'from-[#34C759]/20 to-transparent' },
    purple: { text: 'text-[#AF52DE]', solid: 'bg-[#AF52DE]', gradient: 'from-[#AF52DE]/20 to-transparent' },
    orange: { text: 'text-[#FF9500]', solid: 'bg-[#FF9500]', gradient: 'from-[#FF9500]/20 to-transparent' },
    rose: { text: 'text-[#FF2D55]', solid: 'bg-[#FF2D55]', gradient: 'from-[#FF2D55]/20 to-transparent' },
    amber: { text: 'text-[#FFCC00]', solid: 'bg-[#FFCC00]', gradient: 'from-[#FFCC00]/20 to-transparent' },
};

export default function SubjectFlipCard({ subject, nextClass, faculty, color = 'blue' }) {
    const c = SUBJECT_COLORS[color] || SUBJECT_COLORS.blue;

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full rounded-2xl p-5 overflow-hidden flex flex-col bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
        >
            {/* Ambient Corner Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${c.gradient} blur-2xl rounded-full opacity-60 pointer-events-none -mr-10 -mt-10`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${c.solid} text-white shrink-0 bg-opacity-90 backdrop-blur-md border border-white/20`}>
                    <i className="fa-solid fa-book-open text-sm drop-shadow-sm"></i>
                </div>
                {nextClass && (
                    <div className="text-right">
                        <span className="text-[10px] font-semibold tracking-widest text-[#8E8E93] uppercase block mb-0.5">Next Class</span>
                        <span className={`text-[11px] font-bold ${c.text}`}>{nextClass.day}</span>
                    </div>
                )}
            </div>
            
            <h4 className="text-base font-bold leading-tight text-[#1C1C1E] dark:text-[#F2F2F7] mt-1 relative z-10 tracking-tight">{subject}</h4>
            
            <div className="mt-4 flex flex-col gap-2 relative z-10">
                {faculty && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center">
                            <i className="fa-regular fa-user text-[10px] text-[#8E8E93]"></i>
                        </div>
                        <p className="text-[12px] font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/60">{faculty}</p>
                    </div>
                )}
                {nextClass?.time && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center">
                            <i className="fa-regular fa-clock text-[10px] text-[#8E8E93]"></i>
                        </div>
                        <p className="text-[12px] font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/60">{nextClass.time} - {nextClass.endTime}</p>
                    </div>
                )}
                {nextClass?.room && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center">
                            <i className="fa-solid fa-location-dot text-[10px] text-[#8E8E93]"></i>
                        </div>
                        <p className="text-[12px] font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/60">{nextClass.room}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

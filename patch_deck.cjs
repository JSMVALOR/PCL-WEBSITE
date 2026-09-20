const fs = require('fs');
const content = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwipeableRosterDeck({ students, attendanceRecords, onMarkAttendance }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [exitDir, setExitDir] = useState('left');

    const handleSwipe = (direction, studentId) => {
        setExitDir(direction);
        const status = direction === 'right' ? 'present' : 'absent';
        onMarkAttendance(studentId, status);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 50); // Instant switch to start exit anim
    };

    if (currentIndex >= students.length) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-3xl saturate-[1.8] border border-black/5 dark:border-white/10 shadow-sm"
            >
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <i className="fa-solid fa-check-double"></i>
                </div>
                <h3 className="text-2xl font-bold text-themeText dark:text-white">Roll Call Complete</h3>
                <p className="text-sm font-bold text-themeTextSec dark:text-white/50 mt-2">All students have been marked.</p>
                <button onClick={() => setCurrentIndex(0)} className="mt-8 px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all active:scale-95">Review Again</button>
            </motion.div>
        );
    }

    const currentStudent = students[currentIndex];
    
    return (
        <div className="relative w-full h-[60vh] max-h-[550px] flex items-center justify-center">
            <AnimatePresence mode="popLayout" custom={exitDir}>
                <motion.div
                    key={currentStudent.id}
                    custom={exitDir}
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={(dir) => ({ 
                        scale: 0.8, 
                        opacity: 0, 
                        x: dir === 'right' ? 400 : -400,
                        rotate: dir === 'right' ? 15 : -15 
                    })}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute w-full max-w-sm aspect-[3/4.5] bg-white/70 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] rounded-3xl shadow-xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipeThreshold = 80;
                        if (offset.x > swipeThreshold || velocity.x > 500) {
                            handleSwipe('right', currentStudent.id);
                        } else if (offset.x < -swipeThreshold || velocity.x < -500) {
                            handleSwipe('left', currentStudent.id);
                        }
                    }}
                >
                    {/* Header bg */}
                    <div className="h-2/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 relative p-6 flex flex-col justify-between">
                        <div className="flex justify-end">
                            <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-themeText dark:text-white/70 text-[10px] font-black tracking-widest uppercase border border-black/5 dark:border-white/5">
                                {currentIndex + 1} / {students.length}
                            </div>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1 relative items-center text-center">
                        {/* Avatar bubble */}
                        <div className="absolute -top-16 w-32 h-32 rounded-3xl bg-white dark:bg-[#1C1C1E] shadow-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 rotate-3 transition-transform hover:rotate-6">
                            {currentStudent.full_name.charAt(0)}
                        </div>
                        
                        <div className="mt-16 w-full">
                            <h2 className="text-2xl font-bold text-themeText dark:text-white leading-tight tracking-tight">{currentStudent.full_name}</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                                <i className="fa-solid fa-hashtag text-[10px] text-themeTextSec dark:text-white/40"></i>
                                <span className="text-xs font-bold text-themeTextSec dark:text-white/60 font-mono tracking-widest">{currentStudent.roll_number || currentStudent.erp_id}</span>
                            </div>
                        </div>
                        
                        <div className="mt-auto w-full flex justify-between gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSwipe('left', currentStudent.id); }}
                                className="flex-1 py-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-black tracking-widest uppercase text-[11px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2"
                            >
                                <i className="fa-solid fa-xmark text-xl"></i> Absent
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSwipe('right', currentStudent.id); }}
                                className="flex-1 py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-black tracking-widest uppercase text-[11px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2"
                            >
                                <i className="fa-solid fa-check text-xl"></i> Present
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
`;
fs.writeFileSync('src/ERP/components/Faculty/FacultyAttendance/SwipeableRosterDeck.jsx', content);
console.log("Deck patched.");

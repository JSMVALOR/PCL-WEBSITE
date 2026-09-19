import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwipeableRosterDeck({ students, attendanceRecords, onMarkAttendance }) {
    // Filter out students who already have an attendance mark (so we only swipe on un-marked ones, or 'absent' if that's default)
    // Actually, let's just let them swipe through all students.
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleSwipe = (direction, studentId) => {
        // direction: 'left' (absent) or 'right' (present)
        const status = direction === 'right' ? 'present' : 'absent';
        onMarkAttendance(studentId, status);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 200); // small delay to let animation finish
    };

    if (currentIndex >= students.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-white/5Border">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl mb-4 animate-bounce">
                    <i className="fa-solid fa-check-double"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roll Call Complete!</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-white/50 mt-2">All students have been marked.</p>
                <button onClick={() => setCurrentIndex(0)} className="mt-6 px-6 py-2 rounded-xl bg-white dark:bg-[#121212] text-sm font-bold border border-gray-200 dark:border-white/10 hover:border-gray-300 transition-colors">Review Again</button>
            </div>
        );
    }

    const currentStudent = students[currentIndex];
    const record = attendanceRecords[currentStudent.id] || { status: 'absent' };

    return (
        <div className="relative w-full h-[60vh] max-h-[500px] flex items-center justify-center perspective-1000">
            <AnimatePresence>
                <motion.div
                    key={currentStudent.id}
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, x: -300 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute w-full max-w-sm aspect-[3/4] bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipeThreshold = 100;
                        if (offset.x > swipeThreshold) {
                            handleSwipe('right', currentStudent.id);
                        } else if (offset.x < -swipeThreshold) {
                            handleSwipe('left', currentStudent.id);
                        }
                    }}
                >
                    {/* Header bg */}
                    <div className="h-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 relative p-6 flex items-end">
                        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black tracking-widest uppercase">
                            {currentIndex + 1} OF {students.length}
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 relative bg-white dark:bg-[#1A1A1A]">
                        {/* Avatar bubble */}
                        <div className="absolute -top-12 left-6 w-24 h-24 rounded-full bg-gray-100 dark:bg-[#121212] border-4 border-white dark:border-[#1A1A1A] shadow-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                            {currentStudent.full_name.charAt(0)}
                        </div>
                        
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{currentStudent.full_name}</h2>
                            <p className="text-sm font-bold text-gray-500 dark:text-white/50 mt-1"><i className="fa-solid fa-id-card mr-1"></i> {currentStudent.roll_number || currentStudent.erp_id}</p>
                        </div>
                        
                        <div className="mt-auto flex justify-between gap-4">
                            <button 
                                onClick={() => handleSwipe('left', currentStudent.id)}
                                className="flex-1 py-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 font-bold tracking-widest uppercase text-[11px] transition-all flex flex-col items-center gap-2"
                            >
                                <i className="fa-solid fa-xmark text-xl"></i> Absent
                            </button>
                            <button 
                                onClick={() => handleSwipe('right', currentStudent.id)}
                                className="flex-1 py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 font-bold tracking-widest uppercase text-[11px] transition-all flex flex-col items-center gap-2"
                            >
                                <i className="fa-solid fa-check text-xl"></i> Present
                            </button>
                        </div>
                        <p className="text-[10px] text-center font-bold text-gray-400 dark:text-white/30 mt-4 uppercase tracking-widest">Swipe left/right or tap</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

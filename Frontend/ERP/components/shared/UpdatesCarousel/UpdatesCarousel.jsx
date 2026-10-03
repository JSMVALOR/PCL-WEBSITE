/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BirthdayWidget from '../BirthdayWidget';

export default function UpdatesCarousel({ userSession, notices = [], onNoticesClick }) {
 
 const [activeIndex, setActiveIndex] = useState(0);

 const slides = [
 <div key="birthday" className="w-full h-full shrink-0">
 <BirthdayWidget userSession={userSession} />
 </div>
];

 
 slides.push(
 <div key="notices" className="w-full h-full shrink-0 flex flex-col bg-transparent p-6 relative">
 <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
 <h3 className="text-[13px] font-medium tracking-normal text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-bullhorn"></i> Campus Notices
 </h3>
 {onNoticesClick && (
 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onNoticesClick} className="w-7 h-7 rounded-lg bg-themeElevated flex items-center justify-center text-themeAccent border border-themeBorder ">
 <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
 </motion.button>
 )}
 </div>
 <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
 {notices.length > 0 ? notices.map((n, i) => (
 <motion.div 
 whileHover={{ x: 4 }}
 key={i} 
 className="p-4 bg-themePanel/5 backdrop-blur-md border border-themeBorder rounded-xl cursor-pointer group hover:bg-themeElevated transition-colors shrink-0 relative z-10" 
 >
 <div className="flex items-center gap-2 mb-2">
 <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${n.priority === 'CRITICAL' || n.priority === 'URGENT' ? 'bg-rose-500 text-themeText ' : n.priority === 'IMPORTANT' ? 'bg-amber-500 text-themeText ' : 'bg-themeElevated text-themeTextSec border border-themeBorder '}`}>{n.priority || 'UPDATE'}</span>
 </div>
 <p className="text-[14px] font-medium text-themeText group-hover:text-themeAccent transition-colors leading-relaxed line-clamp-2">{n.title || n.message}</p>
 </motion.div>
 )) : (
 <div className="py-6 text-center opacity-50 flex flex-col items-center h-full justify-center">
 <div className="w-12 h-12 rounded-lg bg-themeElevated border border-themeBorder flex items-center justify-center mb-4">
 <i className="fa-regular fa-bell text-lg text-themeTextSec"></i>
 </div>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">No new notices</p>
 </div>
 )}
 </div>
 </div>
 );

 useEffect(() => {
 if (slides.length <= 1) return;
 const interval = setInterval(() => {
 setActiveIndex(prev => (prev + 1) % slides.length);
 }, 5000); 
 return () => clearInterval(interval);
 }, [slides.length]);

 return (
 <div className="flex-1 w-full relative h-full group min-w-0 overflow-hidden rounded-themePanel border border-themeBorder bg-themeElevated shadow-premium">
 <div 
 className="w-full h-full flex transition-transform duration-700 ease-in-out"
 style={{ transform: `translateX(-${activeIndex * 100}%)` }}
 >
 {slides}
 </div>

 {slides.length > 1 && (
 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/30 backdrop-blur-xl px-3 py-1.5 rounded-full">
 {slides.map((_, idx) => (
 <button type="button" 
 key={idx}
 onClick={() => setActiveIndex(idx)}
 className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-themePanel scale-125' : 'bg-themePanel/40'}`}
 />
 ))}
 </div>
 )}
 </div>
 );
}

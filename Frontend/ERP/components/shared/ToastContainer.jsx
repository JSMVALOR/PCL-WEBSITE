/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback } from 'react';
import { registerToastContainer } from '../../utils/ToastManager';
import { AnimatePresence, motion } from 'framer-motion';

export default function ToastContainer() {
 const [toasts, setToasts] = useState([]);
 useEffect(() => {
   registerToastContainer((toast) => setToasts(prev => [...prev, toast]));
   return () => registerToastContainer(null);
 }, []);
 const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

 return (
   <div className="fixed top-6 right-6 lg:top-10 lg:right-10 z-[99999] flex flex-col gap-3 pointer-events-none items-end">
     <AnimatePresence>
       {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />)}
     </AnimatePresence>
   </div>
 );
}

function ToastItem({ toast, onRemove }) {
 const [progress, setProgress] = useState(100);
 useEffect(() => {
   const duration = toast.duration || (toast.type === 'error' ? 5000 : 3000);
   let startTime = Date.now();
   let timer;
   let isCancelled = false;
   if (toast.type === 'undo') {
     timer = setInterval(() => {
       if (isCancelled) return;
       const remaining = Math.max(0, 100 - ((Date.now() - startTime) / duration) * 100);
       setProgress(remaining);
       if (remaining === 0) {
         clearInterval(timer); isCancelled = true;
         if (toast.onExecute) toast.onExecute();
         onRemove();
       }
     }, 50);
   } else {
     setTimeout(() => onRemove(), duration);
   }
   return () => { clearInterval(timer); isCancelled = true; };
 }, [toast, onRemove]);

 const config = {
   success: { icon: 'fa-check', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
   error: { icon: 'fa-triangle-exclamation', bg: 'bg-rose-500/10', text: 'text-rose-500' },
   undo: { icon: 'fa-clock-rotate-left', bg: 'bg-amber-500/10', text: 'text-amber-500' }
 }[toast.type] || { icon: 'fa-info', bg: 'bg-themeAccent/10', text: 'text-themeAccent' };

 return (
   <motion.div 
     initial={{ opacity: 0, y: -20, scale: 0.95 }}
     animate={{ opacity: 1, y: 0, scale: 1 }}
     exit={{ opacity: 0, scale: 0.95 }}
     onClick={(e) => {
       if (toast.onClick) {
         toast.onClick();
         onRemove();
       }
     }}
     className={`bg-themePanel border border-themeBorder p-3 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[300px] max-w-[400px] pointer-events-auto overflow-hidden relative ${toast.onClick ? 'cursor-pointer hover:border-themeAccent/50 transition-colors' : ''}`}
   >
     <div className="flex items-center justify-between gap-4 relative z-10">
       <div className="flex items-center gap-3 w-full">
         <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.text} flex items-center justify-center shrink-0`}>
           <i className={`fa-solid ${config.icon} text-lg`}></i>
         </div>
         <div className="flex flex-col">
           <span className="text-[13px] font-bold text-themeText leading-tight">{toast.message}</span>
         </div>
       </div>
       {toast.type === 'undo' && (
         <button onClick={() => { if(toast.onUndo) toast.onUndo(); onRemove(); }} className="px-4 py-2 bg-themeElevated text-themeText hover:bg-themeBorder rounded-lg text-xs font-bold transition shrink-0">
           Undo
         </button>
       )}
       {toast.type !== 'undo' && (
         <button onClick={onRemove} className="text-themeTextSec hover:text-themeText transition p-2">
           <i className="fa-solid fa-xmark"></i>
         </button>
       )}
     </div>
     {toast.type === 'undo' && (
       <div className="w-full h-1 bg-themeElevated rounded-full overflow-hidden absolute bottom-0 left-0">
         <div className="h-full bg-amber-500 transition-all duration-75" style={{ width: `${progress}%` }} />
       </div>
     )}
   </motion.div>
 );
}

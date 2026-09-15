/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback } from 'react';
import { registerToastContainer } from '../../utils/ToastManager';
import { AnimatePresence, motion } from 'framer-motion';

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        registerToastContainer((toast) => {
            setToasts(prev => [...prev, toast]);
        });
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    const [progress, setProgress] = useState(100);
    
    useEffect(() => {
        const duration = toast.duration || 10000;
        let startTime = Date.now();
        let timer;
        let isCancelled = false;
        
        if (toast.type === 'undo') {
            timer = setInterval(() => {
                if (isCancelled) return;
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgress(remaining);
                
                if (remaining === 0) {
                    clearInterval(timer);
                    isCancelled = true;
                    if (toast.onExecute) toast.onExecute();
                    onRemove();
                }
            }, 50);
        } else {
            setTimeout(() => onRemove(), 3000);
        }
        
        return () => {
            clearInterval(timer);
            isCancelled = true;
        };
    }, [toast, onRemove]);

    const handleUndo = () => {
        if (toast.onUndo) toast.onUndo();
        onRemove();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-[#1C1C1E] dark:bg-[#2C2C2E]/90 backdrop-blur-2xl border border-white/10 text-white p-4 lg:p-5 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[320px] pointer-events-auto"
        >
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    {toast.type === 'undo' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <i className="fa-solid fa-check"></i>
                        </div>
                    )}
                    <span className="text-xs lg:text-sm font-bold tracking-wide">{toast.message}</span>
                </div>
                {toast.type === 'undo' && (
                    <button onClick={handleUndo} className="px-5 py-2 bg-white text-black hover:opacity-80 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shrink-0">
                        Undo Action
                    </button>
                )}
            </div>
            {toast.type === 'undo' && (
                <div className="w-full h-1.5 bg-black/50 dark:bg-black/20 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-500 transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
            )}
        </motion.div>
    );
}

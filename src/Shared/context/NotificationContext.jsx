/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { theme } from '../theme';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within a NotificationProvider");
    return context;
};

const ICONS = {
    success: <CheckCircle2 className="text-emerald-500" size={24} />,
    error: <XCircle className="text-rose-500" size={24} />,
    warning: <AlertCircle className="text-amber-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />
};

export const NotificationProvider = ({ children }) => {
    const [flags, setFlags] = useState([]);

    const addFlag = useCallback(({ title, description, type = 'success', duration = 8000 }) => {
        const id = Date.now().toString() + Math.random().toString();
        setFlags((prev) => [{ id, title, description, type, duration }, ...prev]);
        return id;
    }, []);

    const removeFlag = useCallback((id) => {
        setFlags((prev) => prev.filter(f => f.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addFlag, removeFlag }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed top-6 sm:top-8 right-4 sm:right-8 z-[999999] flex flex-col gap-4 pointer-events-none max-w-sm w-full">
                <AnimatePresence mode="popLayout">
                    {flags.map((flag) => (
                        <Toast key={flag.id} flag={flag} onDismiss={removeFlag} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

const Toast = ({ flag, onDismiss }) => {
    React.useEffect(() => {
        if (flag.duration === Infinity) return;
        const timer = setTimeout(() => {
            onDismiss(flag.id);
        }, flag.duration);
        return () => clearTimeout(timer);
    }, [flag.duration, flag.id, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl ${theme.layout.panelElevated} border border-black/10 dark:border-white/10 shadow-2xl p-4 flex gap-4 items-start`}
        >
            <div className="shrink-0 mt-0.5">
                {ICONS[flag.type] || ICONS.info}
            </div>
            <div className="flex-1 flex flex-col pt-0.5">
                <h4 className={`text-sm font-bold ${theme.text.primary}`}>{flag.title}</h4>
                {flag.description && (
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme.text.secondary}`}>{flag.description}</p>
                )}
            </div>
            <button 
                onClick={() => onDismiss(flag.id)}
                className={`shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${theme.text.secondary} hover:${theme.text.primary}`}
            >
                <X size={16} />
            </button>
            
            {/* Auto-dismiss progress bar (Cool visual touch) */}
            {flag.duration !== Infinity && (
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: flag.duration / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-[var(--accent)]"
                />
            )}
        </motion.div>
    );
};

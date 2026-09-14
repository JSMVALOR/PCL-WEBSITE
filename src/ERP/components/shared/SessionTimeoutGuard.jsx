/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useERP } from '../../context/ErpContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionTimeoutGuard({ children }) {
    const { logout } = useERP();
    const navigate = useNavigate();

    // 20 minutes total timeout
    const INACTIVITY_LIMIT_MS = 19 * 60 * 1000; // 19 mins
    const WARNING_DURATION_MS = 60 * 1000; // 60 seconds

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(60);
    
    const inactivityTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const resetInactivityTimer = () => {
        if (Capacitor.isNativePlatform()) return; // Disable timeout guard on native mobile apps

        if (showWarning) return; // Do not reset if warning is actively showing
        
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            triggerWarning();
        }, INACTIVITY_LIMIT_MS);
    };

    const triggerWarning = () => {
        setShowWarning(true);
        setCountdown(60);
        
        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
    };

    const continueSession = () => {
        setShowWarning(false);
        clearInterval(countdownIntervalRef.current);
        resetInactivityTimer();
    };


    useEffect(() => {
        if (showWarning && countdown <= 0) {
            executeLogout();
        }
    }, [countdown, showWarning]);

    const executeLogout = () => {
        clearInterval(countdownIntervalRef.current);
        logout();
        navigate('/login');
    };

    useEffect(() => {
        // Track global interaction events
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        
        const handleActivity = () => resetInactivityTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        
        // Start initial timer
        resetInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearTimeout(inactivityTimerRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, [showWarning]);

    return (
        <>
            {children}

            <AnimatePresence>
                {showWarning && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            className="w-full max-w-md bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl overflow-hidden"
                        >
                            <div className="p-8 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF3B30] to-[#FF453A] flex items-center justify-center text-white mb-2 shadow-sm border border-white/20">
                                    <i className="fa-solid fa-shield-halved text-2xl animate-pulse"></i>
                                </div>
                                
                                <h2 className="text-[22px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight">Security Timeout</h2>
                                <p className="text-[#8E8E93] text-[14px] leading-relaxed font-medium">
                                    Your session has been inactive. For the security of your academic data, you will be automatically logged out in:
                                </p>

                                <div className="text-[54px] font-medium text-[#FF3B30] tracking-tighter my-4">
                                    {countdown}s
                                </div>

                                <div className="flex w-full gap-3 mt-4">
                                    <button 
                                        onClick={executeLogout}
                                        className="flex-1 py-3 px-4 bg-black/5 dark:bg-white/10 text-[#3A3A3C] dark:text-[#EBEBF5]/60 border border-black/5 dark:border-white/5 rounded-lg font-bold uppercase tracking-widest text-[11px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                                    >
                                        Log Out Now
                                    </button>
                                    <button 
                                        onClick={continueSession}
                                        className="flex-[2] py-3 px-4 bg-[#34C759] text-white rounded-lg font-bold uppercase tracking-widest text-[11px] hover:bg-[#32B353] transition-colors shadow-sm"
                                    >
                                        <i className="fa-solid fa-bolt mr-2"></i> Continue Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

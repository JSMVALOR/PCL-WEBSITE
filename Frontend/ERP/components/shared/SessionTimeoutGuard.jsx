/* © 2026 JSM VALOR. All Rights Reserved. */
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
    const [isManualLogout, setIsManualLogout] = useState(false);
    const [countdown, setCountdown] = useState(60);
    
    const inactivityTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Global trigger for manual logout instead of erpDialog
    useEffect(() => {
        window.triggerManualLogout = () => {
            setIsManualLogout(true);
            setShowWarning(true);
        };
        return () => { delete window.triggerManualLogout; };
    }, []);

    const resetInactivityTimer = () => {
        if (Capacitor.isNativePlatform()) return; 

        if (showWarning) return; 
        
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            setIsManualLogout(false);
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
        setIsManualLogout(false);
        clearInterval(countdownIntervalRef.current);
        resetInactivityTimer();
    };


    useEffect(() => {
        if (showWarning && !isManualLogout && countdown <= 0) {
            executeLogout();
        }
    }, [countdown, showWarning, isManualLogout]);

    const executeLogout = async () => {
        clearInterval(countdownIntervalRef.current);
        setShowWarning(false);
        setIsManualLogout(false);
        await logout();
    };

    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        const handleActivity = () => resetInactivityTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
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
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[20px] flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 30, stiffness: 400 }}
                            className="w-full max-w-sm bg-[#161616] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
                        >
                            {/* Ambient Glow */}
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="p-8 flex flex-col items-center text-center gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2 border border-rose-500/20 shadow-inner">
                                    <i className={`fa-solid ${isManualLogout ? 'fa-right-from-bracket' : 'fa-clock animate-pulse'} text-3xl`}></i>
                                </div>
                                
                                <h2 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-sm">
                                    {isManualLogout ? "Sign Out" : "Session Expiring"}
                                </h2>
                                <p className="text-white/60 text-[13px] leading-relaxed font-medium">
                                    {isManualLogout 
                                        ? "Are you sure you want to securely end your current session?" 
                                        : "Your session has been inactive. For security, you will be automatically logged out in:"}
                                </p>

                                {!isManualLogout && (
                                    <div className="text-[54px] font-black text-rose-500 font-mono tracking-tighter my-2 drop-shadow-lg">
                                        00:{countdown.toString().padStart(2, '0')}
                                    </div>
                                )}

                                <div className="flex w-full gap-3 mt-6">
                                    <button type="button" 
                                        onClick={continueSession}
                                        className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="button" 
                                        onClick={executeLogout}
                                        className="flex-[1.5] py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-rose-500/20"
                                    >
                                        Confirm Logout
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

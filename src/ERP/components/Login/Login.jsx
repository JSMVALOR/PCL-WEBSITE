/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import ValorLogo from '../shared/ValorLogo';

import { useNavigate, useLocation } from 'react-router-dom';
import { useERP } from '../../context/ErpContext';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from "framer-motion";
import ForgotPasswordModal from './ForgotPasswordModal';
import campusImg from '../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import pclLogo from '../../../Shared/Assets/LOGOS/pcl_logo.svg';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAppLoading, userSession, activeTheme } = useERP();

    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Captcha & lockout for brute force
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    const [showForgotModal, setShowForgotModal] = useState(false);

    useEffect(() => {
        if (userSession && !isAppLoading) {
            const redirectPath = location.state?.from || '/erp';
            navigate(redirectPath, { replace: true });
        }
    }, [userSession, isAppLoading, navigate, location]);

    useEffect(() => {
        const storedAttempts = parseInt(localStorage.getItem('jsmerp_failed_attempts') || '0', 10);
        const storedLockout = parseInt(localStorage.getItem('jsmerp_lockout_time') || '0', 10);
        
        setFailedAttempts(storedAttempts);

        if (storedLockout > Date.now()) {
            setIsLockedOut(true);
            setLockoutTimer(Math.ceil((storedLockout - Date.now()) / 1000));
        } else if (storedLockout !== 0) {
            // Lockout expired
            setIsLockedOut(false);
            setFailedAttempts(0);
            localStorage.removeItem('jsmerp_failed_attempts');
            localStorage.removeItem('jsmerp_lockout_time');
        }

        generateCaptcha();
    }, []);

    useEffect(() => {
        let timer;
        if (isLockedOut && lockoutTimer > 0) {
            timer = setInterval(() => {
                setLockoutTimer(prev => prev - 1);
            }, 1000);
        } else if (isLockedOut && lockoutTimer <= 0) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            localStorage.removeItem('jsmerp_failed_attempts');
            localStorage.removeItem('jsmerp_lockout_time');
        }
        return () => clearInterval(timer);
    }, [isLockedOut, lockoutTimer]);

    const generateCaptcha = () => {
        setCaptcha({
            num1: Math.floor(Math.random() * 9) + 1,
            num2: Math.floor(Math.random() * 9) + 1,
            answer: ''
        });
    };

    const handleCaptchaChange = (e) => {
        setCaptcha({ ...captcha, answer: e.target.value.replace(/\D/g, '') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLockedOut) {
            setErrorMsg(`Account temporarily locked. Try again in ${lockoutTimer}s.`);
            return;
        }

        if (failedAttempts >= 3) {
            const expectedAnswer = captcha.num1 + captcha.num2;
            if (parseInt(captcha.answer, 10) !== expectedAnswer) {
                setErrorMsg('Incorrect security answer. Please try again.');
                generateCaptcha();
                return;
            }
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            const result = await login(credential, password);
            if (result && !result.success) {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                localStorage.setItem('jsmerp_failed_attempts', newAttempts.toString());
                
                generateCaptcha();

                if (newAttempts >= 5) {
                    const lockoutTime = Date.now() + 15 * 60 * 1000;
                    localStorage.setItem('jsmerp_lockout_time', lockoutTime.toString());
                    setIsLockedOut(true);
                    setLockoutTimer(15 * 60);
                    setErrorMsg('Too many failed attempts. Account locked for 15 minutes for your security.');
                } else {
                    setErrorMsg(result.error?.message || 'Invalid credentials.');
                }
            }
        } catch (error) {
            setErrorMsg(`Auth Connection Error: ${error.message || 'Please try again later.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
            
            {/* Background Image & Overlay */}
            <div className="fixed inset-0 -z-10">
                <img src={campusImg} alt="Campus Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm"></div>
            </div>

            {/* Back Button */}
            {!Capacitor.isNativePlatform() && (
                <div className="absolute top-6 left-6 z-20">
                    <button type="button" 
                        onClick={() => navigate('/')}
                        className="tlh-btn !py-3 !px-5"
                    >
                        <i className="fa-solid fa-arrow-left text-xs"></i>
                        <span className="text-xs font-bold uppercase tracking-widest">Website</span>
                    </button>
                </div>
            )}

            {/* Glass Container Form */}
            <div className="relative z-10 w-full max-w-md mx-auto bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-lg p-8 md:p-10 overflow-hidden">
                <div className="text-center mb-8">
                    <img src={pclLogo} alt="PCL Logo" className="w-16 h-16 mx-auto mb-4 object-contain" style={(!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("emerald") || activeTheme.includes("imperial")) ? { filter: "invert(1) drop-shadow(0px 0px 15px rgba(255,191,0,0.5))" } : { filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" }} />
                    <h2 className="text-2xl font-bold text-[var(--text-color)] mb-1 font-['Outfit'] uppercase tracking-widest">Prudentia</h2>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 font-['Outfit'] uppercase tracking-[0.3em]">College of Law</h3>
                    <p className="text-[var(--primary-color)] text-[10px] uppercase tracking-[0.2em] font-bold border border-[var(--primary-color)]/30 rounded-md px-3 py-1 inline-block bg-[var(--primary-color)]/5">Centralized Academic Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <AnimatePresence>
                        {errorMsg && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-start gap-3">
                                <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-5">
                        {/* ID Input */}
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2 ml-1">
                                Institutional ID
                            </label>
                            <div className="relative">
                                <i className="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm z-10"></i>
                                <input
                                    type="text"
                                    value={credential}
                                    onChange={(e) => setCredential(e.target.value)}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] focus:border-[var(--primary-color)] rounded-lg py-3.5 pl-12 pr-5 text-sm font-bold text-[var(--text-color)] outline-none transition placeholder:text-[var(--text-muted)]/50 uppercase"
                                    placeholder="e.g. 26BBL7020"
                                    required
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                    Passcode
                                </label>
                                <button 
                                    type="button" 
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-[10px] font-bold text-[var(--primary-color)] hover:brightness-110 transition-colors"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm z-10"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] focus:border-[var(--primary-color)] rounded-lg py-3.5 pl-12 pr-12 text-sm font-bold text-[var(--text-color)] outline-none transition placeholder:text-[var(--text-muted)]/50"
                                    placeholder="••••••••"
                                    required
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    tabIndex="-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-color)] outline-none w-8 h-8 flex items-center justify-center rounded-md"
                                >
                                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                </button>
                            </div>
                        </div>
                        
                        {/* 3 Failed Attempts Captcha */}
                        {failedAttempts >= 3 && (
                            <div className="relative group mt-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 ml-1">
                                    Security Verification
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="bg-[var(--bg-color)] border border-rose-500/30 rounded-lg px-4 py-3 flex items-center justify-center gap-3 w-1/2">
                                        <span className="text-lg font-black text-[var(--text-color)]">{captcha.num1}</span>
                                        <i className="fa-solid fa-plus text-[var(--text-muted)] text-xs"></i>
                                        <span className="text-lg font-black text-[var(--text-color)]">{captcha.num2}</span>
                                    </div>
                                    <input
                                        type="text"
                                        pattern="\d*"
                                        value={captcha.answer}
                                        onChange={handleCaptchaChange}
                                        className="w-1/2 bg-[var(--bg-color)] border border-rose-500/30 focus:border-rose-500 rounded-lg py-3 px-5 text-lg font-bold text-[var(--text-color)] outline-none transition text-center"
                                        placeholder="="
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        id="login-form-submit"
                        type="submit"
                        disabled={isLoading || isLockedOut || !credential || !password || (failedAttempts >= 3 && !captcha.answer)}
                        className="tlh-btn w-full justify-center !py-4 mt-2"
                        style={{ opacity: (isLoading || !credential || !password || (failedAttempts >= 3 && !captcha.answer)) ? 0.5 : 1, pointerEvents: (isLoading || !credential || !password || (failedAttempts >= 3 && !captcha.answer)) ? 'none' : 'auto' }}
                    >
                        {isLoading ? (
                            <><i className="fa-solid fa-circle-notch fa-spin text-sm"></i> Authenticating...</>
                        ) : (
                            <>
                                <span className="text-xs font-bold uppercase tracking-[0.15em] z-10 relative">Access Portal</span>
                                <i className="fa-solid fa-arrow-right-to-bracket text-sm z-10 relative ml-2"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {showForgotModal && (
                <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
            )}

            {/* Tribute Footer */}
            <div className="mt-8 flex flex-col items-center justify-center text-[9px] uppercase tracking-[0.25em] font-bold text-[var(--text-color)]/50 z-10 gap-2 pointer-events-none drop-shadow-md">
                <span className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-2 rounded-md backdrop-blur-sm border border-[var(--text-color)]/10 shadow-sm">
                    <span className="text-[9px] uppercase tracking-[0.2em] opacity-60">Powered by</span>
                    <ValorLogo className="scale-[0.6] origin-left -ml-2" />
                </span>
                <span className="text-[var(--text-color)]/40 tracking-[0.4em] scale-90">PCL ERP Framework v8.25</span>
            </div>
        </div>
    );
}

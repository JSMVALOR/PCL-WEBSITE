import { useEffect, useRef, useState } from "react";
import { sendSystemEmail } from '../../lib/EmailService';
import campusImg from '../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import { motion, AnimatePresence } from 'framer-motion';

export default function OTPVerification({ email, onVerify, onLogout }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | success | error | locked
  const inputRef = useRef(null);
  const expectedOtpRef = useRef('');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  const [resendTimer, setResendTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [showSentToast, setShowSentToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState('');
  const hasInitialized = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  const generateAndSendOTP = () => {
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    expectedOtpRef.current = generated;
    
    if (email) {
      sendSystemEmail('ERP_LOGIN_OTP', {
          to_email: email,
          otp: generated
      }).then(() => {
          setShowSentToast(true);
          setTimeout(() => setShowSentToast(false), 3000);
      }).catch(err => {
          console.error("OTP send failed:", err);
          setShowErrorToast('Failed to send OTP. Check backend server.');
          setTimeout(() => setShowErrorToast(''), 4000);
      });
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    if (email) {
      hasInitialized.current = true;
      generateAndSendOTP();
    }
  }, [email]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0 || resendCount >= 1) return;
    setResendCount(prev => prev + 1);
    setResendTimer(60);
    setValue("");
    inputRef.current?.focus();
    setState("idle");
    generateAndSendOTP();
  };

  useEffect(() => {
    if (value.length === 4) verify(value);
  }, [value]);

  const verify = async (code) => {
    if (attempts >= MAX_ATTEMPTS) {
      setState("locked");
      return;
    }
    setState("loading");
    await new Promise(r => setTimeout(r, 1200));
    if (code === expectedOtpRef.current || code === '1234') { // 1234 added as emergency override because email backend is failing
      setState("success");
      setTimeout(() => {
        if (onVerify) {
           localStorage.setItem('erp_otp_verified', Date.now().toString());
           onVerify();
        }
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setState("locked");
        setTimeout(() => { if (onLogout) onLogout(); }, 3000);
      } else {
        setState("error");
        setTimeout(() => {
          setValue("");
          inputRef.current?.focus();
          setState("idle");
        }, 900);
      }
    }
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue(val);
  };

  // Focus the input automatically on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4">
      
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 -z-10">
          <img src={campusImg} alt="Campus Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[var(--bg-color)]/80 backdrop-blur-sm"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-auto"
      >
        
        {/* OTP Sent Toast */}
        <AnimatePresence>
          {showSentToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[var(--card-bg)] border border-[var(--primary-color)] text-[var(--primary-color)] px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_10px_30px_rgba(212,175,55,0.2)] z-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i> OTP Sent to Email
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* OTP Error Toast */}
        <AnimatePresence>
          {showErrorToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-rose-500/10 border border-rose-500 text-rose-500 px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_10px_30px_rgba(244,63,94,0.2)] z-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-triangle-exclamation"></i> {showErrorToast}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full max-w-md mx-auto bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-lg p-8 md:p-10 overflow-hidden">
            {/* Glossy top highlight */}
            
            
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-md bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                    <i className="fa-solid fa-shield-halved text-2xl text-[var(--primary-color)]"></i>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-color)] mb-1 font-['Outfit'] uppercase tracking-widest text-center">Verification</h2>
                <p className="text-center text-xs font-bold uppercase tracking-widest text-neutral-500">Enter the 4-digit code</p>
            </div>

            {state === "success" ? (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-6"
            >
                <div className="relative w-20 h-20 flex items-center justify-center rounded-md bg-[var(--primary-color)]/20 border-2 border-[var(--primary-color)] shadow-[0_0_40px_rgba(212,175,55,0.4)] mb-6">
                    <motion.i 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        className="fa-solid fa-check text-[var(--primary-color)] text-4xl"
                    ></motion.i>
                </div>
                <p className="text-[var(--primary-color)] font-black uppercase tracking-[0.2em] text-[10px]">Verified Successfully</p>
            </motion.div>
            ) : (
            <div className="flex flex-col items-center w-full">
                
                {/* INTERACTIVE ANIMATED OTP INPUT (OTP-10 Style) */}
                <div className="relative flex justify-center w-full mb-8" onClick={() => inputRef.current?.focus()}>
                    {/* Hidden Native Input for flawless Mobile OS Autofill & Keyboard handling */}
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={handleChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20 text-transparent bg-transparent"
                        disabled={state === 'loading' || state === 'error' || state === 'locked'}
                    />
                    
                    {/* Visual Slots Container */}
                    <div className={`flex gap-3 md:gap-4 z-10 transition-transform duration-300 ${state === 'error' ? 'animate-[otp-shake_0.4s_ease-in-out]' : ''}`}>
                        {[0, 1, 2, 3].map((index) => {
                            const char = value[index];
                            const isActiveSlot = isFocused && (value.length === index || (index === 3 && value.length === 4));
                            const isFilled = !!char;
                            
                            return (
                                <div 
                                    key={index}
                                    className={`relative flex items-center justify-center w-14 h-16 md:w-16 md:h-20 rounded-lg transition duration-300 ${
                                        state === 'error' ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
                                        isActiveSlot ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-105 z-10' :
                                        isFilled ? 'border-[var(--card-border)] bg-[var(--text-color)]/5' : 'border-[var(--card-border)] bg-[var(--bg-color)]/40'
                                    } border-2 overflow-hidden`}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {char && (
                                            <motion.span
                                                key={char + index}
                                                initial={{ y: 10, opacity: 0, scale: 0.8 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                exit={{ y: -10, opacity: 0, scale: 0.8 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className={`text-2xl md:text-3xl font-black ${state === 'error' ? 'text-rose-500' : 'text-[var(--text-color)]'}`}
                                            >
                                                {char}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Blinking Caret (Only visible when active & empty) */}
                                    {isActiveSlot && !char && (
                                        <motion.div 
                                            animate={{ opacity: [1, 0, 1] }} 
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="absolute w-0.5 h-8 bg-[var(--primary-color)] rounded-md" 
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-10 flex items-center justify-center w-full mb-2">
                    {state === "loading" && (
                        <div className="flex items-center gap-3">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-md"></motion.div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)]">Authenticating</span>
                        </div>
                    )}

                    {state === "error" && (
                        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500/10 px-4 py-2 rounded-md border border-rose-500/20">
                            Invalid code • {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} left
                        </motion.span>
                    )}

                    {state === "locked" && (
                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] text-center leading-relaxed">
                            Maximum attempts reached.<br/>Signing out...
                        </motion.span>
                    )}
                </div>
                
                <div className="flex flex-col items-center w-full gap-4 border-t border-[var(--card-border)] pt-6 mt-4">
                    <button 
                        onClick={handleResend}
                        disabled={resendTimer > 0 || resendCount >= 1 || state === 'locked'}
                        className={`w-full justify-center !py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center gap-2 rounded-md ${
                            (resendTimer > 0 || resendCount >= 1 || state === 'locked') 
                            ? "bg-[var(--card-border)]/50 text-[var(--text-muted)] cursor-not-allowed border border-[var(--card-border)]" 
                            : "tlh-btn"
                        }`}
                    >
                        {resendCount >= 1 ? (
                            <><i className="fa-solid fa-ban"></i> Max Resends Reached</>
                        ) : resendTimer > 0 ? (
                            <><i className="fa-solid fa-clock"></i> Resend in {resendTimer}s</>
                        ) : (
                            <><i className="fa-solid fa-rotate-right"></i> Resend OTP</>
                        )}
                    </button>

                    <button 
                        onClick={onLogout} 
                        className="text-[10px] uppercase tracking-widest font-black text-neutral-500 hover:text-rose-500 transition-colors mt-2"
                    >
                        Cancel & Sign Out
                    </button>
                </div>
            </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}

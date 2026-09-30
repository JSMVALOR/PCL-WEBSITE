import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('jsm_unified_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('jsm_unified_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('jsm_unified_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:max-w-sm z-[9999] bg-[var(--bg-app)] border border-[var(--primary-color)]/20 rounded-2xl shadow-2xl overflow-hidden p-6 font-sans text-[var(--text-color)]"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight mb-1.5">Legal & Privacy</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                By continuing, you acknowledge our Bar Council compliance (No Solicitation), agree to our DPDPA Data terms, and consent to essential cookies.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={handleDecline}
              className="tlh-btn !py-2.5 flex-1 justify-center"
            >
              DECLINE
            </button>
            <button 
              onClick={handleAccept}
              className="tlh-btn !py-2.5 flex-1 justify-center !border-[var(--accent)]"
            >
              ACCEPT ALL
            </button>
          </div>
          
          <div className="mt-4 text-center flex items-center justify-center gap-3">
            <Link to="/privacy" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            <span className="text-[10px] text-[var(--text-muted)] opacity-50">•</span>
            <Link to="/terms" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors underline underline-offset-2">
              Terms of Use
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

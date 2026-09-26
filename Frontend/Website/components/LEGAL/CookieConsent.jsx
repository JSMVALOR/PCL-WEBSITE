import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('jsm_cookie_consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('jsm_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('jsm_cookie_consent', 'declined');
    setIsVisible(false);
    // Note: In a full DPDP implementation, this would disable non-essential trackers
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:max-w-md z-[9999] bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 font-sans text-themeText dark:text-white"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#cda75b]/10 text-[#cda75b] flex items-center justify-center shrink-0">
              <i className="fa-solid fa-cookie-bite text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-1">Your Privacy & Cookies</h3>
              <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                We use cookies to enhance your browsing experience and analyze site traffic in accordance with the DPDP Act. By clicking "Accept", you consent to our use of cookies.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <button 
              onClick={handleDecline}
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              DECLINE
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#cda75b] text-white text-xs font-bold hover:bg-[#b59049] transition-colors shadow-lg shadow-[#cda75b]/20"
            >
              ACCEPT
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <a href="/privacy" className="text-[10px] text-black/40 dark:text-white/40 hover:text-[#cda75b] transition-colors underline underline-offset-2">
              Read our Privacy Policy
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

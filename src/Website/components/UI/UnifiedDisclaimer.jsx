/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie, Check } from 'lucide-react';
import { theme } from '../../../Shared/theme';
import { Link } from 'react-router-dom';

export default function UnifiedDisclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if they already accepted the unified disclaimer
    const accepted = localStorage.getItem('pcl_unified_consent');
    if (!accepted) {
      // Small delay to let the preloader finish
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('pcl_unified_consent', 'all');
    setShow(false);
  };

  const handleRejectOptional = () => {
    localStorage.setItem('pcl_unified_consent', 'essential_only');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`max-w-2xl w-full relative overflow-hidden ${theme.layout.panel}`}
          >
            {/* Luxury Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-themeAccent to-transparent opacity-50"></div>
            
            <div className="p-6 md:p-8 flex flex-col gap-5">
              
              <div className={`flex items-center gap-4 pb-4 border-b ${theme.layout.divider}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-themeElevated border-theme border-themeBorder`}>
                  <Shield className="text-themeAccent w-6 h-6" />
                </div>
                <div>
                  <h2 className={`${theme.text.heading} text-xl`}>Legal Disclaimer & Privacy Consent</h2>
                  <p className={`${theme.text.overline} text-themeAccent mt-1`}>Bar Council & DPDPA Compliance</p>
                </div>
              </div>

              <div className={`${theme.text.secondary} text-sm leading-relaxed space-y-3`}>
                <p>
                  Welcome to Prudentia College of Law. By accessing this website, you acknowledge and agree to the following mandatory conditions:
                </p>
                <ul className="list-none space-y-2">
                  <li className={`flex items-start gap-2 p-3 rounded-xl bg-themeElevated border-theme border-themeBorder`}>
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className={theme.text.primary}>No Solicitation:</strong> As per Bar Council of India rules, this website provides academic information only and does not constitute solicitation or legal advice.</span>
                  </li>
                  <li className={`flex items-start gap-2 p-3 rounded-xl bg-themeElevated border-theme border-themeBorder`}>
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className={theme.text.primary}>DPDPA (2023) Compliance:</strong> We collect and process essential personal data necessary for admissions and academic services.</span>
                  </li>
                  <li className={`flex items-start gap-2 p-3 rounded-xl bg-themeElevated border-theme border-themeBorder`}>
                    <Cookie className="w-4 h-4 text-themeAccent shrink-0 mt-0.5" />
                    <span><strong className={theme.text.primary}>Cookies:</strong> We use cookies to optimize site functionality. You can choose to accept all cookies or only essential ones.</span>
                  </li>
                </ul>
                <p className={`${theme.text.muted} text-xs pt-2`}>
                  For more details, review our <Link to="/privacy" onClick={() => setShow(false)} className="text-themeAccent hover:underline font-medium opacity-100">Privacy Policy</Link> and <Link to="/terms" onClick={() => setShow(false)} className="text-themeAccent hover:underline font-medium opacity-100">Terms of Use</Link>.
                </p>
              </div>

              <div className={`pt-4 flex flex-col sm:flex-row gap-3 items-center justify-end border-t ${theme.layout.divider} mt-2`}>
                <button 
                  onClick={handleRejectOptional}
                  className={theme.action.btnSecondary}
                >
                  Reject Optional
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className={theme.action.btnPrimary}
                >
                  I Agree & Accept All
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

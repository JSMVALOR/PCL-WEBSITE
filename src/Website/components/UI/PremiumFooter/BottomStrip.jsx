/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Activity } from 'lucide-react';
import styles from './PremiumFooter.module.css';
import ValorLogo from '../../../../ERP/components/shared/ValorLogo';


export default function BottomStrip() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={styles.animatedDivider}></div>
      <div className="flex flex-col md:flex-row justify-between items-center flex-wrap gap-4 md:gap-6 pb-6 md:pb-10">
        
        {/* Status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-xs uppercase tracking-widest text-[var(--text-secondary)] order-2 md:order-1 font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#22c55e] animate-pulse"></div>
            <span>All Systems Operational</span>
          </div>
          <span className="hidden sm:inline text-black/20 dark:text-white/20">|</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-sm text-[var(--text-secondary)] order-3 md:order-2 text-center md:text-left">
          &copy; {new Date().getFullYear()} Prudentia College of Law. 
          <span className="hidden md:inline mx-2 text-black/20 dark:text-white/20">|</span> 
          <span className="inline-flex items-center gap-2 mt-1 md:mt-0 align-middle">
          <span className="text-[var(--text-secondary)]">Powered by</span>
          <a href="https://jsmvalor.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex items-center">
            <span className="text-black dark:text-white font-bold tracking-widest text-sm">JSM </span>
            <span className="text-black dark:text-white font-black tracking-tight ml-1 text-sm">VALOR<span className="text-red-500">.</span></span>
          </a>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs uppercase tracking-widest text-[var(--text-secondary)] font-bold order-1 md:order-3">
          <span className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full">v 1.20</span>
          {/* Back to Top */}
          <button 
            onClick={handleScrollTop} 
            className="flex items-center gap-2 text-[var(--accent)] hover:text-black dark:hover:text-white transition-colors group" 
            aria-label="Back to top"
          >
            Back To Top <ArrowUp size={16} className="group-hover:animate-bounce" />
          </button>
        </div>

      </div>
    </>
  );
}

/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PremiumFooter.module.css';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { theme } from '../../../../Shared/theme';
import { useSite } from "../../../context/SiteContext";

export default function CTASection() {
  const siteContext = useSite();
  const isAdmissionsOpen = siteContext?.isAdmissionsOpen;

  return (
    <div className={`relative rounded-[32px] ${theme.layout.panelElevated} overflow-hidden p-8 md:p-12 lg:p-16 mb-10 md:mb-16 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 text-center lg:text-left`}>
      {/* Background Effects */}
      <div className={styles.aurora}></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 max-w-2xl">
        <h2 className={` text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight ${theme.text.primary}`}>
          {isAdmissionsOpen ? (
            <>Let's create your <br className="hidden lg:block" /><span className="text-[var(--accent)]">future in law.</span></>
          ) : (
            <>Begin your <br className="hidden lg:block" /><span className="text-[var(--accent)]">legal journey.</span></>
          )}
        </h2>
        <p className={`${theme.text.secondary} text-base md:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium`}>
          {isAdmissionsOpen 
            ? "Join Prudentia College of Law. Crafting premium legal minds with precision, analytical rigor, and an unwavering commitment to excellence."
            : "Admissions for the current academic year are closed. Connect with our admissions office to inquire about upcoming intake cycles and secure your future."}
        </p>
      </div>
      
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0 justify-center">
        {isAdmissionsOpen ? (
          <Link to="/apply" className="tlh-btn justify-center">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Apply Now</span>
            <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
        ) : (
          <Link to="/contact" className="tlh-btn justify-center">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Inquire Admissions</span>
            <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
        )}
        <Link to="/campus/gallery" className="tlh-btn justify-center">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Campus Tour</span>
          <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

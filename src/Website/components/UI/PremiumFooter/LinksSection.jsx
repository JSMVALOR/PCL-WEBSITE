/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import logo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';
import { useSite } from "../../../context/SiteContext";

export default function LinksSection() {
  const siteContext = useSite();
  const isAdmissionsOpen = siteContext?.isAdmissionsOpen;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 lg:gap-8 xl:gap-12 mb-8 md:mb-16 relative z-10">
      {/* Brand & Identity */}
      <div className="flex flex-col col-span-2 lg:col-span-1">
        <Link to="/" className="flex items-center gap-3 md:gap-4 mb-3 md:mb-6 group w-fit">
          <img decoding="async" loading="lazy" 
            src={logo} 
            alt="Prudentia College of Law Logo" 
            className="h-8 md:h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform theme-logo"
            
          />
          <div className="flex flex-col">
            <span className="font-bold tracking-[0.2em] text-base md:text-xl lg:text-2xl text-[var(--text-primary)]">
              PRUDENTIA
            </span>
            <span className="text-[7px] md:text-[9px] lg:text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] font-bold mt-1">
              College of Law
            </span>
          </div>
        </Link>
        <p className="text-[var(--text-muted)] text-xs md:text-sm mb-2 md:mb-8 leading-relaxed max-w-sm font-medium">
          Forging analytical minds capable of commanding courtrooms and navigating complex corporate governance.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col col-span-1">
        <h4 className="text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3 md:mb-6">Navigation</h4>
        <ul className="flex flex-col gap-2 md:gap-4">
          <li><Link to="/" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Home</Link></li>
          <li><Link to="/about" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">About Us</Link></li>
          <li><Link to="/programs" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Programs</Link></li>
          <li><Link to="/campus/facilities" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Campus Life</Link></li>
          <li><Link to="/blogs" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Blogs</Link></li>
        </ul>
      </div>

      {/* Resources */}
      <div className="flex flex-col col-span-1">
        <h4 className="text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3 md:mb-6">Resources</h4>
        <ul className="flex flex-col gap-2 md:gap-4">
          {isAdmissionsOpen ? (
            <li><Link to="/apply" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Admissions</Link></li>
          ) : (
            <li><Link to="/contact" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Inquire Admissions</Link></li>
          )}
          <li><Link to="/events" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">Events</Link></li>
          <li><Link to="/login" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium flex items-center gap-2">IT Helpdesk <i className="fa-solid fa-lock text-[10px] text-[var(--accent)]"></i></Link></li>
        </ul>
      </div>

      {/* Social & Contact */}
      <div className="flex flex-col col-span-2 lg:col-span-1 mt-2 md:mt-0">
        <h4 className="text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3 md:mb-6">Connect</h4>
        <ul className="flex flex-col gap-2 md:gap-4 mb-4 md:mb-6">
          <li><a href="mailto:info@prudentiacollegeoflaw.com" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium break-all">info@prudentiacollegeoflaw.com</a></li>
          <li><a href="tel:+918599000777" className="text-[var(--text-primary)]/80 hover:text-[var(--accent)] transition-colors text-xs md:text-sm font-medium">+91 8599000777</a></li>
          <li><span className="text-[var(--text-muted)] text-xs md:text-sm font-medium">Hyderabad, India</span></li>
        </ul>

        <div className="flex gap-4">
          <a href="https://www.instagram.com/prudentiacollegeoflaw" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent)] transition-all hover:scale-110" aria-label="Instagram">
            <FaInstagram className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
          </a>
          <a href="https://www.instagram.com/prudentiacollegeoflaw" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--text-on-accent)] hover:border-[var(--accent)] transition-all hover:scale-110" aria-label="WhatsApp">
            <FaWhatsapp className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
          </a>
        </div>
      </div>
    </div>
  );
}

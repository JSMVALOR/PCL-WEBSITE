/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import StaggeredMenu from './MOBILE_MENU/MobileMenu';
import GlobeMap from '../UI/GlobeMap';
import { useSite } from '../../context/SiteContext';

const MENU_ITEMS = [
  {
    label: 'Discover PCL',
    link: '/about',
    menu: {
      columns: [
        {
          title: 'About Us',
          items: [
            { label: 'Leadership & Vision', link: '/about/leadership' },
            { label: 'Faculty Profiles', link: '/about/faculty' },
            { label: 'Affiliations', link: '/about/affiliations' },
          ] },
        {
          title: 'Connect & Grow',
          items: [
            { label: 'Careers with Us', link: '/careers' },
            { label: 'Placement Cell', link: '/careers/placement' },
          ] },
      ]
    }
  },
  {
    label: 'Academics',
    link: '/programs',
    menu: {
      columns: [
        {
          title: 'Programs',
          items: [
            { label: '5-Year BA. LL.B (Honors)', link: '/programs/ba-llb' },
            { label: '5-Year BBA. LL.B (Honors)', link: '/programs/bba-llb' },
            { label: '3-Year LL.B (Standard)', link: '/programs/llb' },
          ] },
        {
          title: 'Admissions',
          items: [
            { label: 'Academic Courses', link: '/programs#courses' },
            { label: 'Admissions & Fees', link: '/programs#admissions' },
            { label: 'Documents Required', link: '/programs#documents' },
          ] },
        {
          title: 'Resources',
          items: [
            { label: 'Academic Calendar', link: '/programs#calendar' },
            { label: 'Educational Collaborations', link: '/programs#collaborations' },
          ] },
      ]
    }
  },
  {
    label: 'Campus Life',
    link: '/campus',
    menu: {
      columns: [
        {
          title: 'Infrastructure',
          items: [
            { label: 'Campus Facilities', link: '/campus/facilities' },
            { label: 'Campus Gallery', link: '/campus/gallery' },
          ] },
        {
          title: 'Student Life',
          items: [
            { label: 'Moot Court Society', link: '/campus/moot-court' },
            { label: 'Legal Aid & Clinic', link: '/campus/legal-aid' },
          ] },
      ]
    }
  },
  {
    label: 'News & Media',
    link: '/events',
    menu: {
      columns: [
        {
          title: 'Updates',
          items: [
            { label: 'Campus Events', link: '/events' },
            { label: 'Blogs', link: '/blogs' },
          ] },
      ]
    }
  },
  {
    label: 'Contact Us',
    link: '/contact',
    menu: {
      isContactCard: true,
      showGlobe: true
    }
  },
];

const SOCIAL_ITEMS = [
  { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' },
];

const MOBILE_MENU_ITEMS = MENU_ITEMS.map(({ menu, ...item }) => ({
  ...item,
  columns: menu.columns || [] }));

export default function Navbar() {
  const { isAdmissionsOpen } = useSite();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          setScrolled(currentScrollY > 50);
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setHidden(false);
            setActiveDropdown(null); // Close dropdown on scroll
          } else {
            setHidden(false); // Show when scrolling up
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (label) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      {/* Dark Overlay for "Covers Moments" */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-[45]"
            onMouseEnter={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="combined-nav-wrapper bg-[var(--bg-color)] border-b border-[var(--card-border)] transition-colors duration-400 ease-out"
      >
        <div className="w-full relative z-50 flex flex-col">


          <nav
            className="navbar relative"
            style={{ height: "70px" }}
          >
            <div className="flex justify-between items-center w-full max-w-[1400px] mx-auto px-6 h-full">
              
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3 text-[var(--text-color)] z-50 hover:opacity-80 transition-opacity"
              >
                <div className="brand-crest scale-110"></div>
                <div className="flex flex-col leading-[1.1]">
                  <span className="font-bold tracking-[1.5px] text-lg">PRUDENTIA</span>
                  <span className="text-[0.65rem] tracking-[1.8px] opacity-90">COLLEGE OF LAW</span>
                </div>
              </Link>

              {/* Desktop Links */}
              <div className="hidden lg:flex items-center h-full z-50">
                {MENU_ITEMS.map((item, idx) => (
                  <div 
                    key={item.label}
                    className="h-full flex items-center relative"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={item.link}
                      className={`flex items-center gap-1.5 px-4 xl:px-5 h-full text-sm font-medium tracking-wide transition-colors ${
                        activeDropdown === item.label ? 'text-[var(--primary-color)]' : 'text-[var(--text-color)] hover:text-[var(--primary-color)]'
                      }`}
                    >
                      {item.label}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-300 ${activeDropdown === item.label ? '-rotate-180 text-[var(--primary-color)]' : 'text-[var(--text-muted)]'}`}>
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>

                    {/* TLH-Style Dropdown Panel */}
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="fixed top-[70px] left-0 w-full bg-[var(--bg-color)] border-y border-[var(--card-border)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
                        >
                          <div className="w-full max-w-[1400px] mx-auto px-6 py-10 flex justify-between gap-16">
                            
                            {/* Left Intro Column */}
                            <div className="w-[300px] shrink-0">
                                <h3 className="text-2xl font-serif font-bold text-[var(--text-color)] mb-3">{item.label}</h3>
                                <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                                    {item.label === 'Discover PCL' && "Learn about our vision, leadership, and how we are shaping the future of legal education."}
                                    {item.label === 'Academics' && "Explore our comprehensive law programs, admission procedures, and academic resources."}
                                    {item.label === 'Campus Life' && "Discover our state-of-the-art facilities, moot courts, and vibrant student community."}
                                    {item.label === 'News & Media' && "Stay updated with the latest events, campus news, and insightful legal blogs."}
                                    {item.label === 'Contact Us' && "Get in touch with our admissions office or schedule a personalized campus tour."}
                                </p>
                                {item.menu.showGlobe && (
                                  <div className="mt-8 w-full h-[200px] relative flex items-center justify-center bg-[#1a1818] rounded-2xl overflow-hidden border border-[var(--card-border)]">
                                    <div className="absolute top-4 left-4 z-10">
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Hyderabad</h4>
                                    </div>
                                    <div className="w-full h-full scale-[1.2]">
                                      <GlobeMap />
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Grid of Links or Sections */}
                            <div className="flex-1 flex flex-col gap-8">
                                <div className="flex flex-wrap gap-x-12 gap-y-8">
                                    {item.menu.columns && item.menu.columns.map((col, cIdx) => (
                                        <div key={cIdx} className="flex flex-col min-w-[280px] flex-1">
                                            <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--accent)] mb-4 pb-2 border-b border-[var(--card-border)] px-1">{col.title}</h4>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                                {col.items.map((subItem, sIdx) => (
                                                    <Link
                                                        key={sIdx}
                                                        to={subItem.link}
                                                        onClick={() => setActiveDropdown(null)}
                                                        className="group/btn relative flex flex-col gap-2 p-3.5 rounded-xl transition-all text-left border border-transparent hover:bg-[var(--card-bg)] hover:border-[var(--card-border)] outline-none"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] group-hover/btn:text-[var(--primary-color)] group-hover/btn:border-[var(--primary-color)]/20 shadow-inner">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-current" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                <polyline points="12 5 19 12 12 19"></polyline>
                                                            </svg>
                                                        </div>
                                                        <div className="flex flex-col mt-1">
                                                            <span className="text-[13px] font-bold text-[var(--text-color)] group-hover/btn:text-[var(--primary-color)] transition-colors">{subItem.label}</span>
                                                            <span className="text-[11px] text-[var(--text-muted)] font-medium mt-1 opacity-80 line-clamp-1">Explore {subItem.label.toLowerCase()}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {item.menu.isContactCard && (
                                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 hover:border-[var(--primary-color)] transition-colors group max-w-md w-full">
                                            <h3 className="text-2xl font-serif font-bold text-[var(--text-color)] mb-2">Admissions & Inquiries</h3>
                                            <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
                                              Connect with our dedicated admissions office, ask questions, or schedule a personalized campus tour.
                                            </p>
                                            <Link to="/contact" onClick={() => setActiveDropdown(null)} className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--bg-color)] bg-[var(--primary-color)] px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-[var(--primary-color)]/20">
                                              Contact Office <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-6 z-50">
                <a
                  href="/erp"
                  className="hidden md:flex text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                >
                  ERP Portal
                </a>

                <div className="hidden sm:block">
                  {isAdmissionsOpen ? (
                    <Link to="/apply" className="tlh-btn">
                      <span className="text-xs font-bold uppercase tracking-widest">Apply Now</span>
                      <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </Link>
                  ) : (
                    <Link to="/contact" className="tlh-btn">
                      <span className="text-xs font-bold uppercase tracking-widest">Contact Us</span>
                      <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </Link>
                  )}
                </div>

                <div className="lg:hidden">
                  <StaggeredMenu
                    items={MOBILE_MENU_ITEMS}
                    socialItems={SOCIAL_ITEMS}
                    displaySocials={true}
                    position="right"
                  />
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

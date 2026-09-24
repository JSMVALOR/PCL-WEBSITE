/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Menu, ArrowRight } from 'lucide-react';
import { theme } from '../../../../Shared/theme';

const StaggeredMenu = ({ items = [], socialItems = [], displaySocials = true, showApplyButton = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSubmenu = (index) => setOpenSubmenu(openSubmenu === index ? null : index);

  // Framer Motion Variants
  const menuVariants = {
    closed: { x: '100%', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    open: { x: '0%', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  const submenuVariants = {
    closed: { height: 0, opacity: 0, overflow: 'hidden' },
    open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        className={`flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] ${theme.text.primary} hover:bg-[var(--accent)] hover:text-black transition-colors shadow-sm`}
      >
        <span className="text-xs font-bold uppercase tracking-widest">Menu</span>
        <Menu size={16} />
      </button>

      {/* Menu Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
              />

              {/* Drawer */}
              <motion.aside
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className={`fixed top-0 right-0 w-full sm:w-[400px] h-[100dvh] overflow-y-auto ${theme.layout.panelElevated} border-l border-[var(--card-border)] shadow-2xl z-[100000] flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
                  <div className="flex items-center gap-3">
                    <div className="brand-crest scale-100"></div>
                    <div className="flex flex-col leading-[1.1]">
                      <span className={`font-bold tracking-[1.5px] text-lg ${theme.text.primary}`}>PRUDENTIA</span>
                      <span className="text-[0.65rem] tracking-[1.8px] opacity-90 uppercase text-[var(--accent)] font-bold">College of Law</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className={`p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 ${theme.text.primary} hover:bg-[var(--accent)] hover:text-black transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 py-8 px-6 flex flex-col gap-6">
                  {items.map((item, idx) => {
                    const hasSubItems = item.columns && item.columns.length > 0;
                    const isActive = location.pathname.startsWith(item.link);
                    
                    return (
                      <motion.div key={idx} variants={itemVariants} className="flex flex-col">
                        <div 
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => hasSubItems ? toggleSubmenu(idx) : null}
                        >
                          <Link 
                            to={item.link} 
                            onClick={!hasSubItems ? () => setIsOpen(false) : (e) => e.preventDefault()}
                            className={`text-2xl font-serif font-bold transition-colors ${isActive ? 'text-[var(--accent)]' : theme.text.primary} group-hover:text-[var(--accent)]`}
                          >
                            {item.label}
                          </Link>
                          {hasSubItems && (
                            <button className={`p-2 rounded-full bg-transparent ${theme.text.secondary} group-hover:text-[var(--accent)] transition-transform ${openSubmenu === idx ? 'rotate-180' : ''}`}>
                              <ChevronDown size={20} />
                            </button>
                          )}
                        </div>

                        {/* Submenu */}
                        {hasSubItems && (
                          <AnimatePresence>
                            {openSubmenu === idx && (
                              <motion.div
                                variants={submenuVariants}
                                initial="closed"
                                animate="open"
                                exit="closed"
                              >
                                <div className="flex flex-col gap-6 pt-4 pl-4 border-l border-[var(--accent)]/30 mt-4">
                                  {item.columns.map((col, cIdx) => (
                                    <div key={cIdx} className="flex flex-col gap-3">
                                      {/* Colored Category Header */}
                                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] border-b border-[var(--card-border)] pb-2 mb-1">
                                        {col.title}
                                      </h4>
                                      {/* Indented Sub-Options List */}
                                      <ul className="flex flex-col gap-3 pl-3 border-l-2 border-[var(--card-border)]/50 ml-1">
                                        {col.items.map((sub, sIdx) => (
                                          <li key={sIdx}>
                                            <Link 
                                              to={sub.link}
                                              onClick={() => setIsOpen(false)}
                                              className={`text-sm font-medium ${location.pathname === sub.link ? 'text-[var(--text-primary)] font-bold' : theme.text.secondary} hover:text-[var(--text-primary)] transition-all flex items-center gap-2`}
                                            >
                                              {sub.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer / Actions */}
                <motion.div variants={itemVariants} className="p-6 mt-auto bg-black/5 dark:bg-white/5 border-t border-[var(--card-border)] flex flex-col gap-6">
                  {showApplyButton && (
                    <div className="flex flex-col gap-3">
                      <Link 
                        to="/apply" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[var(--accent)] text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,191,0,0.3)] hover:scale-[1.02] transition-transform"
                      >
                        Apply Now <ArrowRight size={16} />
                      </Link>
                      <Link 
                        to="/erp" 
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--card-border)] ${theme.text.primary} font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-colors`}
                      >
                        ERP Portal
                      </Link>
                    </div>
                  )}

                  {displaySocials && socialItems.length > 0 && (
                    <div className="flex items-center justify-center gap-6">
                      {socialItems.map((social, idx) => (
                        <a 
                          key={idx} 
                          href={social.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-xs font-bold uppercase tracking-widest ${theme.text.secondary} hover:text-[var(--accent)] transition-colors`}
                        >
                          {social.label}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default StaggeredMenu;

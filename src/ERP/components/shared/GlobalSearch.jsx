/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERP } from '../../context/ErpContext';
import { theme } from '../../../Shared/theme';

// Pre-defined static modules for the search dictionary
const STATIC_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-house', path: '' },
  { id: 'notices', name: 'Notice Board', icon: 'fa-solid fa-thumbtack', path: 'notices' },
  { id: 'timetable', name: 'Timetable', icon: 'fa-solid fa-calendar-days', path: 'timetable' },
  { id: 'attendance', name: 'Attendance', icon: 'fa-solid fa-user-check', path: 'attendance' },
  { id: 'fees', name: 'Fees & Payments', icon: 'fa-solid fa-indian-rupee-sign', path: 'fees' },
  { id: 'leave', name: 'Leave Application', icon: 'fa-solid fa-plane-departure', path: 'leave' },
  { id: 'library', name: 'Library Resources', icon: 'fa-solid fa-book-open', path: 'library' },
  { id: 'helpdesk', name: 'IT Helpdesk', icon: 'fa-solid fa-headset', path: 'helpdesk' },
  { id: 'profile', name: 'My Profile', icon: 'fa-solid fa-user', path: 'profile' },
  { id: 'settings', name: 'Settings', icon: 'fa-solid fa-gear', path: 'settings' }
];

const QUICK_LINKS = [
  'timetable', 'notices', 'library', 'helpdesk'
];

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { userSession } = useERP();

  // Cmd+K shortcut disabled based on user preference

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) && 
        inputRef.current && 
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    const role = userSession?.role || 'student';
    // Navigate with role prefix
    navigate(`/${role}${path ? `/${path}` : ''}`);
  };

  const filteredModules = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return STATIC_MODULES.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) || 
      m.id.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const quickLinks = useMemo(() => {
    return STATIC_MODULES.filter(m => QUICK_LINKS.includes(m.id));
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto z-[100]">
      {/* Input Bar */}
      <div className="relative flex items-center group">
        <div className="absolute left-5 text-themeTextSec transition-colors group-focus-within:text-themeAccent flex items-center justify-center">
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search modules, features, or quick links..."
          className="w-full bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-white/5 text-themeText rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-themeAccent/20 focus:border-themeAccent transition shadow-sm placeholder:text-themeTextSec text-sm"
        />
      </div>

      {/* Glassmorphism Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-themePanel/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-themePanel shadow-2xl overflow-hidden transform transition duration-300 origin-top animate-fade-in"
        >
          <div className="max-h-[420px] overflow-y-auto p-3 scrollbar-hide">
            
            {!query ? (
              <div className="p-1 space-y-6">
                {/* Quick Links Section */}
                <div>
                  <h3 className={`${theme.text.overline} mb-3 px-3`}>
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleSelect(link.path)}
                        className="flex items-center gap-3 w-full p-3 rounded-themeBtn hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-left transition-colors group border border-transparent hover:border-white/5"
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-themeTextSec group-hover:text-themeAccent group-hover:bg-themeAccent/10 transition-colors">
                          <i className={link.icon}></i>
                        </div>
                        <span className="text-sm font-medium text-themeText group-hover:text-themeAccent transition-colors">
                          {link.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Places Section */}
                <div>
                  <h3 className={`${theme.text.overline} mb-3 px-3 flex items-center gap-2`}>
                    <i className="fa-solid fa-clock-rotate-left"></i> Recent Places
                  </h3>
                  <div className="space-y-1">
                    {STATIC_MODULES.slice(0, 3).map((item) => (
                      <button
                        key={`recent-${item.id}`}
                        onClick={() => handleSelect(item.path)}
                        className="flex items-center justify-between w-full p-3 rounded-themeBtn hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 flex justify-center text-themeTextSec group-hover:text-themeAccent transition-colors">
                            <i className={item.icon}></i>
                          </div>
                          <span className="text-sm text-themeTextSec group-hover:text-themeText transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredModules.length > 0 ? (
              <div className="p-1">
                <h3 className={`${theme.text.overline} mb-3 px-3`}>
                  Search Results
                </h3>
                <div className="space-y-1">
                  {filteredModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => handleSelect(module.path)}
                      className="flex items-center justify-between w-full p-3 rounded-themeBtn hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-left transition group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-white/5 text-themeTextSec group-hover:text-themeAccent group-hover:border-themeAccent/30 group-hover:bg-themeAccent/10 transition-colors">
                          <i className={`${module.icon} text-lg`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-themeText group-hover:text-themeAccent transition-colors">
                            {module.name}
                          </p>
                          <p className="text-xs text-themeTextSec capitalize mt-0.5">
                            ERP Module
                          </p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition pr-2 translate-x-2 group-hover:translate-x-0 transform duration-300">
                        <i className="fa-solid fa-arrow-right text-themeAccent"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-14 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-white/5 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-magnifying-glass text-xl text-themeTextSec"></i>
                </div>
                <p className="text-sm text-themeText font-medium mb-1">No results found</p>
                <p className="text-xs text-themeTextSec">We couldn't find any modules matching "{query}"</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border-t-theme border-white/5 p-3 px-5 flex items-center justify-between text-xs text-themeTextSec">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-white/5 shadow-sm font-sans font-medium text-themeText">↑↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-white/5 shadow-sm font-sans font-medium text-themeText">↵</kbd>
                <span>to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-white/5 shadow-sm font-sans font-medium text-themeText">ESC</kbd>
              <span>to close</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

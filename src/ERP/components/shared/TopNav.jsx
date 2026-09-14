/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useRef } from 'react';
import { STUDENT_NAV_MEGA as STUDENT_SIDEBAR_CONFIG } from '../Student/sidebar/Sidebar';
import { FACULTY_NAV_MEGA as FACULTY_SIDEBAR_CONFIG } from '../Faculty/FacultySidebar/FacultySidebar';
import { ADMIN_NAV_GROUPS as ADMIN_SIDEBAR_CONFIG } from '../Admin/AdminSidebar/AdminSidebar';
import { useERP } from '../../context/ErpContext';
import pclLogo from '../../../Shared/Assets/LOGOS/pcl_logo.svg';
import { GlobalSearch } from './LiveHeaderComponents';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav({ userSession, activeTab, setActiveTab, onLogout }) {
    const { changeNavLayout, notices, activeTheme } = useERP();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const timeoutRef = useRef(null);

    let config = [];
    if (userSession?.role === 'student') config = STUDENT_SIDEBAR_CONFIG;
    else if (userSession?.role === 'faculty') config = FACULTY_SIDEBAR_CONFIG;
    else if (userSession?.role === 'admin') config = ADMIN_SIDEBAR_CONFIG;

    const initials = userSession?.name
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'US';

    const displayName = userSession?.name?.split(' ')[0] || "User";

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
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border-b border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgb(0,0,0,0.2)]">
            <header className="h-[72px] px-4 lg:px-8 flex items-center justify-between max-w-[2000px] mx-auto gap-4">
                
                {/* Left: Branding */}
                <div className="flex items-center gap-3 lg:gap-4 shrink-0 pr-2 lg:pr-4 xl:pr-10">
                    <div className="w-10 h-10 rounded-xl bg-themeElevated flex items-center justify-center p-2 shadow-inner border border-black/5 dark:border-white/5">
                        <img src={pclLogo} alt="PCL Logo" className="w-full h-full object-contain drop-shadow-sm" style={(!activeTheme || activeTheme.includes("dark") || activeTheme.includes("midnight") || activeTheme.includes("crimson") || activeTheme.includes("emerald") || activeTheme.includes("imperial")) ? { filter: "invert(1) drop-shadow(0px 0px 5px rgba(255,255,255,0.2))" } : { filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[16px] font-black tracking-widest text-themeText leading-none mb-1">
                            PCL<span className="text-themeAccent">ERP</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-themeTextSec leading-none">
                            {userSession?.role} Portal
                        </span>
                    </div>
                </div>

                {/* Center: Website Style Navbar */}
                <nav className="hidden lg:flex items-center h-full flex-1">
                    {config.flatMap(group => group.links).map((navItem, idx) => {
                        const hasChildren = navItem.children && navItem.children.length > 0;
                        const isNavActive = activeTab === navItem.id;
                        
                        return (
                        <div 
                            key={idx} 
                            className="h-full flex items-center relative"
                            onMouseEnter={() => hasChildren && handleMouseEnter(navItem.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button type="button" 
                                onClick={() => {
                                    if (!hasChildren) {
                                        setActiveTab(navItem.id);
                                    }
                                }}
                                className={`h-full flex items-center gap-1.5 px-3 xl:px-4 text-[11px] font-bold uppercase tracking-widest transition-colors outline-none ${
                                    (activeDropdown === navItem.id || isNavActive) ? 'text-themeAccent' : 'text-themeText hover:text-themeAccent'
                                }`}
                            >
                                {navItem.label}
                                {hasChildren && (
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-300 ml-0.5 ${activeDropdown === navItem.id ? '-rotate-180 text-themeAccent' : 'text-themeTextSec'}`}>
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </button>

                            {/* Dropdown Panel (Only for items with children) */}
                            {hasChildren && (
                                <AnimatePresence>
                                    {activeDropdown === navItem.id && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="absolute top-[calc(100%-8px)] left-0 pt-2 z-50 origin-top-left"
                                        >
                                            <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-2xl p-4 min-w-[260px] flex flex-col gap-1.5 relative overflow-hidden">
                                                
                                                {/* Top edge highlight */}
                                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#007AFF]/30 to-transparent"></div>

                                                {navItem.children.map(link => {
                                                    const isActive = activeTab === link.id;
                                                    const hasNotice = link.id === 'notices' && notices?.length > 0;
                                                    return (
                                                        <button type="button"
                                                            key={link.id}
                                                            onClick={() => {
                                                                setActiveTab(link.id);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`group/btn relative flex items-center gap-3 p-2.5 rounded-lg transition-all text-left outline-none ${
                                                                isActive ? 'bg-themeElevated text-themeText' : 'text-themeTextSec hover:bg-black/5 dark:hover:bg-white/5 hover:text-themeText dark:hover:text-[#F2F2F7]'
                                                            }`}
                                                        >
                                                            {isActive && (
                                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#007AFF] rounded-r-md shadow-[0_0_8px_rgba(0,122,255,0.4)]"></div>
                                                            )}
                                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors shadow-inner shrink-0 ${
                                                                isActive ? 'bg-themeAccent/10 text-themeAccent border border-themeAccent/20' : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-themeTextSec group-hover/btn:text-themeAccent group-hover/btn:bg-[#007AFF]/5 group-hover/btn:border-[#007AFF]/10'
                                                            }`}>
                                                                <i className={`${link.icon} text-sm drop-shadow-sm`}></i>
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-[12px] font-bold truncate tracking-tight">{link.label}</span>
                                                            </div>
                                                            {hasNotice && (
                                                                <div className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black shrink-0">
                                                                    {notices.length}
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    )})}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Global Search Inject */}
                    <div className="hidden 2xl:block w-full max-w-[14rem]">
                        <GlobalSearch />
                    </div>

                    
                    {/* Layout Switcher */}

                    <button type="button" onClick={() => setActiveTab('notices')} className="w-9 h-9 rounded-lg bg-themeElevated hover:bg-themeElevated/80 border border-black/5 dark:border-white/5 flex items-center justify-center text-themeTextSec hover:text-themeText dark:hover:text-[#F2F2F7] transition-all relative group outline-none shadow-sm">
                        <i className="fa-regular fa-bell text-[13px] group-hover:scale-110 transition-transform"></i>
                        {notices?.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-md bg-[#FF9500] shadow-[0_0_8px_#FF9500] animate-pulse border border-white dark:border-[#1C1C1E]"></span>
                        )}
                    </button>

                    <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block"></div>

                    {/* Quick Profile Dropdown trigger */}
                    <div 
                        className="relative h-full flex items-center group/profile"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button type="button" 
                            onClick={() => setActiveTab('credentials')}
                            className="flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 p-1 pr-1 xl:pr-3 rounded-xl transition duration-300 outline-none"
                        >
                            <div className="w-9 h-9 rounded-lg bg-themeElevated flex items-center justify-center font-black text-[11px] text-themeText shadow-inner border border-black/5 dark:border-white/5 group-hover/profile:border-themeAccent/30 transition-colors overflow-hidden relative">
                                {userSession?.profile_picture_url ? (
                                    <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover relative z-10" />
                                ) : (
                                    <span className="relative z-10">{initials}</span>
                                )}
                            </div>
                            <div className="flex flex-col items-start hidden xl:flex">
                                <span className="text-[13px] font-bold text-themeText group-hover/profile:text-themeAccent transition-colors duration-300 truncate max-w-[120px] tracking-tight">
                                    {displayName}
                                </span>
                                <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5">
                                    Settings
                                </span>
                            </div>
                        </button>
                        
                        {/* Profile Dropdown */}
                        <AnimatePresence>
                            {activeDropdown === 'profile' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="absolute top-[calc(100%-8px)] right-0 pt-2 z-50 origin-top-right"
                                >
                                    <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-2xl p-4 min-w-[220px] flex flex-col gap-2 relative overflow-hidden">
                                        <div className="p-3 mb-2 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-themeElevated flex items-center justify-center font-black text-themeText shadow-inner overflow-hidden border border-black/5 dark:border-white/5">
                                                {userSession?.profile_picture_url ? (
                                                    <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[13px] font-bold text-themeText tracking-tight truncate">{userSession?.name || "User"}</span>
                                                <span className="text-[10px] font-semibold text-themeTextSec uppercase">{userSession?.role}</span>
                                            </div>
                                        </div>
                                        
                                        <button type="button" 
                                            onClick={() => {
                                                setActiveTab('credentials');
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-themeTextSec hover:text-themeText dark:hover:text-[#F2F2F7] text-[12px] font-bold"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                                <i className="fa-solid fa-user-gear text-[11px]"></i>
                                            </div>
                                            Manage Profile
                                        </button>
                                        
                                        <button type="button" 
                                            onClick={async () => {
                                                const confirmed = await window.erpDialog?.confirm("Are you sure you want to securely sign out?", "End Session");
                                                if (confirmed) {
                                                    onLogout();
                                                    window.location.href = '/';
                                                }
                                            }}
                                            className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-rose-500/10 transition-colors text-rose-500 text-[12px] font-bold mt-1"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center">
                                                <i className="fa-solid fa-power-off text-[11px]"></i>
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {userSession?.role === 'admin' && (
                        <>
                            <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block"></div>
                            <button type="button" 
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                title="Return to Main Website"
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-themeElevated hover:bg-themeElevated/80 text-themeTextSec hover:text-themeText dark:hover:text-[#F2F2F7] text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm outline-none"
                            >
                                <i className="fa-solid fa-earth-americas text-[11px]"></i>
                                <span>Website</span>
                            </button>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
}

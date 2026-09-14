/* © 2026 JSM VALOR. All Rights Reserved. */
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useERP } from '../../../context/ErpContext';
import { theme } from '../../../../Shared/theme';
import { Dialog } from '../../../utils/DialogManager';
import pclLogo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';

// --- Constants & Config ---
const SIDEBAR_MIN_WIDTH = 80; // Compact width
const SIDEBAR_DEFAULT_WIDTH = 280; // Default expanded width
const SIDEBAR_MAX_WIDTH = 400; // Maximum drag width
const STORAGE_KEY_WIDTH = 'jsmerp_sidebar_width';
const STORAGE_KEY_FAVS = 'jsmerp_sidebar_favs';

export default function SidebarFramework({ 
    config = [], 
    bottomLinks = [], 
    userSession, 
    activeTab, 
    setActiveTab, 
    onLogout,
    customBrandContext
}) {
    const { isSidebarCollapsed, toggleSidebar, notices } = useERP();
    
    // --- Core State ---
    const sidebarWidth = isSidebarCollapsed ? SIDEBAR_MIN_WIDTH : SIDEBAR_DEFAULT_WIDTH;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const handleLogout = async () => {
        const confirmed = await Dialog.confirm("Are you sure you want to securely sign out?", "End Session");
        if (confirmed) {
            onLogout();
        }
    };

    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS)) || []; }
        catch { return []; }
    });
    
    // Expanded submenus state
    const [expandedGroups, setExpandedGroups] = useState(() => {
        let initialState = {};
        config.forEach((g, idx) => { initialState[idx] = true; });
        return initialState;
    });

    const [expandedSubmenus, setExpandedSubmenus] = useState({});

    // Floating Submenu / Context Menu states
    const [contextMenu, setContextMenu] = useState(null); // { item, x, y }

    const isCompact = sidebarWidth <= SIDEBAR_MIN_WIDTH + 20 || isSidebarCollapsed;

    // --- Persist State ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favorites));
    }, [favorites]);


    // --- Resizing Engine ---


    // --- Search & Filter Logic ---
    const filteredConfig = useMemo(() => {
        return config;
        
        return config.map(group => {
            const filteredLinks = group.links.filter(link => {
                const matchLabel = link.label.toLowerCase().includes(q);
                const matchChildren = link.children && link.children.some(child => child.label.toLowerCase().includes(q));
                return matchLabel || matchChildren;
            });
            return { ...group, links: filteredLinks };
        }).filter(group => group.links.length > 0);
    }, [config]);

    // --- Handlers ---
    const handleTabSwitch = (id) => {
        if (!id) return;
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
        setContextMenu(null);
    };

    const handleContextMenu = (e, link) => {
        e.preventDefault();
        setContextMenu({
            item: link,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Global click to close context menus
    useEffect(() => {
        const closeMenus = () => setContextMenu(null);
        document.addEventListener('click', closeMenus);
        return () => document.removeEventListener('click', closeMenus);
    }, []);

    // --- Renderers ---
    const renderLink = (link, depth = 0) => {
        const isActive = activeTab === link.id;
        const hasChildren = link.children && link.children.length > 0;
        
        const paddingLeft = isCompact ? '0' : `calc(0.75rem + ${depth * 0.75}rem)`;
        
        const isSubmenuExpanded = expandedSubmenus[link.id];

        return (
            <div key={link.id} className="relative group/item outline-none w-full">
                <button
                    onContextMenu={(e) => handleContextMenu(e, link)}
                    onClick={() => {
                        if (hasChildren && !isCompact) {
                            setExpandedSubmenus(prev => ({ ...prev, [link.id]: !prev[link.id] }));
                        } else {
                            handleTabSwitch(link.id);
                        }
                    }}
                    style={{ paddingLeft }}
                    className={`
                        relative w-full flex items-center justify-between py-2.5 my-0.5 rounded-xl
                        text-xs font-bold tracking-wide transition duration-200 outline-none
                        ${isActive 
                            ? "bg-black/5 dark:bg-white/10 backdrop-blur-[30px] border border-black/10 dark:border-white/10 text-themeText shadow-md" 
                            : "text-themeTextSec hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:text-themeText"
                        }
                        ${isCompact ? "justify-center px-0" : "pr-3"}
                    `}
                    title={isCompact ? link.label : ""}
                >
                    {/* Animated Active Indicator (Sliding Pill style) */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-themeAccent rounded-r-full shadow-[0_0_12px_var(--accent)] animate-fade-in"></div>
                    )}

                    <div className={`flex items-center ${isCompact ? "justify-center w-full" : "gap-3"} min-w-0`}>
                        {/* Icon Lift Animation */}
                        <div className={`w-6 flex justify-center shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover/item:scale-110 group-hover/item:-translate-y-0.5"}`}>
                            <i className={`${link.icon} text-lg ${isActive ? "text-black dark:text-white drop-shadow-sm" : "opacity-70 group-hover/item:opacity-100 group-hover/item:text-themeText"}`}></i>
                        </div>
                        
                        {/* Label */}
                        {!isCompact && (
                            <span className="truncate flex-1 text-left select-none">{link.label}</span>
                        )}
                    </div>

                    {/* Badges / Indicators */}
                    {!isCompact && (
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                            {link.badge && (
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${link.badge.color || 'bg-themeAccent/20 text-themeAccent border border-themeAccent/30'}`}>
                                    {link.badge.text}
                                </span>
                            )}
                            {((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                            )}
                            {hasChildren && (
                                <i className={`fa-solid fa-chevron-down text-[10px] opacity-40 transition-transform duration-200 ${isSubmenuExpanded ? 'rotate-180' : ''}`}></i>
                            )}
                        </div>
                    )}
                </button>

                {/* Submenu Children */}
                {hasChildren && !isCompact && (
                    <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out pl-2 border-l border-black/5 dark:border-white/5 ml-4 mt-1 ${isSubmenuExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {link.children.map(child => renderLink(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const initials = userSession?.name ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "US";
    
    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside 
                style={{ width: `${sidebarWidth}px`, transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                className={`
                    hidden lg:flex flex-col shrink-0 h-screen relative z-40 
                    bg-white/40 dark:bg-black/40 backdrop-blur-[80px] shadow-[15px_0_50px_0_rgba(0,0,0,0.05)] dark:shadow-[15px_0_50px_0_rgba(0,0,0,0.3)] border-r border-black/10 dark:border-black/10 dark:border-black/5 dark:border-white/10
                `}
            >
                {/* Edge Specular Highlight */}
                {/* 1. BRAND ZONE */}
                <div className="h-20 flex items-center justify-between px-5 shrink-0 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleTabSwitch('dashboard')}>
                        <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/20 dark:border-black/10 dark:border-white/20 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                            <img src={pclLogo} alt="PCL" className="w-5 h-5 theme-logo transition-transform duration-300" />
                        </div>
                        {!isCompact && (
                            <div className="flex flex-col min-w-0 animate-fade-in whitespace-nowrap">
                                <span className="text-lg font-black tracking-tight text-themeText leading-none truncate">
                                    JSM<span className="text-themeAccent">ERP</span>
                                </span>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-[0.2em] mt-1 opacity-70 truncate">
                                    {customBrandContext || "Associates"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle Button (Absolute Positioned on Edge) */}
                <button 
                    onClick={toggleSidebar} 
                    className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-black/10 dark:border-black/5 dark:border-white/10 shadow-md flex items-center justify-center text-themeTextSec hover:text-themeText hover:scale-110 transition z-50"
                    title={isCompact ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <i className={`fa-solid ${isCompact ? 'fa-chevron-right' : 'fa-chevron-left'} text-[9px]`}></i>
                </button>

                {/* 3. NAVIGATION ZONE */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar flex flex-col gap-5">
                    
                    {/* Favorites Section */}
                    {favorites.length > 0 && (
                        <div className="flex flex-col gap-1">
                            {!isCompact && <p className="text-[9px] font-black text-themeTextSec opacity-60 uppercase tracking-widest px-3 mb-1 animate-fade-in">Favorites</p>}
                            {config.flatMap(g => g.links).filter(l => favorites.includes(l.id)).map(link => renderLink(link))}
                        </div>
                    )}

                    {/* Standard Groups */}
                    {filteredConfig.map((group, groupIndex) => {
                        const isExpanded = expandedGroups[groupIndex];
                        return (
                            <div key={groupIndex} className="flex flex-col gap-1">
                                {!isCompact ? (
                                    <button 
                                        onClick={() => setExpandedGroups(p => ({ ...p, [groupIndex]: !p[groupIndex] }))}
                                        className="flex items-center justify-between w-full px-3 py-1 mb-1 group outline-none"
                                    >
                                        <p className="text-[9px] font-black text-themeTextSec opacity-60 group-hover:text-themeText group-hover:opacity-100 uppercase tracking-widest transition">
                                            {group.category}
                                        </p>
                                        <i className={`fa-solid fa-chevron-down text-[8px] text-themeTextSec opacity-30 transition-transform duration-300 ${isExpanded ? 'rotate-180 opacity-60' : ''}`}></i>
                                    </button>
                                ) : (
                                    <div className="w-full border-t border-black/5 dark:border-white/5 my-2"></div>
                                )}
                                
                                <div className={`flex flex-col gap-0.5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isExpanded || isCompact ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {group.links.map(link => renderLink(link))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 4. UTILITY & USER CARD ZONE */}
                <div className="p-3 shrink-0 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                    
                    {!isCompact && (
                        <div onClick={() => handleTabSwitch('credentials')} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-black/10 dark:border-black/5 dark:border-white/10 mt-1 cursor-pointer hover:bg-black/5 dark:bg-white/5 hover:border-black/20 dark:border-black/10 dark:border-white/20 transition shadow-inner group-hover:scale-[1.02]">
                            <div className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-black/10 dark:border-black/5 dark:border-white/10 flex items-center justify-center font-black text-xs text-themeText relative shrink-0 overflow-hidden">
                                {userSession?.profile_picture_url ? (
                                    <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themeApp z-10"></div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-themeText truncate leading-tight">{userSession?.name || 'User'}</span>
                                <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest truncate">{userSession?.role || 'Guest'}</span>
                            </div>
                        </div>
                    )}
                    
                </div>


            </aside>

            {/* CONTEXT MENU (Right Click) */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] w-48 bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-black/5 dark:border-white/5 shadow-2xl rounded-xl py-1 animate-fade-in scale-in custom-blur"
                    style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
                        <p className="text-xs font-black text-themeText truncate">{contextMenu.item.label}</p>
                        <p className="text-[9px] text-themeTextSec uppercase tracking-widest mt-0.5">Context Options</p>
                    </div>
                    <button onClick={(e) => toggleFavorite(e, contextMenu.item.id)} className="w-full text-left px-4 py-2 hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className={`fa-solid fa-star ${favorites.includes(contextMenu.item.id) ? 'text-amber-500' : 'text-themeTextSec'}`}></i>
                        {favorites.includes(contextMenu.item.id) ? 'Remove Favorite' : 'Pin to Favorites'}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="w-full text-left px-4 py-2 hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className="fa-solid fa-arrow-up-right-from-square text-themeTextSec"></i> Open in New Tab
                    </button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="w-full text-left px-4 py-2 hover:bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className="fa-solid fa-link text-themeTextSec"></i> Copy Link
                    </button>
                </div>
            )}

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-[60px] border-t border-black/10 dark:border-black/5 dark:border-white/10 z-50 px-2 py-3 pb-safe flex items-center justify-between shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
                {bottomLinks.map(link => {
                    const isActive = activeTab === link.id && !mobileMenuOpen;
                    return (
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            key={link.id}
                            onClick={() => handleTabSwitch(link.id)}
                            className={`flex flex-col items-center justify-center w-16 gap-1.5 transition duration-300 relative z-10 ${isActive ? 'text-black dark:text-white -translate-y-1' : 'text-white/60 hover:text-black dark:hover:text-white'}`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative overflow-hidden ${isActive ? 'bg-black/10 dark:bg-white/15 backdrop-blur-3xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border border-black/20 dark:border-black/10 dark:border-white/20' : 'bg-transparent'}`}>
                                
                                <i className={`${link.icon} text-lg`}></i>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </motion.button>
                    )
                })}
                
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center w-16 gap-1.5 transition duration-300 relative z-10 ${mobileMenuOpen ? 'text-black dark:text-white -translate-y-1' : 'text-white/60 hover:text-black dark:hover:text-white'}`}
                >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative overflow-hidden ${mobileMenuOpen ? 'bg-black/10 dark:bg-white/15 backdrop-blur-3xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border border-black/20 dark:border-black/10 dark:border-white/20' : 'bg-transparent'}`}>
                        
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
                </motion.button>
            </div>

            {/* FULL SCREEN MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-[60px] overflow-y-auto pb-24"
                    >
                        <div className="p-6 pt-10 flex items-center gap-4 border-b border-black/10 dark:border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 sticky top-0 backdrop-blur-2xl z-10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 backdrop-blur-xl border border-black/20 dark:border-black/10 dark:border-white/20 flex items-center justify-center font-black text-xl text-black dark:text-white relative shadow-lg overflow-hidden">
                                {userSession?.profile_picture_url ? (
                                    <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover relative z-0" />
                                ) : (
                                    initials
                                )}
                                <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-transparent z-20 shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-xl font-black text-black dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-md">{userSession?.name || "User"}</p>
                                <p className="text-[10px] font-black text-black/70 dark:text-white/70 uppercase tracking-widest mt-0.5">{userSession?.role}</p>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-8">
                            {config.map((group, idx) => (
                                <div key={idx}>
                                    <p className="text-[11px] font-black text-black/50 dark:text-white/50 uppercase tracking-widest mb-4 pl-2 drop-shadow-sm">
                                        {group.category}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {group.links.flatMap(l => l.children ? l.children : [l]).map(link => {
                                            const isActive = activeTab === link.id;
                                            return (
                                                <motion.button
                                                    key={link.id}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-colors duration-300 relative overflow-hidden ${isActive 
                                                        ? 'bg-black/10 dark:bg-white/15 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-black/20 dark:border-black/10 dark:border-white/20 text-white' 
                                                        : 'bg-white/50 dark:bg-black/20 backdrop-blur-xl border-black/5 dark:border-white/5 text-black/80 dark:text-white/80 hover:bg-black/5 dark:bg-white/5 hover:border-black/10 dark:border-black/5 dark:border-white/10 hover:text-black dark:hover:text-white'}`}
                                                >
                                                    
                                                    <i className={`${link.icon} text-2xl ${isActive ? '' : 'text-black/50 dark:text-white/50'}`}></i>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-left leading-snug drop-shadow-sm">{link.label}</span>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}



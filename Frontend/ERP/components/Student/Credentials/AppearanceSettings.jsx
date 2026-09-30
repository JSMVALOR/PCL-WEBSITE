/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useEffect, useState } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";

export default function AppearanceSettings() {
    const { activeTheme, changeTheme, navLayout, changeNavLayout, sidebarMode, changeSidebarMode } = useERP();

        const allThemes = [
        { id: 'prudentia-classic', name: 'Prudentia Classic', desc: 'Signature Beige & Chocolate', icon: 'fa-scale-balanced', gradient: 'bg-gradient-to-br from-[#efece3] via-[#efece3] to-[#e8e4d8]', accent: 'bg-[#4A3B32]' },
        { id: 'apple-hig-light', name: 'Pristine Alabaster', desc: 'Clean White & Red', icon: 'fa-sun', gradient: 'bg-gradient-to-br from-white via-white to-gray-100', accent: 'bg-[#E11D48]' },
        { id: 'midnight-justice', name: 'Obsidian Crimson', desc: 'Deep Black & Red', icon: 'fa-moon', gradient: 'bg-gradient-to-br from-black via-zinc-900 to-black', accent: 'bg-[#DC2626]' },
        { id: 'marble-executive', name: 'Nordic Slate', desc: 'Cool Slate & Rose', icon: 'fa-cloud-moon', gradient: 'bg-gradient-to-br from-slate-800 via-[#0B1120] to-slate-900', accent: 'bg-[#EF4444]' },
        { id: 'emerald-chancery', name: 'Rosewood Executive', desc: 'Warm White & Mahogany', icon: 'fa-leaf', gradient: 'bg-gradient-to-br from-red-50 via-white to-orange-50', accent: 'bg-[#991B1B]' },
        { id: 'crimson-advocate', name: 'Velvet Midnight', desc: 'Deep Plum & Ruby', icon: 'fa-gem', gradient: 'bg-gradient-to-br from-[#2E0A16] via-[#1A050C] to-black', accent: 'bg-[#FDA4AF]' },
        { id: 'imperial-crown', name: 'Autumn Hearth', desc: 'Warm Sand & Orange', icon: 'fa-fire', gradient: 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200', accent: 'bg-[#EA580C]' },
        { id: 'structural-neo-brutalism', name: 'Neo-Brutalism', desc: 'High Contrast Red', icon: 'fa-cube', gradient: 'bg-white', accent: 'bg-[#FF0000]' }
    ];
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const themes = allThemes;
    
    
    return (
        <div className="flex flex-col gap-8 max-w-5xl animate-fade-in pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className={`${theme.ui.logoBox} text-themeAccent border-themeBorderStrong bg-themePanel`}>
                    <i className="fa-solid fa-palette text-xl"></i>
                </div>
                <div>
                    <h2 className={`${theme.text.heading} text-2xl`}>Appearance</h2>
                    <p className={`${theme.text.secondary} text-xs tracking-normal mt-1`}>Customize your environment</p>
                </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {themes.map((t) => (
                    <button 
                        key={t.id} 
                        type="button" 
                        onClick={() => changeTheme(t.id)} 
                        className={`group relative overflow-hidden flex flex-col text-left p-6 transition-all duration-300 outline-none rounded-themePanel border
                        ${activeTheme === t.id 
                            ? `${theme.layout.panel} border-themeAccent ring-1 ring-themeAccent shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]` 
                            : `${theme.layout.panel} border-themeBorder hover:border-themeAccent/50`}
                        `}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-150 ${t.gradient}`}></div>
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between w-full">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-themeBorder dark:border-white/10 ${t.gradient} shadow-lg`}>
                                    <i className={`fa-solid ${t.icon} text-themeText dark:text-white`}></i>
                                </div>
                                {activeTheme === t.id && (
                                    <div className="w-6 h-6 rounded-full bg-themeAccent/20 flex items-center justify-center border border-themeAccent/50 text-themeAccent">
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </div>
                                )}
                            </div>

                            {/* Mini UI Preview */}
                            <div className={`w-full h-16 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 flex shadow-inner ${t.gradient}`}>
                                {/* Mini Sidebar */}
                                <div className={`w-1/4 h-full border-r border-black/5 dark:border-white/10 ${['apple-hig-light', 'marble-executive'].includes(t.id) ? 'bg-white/60' : 'bg-black/40'}`}>
                                    <div className={`w-full h-2 mt-2 ${['apple-hig-light', 'marble-executive'].includes(t.id) ? 'bg-gray-50 dark:bg-black/20' : 'bg-white/20'} mx-auto w-3/4 rounded-full`}></div>
                                    <div className={`w-full h-1 mt-2 ${t.accent} mx-auto w-1/2 rounded-full`}></div>
                                </div>
                                {/* Mini Content */}
                                <div className="w-3/4 h-full p-2 flex flex-col gap-1">
                                    <div className={`w-1/3 h-1.5 rounded-full ${['apple-hig-light', 'marble-executive'].includes(t.id) ? 'bg-black/40' : 'bg-white/40'}`}></div>
                                    <div className={`w-full h-6 rounded-md border border-black/5 dark:border-white/5 mt-1 ${['apple-hig-light', 'marble-executive'].includes(t.id) ? 'bg-white/60' : 'bg-black/40'}`}></div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className={`font-black text-sm tracking-tight mb-1 ${activeTheme === t.id ? 'text-themeAccent' : 'text-themeText'}`}>
                                    {t.name}
                                </h3>
                                <p className={`text-[10px] tracking-normal ${theme.text.muted} leading-relaxed`}>{t.desc}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            
            {/* Navigation Layout & Density */}
            <div className="grid grid-cols-1 gap-8 mt-4 pt-8 border-t border-themeBorder">
                
                {/* Desktop Navigation */}
                <div className="flex flex-col gap-5">
                    <h3 className={`text-[14px] font-medium text-themeText tracking-normal flex items-center gap-2 px-1`}>
                        <i className="fa-solid fa-layer-group text-themeAccent"></i> Desktop Navigation
                    </h3>
                    <div className="flex flex-col gap-4">
                        <button type="button" onClick={() => changeNavLayout('classic')}
                            className={`group flex items-start gap-4 p-5 rounded-themePanel border transition-all duration-300 outline-none ${
                            navLayout === 'classic' ? `${theme.layout.panel} border-themeAccent ring-1 ring-themeAccent` : `${theme.layout.panel} border-themeBorder hover:border-themeAccent/50`}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${navLayout === 'classic' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-themeElevated text-themeTextSec border-themeBorder'}`}>
                                <i className="fa-solid fa-sidebar text-lg"></i>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className={`font-black text-sm ${navLayout === 'classic' ? 'text-themeAccent' : 'text-themeText'}`}>Classic Sidebar</h3>
                                <p className={`text-[10px] tracking-normal ${theme.text.muted} mt-1`}>Traditional vertical sidebar</p>
                            </div>
                        </button>

                        <button type="button" onClick={() => changeNavLayout('topnav')}
                            className={`group flex items-start gap-4 p-5 rounded-themePanel border transition-all duration-300 outline-none ${
                            navLayout === 'topnav' ? `${theme.layout.panel} border-themeAccent ring-1 ring-themeAccent` : `${theme.layout.panel} border-themeBorder hover:border-themeAccent/50`}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${navLayout === 'topnav' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-themeElevated text-themeTextSec border-themeBorder'}`}>
                                <i className="fa-solid fa-window-maximize text-lg"></i>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className={`font-black text-sm ${navLayout === 'topnav' ? 'text-themeAccent' : 'text-themeText'}`}>Mega-Menu</h3>
                                <p className={`text-[10px] tracking-normal ${theme.text.muted} mt-1`}>Modern horizontal top bar</p>
                            </div>
                        </button>
                    </div>
                </div>

        </div>
    </div>
    );
}

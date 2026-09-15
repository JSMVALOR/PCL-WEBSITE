import React from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";

export default function AppearanceSettings() {
    const { activeTheme, changeTheme, navLayout, changeNavLayout, sidebarMode, changeSidebarMode } = useERP();

    const themes = [
        { id: 'dark-luxury', name: 'Obsidian Glass', desc: 'Ultra-Dark Slate & Gold', icon: 'fa-moon', gradient: 'bg-gradient-to-br from-neutral-800 via-[#0a0a0a] to-black', accent: 'bg-[#D4AF37]' },
        { id: 'marble-executive', name: 'Arctic Frost', desc: 'Bright Crystal & Blue', icon: 'fa-sun', gradient: 'bg-gradient-to-br from-slate-50 via-white to-slate-200', accent: 'bg-[#1E3A8A]' },
        { id: 'midnight-justice', name: 'Midnight Sapphire', desc: 'Deep Ocean & Platinum', icon: 'fa-cloud-moon', gradient: 'bg-gradient-to-br from-slate-800 via-[#0B1120] to-blue-950', accent: 'bg-[#E2E8F0]' },
        { id: 'emerald-chancery', name: 'Emerald Prism', desc: 'Abyssal Green & Brass', icon: 'fa-tree', gradient: 'bg-gradient-to-br from-[#0a1f18] via-[#061410] to-black', accent: 'bg-[#CBA86B]' },
        { id: 'crimson-advocate', name: 'Ruby Quartz', desc: 'Smoked Crimson', icon: 'fa-droplet', gradient: 'bg-gradient-to-br from-[#1a0a0a] via-[#110707] to-black', accent: 'bg-[#FCA5A5]' },
        { id: 'imperial-crown', name: 'Amethyst Shard', desc: 'Violet Glass & Gold', icon: 'fa-crown', gradient: 'bg-gradient-to-br from-[#1a0f2e] via-[#0B0710] to-black', accent: 'bg-[#FDE047]' }
    ];

    return (
        <div className="flex flex-col gap-8 max-w-5xl animate-fade-in pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className={`${theme.ui.logoBox} text-themeAccent border-themeBorderStrong bg-themePanel`}>
                    <i className="fa-solid fa-palette text-xl"></i>
                </div>
                <div>
                    <h2 className={`${theme.text.heading} text-2xl`}>Appearance</h2>
                    <p className={`${theme.text.secondary} text-xs uppercase tracking-widest mt-1`}>Customize your environment</p>
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${t.gradient} shadow-lg`}>
                                    <i className={`fa-solid ${t.icon} text-white`}></i>
                                </div>
                                {activeTheme === t.id && (
                                    <div className="w-6 h-6 rounded-full bg-themeAccent/20 flex items-center justify-center border border-themeAccent/50 text-themeAccent">
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </div>
                                )}
                            </div>

                            {/* Mini UI Preview */}
                            <div className="w-full h-16 rounded-lg overflow-hidden border border-white/5 flex shadow-inner" style={{ background: 'var(--bg-color)' }}>
                                {/* Mini Sidebar */}
                                <div className="w-1/4 h-full border-r border-white/5" style={{ background: 'var(--panel-bg)' }}>
                                    <div className="w-full h-2 mt-2 bg-[var(--text-muted)] opacity-20 mx-auto w-3/4 rounded-full"></div>
                                    <div className="w-full h-1 mt-2 bg-[var(--primary-color)] mx-auto w-1/2 rounded-full"></div>
                                </div>
                                {/* Mini Content */}
                                <div className="w-3/4 h-full p-2 flex flex-col gap-1">
                                    <div className="w-1/3 h-1.5 rounded-full bg-[var(--text-color)] opacity-50"></div>
                                    <div className="w-full h-6 rounded-md border border-white/5 mt-1" style={{ background: 'var(--panel-bg)' }}></div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className={`font-black text-sm tracking-tight mb-1 ${activeTheme === t.id ? 'text-themeAccent' : 'text-themeText'}`}>
                                    {t.name}
                                </h3>
                                <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} leading-relaxed`}>{t.desc}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            
            {/* Navigation Layout & Density */}
            <div className="grid grid-cols-1 gap-8 mt-4 pt-8 border-t border-themeBorder">
                
                {/* Desktop Navigation */}
                <div className="flex flex-col gap-5">
                    <h3 className={`text-xs font-black text-themeText uppercase tracking-widest flex items-center gap-2 px-1`}>
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
                                <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} mt-1`}>Traditional vertical sidebar</p>
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
                                <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} mt-1`}>Modern horizontal top bar</p>
                            </div>
                        </button>
                    </div>
                </div>

        </div>
    </div>
    );
}

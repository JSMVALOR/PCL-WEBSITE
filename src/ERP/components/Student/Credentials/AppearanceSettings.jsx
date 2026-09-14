/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";

export default function AppearanceSettings() {
 const { activeTheme, changeTheme, navLayout, changeNavLayout, sidebarMode, changeSidebarMode } = useERP();

 const themes = [
 { 
 id: 'dark-luxury', 
 name: 'Obsidian Glass', 
 desc: 'Ultra-Dark Frosted Slate & Gold', 
 icon: 'fa-moon', 
 gradient: 'bg-gradient-to-br from-neutral-800 via-[#0a0a0a] to-black',
 accent: 'bg-[#D4AF37]',
 circles: 'border-[#D4AF37]/20',
 },
 { 
 id: 'marble-executive', 
 name: 'Arctic Frost', 
 desc: 'Bright Crystal & Executive Blue', 
 icon: 'fa-sun', 
 gradient: 'bg-gradient-to-br from-slate-50 via-white to-slate-200',
 accent: 'bg-[#1E3A8A]',
 circles: 'border-[#1E3A8A]/10',
 },
 { 
 id: 'midnight-justice', 
 name: 'Midnight Sapphire', 
 desc: 'Deep Ocean Glass & Platinum', 
 icon: 'fa-cloud-moon', 
 gradient: 'bg-gradient-to-br from-slate-800 via-[#0B1120] to-blue-950',
 accent: 'bg-[#E2E8F0]',
 circles: 'border-[#E2E8F0]/10',
 },
 { 
 id: 'emerald-chancery', 
 name: 'Emerald Prism', 
 desc: 'Abyssal Green & Brass', 
 icon: 'fa-tree', 
 gradient: 'bg-gradient-to-br from-[#0a1f18] via-[#061410] to-black',
 accent: 'bg-[#CBA86B]',
 circles: 'border-[#CBA86B]/20',
 },
 { 
 id: 'crimson-advocate', 
 name: 'Ruby Quartz', 
 desc: 'Smoked Crimson & Platinum', 
 icon: 'fa-droplet', 
 gradient: 'bg-gradient-to-br from-[#1a0a0a] via-[#110707] to-black',
 accent: 'bg-[#FCA5A5]',
 circles: 'border-[#FCA5A5]/20',
 },
 { 
 id: 'imperial-crown', 
 name: 'Amethyst Shard', 
 desc: 'Violet Glass & Sovereign Gold', 
 icon: 'fa-crown', 
 gradient: 'bg-gradient-to-br from-[#1a0f2e] via-[#0B0710] to-black',
 accent: 'bg-[#FDE047]',
 circles: 'border-[#FDE047]/20',
 },
 { 
 id: 'structural-neo-brutalism', 
 name: 'Structural Brutalism', 
 desc: 'Raw Edges & High Contrast', 
 icon: 'fa-cube', 
 gradient: 'bg-[#f4f4f0] border-4 border-black',
 accent: 'bg-[#FF3333]',
 circles: 'border-black/10',
 specialBorder: 'border-b-4 border-black',
 },
 ];

 return (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
 {/* Header */}
 <div className="flex items-center gap-3 lg:gap-4 border-b border-black/10 dark:border-white/20 pb-4 lg:pb-6">
 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] rounded-2xl shadow-sm flex items-center justify-center text-themeAccent shrink-0">
 <i className="fa-solid fa-wand-magic-sparkles text-lg lg:text-xl"></i>
 </div>
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-2xl`}>Appearance &amp; Themes</h2>
 <p className={`${theme.text.secondary} text-xs uppercase tracking-widest mt-1`}>Customize your digital workspace</p>
 </div>
 </div>

 {/* Themes Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
 {themes.map(t => {
 const isActive = activeTheme === t.id;
 return (
 <button
 key={t.id}
 onClick={() => changeTheme(t.id)}
 className={`group flex flex-col text-left rounded-2xl overflow-hidden border-theme transition duration-300 relative outline-none ${
 isActive
 ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-themeAccent border-themeAccent scale-[1.02]'
 : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-transparent hover:border-themeAccent/30 hover:-translate-y-1'
 }`}
 >
 {isActive && (
 <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-themeAccent/20 flex items-center justify-center text-themeAccent z-20 backdrop-blur-md border border-themeAccent/30">
 <i className="fa-solid fa-check text-[10px] font-black"></i>
 </div>
 )}

 {/* Theme Illustration Header */}
 <div className={`w-full h-32 ${t.gradient} relative overflow-hidden flex items-center justify-center ${t.specialBorder || 'border-b border-black/10 dark:border-white/20'}`}>
 {/* Abstract Geometric Overlay */}
 <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 ${t.circles} opacity-50 mix-blend-overlay group-hover:scale-110 transition-transform duration-700`}></div>
 <div className={`absolute -left-4 -bottom-4 w-24 h-24 rounded-full border-4 ${t.circles} opacity-30 mix-blend-overlay group-hover:-translate-x-2 transition-transform duration-700`}></div>
 
 {/* UI Mockup Miniature */}
 <div className="w-3/4 h-20 bg-white/5 backdrop-blur-md rounded-lg border border-black/5 dark:border-white/10 flex flex-col p-2 gap-2 transform group-hover:-translate-y-1 transition-transform duration-500 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
 {/* Mockup Header */}
 <div className="flex justify-between items-center w-full">
 <div className="flex gap-1.5">
 <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
 <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
 <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
 </div>
 <div className={`w-12 h-1.5 rounded-full ${t.accent} opacity-80`}></div>
 </div>
 {/* Mockup Body */}
 <div className="flex gap-2 h-full mt-1">
 <div className="w-1/4 h-full bg-white/10 rounded-md border border-black/10 dark:border-white/20"></div>
 <div className="flex-1 flex flex-col gap-1.5">
 <div className="w-full h-3 bg-white/10 rounded-sm border border-black/10 dark:border-white/20"></div>
 <div className="w-3/4 h-3 bg-white/10 rounded-sm border border-black/10 dark:border-white/20"></div>
 </div>
 </div>
 </div>
 </div>

 {/* Theme Details */}
 <div className="p-4 flex flex-col flex-1">
 <div className="flex items-center gap-2 mb-1">
 <i className={`fa-solid ${t.icon} text-xs ${isActive ? 'text-themeAccent' : 'text-themeTextSec'} group-hover:rotate-12 transition-transform`}></i>
 <h3 className={`font-black text-sm tracking-tight ${isActive ? 'text-themeAccent' : 'text-themeText'}`}>{t.name}</h3>
 </div>
 <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} mt-1 leading-relaxed`}>{t.desc}</p>
 </div>
 </button>
 );
 })}
 </div>
 
 {/* Desktop Navigation Layout Section */}
 <div className="hidden lg:flex flex-col gap-5 mt-6 border-t border-black/10 dark:border-white/20 pt-6 lg:pt-8">
 <div className="flex items-center gap-3 lg:gap-4">
 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] rounded-2xl shadow-sm flex items-center justify-center text-themeAccent shrink-0">
 <i className="fa-solid fa-layer-group text-lg lg:text-xl"></i>
 </div>
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-2xl`}>Desktop Navigation</h2>
 <p className={`${theme.text.secondary} text-xs uppercase tracking-widest mt-1`}>Choose your preferred layout for large screens</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
 {/* Classic Sidebar */}
 <button
 onClick={() => changeNavLayout('classic')}
 className={`group flex items-start gap-4 text-left p-5 lg:p-6 rounded-2xl border-theme transition duration-300 outline-none ${
 navLayout === 'classic'
 ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-themeAccent border-themeAccent'
 : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-transparent hover:border-themeAccent/30'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${navLayout === 'classic' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-transparent text-themeTextSec border-black/10 dark:border-white/20 group-hover:text-themeText'}`}>
 <i className="fa-solid fa-sidebar text-lg"></i>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between w-full mb-1">
 <h3 className={`font-black text-sm tracking-tight ${navLayout === 'classic' ? 'text-themeAccent' : 'text-themeText'}`}>Classic Sidebar</h3>
 {navLayout === 'classic' && <i className="fa-solid fa-check text-themeAccent text-xs"></i>}
 </div>
 <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} leading-relaxed`}>Traditional left-aligned vertical sidebar</p>
 </div>
 </button>

 {/* Top Navigation */}
 <button
 onClick={() => changeNavLayout('topnav')}
 className={`group flex items-start gap-4 text-left p-5 lg:p-6 rounded-2xl border-theme transition duration-300 outline-none ${
 navLayout === 'topnav'
 ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-themeAccent border-themeAccent'
 : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-transparent hover:border-themeAccent/30'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${navLayout === 'topnav' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-transparent text-themeTextSec border-black/10 dark:border-white/20 group-hover:text-themeText'}`}>
 <i className="fa-solid fa-window-maximize text-lg"></i>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between w-full mb-1">
 <h3 className={`font-black text-sm tracking-tight ${navLayout === 'topnav' ? 'text-themeAccent' : 'text-themeText'}`}>Mega-Menu</h3>
 {navLayout === 'topnav' && <i className="fa-solid fa-check text-themeAccent text-xs"></i>}
 </div>
 <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} leading-relaxed`}>Modern horizontal top bar with dropdowns</p>
 </div>
 </button>
 </div>
 </div>

 {/* Sidebar Density Section */}
 <div className="hidden lg:flex flex-col gap-5 mt-6 border-t border-black/10 dark:border-white/20 pt-6 lg:pt-8">
 <div className="flex items-center gap-3 lg:gap-4">
 <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] rounded-2xl shadow-sm flex items-center justify-center text-themeAccent shrink-0">
 <i className="fa-solid fa-list-check text-lg lg:text-xl"></i>
 </div>
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-2xl`}>Sidebar Density</h2>
 <p className={`${theme.text.secondary} text-xs uppercase tracking-widest mt-1`}>Choose your preferred sidebar depth</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
 {/* Hubs Mode */}
 <button
 onClick={() => changeSidebarMode('hubs')}
 className={`group flex items-start gap-4 text-left p-5 lg:p-6 rounded-2xl border-theme transition duration-300 outline-none ${
 sidebarMode === 'hubs'
 ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-themeAccent border-themeAccent'
 : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-transparent hover:border-themeAccent/30'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${sidebarMode === 'hubs' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-transparent text-themeTextSec border-black/10 dark:border-white/20 group-hover:text-themeText'}`}>
 <i className="fa-solid fa-layer-group text-lg"></i>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between w-full mb-1">
 <h3 className={`font-black text-sm tracking-tight ${sidebarMode === 'hubs' ? 'text-themeAccent' : 'text-themeText'}`}>Hubs Mode</h3>
 {sidebarMode === 'hubs' && <i className="fa-solid fa-check text-themeAccent text-xs"></i>}
 </div>
 <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} leading-relaxed`}>Clean sidebar. Tools are grouped into massive Central Hubs.</p>
 </div>
 </button>

 {/* Expanded Mode */}
 <button
 onClick={() => changeSidebarMode('expanded')}
 className={`group flex items-start gap-4 text-left p-5 lg:p-6 rounded-2xl border-theme transition duration-300 outline-none ${
 sidebarMode === 'expanded'
 ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-themeAccent border-themeAccent'
 : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-transparent hover:border-themeAccent/30'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${sidebarMode === 'expanded' ? 'bg-themeAccent/10 text-themeAccent border-themeAccent/20' : 'bg-transparent text-themeTextSec border-black/10 dark:border-white/20 group-hover:text-themeText'}`}>
 <i className="fa-solid fa-list text-lg"></i>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between w-full mb-1">
 <h3 className={`font-black text-sm tracking-tight ${sidebarMode === 'expanded' ? 'text-themeAccent' : 'text-themeText'}`}>Expanded Mode</h3>
 {sidebarMode === 'expanded' && <i className="fa-solid fa-check text-themeAccent text-xs"></i>}
 </div>
 <p className={`text-[10px] uppercase tracking-widest ${theme.text.muted} leading-relaxed`}>All tools directly accessible from the sidebar with dropdown submenus.</p>
 </div>
 </button>
 </div>
 </div>
 </div>
 );
}

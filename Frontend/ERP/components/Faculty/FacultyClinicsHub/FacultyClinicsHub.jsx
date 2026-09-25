/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import AdminMootCourt from "../../Admin/AdminMootCourt/AdminMootCourt";
import AdminPlacements from "../../Admin/AdminPlacements/AdminPlacements";
import AdminLegalAid from "../../Admin/AdminLegalAid/AdminLegalAid";

export default function FacultyClinicsHub() {
    const [activeTab, setActiveTab] = useState("mootcourt");

    const tabs = [
        { id: "mootcourt", label: "Moot Court", icon: "fa-gavel" },
        { id: "placements", label: "Placements", icon: "fa-briefcase" },
        { id: "legalaid", label: "Legal Aid", icon: "fa-hand-holding-hand" }
    ];

    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                
                {/* Premium Vibrant Header */}
                <div className="relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl p-6 lg:p-8 z-10 flex flex-col gap-6">
                    {/* Background Gradients */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4"></div>
                                <i className="fa-solid fa-scale-balanced relative z-10"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white flex items-center gap-3">
                                    Clinics & Programs
                                </h1>
                                <p className="text-sm font-medium text-themeTextSec mt-1">Oversight for moot court, placements, and legal aid societies.</p>
                            </div>
                        </div>
                    </div>

                    {/* Premium Mobile-Optimized Tab Bar */}
                    <div className="relative w-full max-w-full -mx-4 sm:mx-0 px-4 sm:px-0">
                        <div className="flex p-1.5 sm:p-2 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-xl sm:rounded-[1.25rem] border-y sm:border border-black/5 dark:border-white/5 gap-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`snap-center shrink-0 px-5 sm:px-6 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap relative overflow-hidden group ${
                                        activeTab === tab.id
                                            ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-md border border-black/5 dark:border-white/10'
                                            : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}>
                                    
                                    {/* Subtle glow for active tab */}
                                    {activeTab === tab.id && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-50"></div>
                                    )}
                                    
                                    <i className={`fa-solid ${tab.icon} relative z-10 ${activeTab === tab.id ? 'text-amber-500 drop-shadow-md' : 'group-hover:scale-110 transition-transform'}`}></i> 
                                    <span className="relative z-10 tracking-wide">{tab.label}</span>
                                    
                                    {/* Animated bottom indicator line */}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-amber-500 rounded-t-full shadow-[0_-2px_10px_currentColor]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-visible min-h-[500px]">
                    <div className="w-full h-full animate-fade-in -mt-10">
                        {activeTab === "mootcourt" && <AdminMootCourt />}
                        {activeTab === "placements" && <AdminPlacements />}
                        {activeTab === "legalaid" && <AdminLegalAid />}
                    </div>
                </div>

            </div>
        </div>
    );
}

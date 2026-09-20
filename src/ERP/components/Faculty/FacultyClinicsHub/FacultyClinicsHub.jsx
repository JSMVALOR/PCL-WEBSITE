/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import AdminMootCourt from "../../Admin/AdminMootCourt/AdminMootCourt";
import AdminPlacements from "../../Admin/AdminPlacements/AdminPlacements";
import AdminLegalAid from "../../Admin/AdminLegalAid/AdminLegalAid";

export default function FacultyClinicsHub({ isEmbedded = false }) {
 const [activeTab, setActiveTab] = useState("mootcourt");

 const tabs = [
 { id: "mootcourt", label: "Moot Court Society", icon: "fa-scale-balanced" },
 { id: "placements", label: "Placements & Drives", icon: "fa-briefcase" },
 { id: "legalaid", label: "Legal Aid Clinic (CLE)", icon: "fa-hand-holding-hand" },
 ];

 return (
 <div className={isEmbedded ? "flex flex-col gap-6" : "w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-32 xl:pb-8 animate-fade-in selection:bg-themeElevated"}>
 {/* HEADER */}
 {!isEmbedded && (
 <PageHeader 
 icon="fa-solid fa-gavel" 
 title="Clinics & Societies" 
 subtitle="Manage moot court activities, oversee placements, and review CLE diaries." 
 />
 )}

 {/* BETA BANNER */}
 <div className="relative bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 overflow-hidden">
     <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
     <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
         <i className="fa-solid fa-flask text-lg"></i>
     </div>
     <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2 flex-wrap">
             <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 tracking-tight">Under Construction</h4>
             <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-black uppercase tracking-widest">Beta</span>
         </div>
         <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">This module is in active development. Features below are previews and may change.</p>
     </div>
 </div>
 
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-md rounded-2xl border border-themeBorder dark:border-white/5 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {tabs.map((t) => (
 <button type="button"
 key={t.id}
 onClick={() => setActiveTab(t.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === t.id 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-themeText border border-black/10 dark:border-white/40 scale-100' 
 : 'text-themeTextSec opacity-80 hover:text-themeText hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${t.icon} ${activeTab === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
 </button>
 ))}
 </div>

 {/* ═══ RENDER SUB-MODULE ═══ */}
 <div className="animate-fade-in">
 {activeTab === "mootcourt" && <AdminMootCourt isHubView={true} />}
 {activeTab === "placements" && <AdminPlacements isHubView={true} />}
 {activeTab === "legalaid" && <AdminLegalAid isHubView={true} />}
 </div>
 </div>
 );
}

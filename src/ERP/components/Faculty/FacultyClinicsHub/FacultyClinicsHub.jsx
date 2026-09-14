/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from '../../../../Shared/theme';
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
 <div className={isEmbedded ? "flex flex-col gap-6" : "w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated"}>
 {/* HEADER */}
 {!isEmbedded && (
 <PageHeader 
 icon="fa-solid fa-gavel" 
 title="Clinics & Societies" 
 subtitle="Manage moot court activities, oversee placements, and review CLE diaries." 
 />
 )}
 
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-md rounded-2xl border border-white/5 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {tabs.map((t) => (
 <button
 key={t.id}
 onClick={() => setActiveTab(t.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
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

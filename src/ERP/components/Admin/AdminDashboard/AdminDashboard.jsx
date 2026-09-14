/* © 2026 JSM VALOR. All Rights Reserved. */
import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";

import React, { useState } from "react";
import BirthdayWidget from "../../shared/BirthdayWidget";
import PageHeader from "../../shared/PageHeader/PageHeader";
import AdminHeroBanner from "./AdminHeroBanner";
import { AdminCampusPulse, AdminSystemVitals } from "../../shared/DashboardWidgets";
import AdminKPIGrid from "./AdminKPIGrid";
import AdminOverview from "./AdminOverview";
import OrganizationDirectory from "../../shared/OrganizationDirectory/OrganizationDirectory";

import AdminRightSidebar from "./AdminRightSidebar";
// AdminFAB removed to prevent overlap with IntelligentBot

export default function AdminDashboard({ setActiveTab, isEmbedded = false }) {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [viewMode, setViewMode] = useState('dashboard');

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 {/* Mobile Utility Toggle */}
 <div className="xl:hidden w-full flex justify-between items-center mb-4 bg-themePanel/85 backdrop-blur-2xl p-3 rounded-2xl border border-white/5 animate-fade-in">
 <span className="text-xs font-bold text-themeTextSec flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> Utilities & Monitors</span>
 <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 bg-themeElevated/90 backdrop-blur-2xl px-3 py-1.5 rounded-lg border border-white/5 text-themeText hover:border-themeAccent transition-colors">
 <i className="fa-solid fa-bars"></i>
 <span className="text-[10px] font-black uppercase tracking-widest">Open Panel</span>
 </button>
 </div>
 <div className="xl:col-span-12 w-full">
 {/* Row 1: Operations Banner */}
 
 <AdminHeroBanner />

 </div>

 {/* DASHBOARD / ORGANIZATION TOGGLE */}
 <div className="w-full flex justify-center sm:justify-start mb-6">
 <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/10 shrink-0 shadow-inner">
 <button 
 onClick={() => setViewMode('dashboard')}
 className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
 viewMode === 'dashboard' ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-[#007AFF] shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
 }`}
 >
 Overview
 </button>
 <button 
 onClick={() => setViewMode('organization')}
 className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
 viewMode === 'organization' ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-[#007AFF] shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
 }`}
 >
 Organization
 </button>
 </div>
 </div>



 
 

 {viewMode === 'organization' ? (
 <OrganizationDirectory />
 ) : (

 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
 
 {/* Main Content Area (9 Columns) */}
 <div className="xl:col-span-9 flex flex-col gap-8 pb-32 xl:pb-12 min-w-0 animate-fade-in">
 

 {/* MAIN CONTENT WIDGETS */}
 <div className="flex flex-col w-full animate-fade-in-up">
 <AdminSystemVitals />
 </div>

 
 {/* Row 2: 6 KPI Cards */}
 <AdminKPIGrid setActiveTab={setActiveTab} />

 {/* Row 3: Graph, Insights, Tasks */}
 <AdminOverview />




 </div>

 {/* Right Sidebar (Drawer on Mobile, Column on Desktop) */}
 <>
 {/* Overlay */}
 {isSidebarOpen && (
 <div 
 className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm" 
 onClick={() => setIsSidebarOpen(false)}
 ></div>
 )}
 
 <div className={`
 fixed xl:relative top-0 right-0 h-full xl:h-auto w-[320px] sm:w-[380px] xl:w-auto 
 bg-themeApp xl:bg-transparent z-50 xl:z-auto 
 p-6 xl:p-0 overflow-y-auto xl:overflow-visible no-scrollbar
 transition duration-300 ease-in-out
 ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none xl:pointer-events-auto xl:opacity-100 xl:translate-x-0'}
 xl:col-span-3 flex flex-col min-w-0 pb-28 xl:pb-0 border-l-[length:var(--border-width)] border-white/5 xl:border-none
 `}>
 <div className="xl:hidden flex justify-between items-center mb-6">
 <h2 className="text-sm font-black text-themeText tracking-tight flex items-center gap-2"><i className="fa-solid fa-layer-group text-themeTextSec"></i> Utilities</h2>
 <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl flex items-center justify-center text-themeTextSec border border-white/5 hover:text-themeText transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 <div className="shrink-0 mb-6">
 <UpdatesCarousel notices={[]} onNoticesClick={() => setActiveTab('broadcasts')} />
 </div>
 <AdminRightSidebar setActiveTab={setActiveTab} />
 </div>
 </>

 </div>
 )}

 {/* Floating Action Button */}
 {/* FAB Removed */}

 </div>
 </div>
 );
}
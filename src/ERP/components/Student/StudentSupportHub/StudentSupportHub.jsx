/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { motion } from 'framer-motion';
import React, { useState } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import StudentApprovals from "../Approvals/StudentApprovals";
import Helpdesk from "../Helpdesk/Helpdesk";

export default function StudentSupportHub() {
 const [activeCategory, setActiveCategory] = useState("admin");
 const [activeTab, setActiveTab] = useState("approvals");

 const categories = [
 { id: "admin", label: "Administration", icon: "fa-stamp" },
 { id: "guidance", label: "Help & Guidance", icon: "fa-hands-holding-circle" }
 ];

 const tabs = {
 admin: [
 { id: "approvals", label: "Approvals & Grievances", icon: "fa-file-signature" }
 ],
 guidance: [
 { id: "helpdesk", label: "IT Helpdesk", icon: "fa-headset" }
 ]
 };

 const handleCategoryChange = (categoryId) => {
 setActiveCategory(categoryId);
 setActiveTab(tabs[categoryId][0].id);
 };

 return (
 <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
 <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">
 {/* ═══ MASTER HUB HEADER ═══ */}
 <div className={`w-full relative overflow-hidden rounded-[2rem] p-6 lg:p-8 flex flex-col gap-6 bg-white/10 backdrop-blur-[80px] border border-white/20`}>
 

 <div className="flex items-center gap-4 lg:gap-5 relative z-10">
 <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
 <i className="fa-solid fa-headset text-white text-2xl lg:text-3xl"></i>
 </div>
 <div>
 <span className="px-2 lg:px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 inline-block">Student Support</span>
 <h1 className={`${theme.text.display} text-2xl lg:text-3xl tracking-tight text-white mb-1`}>Support Center</h1>
 <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage fee payments, approvals, and connect with mentors.</p>
 </div>
 </div>

 {/* Dual-Line Navigation System */}
 <div className="flex flex-col gap-3 relative z-10">
 <div className="flex flex-wrap gap-2 w-fit">
 {categories.map((cat) => (
 <button
 key={cat.id}
 onClick={() => handleCategoryChange(cat.id)}
 className={`px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex items-center gap-2 ${
 activeCategory === cat.id 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-themeText border border-black/10 dark:border-white/40 scale-100' 
 : 'text-themeTextSec opacity-80 hover:text-themeText hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
 </button>
 ))}
 </div>

 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {tabs[activeCategory].map((t) => (
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
 </div>
 </div>

 <div className="animate-fade-in">
 {activeTab === "approvals" && <StudentApprovals />}
 {activeTab === "helpdesk" && <Helpdesk />}
 </div>
 </div></div></div></div>
 );
}

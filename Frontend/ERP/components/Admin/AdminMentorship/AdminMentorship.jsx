/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";

// Import modular components
import MentorshipDashboard from "./MentorshipDashboard";
import MentorshipAllocations from "./MentorshipAllocations";
import MentorshipTransfers from "./MentorshipTransfers";
import MentorshipReports from "./MentorshipReports";
import MentorshipLogs from "./MentorshipLogs";

export default function AdminMentorship({ isEmbedded = false,  isHubView = false }) {
 const [activeTab, setActiveTab] = useState("dashboard");

 const tabs = [
 { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
 { id: "allocations", label: "Mentor Allocation", icon: "fa-network-wired" },
 { id: "reports", label: "Reports", icon: "fa-file-csv" }
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-24 lg:pb-8 xl:pb-8`}>
 
 {/* Header and Tabs */}
 {!isHubView && (
<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-emerald-500 shadow-sm">
                <i className="fa-solid fa-server"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Mentorship Engine</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Centralized administration for mentor mapping</p>
            </div>
        </div>
    </div>
</div>
)}

<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4 px-4 lg:px-8">
    {tabs.map((tab) => (
        <button type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-themeTextSec border-transparent hover:text-themeText'}`}
        >
            <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i>
            {tab.label}
        </button>
    ))}
</div>

 {/* Main Content Area */}
 <div className="flex-1 w-full relative min-h-[500px] p-4 sm:p-6 lg:p-8">
 {activeTab === "dashboard" && <MentorshipDashboard setActiveTab={setActiveTab} />}
 {activeTab === "allocations" && <MentorshipAllocations />}
 {activeTab === "transfers" && <MentorshipTransfers />}
 {activeTab === "reports" && <MentorshipReports />}
 {activeTab === "logs" && <MentorshipLogs />}
 </div>
 </div>
 </div>
 );
}
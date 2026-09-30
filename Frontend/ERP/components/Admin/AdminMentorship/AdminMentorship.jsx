/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";

// Import modular components
import MentorshipDashboard from "./MentorshipDashboard";
import MentorshipAllocations from "./MentorshipAllocations";
import MentorshipTransfers from "./MentorshipTransfers";
import MentorshipReports from "./MentorshipReports";
import MentorshipLogs from "./MentorshipLogs";

export default function AdminMentorship({ isEmbedded = false, isHubView = false }) {
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
<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
 <PageHeader 
 icon="fa-solid fa-server" 
 title="Mentorship Engine" 
 subtitle="Centralized administration for mentor mapping" 
 />
</div>
)}

<div className="flex w-full border-b border-themeBorder dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6 mt-4 px-4 lg:px-8">
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
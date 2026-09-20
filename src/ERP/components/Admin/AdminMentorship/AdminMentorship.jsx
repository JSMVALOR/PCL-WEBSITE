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
 { id: "transfers", label: "Transfers & Reshuffle", icon: "fa-shuffle" },
 { id: "reports", label: "Reports", icon: "fa-file-csv" },
 { id: "logs", label: "Audit Logs", icon: "fa-list-check" }
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-server" title="Mentorship Engine" subtitle="Centralized administration for faculty-student mentor mapping." />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themePanel/85 backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`}>
 {tabs.map((tab) => (
 <button type="button"
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab.id ? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i>
 {tab.label}
 </button>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="flex-1 w-full relative min-h-[500px]">
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
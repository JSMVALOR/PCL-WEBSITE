/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";

// Sub-components (we'll implement these next)
import LeaveDashboard from "./LeaveDashboard";
import LeaveRequests from "./LeaveRequests";
import LeaveCalendar from "./LeaveCalendar";
import LeaveAnalytics from "./LeaveAnalytics";
import LeavePolicies from "./LeavePolicies";
import LeaveBlackouts from "./LeaveBlackouts";
import LeaveAudit from "./LeaveAudit";
import LeaveReview from "./LeaveReview"; // Detailed view of a request
import ReplacementEngine from "./ReplacementEngine";

export default function AdminLeaveManagement({ isHubView = false }) {
 const [activeTab, setActiveTab] = useState("dashboard");
 const [selectedRequest, setSelectedRequest] = useState(null); // When set, opens the Review page

 const handleReviewRequest = (request) => {
 setSelectedRequest(request);
 setActiveTab("review");
 };

 const handleCloseReview = () => {
 setSelectedRequest(null);
 setActiveTab("requests");
 };

 const tabs = [
 { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
 { id: "requests", label: "Leave Requests", icon: "fa-inbox" },
 { id: "calendar", label: "Calendar", icon: "fa-calendar-days" },
 { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
 { id: "policies", label: "Policies", icon: "fa-scale-balanced" },
    { id: "blackouts", label: "Blackouts", icon: "fa-lock" },
 { id: "audit", label: "Audit Log", icon: "fa-clipboard-list" }
 ];

 return (
 <div className={`w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-fade-in pb-20 lg:pb-8 ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
 
 {/* Header and Tab Navigation */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-plane-departure" title="Leave Management" subtitle="Manage faculty leaves and ensure academic continuity." />
 )}

 {/* Tab Navigation (Hidden when viewing a review) */}
 {activeTab !== "review" && (
 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-2xl backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 relative z-10 gap-1.5 overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8 w-fit max-w-full' : ''}`}>
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab.id 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white border border-black/10 dark:border-white/40 scale-100' 
 : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''} text-sm lg:text-base`}></i>
 <span>{tab.label}</span>
 </button>
 ))}
 </div>
 )}
 
 {/* Review Back Button */}
 {activeTab === "review" && (
 <div className="flex items-center gap-2 relative z-10 pt-2">
 <button
 onClick={handleCloseReview}
 className="px-5 py-3 bg-black/20 backdrop-blur-md border border-black/10 dark:border-white/20 hover:bg-white/20 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest text-white transition-colors flex items-center gap-2"
 >
 <i className="fa-solid fa-arrow-left"></i>
 Back to Requests
 </button>
 </div>
 )}

 {/* Main Content Area */}
 <div className="flex-1 w-full relative min-h-[500px]">
 {activeTab === "dashboard" && <LeaveDashboard setActiveTab={setActiveTab} />}
 {activeTab === "requests" && <LeaveRequests onReviewRequest={handleReviewRequest} />}
 {activeTab === "calendar" && <LeaveCalendar />}
 {activeTab === "analytics" && <LeaveAnalytics />}
 {activeTab === "policies" && <LeavePolicies />}
        {activeTab === "blackouts" && <LeaveBlackouts />}
 {activeTab === "audit" && <LeaveAudit />}
 {activeTab === "review" && selectedRequest && (
 <LeaveReview request={selectedRequest} onClose={handleCloseReview} onAssignReplacement={() => setActiveTab("replacement")} />
 )}
 {activeTab === "replacement" && selectedRequest && (
 <ReplacementEngine request={selectedRequest} onBack={() => setActiveTab("review")} onComplete={handleCloseReview} />
 )}
 </div>

 </div>
 );
}

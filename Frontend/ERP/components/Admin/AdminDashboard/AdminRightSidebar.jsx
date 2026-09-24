/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { useERP } from '../../../context/ErpContext';
import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";
import AdminCampusPulse from "../../shared/DashboardWidgets/AdminCampusPulse";

export default function AdminRightSidebar({ setActiveTab }) {
 const { userSession, notices } = useERP();

 const quickActions = [
 { label: 'Users', icon: 'fa-user-gear', tab: 'users' },
 { label: 'Admissions', icon: 'fa-id-card-clip', tab: 'adminadmissions' },
 { label: 'Approvals', icon: 'fa-shield-halved', tab: 'adminapprovals' },
 { label: 'Notice', icon: 'fa-bullhorn', tab: 'notices' }
 ];

 return (
 <div className="w-full flex flex-col gap-6">
 
 {/* Unified Campus Hub: Pulse + Actions */}
 <div className="w-full flex flex-col gap-4">
    <AdminCampusPulse />
    
    <div className="grid grid-cols-4 gap-2">
    {quickActions.map((action, i) => (
        <button type="button" 
            key={i} 
            onClick={() => setActiveTab && action.tab && setActiveTab(action.tab)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-[14px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] hover:bg-themeAccent/5 hover:border-themeAccent/30 transition-all group"
        >
            <i className={`fa-solid ${action.icon} text-sm text-themeTextSec group-hover:text-themeAccent group-hover:scale-110 transition-transform`}></i>
            <span className="text-[8px] font-black text-themeText uppercase tracking-widest text-center truncate w-full">{action.label}</span>
        </button>
    ))}
    </div>
 </div>

 {/* Notices Carousel */}
 <div className="w-full relative h-[360px]">
    <UpdatesCarousel userSession={userSession} notices={notices || []} onNoticesClick={() => setActiveTab('notices')} />
 </div>

 </div>
 );
}

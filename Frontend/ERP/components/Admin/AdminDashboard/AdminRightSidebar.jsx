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
 { label: 'Notice', icon: 'fa-bullhorn', tab: 'notices' },
 { label: 'WhatsApp', icon: 'fa-brands fa-whatsapp', tab: 'whatsapp' }
 ];

 return (
 <div className="w-full flex flex-col gap-4">
 
 {/* Unified Campus Hub: Pulse + Actions */}
 <div className="w-full flex flex-col gap-4">
 <AdminCampusPulse />
 
 <div className="grid grid-cols-5 gap-1.5">
 {quickActions.map((action, i) => (
 <button type="button" 
 key={i} 
 onClick={() => setActiveTab && action.tab && setActiveTab(action.tab)}
 className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-themePanel shadow-sm border border-themeBorder dark:border-white/[0.08] hover:bg-themeAccent/5 hover:border-themeAccent/30 transition-all group"
 >
 <i className={`${action.icon.includes(' ') ? action.icon : 'fa-solid ' + action.icon} text-sm text-themeTextSec group-hover:text-themeAccent group-hover:scale-110 transition-transform`}></i>
 <span className="text-[6.5px] font-black text-themeText uppercase tracking-wider text-center w-full">{action.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Notices Carousel */}
 <div className="w-full relative h-[320px] overflow-hidden rounded-2xl">
 <UpdatesCarousel userSession={userSession} notices={notices || []} onNoticesClick={() => setActiveTab('notices')} />
 </div>

 </div>
 );
}

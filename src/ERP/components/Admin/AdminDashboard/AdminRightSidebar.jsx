/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { theme } from '../../../../Shared/theme';
import { useERP } from '../../../context/ErpContext';
import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminRightSidebar({ setActiveTab }) {
 const { userSession, notices } = useERP();

 const quickActions = [
 { label: 'Add Student', icon: 'fa-user-graduate', color: 'text-indigo-500', tab: 'users' },
 { label: 'Add Faculty', icon: 'fa-chalkboard-user', color: 'text-blue-500', tab: 'faculty' },
 { label: 'New Notice', icon: 'fa-bullhorn', color: 'text-amber-500', tab: 'notices' },
 { label: 'Publish Blog', icon: 'fa-newspaper', color: 'text-emerald-500', tab: 'siteeditor' },
 { label: 'Add Event', icon: 'fa-calendar-plus', color: 'text-rose-500', tab: 'events' },
 { label: 'Upload Circular', icon: 'fa-file-pdf', color: 'text-red-500', tab: 'notices' },
 ];

 return (
 <div className="w-full flex flex-col gap-6">
 
 {/* Card 1: Quick Actions */}
 <div className={`bg-themePanel/85 backdrop-blur-2xl rounded-2xl border border-white/5 p-5 flex flex-col shadow-none`}>
 <h2 className={`font-bold tracking-tight text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
 <span>Quick Actions</span>
 <i className="fa-solid fa-bolt text-themeAccent"></i>
 </h2>
 <div className="grid grid-cols-2 gap-2">
 {quickActions.map((action, i) => (
 <button type="button" 
 key={i} 
 onClick={() => {
 if (setActiveTab && action.tab) {
 setActiveTab(action.tab);
 }
 }}
 className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-white/5 hover:border-themeAccent transition group"
 >
 <i className={`fa-solid ${action.icon} text-lg text-themeTextSec group-hover:${action.color} group-hover:scale-110 transition-transform`}></i>
 <span className="text-[9px] font-bold text-themeText uppercase tracking-widest text-center">{action.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Card 2: Birthdays & Notices */}
 <div className="w-full relative h-[360px]">
    <UpdatesCarousel userSession={userSession} notices={notices || []} onNoticesClick={() => setActiveTab('notices')} />
 </div>

 </div>
 );
}

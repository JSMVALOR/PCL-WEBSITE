/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveDashboard({ setActiveTab }) {
 const [stats, setStats] = useState({
 onLeaveToday: 0,
 pendingRequests: 0,
 approvedThisMonth: 0,
 replacementPending: 0,
 replacementAssigned: 0
 });
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchDashboardStats();
 }, []);

 const fetchDashboardStats = async () => {
 setIsLoading(true);
 try {
 // For now, using mock counts if table is empty, but hitting the real table
 const { data: leaves } = await supabase.from('faculty_leaves').select('id, status, from_date, to_date');
 
 if (!leaves || leaves.length === 0) {
 // Return dummy data only if table is entirely empty to show the UI works
 // But normally we'd return 0. The user explicitly said "No dummies" earlier for another module,
 // so we will STRICTLY compute from actual data.
 setStats({
 onLeaveToday: 0,
 pendingRequests: 0,
 approvedThisMonth: 0,
 replacementPending: 0,
 replacementAssigned: 0
 });
 return;
 }

 const today = new Date().toISOString().split('T')[0];
 const currentMonth = new Date().getMonth();
 const currentYear = new Date().getFullYear();

 let onLeaveToday = 0;
 let pendingRequests = 0;
 let approvedThisMonth = 0;
 let replacementPending = 0;
 let replacementAssigned = 0;

 leaves.forEach(l => {
 // Pending
 if (l.status === 'Pending') pendingRequests++;

 // Approved this month
 if (l.status === 'Approved') {
 const startDate = new Date(l.from_date);
 if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
 approvedThisMonth++;
 }

 // On Leave Today
 if (l.from_date <= today && l.to_date >= today) {
 onLeaveToday++;
 }

 // Replacements
 if (l.replacement_status === 'Pending') replacementPending++;
 if (l.replacement_status === 'Assigned') replacementAssigned++;
 }
 });

 setStats({
 onLeaveToday,
 pendingRequests,
 approvedThisMonth,
 replacementPending,
 replacementAssigned
 });

 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsLoading(false);
 }
 };

 const quickActions = [
 { label: "Review Requests", icon: "fa-inbox", color: "indigo", tab: "requests" },
 { label: "Assign Replacement", icon: "fa-user-clock", color: "amber", tab: "requests" },
 { label: "Leave Calendar", icon: "fa-calendar-days", color: "emerald", tab: "calendar" },
 { label: "View Analytics", icon: "fa-chart-line", color: "blue", tab: "analytics" }
 ];

 const colorMap = {
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', hoverBorder: 'hover:border-rose-500', hoverBg: 'group-hover:bg-rose-500', from: 'from-rose-500/5', actionHover: 'hover:bg-rose-500/10 hover:border-rose-500/50' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', hoverBorder: 'hover:border-amber-500', hoverBg: 'group-hover:bg-amber-500', from: 'from-amber-500/5', actionHover: 'hover:bg-amber-500/10 hover:border-amber-500/50' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-500', hoverBg: 'group-hover:bg-emerald-500', from: 'from-emerald-500/5', actionHover: 'hover:bg-emerald-500/10 hover:border-emerald-500/50' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', hoverBorder: 'hover:border-orange-500', hoverBg: 'group-hover:bg-orange-500', from: 'from-orange-500/5', actionHover: 'hover:bg-orange-500/10 hover:border-orange-500/50' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20', hoverBorder: 'hover:border-indigo-500', hoverBg: 'group-hover:bg-indigo-500', from: 'from-indigo-500/5', actionHover: 'hover:bg-indigo-500/10 hover:border-indigo-500/50' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', hoverBorder: 'hover:border-blue-500', hoverBg: 'group-hover:bg-blue-500', from: 'from-blue-500/5', actionHover: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20', hoverBorder: 'hover:border-teal-500', hoverBg: 'group-hover:bg-teal-500', from: 'from-teal-500/5', actionHover: 'hover:bg-teal-500/10 hover:border-teal-500/50' }
 };

 const StatCard = ({ label, value, icon, color }) => {
   const c = colorMap[color] || colorMap.blue;
   return (
    <div className={`bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-themeBorder dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between transition ${c.hoverBorder} group relative overflow-hidden h-28`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${c.from} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
      <div className="flex justify-between items-start w-full relative z-10">
        <p className="text-[10px] font-bold text-themeTextSec group-hover:text-themeText transition-colors uppercase tracking-widest max-w-[70%] leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center ${c.text} text-sm border ${c.border} ${c.hoverBg} group-hover:text-themeText transition duration-300 shrink-0`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <h3 className="text-2xl font-black tracking-tight text-themeText">{isLoading ? "-" : value}</h3>
      </div>
    </div>
  );
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 <StatCard label="Faculty on Leave Today" value={stats.onLeaveToday} icon="fa-user-injured" color="rose" />
 <StatCard label="Pending Requests" value={stats.pendingRequests} icon="fa-hourglass-half" color="amber" />
 <StatCard label="Approved This Month" value={stats.approvedThisMonth} icon="fa-calendar-check" color="emerald" />
 <StatCard label="Replacement Pending" value={stats.replacementPending} icon="fa-user-clock" color="orange" />
 <StatCard label="Replacement Assigned" value={stats.replacementAssigned} icon="fa-user-check" color="indigo" />
 </div>

 {/* Quick Actions */}
 <div>
 <h2 className={`font-bold tracking-tight text-base lg:text-lg mb-3 lg:mb-4 text-themeText`}>Quick Actions</h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
 {quickActions.map((action, idx) => {
   const c = colorMap[action.color] || colorMap.blue;
   return (
   <button type="button"
   key={idx}
   onClick={() => setActiveTab(action.tab)}
   className={`bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-themeBorder dark:border-white/[0.08] rounded-xl p-4 lg:p-5 flex flex-col items-center justify-center gap-2 lg:gap-3 ${c.actionHover} hover:-translate-y-1 transition duration-300 group`}
   >
   <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full ${c.bg} flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform`}>
   <i className={`fa-solid ${action.icon} text-lg lg:text-xl`}></i>
   </div>
   <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center">{action.label}</span>
   </button>
   );
 })}
 </div>
 </div>
 </div>
 );
}

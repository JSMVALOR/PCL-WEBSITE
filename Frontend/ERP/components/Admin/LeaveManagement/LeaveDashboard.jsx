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

 } catch (error) {
 console.error("Error fetching leave stats:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const quickActions = [
 { label: "Review Requests", icon: "fa-inbox", color: "indigo", tab: "requests" },
 { label: "Assign Replacement", icon: "fa-user-clock", color: "amber", tab: "requests" },
 { label: "Leave Calendar", icon: "fa-calendar-days", color: "emerald", tab: "calendar" },
 { label: "View Analytics", icon: "fa-chart-line", color: "blue", tab: "analytics" }
 ];

 const StatCard = ({ label, value, icon, color }) => (
 <div className={`bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-5 lg:p-6 flex items-center justify-between transition hover:border-${color}-500 group relative overflow-hidden`}>
 {/* Background Glow on Hover */}
 <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
 
 <div className="relative z-10">
 <p className="text-[9px] lg:text-[13px] font-medium text-themeTextSec group-hover:text-themeText transition-colors mb-1">{label}</p>
 <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-themeText">{isLoading ? "-" : value}</h3>
 </div>
 <div className={`relative z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-${color}-500/10 flex items-center justify-center text-${color}-500 text-lg lg:text-xl border-[length:var(--border-width)] border-${color}-500/20 group-hover:bg-${color}-500 group-hover:text-themeText dark:text-white transition duration-300`}>
 <i className={`fa-solid ${icon}`}></i>
 </div>
 </div>
 );

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
 {quickActions.map((action, idx) => (
 <button type="button"
 key={idx}
 onClick={() => setActiveTab(action.tab)}
 className={`bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-4 lg:p-5 flex flex-col items-center justify-center gap-2 lg:gap-3 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/10 hover:-translate-y-1 transition duration-300 group`}
 >
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-${action.color}-500/10 flex items-center justify-center text-${action.color}-500 group-hover:scale-110 transition-transform`}>
 <i className={`fa-solid ${action.icon} text-lg lg:text-xl`}></i>
 </div>
 <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center">{action.label}</span>
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}

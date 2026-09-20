/* © 2026 JSM VALOR. All Rights Reserved. */
import AdminCampusPulse from "../../shared/DashboardWidgets/AdminCampusPulse";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminOverview({}) {
 const [activeGraph, setActiveGraph] = useState('attendance');
 const [activeInsight, setActiveInsight] = useState(0);
 const [loading, setLoading] = useState(true);

 const [graphData, setGraphData] = useState({
 attendance: Array(12).fill(0),
 fees: Array(12).fill(0),
 admissions: Array(12).fill(0),
 support: Array(12).fill(0),
 traffic: Array(12).fill(0)
 });

 const [insights, setInsights] = useState([
 { label: "Total Revenue YTD", value: "₹0", sub: "Loading...", color: "text-themeAccent" },
 { label: "Total Admissions", value: "0", sub: "Loading...", color: "text-themeAccent" },
 { label: "Web Traffic", value: "0", sub: "Loading...", color: "text-themeAccent" },
 { label: "Unique Visitors", value: "0", sub: "Loading...", color: "text-themeAccent" }
 ]);

 const [tasks, setTasks] = useState({
 leaves: 0,
 admissions: 0,
 tickets: 0,
 docs: 0
 });

 useEffect(() => {
 let isMounted = true;
 const fetchData = async () => {
 try {
 const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
 if (error) { console.warn("Dashboard stats error (RPC missing):", error.message); if (isMounted) setLoading(false); return; }
 if (!isMounted) return;

 if (data) {
 const d = data;
 
 const newGraph = {
 attendance: Array(12).fill(0),
 fees: Array(12).fill(0),
 admissions: Array(12).fill(0),
 support: Array(12).fill(0),
 traffic: Array(12).fill(0)
 };
 
 /* attendance moved to AdminCampusPulse */
 
 let maxFee = 1, maxAdm = 1, maxTic = 1, maxTraf = 1;
 if (d.graphs && d.graphs.fees) { d.graphs.fees.forEach(f => { newGraph.fees[f.m - 1] = f.s; if (f.s > maxFee) maxFee = f.s; }); }
 d.graphs?.adm?.forEach(a => { newGraph.admissions[a.m - 1] = a.c; if (a.c > maxAdm) maxAdm = a.c; });
 d.graphs?.tic?.forEach(t => { newGraph.support[t.m - 1] = t.c; if (t.c > maxTic) maxTic = t.c; });
 d.graphs?.traffic?.forEach(g => { newGraph.traffic[g.m - 1] = g.c; if (g.c > maxTraf) maxTraf = g.c; });
 
 for(let i=0; i<12; i++) {
 newGraph.fees[i] = (newGraph.fees[i] / maxFee) * 100;
 newGraph.admissions[i] = (newGraph.admissions[i] / maxAdm) * 100;
 newGraph.support[i] = (newGraph.support[i] / maxTic) * 100;
 newGraph.traffic[i] = (newGraph.traffic[i] / maxTraf) * 100;
 }
 
 setGraphData(newGraph);
 
 const formatCurrency = (val) => {
 if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
 if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
 return `₹${val}`;
 };
 
 setInsights([
 { label: "Total Revenue YTD", value: formatCurrency((d.insights?.total_revenue || 0)), sub: "Fees Collected", color: "text-emerald-500" },
 { label: "Admissions Volume", value: String((d.insights?.total_adm || 0)), sub: "Applications Processed", color: "text-blue-500" },
 { label: "Web Traffic", value: String((d.insights?.total_traffic || 0) || 0), sub: "Total Page Views", color: "text-indigo-500" },
 { label: "Unique Visitors", value: String((d.insights?.unique_visitors || 0) || 0), sub: "Sessions YTD", color: "text-purple-500" }
 ]);
 
 setTasks({
 leaves: (d.tasks?.leaves || 0) || 0,
 admissions: (d.tasks?.admissions || 0) || 0,
 tickets: (d.tasks?.tickets || 0) || 0,
 docs: (d.tasks?.docs || 0) || 0
 });
 
 setLoading(false);
 }
 } catch (error) {
 console.error("Error fetching overview data:", error);
 if (isMounted) setLoading(false);
 }
 };

 fetchData();
 return () => { isMounted = false; };
 }, []);

 // Insight Rotator
 useEffect(() => {
 const interval = setInterval(() => {
 setActiveInsight((prev) => (prev + 1) % insights.length);
 }, 5000);
 return () => clearInterval(interval);
 }, [insights.length]);

 const tabs = [
 { id: 'attendance', label: 'Attendance', color: 'bg-themeAccent' },
 { id: 'fees', label: 'Fees', color: 'bg-themeAccent' },
 { id: 'admissions', label: 'Admissions', color: 'bg-themeAccent' },
 { id: 'support', label: 'Support', color: 'bg-themeAccent' },
 { id: 'traffic', label: 'Web Traffic', color: 'bg-themeAccent' }
 ];

 const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

 return (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 <AdminCampusPulse className="col-span-1 lg:col-span-8 h-auto" />

{/* Right: Insights & Tasks */}
 <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
 
 {/* Quick Insights */}
 <div className={`bg-themePanel/85 backdrop-blur-2xl rounded-2xl border border-themeBorder dark:border-white/5 p-5 flex flex-col min-h-[160px] relative`}>
 <h2 className={`font-bold tracking-tight text-sm text-themeText tracking-tight mb-4 flex justify-between items-center`}>
 <span>Quick Insights</span>
 {loading ? <i className="fa-solid fa-spinner fa-spin text-themeTextSec text-xs"></i> : <i className="fa-solid fa-lightbulb text-themeAccent"></i>}
 </h2>
 
 <div className="relative flex-1 flex items-center justify-center">
 {insights.map((insight, idx) => (
 <div 
 key={idx} 
 className={`absolute inset-0 flex flex-col justify-center transition duration-700 ease-in-out ${idx === activeInsight ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 pointer-events-none'}`}
 >
 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">{insight.label}</span>
 <h3 className={`text-2xl lg:text-3xl font-black ${insight.color} tracking-tight`}>{insight.value}</h3>
 <span className="text-xs font-bold text-themeText mt-1">{insight.sub}</span>
 </div>
 ))}
 </div>

 <div className="flex justify-center gap-1.5 mt-auto pt-4">
 {insights.map((_, idx) => (
 <button type="button" key={idx} onClick={() => setActiveInsight(idx)} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === activeInsight ? 'bg-themeAccent' : 'bg-themeBorderStrong'}`}></button>
 ))}
 </div>
 </div>

 {/* Pending Tasks */}
 <div className={`bg-themePanel/85 backdrop-blur-2xl rounded-2xl border border-themeBorder dark:border-white/5 p-5 flex-1 flex flex-col`}>
 <h2 className={`font-bold tracking-tight text-sm text-themeText tracking-tight mb-4 flex justify-between`}>
 <span>Action Required</span>
 <span className="text-[10px] font-bold text-themeTextSec border border-themeBorder dark:border-white/5 px-2 py-0.5 rounded">Queues</span>
 </h2>
 <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
 
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-amber-500/50 transition-colors text-left group">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded ${tasks.leaves > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-themeApp text-themeTextSec border border-themeBorder dark:border-white/5'} flex items-center justify-center shrink-0`}>
 <span className="font-black text-xs">{tasks.leaves}</span>
 </div>
 <span className="text-xs font-bold text-themeText">Leave Requests</span>
 </div>
 <span className="text-[10px] font-bold text-themeAccent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Review <i className="fa-solid fa-arrow-right"></i></span>
 </button>
 
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-blue-500/50 transition-colors text-left group">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded ${tasks.admissions > 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-themeApp text-themeTextSec border border-themeBorder dark:border-white/5'} flex items-center justify-center shrink-0`}>
 <span className="font-black text-xs">{tasks.admissions}</span>
 </div>
 <span className="text-xs font-bold text-themeText">Admissions</span>
 </div>
 <span className="text-[10px] font-bold text-themeAccent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Review <i className="fa-solid fa-arrow-right"></i></span>
 </button>
 
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-rose-500/50 transition-colors text-left group">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded ${tasks.tickets > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-themeApp text-themeTextSec border border-themeBorder dark:border-white/5'} flex items-center justify-center shrink-0`}>
 <span className="font-black text-xs">{tasks.tickets}</span>
 </div>
 <span className="text-xs font-bold text-themeText">Support Tickets</span>
 </div>
 <span className="text-[10px] font-bold text-themeAccent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Review <i className="fa-solid fa-arrow-right"></i></span>
 </button>
 
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:border-indigo-500/50 transition-colors text-left group">
 <div className="flex items-center gap-3">
 <div className={`w-8 h-8 rounded ${tasks.docs > 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-themeApp text-themeTextSec border border-themeBorder dark:border-white/5'} flex items-center justify-center shrink-0`}>
 <span className="font-black text-xs">{tasks.docs}</span>
 </div>
 <span className="text-xs font-bold text-themeText">Student Docs</span>
 </div>
 <span className="text-[10px] font-bold text-themeAccent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Review <i className="fa-solid fa-arrow-right"></i></span>
 </button>

 </div>
 </div>

 </div>
 </div>
 );
}

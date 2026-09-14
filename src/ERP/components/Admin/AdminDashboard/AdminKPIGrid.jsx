/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminKPIGrid({ setActiveTab }) {
 const [loading, setLoading] = useState(true);
 const [flippedCard, setFlippedCard] = useState(null);
 const [data, setData] = useState({
 students: { total: 0, byBatch: {} },
 faculty: { total: 0, list: [] },
 attendance: { present: 0, total: 0, rate: 0 },
 approvals: { total: 0, leaves: 0, docs: 0, grievances: 0 },
 fees: { collected: 0, pending: 0 }
 });

 useEffect(() => {
 let isMounted = true;
 const fetchKPIs = async () => {
 try {
 const { data, error } = await supabase.rpc('get_admin_kpi_stats');
 if (error) { console.warn("Dashboard stats error (RPC missing):", error.message); if (isMounted) setLoading(false); return; }

 if (isMounted && data) {
 const kpi = data;
 if (kpi) {
 const attTotal = Number(kpi.attendance?.total) || 0;
 const attPresent = Number(kpi.attendance?.present) || 0;
 const rate = attTotal > 0 ? ((attPresent / attTotal) * 100).toFixed(1) : 0;

 const leaves = Number(kpi.approvals?.leaves) || 0;
 const docs = Number(kpi.approvals?.docs) || 0;
 const grievances = Number(kpi.approvals?.grievances) || 0;
 const totalApprovals = leaves + docs + grievances;

 setData({
 students: { total: kpi.students?.total || 0, byBatch: kpi.students?.byBatch || {} },
 faculty: { total: kpi.faculty?.total || 0, list: kpi.faculty?.list || [] },
 attendance: { present: attPresent, total: attTotal, rate },
 approvals: { total: totalApprovals, leaves, docs, grievances },
 fees: { collected: Number(kpi.fees?.collected) || 0, pending: Number(kpi.fees?.pending) || 0 }
 });
 }
 }
 } catch (error) {
 console.error("Error fetching KPIs:", error);
 } finally {
 if (isMounted) setLoading(false);
 }
 };

 fetchKPIs();
 return () => { isMounted = false; };
 }, []);

 const toggleFlip = (cardId) => {
 setFlippedCard(flippedCard === cardId ? null : cardId);
 };

 const formatCurrency = (val) => {
 if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
 if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
 return `₹${val}`;
 };

 if (loading) {
 return (
 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 animate-pulse">
 {[1, 2, 3, 4, 5].map(i => (
 <div key={i} className="h-[140px] bg-themePanel/85 backdrop-blur-2xl rounded-2xl border border-white/5 opacity-50"></div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
 
 {/* 1. Students Flipcard */}
 <div className="relative w-full h-[140px] group [perspective:1000px] cursor-pointer" onClick={() => toggleFlip(1)}>
 <div className={`w-full h-full absolute transition duration-700 [transform-style:preserve-3d] ${flippedCard === 1 ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
 {/* Front */}
 <div className="absolute w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col gap-2 group-hover:border-themeAccent transition-colors">
 <div className="flex justify-between items-start">
 <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0/20">
 <i className="fa-solid fa-user-graduate"></i>
 </div>
 <button onClick={(e) => { e.stopPropagation(); setActiveTab && setActiveTab('users'); }} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
 </div>
 <div className="mt-auto">
 <p className="text-2xl font-black text-themeText tracking-tight">{data.students.total}</p>
 <p className={`text-[9px] font-black text-[#8E8E93] uppercase tracking-widest mt-0.5 truncate`}>Active Students</p>
 </div>
 </div>
 {/* Back */}
 <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col">
 <h4 className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mb-2 border-b-[length:var(--border-width)] border-white/5 pb-1">Breakdown</h4>
 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
 {Object.entries(data.students.byBatch).length === 0 ? (
 <p className="text-[10px] font-medium text-themeTextSec italic text-center mt-2">No data</p>
 ) : (
 Object.entries(data.students.byBatch).map(([batch, count]) => (
 <div key={batch} className="flex justify-between items-center bg-themePanel/85 backdrop-blur-2xl p-1.5 px-2 rounded border border-white/5">
 <span className="text-[9px] font-bold text-themeText truncate pr-2">{batch}</span>
 <span className="text-[9px] font-black text-themeAccent bg-themeAccent/10 px-1.5 py-0.5 rounded">{count}</span>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>

 {/* 2. Faculty Flipcard */}
 <div className="relative w-full h-[140px] group [perspective:1000px] cursor-pointer" onClick={() => toggleFlip(2)}>
 <div className={`w-full h-full absolute transition duration-700 [transform-style:preserve-3d] ${flippedCard === 2 ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
 {/* Front */}
 <div className="absolute w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col gap-2 group-hover:border-themeAccent transition-colors">
 <div className="flex justify-between items-start">
 <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0/20">
 <i className="fa-solid fa-chalkboard-user"></i>
 </div>
 <button onClick={(e) => { e.stopPropagation(); setActiveTab && setActiveTab('faculty'); }} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
 </div>
 <div className="mt-auto">
 <p className="text-2xl font-black text-themeText tracking-tight">{data.faculty.total}</p>
 <p className={`text-[9px] font-black text-[#8E8E93] uppercase tracking-widest mt-0.5 truncate`}>Active Faculty</p>
 </div>
 </div>
 {/* Back */}
 <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col">
 <h4 className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mb-2 border-b-[length:var(--border-width)] border-white/5 pb-1">Directory</h4>
 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
 {data.faculty.list.length === 0 ? (
 <p className="text-[10px] font-medium text-themeTextSec italic text-center mt-2">No data</p>
 ) : (
 data.faculty.list.map(fac => (
 <div key={fac.id} onClick={(e) => { e.stopPropagation(); setActiveTab && setActiveTab('faculty'); }} className="flex items-center gap-2 bg-themePanel/85 backdrop-blur-2xl p-1.5 rounded border border-white/5 hover:border-themeAccent transition-colors cursor-pointer">
 <div className="w-4 h-4 rounded-lg bg-themeAccent/10 text-themeAccent flex items-center justify-center shrink-0">
 <i className="fa-solid fa-user text-[8px]"></i>
 </div>
 <div className="flex flex-col overflow-hidden">
 <span className="text-[9px] font-bold text-themeText truncate">{fac.full_name || 'Unnamed'}</span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>

 {/* 3. Attendance Flipcard */}
 <div className="relative w-full h-[140px] group [perspective:1000px] cursor-pointer" onClick={() => toggleFlip(3)}>
 <div className={`w-full h-full absolute transition duration-700 [transform-style:preserve-3d] ${flippedCard === 3 ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
 {/* Front */}
 <div className="absolute w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col gap-2 group-hover:border-themeAccent transition-colors">
 <div className="flex justify-between items-start">
 <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0/20">
 <i className="fa-solid fa-clipboard-user"></i>
 </div>
 {data.attendance.total > 0 ? (
 <div className="flex gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-themeAccent animate-pulse"></span>
 </div>
 ) : (
 <span className="hidden xl:inline-block text-[8px] font-bold text-themeTextSec bg-themeElevated/90 backdrop-blur-2xl px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[60px]">Awaiting</span>
 )}
 </div>
 <div className="mt-auto">
 <p className="text-2xl font-black text-themeText tracking-tight">
 {data.attendance.total > 0 ? `${data.attendance.rate}%` : '--'}
 </p>
 <p className={`text-[9px] font-black text-[#8E8E93] uppercase tracking-widest mt-0.5 truncate`}>Attendance</p>
 </div>
 </div>
 {/* Back */}
 <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center items-center text-center">
 <h4 className="text-[9px] font-black text-themeText uppercase tracking-widest mb-1">Status</h4>
 <p className="text-[9px] text-themeTextSec px-2">
 {data.attendance.total > 0 ? `${data.attendance.present} of ${data.attendance.total} students present today.` : 'Classes still in session. Check back later.'}
 </p>
 </div>
 </div>
 </div>

 {/* 4. Approvals Flipcard */}
 <div className="relative w-full h-[140px] group [perspective:1000px] cursor-pointer" onClick={() => toggleFlip(4)}>
 <div className={`w-full h-full absolute transition duration-700 [transform-style:preserve-3d] ${flippedCard === 4 ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
 {/* Front */}
 <div className="absolute w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col gap-2 group-hover:border-themeAccent transition-colors">
 <div className="flex justify-between items-start mb-1">
 <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0/20">
 <i className="fa-solid fa-stamp"></i>
 </div>
 <button onClick={(e) => { e.stopPropagation(); setActiveTab && setActiveTab('adminapprovals'); }} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
 </div>
 <div className="mt-auto">
 <p className="text-2xl font-black text-themeText tracking-tight">{data.approvals.total}</p>
 <p className={`text-[9px] font-black text-[#8E8E93] uppercase tracking-widest mt-0.5 truncate`}>Pending Approvals</p>
 </div>
 </div>
 {/* Back */}
 <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col">
 <h4 className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mb-2 border-b-[length:var(--border-width)] border-white/5 pb-1">Queues</h4>
 <div className="flex flex-col gap-1.5 mt-auto pb-1">
 <div className="bg-themePanel/85 backdrop-blur-2xl p-1.5 px-2 rounded border border-white/5 flex justify-between items-center">
 <span className="text-[8px] font-bold text-themeTextSec uppercase tracking-wider">Leaves</span>
 <span className={`text-[10px] font-black ${data.approvals.leaves > 0 ? 'text-amber-500' : 'text-themeText'}`}>{data.approvals.leaves}</span>
 </div>
 <div className="bg-themePanel/85 backdrop-blur-2xl p-1.5 px-2 rounded border border-white/5 flex justify-between items-center">
 <span className="text-[8px] font-bold text-themeTextSec uppercase tracking-wider">Tickets</span>
 <span className={`text-[10px] font-black ${data.approvals.grievances > 0 ? 'text-rose-500' : 'text-themeText'}`}>{data.approvals.grievances}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* 5. Revenue Flipcard */}
 <div className="relative w-full h-[140px] group [perspective:1000px] cursor-pointer" onClick={() => toggleFlip(5)}>
 <div className={`w-full h-full absolute transition duration-700 [transform-style:preserve-3d] ${flippedCard === 5 ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
 {/* Front */}
 <div className="absolute w-full h-full [backface-visibility:hidden] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col gap-2 group-hover:border-themeAccent transition-colors">
 <div className="flex justify-between items-start">
 <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0/20">
 <i className="fa-solid fa-indian-rupee-sign"></i>
 </div>
 <button onClick={(e) => { e.stopPropagation(); setActiveTab && setActiveTab('finance'); }} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
 </div>
 <div className="mt-auto">
 <p className="text-2xl font-black text-themeText tracking-tight truncate">{formatCurrency(data.fees.collected)}</p>
 <p className={`text-[9px] font-black text-[#8E8E93] uppercase tracking-widest mt-0.5 truncate`}>Collected</p>
 </div>
 </div>
 {/* Back */}
 <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center items-center text-center">
 <h4 className="text-[9px] font-black text-themeText uppercase tracking-widest mb-2">Ledger</h4>
 <p className="text-[10px] font-bold text-themeTextSec">Paid: <span className="text-emerald-500">{formatCurrency(data.fees.collected)}</span></p>
 <p className="text-[10px] font-bold text-themeTextSec">Dues: <span className="text-rose-500">{formatCurrency(data.fees.pending)}</span></p>
 </div>
 </div>
 </div>



 </div>
 );
}

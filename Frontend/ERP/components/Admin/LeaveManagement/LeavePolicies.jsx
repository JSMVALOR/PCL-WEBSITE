import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeavePolicies() {
 const [policies, setPolicies] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchPolicies();
 }, []);

 const fetchPolicies = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase.from('leave_policies').select('*').order('created_at', { ascending: true });
 if (error && error.code !== '42P01') throw error; // ignore if table doesn't exist yet
 if (data) setPolicies(data);
 } catch (e) {
 console.error("Error fetching policies:", e);
 } finally {
 setIsLoading(false);
 }
 };

 const getColorClasses = (color) => {
 const map = {
 emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/50" },
 amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/50" },
 purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/50" },
 rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/50" },
 blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/50" },
 indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/50" },
 orange: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/50" },
 slate: { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/50" }
 };
 return map[color] || map.emerald;
 };

 if (isLoading) {
 return <div className="flex items-center justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-themeBorder border-t-transparent animate-spin"></div></div>;
 }

 if (!policies.length) {
 return (
 <div className="p-12 text-center">
 <i className="fa-solid fa-database text-4xl text-themeTextSec /20 mb-4"></i>
 <h3 className="text-lg font-black text-themeText ">Policies Table Not Found</h3>
 <p className="text-sm font-bold text-themeTextSec mt-2">Please run the SQL command provided to initialize the leave_policies table.</p>
 </div>
 );
 }

 return (
 <div className="w-full flex flex-col gap-6 animate-fade-in">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-themeElevated border border-themeBorder rounded-2xl p-4 lg:p-6 backdrop-blur-3xl">
 <div>
 <h2 className="text-xl font-black tracking-tight text-themeText mb-1">Leave Policies Configuration</h2>
 <p className="text-xs font-bold text-themeTextSec tracking-widest uppercase">Manage annual limits and rules for different leave types.</p>
 </div>
 <button className="px-5 py-2.5 bg-themeAccent hover:bg-themeAccent/90 text-[var(--bg-color)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap">
 <i className="fa-solid fa-plus"></i> New Policy
 </button>
 </div>

 {/* Policies Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
 {policies.map((policy, idx) => {
 const c = getColorClasses(policy.color_theme);
 return (
 <div key={policy.id || idx} className={`bg-themePanel dark:bg-themeApp border border-themeBorder rounded-2xl p-4 lg:p-6 relative overflow-hidden group hover:border-${policy.color_theme}-500/30 transition-colors`}>
 <div className={`absolute top-0 left-0 w-full h-1 bg-${policy.color_theme}-500`}></div>
 
 <div className="flex justify-between items-start mb-4 lg:mb-6">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${c.bg} ${c.text} text-xl`}>
 <i className="fa-solid fa-scale-balanced"></i>
 </div>
 <div>
 <h3 className="font-black text-themeText text-base">{policy.name}</h3>
 <span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>{policy.status}</span>
 </div>
 </div>
 <button className="text-themeTextSec /30 hover:text-themeText dark:hover:text-themeApp transition-colors">
 <i className="fa-solid fa-ellipsis-vertical"></i>
 </button>
 </div>

 <p className="text-sm font-medium text-themeTextSec /60 mb-4 lg:mb-8 h-auto lg:h-10">
 {policy.description}
 </p>

 <div className="flex items-center justify-between border-t border-themeBorder pt-4">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec /40">Annual Limit</span>
 <span className="text-sm font-black text-themeText ">{policy.annual_limit} Days</span>
 </div>
 <div className="flex flex-col gap-1 text-right">
 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec /40">Requires Approval</span>
 <span className="text-sm font-black text-amber-500">{policy.requires_approval ? 'Yes (Admin)' : 'No'}</span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function LeavePolicies({ isEmbedded = false }) {
 const [policies, setPolicies] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchPolicies();
 }, []);

 const fetchPolicies = async () => {
 setIsLoading(true);
 try {
 const { data } = await supabase.from('leave_policies').select('*').order('name');
 setPolicies(data || []);
 } catch (error) {
 console.error("Error fetching policies:", error);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 
 <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-4 lg:p-5 gap-4">
 <div>
 <h2 className={`font-bold tracking-tight text-lg lg:text-xl text-themeText`}>Leave Policies Configuration</h2>
 <p className="text-[10px] lg:text-xs text-themeTextSec mt-1">Manage annual limits and rules for different leave types.</p>
 </div>
 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="w-full md:w-auto px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2">
 <i className="fa-solid fa-plus"></i> New Policy
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {isLoading ? (
 <div className="col-span-full flex justify-center py-12">
 <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i>
 </div>
 ) : (
 policies.map(policy => (
 <div key={policy.id} className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6 relative overflow-hidden group hover:border-${policy.color_theme}-500/50 transition duration-300`}>
 {/* Background Glow */}
 <div className={`absolute inset-0 bg-gradient-to-br from-${policy.color_theme}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
 <div className={`absolute top-0 left-0 w-full h-1 bg-${policy.color_theme}-500`}></div>
 
 <div className="flex justify-between items-start mb-4 relative z-10">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-${policy.color_theme}-500/10 flex items-center justify-center text-${policy.color_theme}-500 group-hover:scale-110 transition-transform`}>
 <i className="fa-solid fa-scale-balanced text-lg"></i>
 </div>
 <div>
 <h3 className="text-sm lg:text-base font-black text-themeText">{policy.name}</h3>
 <p className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest mt-0.5 ${policy.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>{policy.is_active ? 'Active' : 'Inactive'}</p>
 </div>
 </div>
 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="text-themeTextSec hover:text-indigo-500 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-500/10">
 <i className="fa-solid fa-ellipsis-vertical"></i>
 </button>
 </div>

 <p className="text-[10px] lg:text-xs text-themeTextSec mb-6 min-h-[40px] leading-relaxed relative z-10">{policy.description}</p>

 <div className="grid grid-cols-2 gap-4 border-t-[length:var(--border-width)] border-white/5 pt-4 relative z-10">
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Annual Limit</p>
 <p className="text-xs lg:text-sm font-bold text-themeText mt-1 group-hover:text-indigo-500 transition-colors">{policy.annual_limit} Days</p>
 </div>
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Requires Approval</p>
 <p className={`text-[10px] lg:text-xs font-bold mt-1 ${policy.requires_approval ? 'text-amber-500' : 'text-emerald-500'}`}>
 {policy.requires_approval ? 'Yes (Admin)' : 'No (Auto)'}
 </p>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 
 </div>
 );
}

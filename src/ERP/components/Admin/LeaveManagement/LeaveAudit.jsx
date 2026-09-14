/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function LeaveAudit({ isEmbedded = false }) {
 const [logs, setLogs] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchAuditLogs();
 }, []);

 const fetchAuditLogs = async () => {
 setIsLoading(true);
 try {
 // In a real app we join this with the faculty name to show "Leave ID xyz for Dr. Meera"
 const { data } = await supabase
 .from('leave_audit_logs')
 .select('id, action, performed_by, details, created_at, leave_id')
 .order('created_at', { ascending: false })
 .limit(50);
 
 setLogs(data || []);
 } catch (error) {
 console.error("Error fetching audit logs:", error);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto">
 
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
 <div>
 <h2 className={`font-bold tracking-tight text-lg lg:text-xl text-themeText`}>Audit Logs</h2>
 <p className="text-[10px] lg:text-xs text-themeTextSec mt-1">Immutable record of all actions taken within the leave management module.</p>
 </div>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="w-full sm:w-10 h-10 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong flex items-center justify-center text-themeTextSec hover:text-indigo-500 transition-colors shrink-0">
 <i className="fa-solid fa-download"></i> <span className="sm:hidden ml-2 text-xs font-black uppercase tracking-widest text-themeText">Download Logs</span>
 </button>
 </div>

 <div className="relative border-l-2 border-white/5 ml-4">
 {isLoading ? (
 <div className="py-12 flex flex-col items-center justify-center opacity-50 ml-[-1rem]">
 <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mb-3"></i>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Retrieving secure logs...</p>
 </div>
 ) : logs.length === 0 ? (
 <div className="py-12 flex flex-col items-center justify-center opacity-50 ml-[-1rem]">
 <i className="fa-solid fa-shield-halved text-4xl text-themeTextSec mb-3"></i>
 <p className="text-sm font-semibold text-themeText">No audit logs found.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {logs.map((log, index) => (
 <div key={log.id} className="relative pl-6 lg:pl-8">
 {/* Timeline Node */}
 <div className="absolute top-2 lg:top-1 -left-[9px] w-4 h-4 rounded-full bg-themeElevated/90 backdrop-blur-2xl border-2 border-indigo-500 ring-4 ring-themePanel"></div>
 
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong rounded-xl p-4 lg:p-5 hover:border-indigo-500/30 transition group">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-2 mb-3 lg:mb-2">
 <h4 className="text-xs lg:text-sm font-black text-themeText flex items-center gap-2">
 {log.action}
 </h4>
 <div className="flex flex-wrap items-center gap-2 lg:gap-3">
 <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] px-2 py-1 rounded text-themeTextSec flex items-center gap-1.5">
 <i className="fa-solid fa-user-shield text-indigo-500"></i>
 {log.performed_by}
 </span>
 <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec group-hover:text-indigo-400 transition-colors">
 {new Date(log.created_at).toLocaleString('en-GB', { 
 day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
 })}
 </span>
 </div>
 </div>
 
 {log.details && (
 <p className="text-[10px] lg:text-xs text-themeTextSec leading-relaxed">
 {log.details}
 </p>
 )}

 <p className="text-[9px] font-bold text-themeTextSec/50 mt-3 font-mono">
 Log ID: {log.id}
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 </div>
 );
}

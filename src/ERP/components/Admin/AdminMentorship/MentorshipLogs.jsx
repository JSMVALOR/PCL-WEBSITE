/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function MentorshipLogs({ isEmbedded = false }) {
 const [logs, setLogs] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchLogs();
 }, []);

 const fetchLogs = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('audit_logs')
 .select('*')
 .eq('table_name', 'mentorship')
 .order('created_at', { ascending: false })
 .limit(50);
 
 if (error) throw error;
 setLogs(data || []);
 } catch (error) {
 console.error("Error fetching audit logs:", error);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative pb-10">
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6">
 <div className="flex justify-between items-center mb-6">
 <h3 className={`font-bold tracking-tight text-sm tracking-tight text-themeText flex items-center gap-2`}>
 <span>Audit Log</span>
 <i className="fa-solid fa-list-check text-themeTextSec"></i>
 </h3>
 <button 
 onClick={fetchLogs}
 className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-themeTextSec hover:text-indigo-500 hover:border-indigo-500 transition-colors flex items-center justify-center"
 >
 <i className="fa-solid fa-rotate-right text-xs"></i>
 </button>
 </div>

 {isLoading ? (
 <div className="w-full py-12 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent"></i></div>
 ) : logs.length === 0 ? (
 <div className="w-full py-16 flex flex-col items-center justify-center text-center opacity-60">
 <i className="fa-solid fa-ghost text-4xl text-themeTextSec mb-4"></i>
 <h3 className="text-sm font-black text-themeText">No Logs Found</h3>
 <p className="text-[10px] font-bold text-themeTextSec mt-1">No mentorship actions have been recorded yet.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-3">
 <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b-[length:var(--border-width)] border-black/5 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-themeTextSec">
 <div className="col-span-3">Timestamp</div>
 <div className="col-span-7">Action Details</div>
 <div className="col-span-2 text-right">Performed By</div>
 </div>

 {logs.map((log) => {
 const date = new Date(log.created_at);
 return (
 <div key={log.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-4 py-3 bg-themeElevated/90 backdrop-blur-2xl border border-white/5 rounded-lg md:items-center">
 <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start border-b md:border-b-0 border-black/5 dark:border-white/10 pb-2 md:pb-0">
 <span className="text-xs font-bold text-themeText">{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' })}</span>
 </div>
 <div className="md:col-span-7 flex items-start md:items-center gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 md:mt-0"></div>
 <span className="text-xs font-bold text-themeText leading-relaxed">{log.action}</span>
 </div>
 <div className="md:col-span-2 flex justify-end">
 <span className="text-[9px] font-black uppercase tracking-widest bg-themePanel/85 backdrop-blur-2xl px-2 py-1 rounded border border-white/5 text-indigo-500">
 Admin
 </span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}

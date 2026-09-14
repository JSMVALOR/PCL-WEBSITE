/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveRequests({ onReviewRequest }) {
 const [requests, setRequests] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 
 // Filters
 const [statusFilter, setStatusFilter] = useState("Pending"); // Pending, Approved, Rejected, All
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 fetchRequests();
 }, []);

 const fetchRequests = async () => {
 setIsLoading(true);
 try {
 // Note: In real setup, you fetch from faculty_leaves joined with profiles & leave_policies
 const { data, error } = await supabase
 .from('faculty_leaves')
 .select(`
 id, 
 start_date, 
 end_date, 
 total_days, 
 status,
 reason,
 classes_affected,
 replacement_status,
 faculty:faculty_id(name, department),
 policy:leave_type_id(name, color_theme)
 `)
 .order('created_at', { ascending: false });

 if (error) {
 // If the new table doesn't exist yet, we just gracefully handle it
 console.error("Error fetching leave requests. Run the SQL schema.", error);
 setRequests([]);
 return;
 }

 setRequests(data || []);

 } catch (error) {
 console.error(error);
 } finally {
 setIsLoading(false);
 }
 };

 const filteredRequests = requests.filter(req => {
 const matchesStatus = statusFilter === "All" || req.status === statusFilter;
 const searchLower = searchQuery.toLowerCase();
 const matchesSearch = !searchQuery || 
 (req.faculty?.name?.toLowerCase().includes(searchLower)) ||
 (req.faculty?.department?.toLowerCase().includes(searchLower)) ||
 (req.policy?.name?.toLowerCase().includes(searchLower));
 return matchesStatus && matchesSearch;
 });

 const getStatusBadge = (status) => {
 switch(status) {
 case 'Approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 case 'Rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
 case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
 default: return 'bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border-black/5 dark:border-white/10';
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 
 {/* Toolbar */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-3 lg:p-5 flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center justify-between">
 <div className="relative w-full lg:w-96">
 <i className="fa-solid fa-search absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input 
 type="text" 
 placeholder="Search faculty, department, or leave type..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong rounded-lg pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 text-xs text-themeText focus:border-indigo-500 outline-none transition-colors"
 />
 </div>

 <div className="flex flex-wrap items-center bg-themeElevated/90 backdrop-blur-2xl p-1 rounded-lg border border-white/5Strong w-full lg:w-auto">
 {["Pending", "Approved", "Rejected", "All"].map(status => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`flex-1 lg:flex-none px-2 lg:px-4 py-2 lg:py-1.5 rounded-md text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition ${
 statusFilter === status 
 ? 'bg-themePanel/85 backdrop-blur-2xl text-themeText border border-white/5' 
 : 'text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-transparent'
 }`}
 >
 {status}
 </button>
 ))}
 </div>
 </div>

 {/* Table */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel overflow-hidden">
 <div className="overflow-x-auto no-scrollbar">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead>
 <tr className="bg-themeElevated/50 border-b-[length:var(--border-width)] border-white/5">
 <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">Faculty</th>
 <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">Leave Type</th>
 <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">Dates</th>
 <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</th>
 <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y-[length:var(--border-width)] divide-themeBorder">
 {isLoading ? (
 <tr>
 <td colSpan="5" className="p-8 text-center">
 <i className="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-500 mb-2"></i>
 <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Loading Requests...</p>
 </td>
 </tr>
 ) : filteredRequests.length === 0 ? (
 <tr>
 <td colSpan="5" className="p-12 text-center">
 <div className="w-16 h-16 bg-themeElevated/90 backdrop-blur-2xl rounded-full flex items-center justify-center mx-auto mb-4">
 <i className="fa-solid fa-inbox text-2xl text-themeTextSec"></i>
 </div>
 <h3 className="text-sm font-black text-themeText">No Requests Found</h3>
 <p className="text-xs text-themeTextSec mt-1">Try adjusting your filters or search query.</p>
 </td>
 </tr>
 ) : (
 filteredRequests.map(req => (
 <tr key={req.id} className="hover:bg-themeElevated/30 transition-colors group">
 <td className="p-3 lg:p-4">
 <p className="text-xs lg:text-sm font-black text-themeText">{req.faculty?.name || 'Unknown Faculty'}</p>
 <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">{req.faculty?.department || 'Department'}</p>
 </td>
 <td className="p-3 lg:p-4">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full bg-${req.policy?.color_theme || 'blue'}-500`}></div>
 <span className="text-[10px] lg:text-xs font-bold text-themeText">{req.policy?.name || 'General Leave'}</span>
 </div>
 </td>
 <td className="p-3 lg:p-4">
 <p className="text-[10px] lg:text-xs font-bold text-themeText">{new Date(req.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(req.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
 <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">{req.total_days} Days</p>
 </td>
 <td className="p-3 lg:p-4">
 <span className={`px-2 py-1 lg:px-2.5 lg:py-1 rounded border-[length:var(--border-width)] text-[8px] lg:text-[9px] font-black uppercase tracking-widest ${getStatusBadge(req.status)}`}>
 {req.status}
 </span>
 </td>
 <td className="p-3 lg:p-4 text-right">
 <button 
 onClick={() => onReviewRequest(req)}
 className="px-3 py-1.5 lg:px-4 lg:py-2 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder border border-white/5Strong rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeText transition-colors whitespace-nowrap"
 >
 Review
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 </div>
 );
}

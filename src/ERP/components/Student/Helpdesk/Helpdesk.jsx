/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function Helpdesk({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- MAIN STATE ---
 const [tickets, setTickets] = useState(() => {
 const userId = userSession?.db_id || userSession?.id;
 if (!userId) return [];
 const cached = sessionStorage.getItem(`helpdesk_tickets_${userId}`);
 return cached ? JSON.parse(cached) : [];
 });

 // --- TAB STATE ---
 const [activeTab, setActiveTab] = useState("tickets"); // "tickets" | "grievance"

 // --- MODAL & FORM STATE ---
 const [showTicketModal, setShowTicketModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

 const [ticketForm, setTicketForm] = useState({
 category: "",
 subject: "",
 description: ""
 });

 const [grievanceForm, setGrievanceForm] = useState({
 description: ""
 });
 const [grievanceStatus, setGrievanceStatus] = useState({ type: "", text: "" });

 // --- DATA SYNC ENGINE ---
 const fetchTickets = async () => {
 const userId = userSession?.db_id || userSession?.id;
 if (!userId) return;
 try {
 const { data, error } = await supabase
 .from('helpdesk_tickets')
 .select('*')
 .eq('user_id', userId)
 .order('created_at', { ascending: false });

 if (error) throw error;
 setTickets(data || []);
 sessionStorage.setItem(`helpdesk_tickets_${userId}`, JSON.stringify(data || []));
 } catch (error) {
 console.error("Failed to sync helpdesk tickets:", error);
 }
 };

 useEffect(() => {
 fetchTickets();
 }, [userSession]);

 // --- TICKET SUBMISSION ENGINE ---
 const handleRequestSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setStatusMessage({ type: "", text: "" });

 try {
 const userId = userSession?.db_id || userSession?.id;
 
 // Generate a readable Ticket ID (e.g., TKT-1A2B3C)
 const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
 const ticketId = `TKT-${randomHex}`;

 const { error } = await supabase
 .from('helpdesk_tickets')
 .insert({
 ticket_id: ticketId,
 user_id: userId,
 category: ticketForm.category,
 subject: ticketForm.subject,
 description: ticketForm.description,
 status: 'open',
 admin_reply: 'Awaiting Support Team Review'
 });

 if (error) throw error;

 // Notify Admin
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'New Support Ticket',
 category: 'System Alert',
 target_audience: 'admin',
 priority: 'normal',
 content: `A new support ticket (${ticketForm.subject}) has been raised under ${ticketForm.category}.`,
 author_name: userSession?.name || 'System',
 author_id: userId
 }]);

 setStatusMessage({ type: "success", text: "Ticket routed to the Support Team." });
 fetchTickets(); // Refresh list

 setTimeout(() => {
 setShowTicketModal(false);
 setStatusMessage({ type: "", text: "" });
 setTicketForm({ category: "", subject: "", description: "" });
 }, 2000);

 } catch (error) {
 console.error("Ticket creation failed:", error);
 setStatusMessage({ type: "error", text: "Failed to submit ticket. Please try again." });
 } finally {
 setIsSubmitting(false);
 }
 };

 // --- GRIEVANCE SUBMISSION ENGINE ---
 const handleGrievanceSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setGrievanceStatus({ type: "", text: "" });

 try {
 const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
 
 const descLower = grievanceForm.description.toLowerCase();
 const isCritical = ['ragging', 'harassment', 'assault'].some(word => descLower.includes(word));
 const severity = isCritical ? 'CRITICAL' : 'NORMAL';

 const { error } = await supabase
 .from('grievances')
 .insert({
 tracking_code: randomHex,
 description: grievanceForm.description,
 severity: severity,
 status: 'PENDING'
 });

 if (error) throw error;

 setGrievanceStatus({ type: "success", text: `Submitted anonymously! Tracking Code: ${randomHex}` });
 
 setTimeout(() => {
 setGrievanceStatus({ type: "", text: "" });
 setGrievanceForm({ description: "" });
 }, 5000);

 } catch (error) {
 console.error("Grievance submission failed:", error);
 setGrievanceStatus({ type: "error", text: "Failed to submit grievance. Please try again." });
 } finally {
 setIsSubmitting(false);
 }
 };

 // --- UI HELPERS ---
 const getCategoryTheme = (category) => {
 if (category === 'IT Support') return 'text-blue-400 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10';
 if (category === 'Finance') return 'text-[var(--primary-color)] bg-white/50 dark:bg-transparent bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10';
 if (category === 'Academic') return 'text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10';
 return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 <PageHeader 
 icon="fa-solid fa-headset" 
 title="Helpdesk Support" 
 subtitle="Raise tickets for campus, academic, or IT issues." 
 rightContent={
 <button type="button"
 onClick={() => setShowTicketModal(true)}
 className="px-6 py-3.5 bg-themeAccent hover:bg-themeAccentMuted text-themeApp rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 transition"
 >
 <i className="fa-solid fa-plus text-lg"></i> Raise New Ticket
 </button>
 }
 />

 {/* TICKETS CONTENT */}
 <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in mt-2">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}><i className="fa-solid fa-ticket text-themeTextSec opacity-80 mr-2"></i> My Support Tickets</h2>

 {tickets.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border-theme border-dashed border-black/10 dark:border-white/20 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-clipboard-check text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">No Active Tickets</h3>
 <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.muted} mt-1 lg:mt-2`}>You haven't raised any support requests yet.</p>
 </div>
 ) : (
 tickets.map((ticket) => (
 <div key={ticket.id || ticket.ticket_id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] lg:rounded-[2rem] hover:border-black/5 dark:border-white/10 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 group border border-black/10 dark:border-white/20`}>

 <div className="flex-1 w-full">
 <div className="flex items-center gap-3 mb-2 lg:mb-3">
 <span className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-2.5 py-1 rounded-md border border-black/10 dark:border-white/20 `}>
 {ticket.ticket_id}
 </span>
 <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme ${getCategoryTheme(ticket.category)}`}>
 {ticket.category}
 </span>
 </div>
 <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-[var(--primary-color)] bg-white/50 dark:bg-transparent transition-colors mb-2 leading-tight">{ticket.subject}</h3>
 <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.secondary}`}><span className={theme.text.muted}>Raised on:</span> {new Date(ticket.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
 </div>

 <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 border-t-theme lg:border-t-0 lg:border-l-theme border-black/10 dark:border-white/20 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
 <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 border-theme w-full lg:w-auto ${ticket.status === 'resolved' ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent border-black/5 dark:border-white/10' : 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-[var(--primary-color)] bg-white/50 dark:bg-transparent border-black/5 dark:border-white/10 '
 }`}>
 {ticket.status === 'resolved' ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-clock"></i>}
 {ticket.status === 'open' ? 'In Progress' : 'Resolved'}
 </span>
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-3 lg:p-4 rounded-[2rem] border border-black/10 dark:border-white/20 text-[10px] lg:text-xs font-medium text-themeTextSec w-full lg:max-w-xs flex items-start gap-2 lg:gap-3">
 <i className="fa-solid fa-reply text-[var(--primary-color)] bg-white/50 dark:bg-transparent/70 mt-0.5 shrink-0"></i>
 <span className="line-clamp-2" title={ticket.admin_reply}>{ticket.admin_reply}</span>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* NEW TICKET MODAL */}
 {showTicketModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]">

 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-5 lg:p-6 text-themeText relative border-b-theme border-black/10 dark:border-white/20 shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="flex justify-between items-start relative z-10">
 <div>
 <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText">Create Support Ticket</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.muted} font-medium`}>We usually respond within 24 hours.</p>
 </div>
 <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 text-themeTextSec hover:text-themeText hover:border-amber-500 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 </div>

 <div className="overflow-y-auto no-scrollbar flex-1">
 <form onSubmit={handleRequestSubmit} className="p-5 lg:p-6 flex flex-col gap-5 lg:gap-6">

 {statusMessage.text && (
 <div className={`p-4 rounded-[2rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-theme animate-fade-in ${statusMessage.type === "success" ? "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-transparent" : "bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border-black/5 dark:border-white/10 text-rose-400"
 }`}>
 <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check-circle" : "fa-triangle-exclamation"}`}></i>
 {statusMessage.text}
 </div>
 )}

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Department</label>
 <div className="relative">
 <select
 value={ticketForm.category}
 onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition appearance-none cursor-pointer"
 required
 >
 <option value="" disabled>Select Department...</option>
 <option value="IT Support">IT & Technical Support</option>
 <option value="Finance">Finance & Fees</option>
 <option value="Academic">Academic & Examination</option>
 <option value="Administration">General Administration</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-80 pointer-events-none"></i>
 </div>
 </div>

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Subject</label>
 <input
 type="text"
 value={ticketForm.subject}
 onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
 placeholder="Brief description of the issue"
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition placeholder:text-neutral-600"
 required
 />
 </div>

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Detailed Explanation</label>
 <textarea
 rows="4"
 value={ticketForm.description}
 onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
 placeholder="Please provide as much detail as possible..."
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] px-4 py-3 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition resize-none placeholder:text-neutral-600"
 required
 ></textarea>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className={`w-full mt-2 py-4 rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex justify-center items-center gap-2 overflow-hidden group shrink-0 ${isSubmitting
 ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-neutral-600 cursor-not-allowed border border-black/10 dark:border-white/20 '
 : 'bg-amber-500 text-[#050505] hover:bg-amber-400 active:scale-[0.98]'
 }`}
 >
 {!isSubmitting && (
 <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
 )}
 {isSubmitting ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
 ) : (
 <><i className="fa-solid fa-paper-plane"></i> Submit Ticket</>
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
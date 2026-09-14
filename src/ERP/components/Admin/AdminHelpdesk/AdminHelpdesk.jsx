/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminHelpdesk({ isHubView = false , isEmbedded = false}) {
 const [tickets, setTickets] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [activeTab, setActiveTab] = useState("all");
 const [replyText, setReplyText] = useState({});
 const [submittingReply, setSubmittingReply] = useState(null);

 useEffect(() => {
 fetchTickets();
 }, []);

 const fetchTickets = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('helpdesk_tickets')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) throw error;
 setTickets(data || []);
 } catch (error) {
 console.error("Failed to fetch tickets:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleReply = async (ticketId, isClosing = false) => {
 const text = replyText[ticketId];
 if (!text && !isClosing) return window.erpDialog.alert("Reply text cannot be empty");

 setSubmittingReply(ticketId);
 try {
 const updatePayload = {
 admin_reply: text || 'Closed by Admin',
 };
 if (isClosing) updatePayload.status = 'resolved';

 const { error } = await supabase
 .from('helpdesk_tickets')
 .update(updatePayload)
 .eq('id', ticketId)
 .select(); // We need the user_id to notify them

 if (error) throw error;
 
 // Notify Requester
 const ticketData = error ? null : (await supabase.from('helpdesk_tickets').select('*').eq('id', ticketId).single()).data;
 if (ticketData) {
 // If it's a student (has user_id)
 if (ticketData.user_id) {
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: isClosing ? 'Support Ticket Resolved' : 'Support Ticket Replied',
 category: 'System Alert',
 target_audience: 'student',
 target_user_id: ticketData.user_id,
 priority: 'normal',
 content: `Your support ticket (${ticketData.ticket_id}) has been ${isClosing ? 'resolved' : 'replied to'} by the Admin.`,
 author_name: 'Admin',
 author_id: null
 }]);
 }
 
 // If it's a public inquiry (no user_id), extract email from description
 let contactEmail = null;
 const emailMatch = ticketData.description.match(/Email: ([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
 if (emailMatch && emailMatch[1]) {
 contactEmail = emailMatch[1];
 }
 
 if (contactEmail) {
 try {
 await sendSystemEmail('TICKET_REPLY', {
 to_email: contactEmail,
 ticket_id: ticketData.ticket_id,
 admin_reply: updatePayload.admin_reply
 });
 } catch(e) { console.warn("Failed to send email reply", e); }
 }
 }

 setReplyText(prev => ({ ...prev, [ticketId]: '' }));
 fetchTickets();
 } catch (error) {
 console.error("Failed to reply:", error);
 window.erpDialog.alert("Failed to submit reply.");
 } finally {
 setSubmittingReply(null);
 }
 };

 const filteredTickets = activeTab === "all" ? tickets : tickets.filter(t => t.category === activeTab);

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-headset" title="Admin Helpdesk" subtitle="Manage and reply to student tickets and public inquiries." />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-2xl backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8' : 'mb-4'}`}>
 {['all', 'public_inquiry', 'IT Support', 'Finance', 'Academic', 'Administration'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white border border-black/10 dark:border-white/40 scale-100' 
 : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {tab === 'all' ? 'All Tickets' : tab === 'public_inquiry' ? 'Public Inquiries' : tab}
 </button>
 ))}
 </div>

 <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in">
 {isLoading ? (
 <div className="flex justify-center p-12">
 <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
 </div>
 ) : filteredTickets.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeApp border border-dashed border-white/5 rounded-themePanel text-center px-4">
 <i className="fa-solid fa-check-double text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">All Caught Up</h3>
 <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-[#8E8E93] mt-1 lg:mt-2`}>No tickets found for this category.</p>
 </div>
 ) : (
 filteredTickets.map(ticket => (
 <div key={ticket.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel border border-white/5 hover:border-black/5 dark:border-white/10 transition flex flex-col gap-4`}>
 <div className="flex justify-between items-start gap-4">
 <div>
 <div className="flex items-center gap-3 mb-2">
 {ticket.ticket_id && (
 <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest bg-themePanel/85 backdrop-blur-2xl px-2.5 py-1 rounded-md border border-white/5">
 {ticket.ticket_id}
 </span>
 )}
 <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-themeElevated/90 backdrop-blur-2xl text-themeAccent border-black/5 dark:border-white/10">
 {ticket.category === 'public_inquiry' ? 'Public Inquiry' : ticket.category}
 </span>
 <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${ticket.status === 'resolved' ? 'bg-themeElevated/90 backdrop-blur-2xl text-emerald-400 border-black/5 dark:border-white/10' : 'bg-themeElevated/90 backdrop-blur-2xl text-amber-500 border-black/5 dark:border-white/10'}`}>
 {ticket.status}
 </span>
 </div>
 <h3 className="text-base lg:text-lg font-black text-themeText mb-2">{ticket.subject}</h3>
 <div className="text-xs lg:text-sm text-themeTextSec bg-themePanel/85 backdrop-blur-2xl p-4 rounded-lg border border-white/5 whitespace-pre-wrap font-medium">
 {ticket.description}
 </div>
 <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-3">
 Received: {new Date(ticket.created_at).toLocaleString()}
 </p>
 </div>
 </div>
 
 <div className="border-t border-white/5 pt-4 mt-2">
 {ticket.status === 'resolved' ? (
 <div className="bg-themePanel/85 backdrop-blur-2xl p-4 rounded-lg border border-white/5">
 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Admin Reply</span>
 <p className="text-sm font-bold text-themeText">{ticket.admin_reply}</p>
 </div>
 ) : (
 <div className="flex flex-col lg:flex-row gap-3">
 <textarea
 value={replyText[ticket.id] || ''}
 onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
 placeholder="Write your reply here..."
 className="flex-1 bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-lg px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent resize-none min-h-[80px]"
 />
 <div className="flex lg:flex-col gap-2 shrink-0">
 <button 
 onClick={() => handleReply(ticket.id, false)}
 disabled={submittingReply === ticket.id}
 className="flex-1 lg:flex-none px-4 py-2 bg-themeAccent hover:bg-themeAccent/80 text-themeText font-black uppercase tracking-widest text-[10px] rounded-lg transition-colors border border-white/5"
 >
 Send Reply
 </button>
 <button 
 onClick={() => handleReply(ticket.id, true)}
 disabled={submittingReply === ticket.id}
 className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-themeText font-black uppercase tracking-widest text-[10px] rounded-lg transition-colors border border-white/5"
 >
 Resolve & Close
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 );
}
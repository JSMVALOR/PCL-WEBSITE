/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useNotification } from '../../../../Shared/context/NotificationContext';
import { sendSystemEmail, sendSystemWhatsApp } from '../../../lib/EmailService';

export default function AdminHelpdesk({ isEmbedded = false, isHubView = false }) {
 const [tickets, setTickets] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [activeTab, setActiveTab] = useState("all");
 const [selectedTicketId, setSelectedTicketId] = useState(null);
 const [replyText, setReplyText] = useState({});
 const [submittingReply, setSubmittingReply] = useState(null);
 const { addFlag } = useNotification();

 useEffect(() => {
 fetchTickets();
 }, []);

 const fetchTickets = async (silent = false) => {
 if (!silent) setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('helpdesk_tickets')
 .select('*, profiles(full_name, role, erp_id, email)')
 .neq('category', 'Public Inquiry')
 .neq('category', 'public_inquiry')
 .order('created_at', { ascending: false });

 if (error) throw error;
 setTickets(data || []);
 } catch (error) { console.error(error); addFlag({title: "Error", description: "An error occurred. Please try again.", type: "error"}); } finally {
 if (!silent) setIsLoading(false);
 }
 };

 const handleReply = async (ticketId, isClosing = false) => {
 const text = replyText[ticketId];
 if (!text && !isClosing) return window.erpDialog.alert("Reply text cannot be empty");

 setSubmittingReply(ticketId);
 try {
 const currentTicket = tickets.find(t => t.id === ticketId);
 let thread = [];
 try { 
   thread = JSON.parse(currentTicket.admin_reply); 
   if (!Array.isArray(thread)) throw new Error('Not array'); 
   thread = thread.map(reply => ({ ...reply, author: reply.author || 'Admin' }));
 } catch {
   if (currentTicket.admin_reply !== 'Awaiting Support Team Review') thread = [{ text: currentTicket.admin_reply, date: currentTicket.updated_at || new Date().toISOString(), author: 'Admin' }];
 }
 
 if ((thread.length === 0 || thread[0].author !== 'User') && currentTicket.description) {
   thread.unshift({ text: currentTicket.description, date: currentTicket.created_at, author: 'User' });
 }

 if (text || isClosing) thread.push({ text: text || 'Closed by Admin', date: new Date().toISOString(), author: 'Admin' });

 const updatePayload = {
 admin_reply: JSON.stringify(thread) };
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
 target_audience: ['student'],
 target_user_id: ticketData.user_id,
 priority: 'normal',
 content: `Your support ticket (${ticketData.ticket_id}) has been ${isClosing ? 'resolved' : 'replied to'} by the Admin.`,
 author_name: 'Admin',
 author_id: null
 }]);
 // Bell notification for ticket update
 if (ticketData.user_id) {
   await supabase.from('notifications').insert([{
     recipient_id: ticketData.user_id,
     title: isClosing ? 'Support Ticket Resolved' : 'Support Ticket Replied',
     message: `Your ticket (${ticketData.ticket_id}) has been updated.`,
     type: 'notice',
     action_link: 'helpdesk'
   }]);

   // Also fetch profile to send Email & WA
   const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticketData.user_id);
   const { data: profile } = await supabase.from('profiles')
      .select('contact_email, contact_phone, email, phone')
      .eq(isUUID ? 'id' : 'erp_id', ticketData.user_id)
      .maybeSingle();
   if (profile) {
      const emailToUse = profile.contact_email || profile.email;
      if (emailToUse) {
       try {
         await sendSystemEmail('TICKET_REPLY', {
           to_email: emailToUse,
           ticket_id: ticketData.ticket_id,
           admin_reply: text || (isClosing ? 'Resolved & Closed' : 'Updated')
         });
         addFlag({title: "Email Sent", description: "Requester was notified via email.", type: "success"});
       } catch (e) { console.warn("Failed to send email", e); }
     }
      const phoneToUse = profile.contact_phone || profile.phone;
      if (phoneToUse) {
        try {
          const waNumber = phoneToUse.length === 10 ? `91${phoneToUse}` : phoneToUse;
         await sendSystemWhatsApp(waNumber, `Hello!\n\nThere is an update to your internal support ticket (${ticketData.ticket_id}).\n\nAdmin Reply: ${text || (isClosing ? 'Resolved & Closed' : 'Updated')}`);
         addFlag({title: "WhatsApp Sent", description: "Requester was notified via WhatsApp.", type: "success"});
       } catch (e) { console.warn("Failed to send WA", e); }
     }
   }
 }
 }
 
 }

 setReplyText(prev => ({ ...prev, [ticketId]: '' }));
  
  // Optimistically update the UI so it doesn't need a fetch to show the message
  setTickets(prev => prev.map(t => {
    if (t.id === ticketId) {
      return { ...t, admin_reply: JSON.stringify(thread), status: isClosing ? 'resolved' : t.status };
    }
    return t;
  }));

  addFlag({title: "Success", description: "Reply sent successfully.", type: "success"});
 } catch (error) { console.error(error); addFlag({title: "Error", description: "Failed to send reply.", type: "error"}); } finally {
 setSubmittingReply(null);
 }
 };

 const filteredTickets = activeTab === "all" ? tickets : tickets.filter(t => t.category === activeTab);

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-transparent text-themeText " : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"}`}>
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-headset" title="Admin Helpdesk" subtitle="Manage and reply to student tickets and public inquiries." />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-2xl border border-themeBorder dark:border-white/[0.08] relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`}>
 {['all', 'IT Support', 'Finance', 'Academic', 'Administration'].map(tab => (
 <button type="button"
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab 
 ? 'bg-themePanel backdrop-blur-[80px] text-themeText border border-themeBorder scale-100' 
 : 'text-themeText/60 hover:text-themeText dark:hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {tab === 'all' ? 'All Tickets' : tab}
 </button>
 ))}
 </div>

 <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in">
 {isLoading ? (
 <div className="flex justify-center p-12 w-full">
 <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
 </div>
 ) : filteredTickets.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-check-double text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">All Caught Up</h3>
 <p className={`text-[9px] lg:text-[13px] font-medium text-themeTextSec mt-1 lg:mt-2`}>No tickets found for this category.</p>
 </div>
 ) : (
   <>
     {/* LEFT PANE: List of tickets */}
     <div className={`w-full ${selectedTicketId ? 'lg:w-[350px] xl:w-[400px] shrink-0 hidden lg:flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
       {filteredTickets.map(ticket => (
          <div 
            key={ticket.id} 
            onClick={() => setSelectedTicketId(ticket.id)}
            className={`p-4 lg:p-5 rounded-themePanel border transition cursor-pointer flex flex-col gap-3 ${selectedTicketId === ticket.id ? 'bg-themeElevated border-themeAccent shadow-md' : 'bg-themePanel/60 border-themeBorder dark:border-white/[0.08] hover:border-themeAccent/50'}`}
          >
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
               <div className="flex gap-2">
                 <span className="text-[10px] font-bold text-themeTextSec tracking-normal bg-themeElevated dark:bg-themeElevated/90 px-2 py-1 rounded border border-themeBorder dark:border-white/[0.08]">
                 {ticket.ticket_id}
                 </span>
                 <span className="text-[10px] font-bold text-themeAccent bg-themeAccent/10 px-2 py-1 rounded border border-themeAccent/20 uppercase tracking-widest">
                 {ticket.category || 'General'}
                 </span>
               </div>
               <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
               {ticket.status}
               </span>
            </div>
            <h3 className="text-sm lg:text-base font-bold tracking-tight text-themeText line-clamp-2">{ticket.subject}</h3>
            
            {ticket.profiles && (
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-themeBorder/50">
            <div className="w-5 h-5 rounded-full bg-themeElevated flex items-center justify-center border border-themeBorder dark:border-white/[0.08]">
            <i className="fa-solid fa-user text-[8px] text-themeTextSec"></i>
            </div>
            <span className="text-[11px] font-bold text-themeTextSec truncate">{ticket.profiles.full_name}</span>
            </div>
            )}
          </div>
       ))}
     </div>

     {/* RIGHT PANE: Details */}
     {selectedTicketId && (
       <div className="flex-1 bg-themePanel/60 dark:bg-themePanel/60 backdrop-blur-3xl rounded-themePanel border border-themeBorder dark:border-white/[0.08] p-5 lg:p-8 flex flex-col animate-fade-in shadow-premium sticky top-24 h-max">
          {(() => {
            const ticket = tickets.find(t => t.id === selectedTicketId);
            if (!ticket) return null;
            
            let thread = [];
            try { 
              thread = JSON.parse(ticket.admin_reply); 
              if (!Array.isArray(thread)) throw new Error('Not array'); 
              thread = thread.map(reply => ({ ...reply, author: reply.author || 'Admin' }));
            } catch {
              if (ticket.admin_reply !== 'Awaiting Support Team Review') thread = [{ text: ticket.admin_reply, date: ticket.updated_at, author: 'Admin' }];
            }
            if ((thread.length === 0 || thread[0].author !== 'User') && ticket.description) {
              thread.unshift({ text: ticket.description, date: ticket.created_at, author: 'User' });
            }

            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                   <div className="flex items-center gap-3">
                       <button type="button" onClick={() => setSelectedTicketId(null)} className="lg:hidden w-10 h-10 rounded-xl bg-themeElevated border border-themeBorder flex items-center justify-center text-themeTextSec">
                          <i className="fa-solid fa-arrow-left"></i>
                       </button>
                       <div>
                          <h2 className="text-xl lg:text-2xl font-black text-themeText tracking-tight mb-1">{ticket.subject}</h2>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-themeAccent bg-themeAccent/10 px-2 py-1 rounded-md border border-themeAccent/20">{ticket.category}</span>
                            <span className="text-[11px] font-bold text-themeTextSec">Requested on {new Date(ticket.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                   </div>
                   {ticket.status === 'resolved' && (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                        <i className="fa-solid fa-check-double"></i> Resolved
                      </span>
                   )}
                </div>

                <div className="bg-themeElevated p-5 rounded-2xl border border-themeBorder mb-6">
                  <div className="flex items-center gap-3 mb-4 border-b border-themeBorder pb-3">
                    <div className="w-8 h-8 rounded-full bg-themePanel flex items-center justify-center border border-themeBorder">
                    <i className="fa-solid fa-user text-themeTextSec text-xs"></i>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-themeText">{ticket.profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-[10px] uppercase tracking-widest text-themeTextSec">{ticket.profiles?.role} • {ticket.profiles?.erp_id}</div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-themeText leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {thread.length > 0 && (
                <div className="flex flex-col gap-4 mb-6">
                {thread.map((reply, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border relative ml-4 lg:ml-8 ${reply.author === 'Admin' ? 'bg-themeAccent/5 border-themeAccent/10' : 'bg-themeElevated border-themeBorder'}`}>
                   <div className={`absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center border-4 border-themeApp shadow-sm ${reply.author === 'Admin' ? 'bg-themeAccent' : 'bg-blue-500'}`}>
                      <i className={`fa-solid ${reply.author === 'Admin' ? 'fa-reply' : 'fa-user'} text-white text-[8px]`}></i>
                   </div>
                   <span className={`text-[10px] uppercase tracking-widest font-bold block mb-2 ${reply.author === 'Admin' ? 'text-themeAccent' : 'text-themeTextSec'}`}>
                     {reply.author} • {reply.date ? new Date(reply.date).toLocaleString() : 'Unknown Date'}
                   </span>
                   <p className="text-sm font-bold text-themeText whitespace-pre-wrap">{reply.text}</p>
                </div>
                ))}
                </div>
                )}

                <div className="mt-auto border-t border-themeBorder pt-6">
                {ticket.status === 'resolved' ? (
                <div className="flex flex-col gap-4 text-center p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                   <span className="text-[13px] font-bold text-emerald-500 uppercase tracking-widest block"><i className="fa-solid fa-lock mr-2"></i> Ticket Resolved & Closed</span>
                   <button type="button" 
                     onClick={async () => {
                       const { error } = await supabase.from('helpdesk_tickets').update({ status: 'open' }).eq('id', ticket.id);
                       if (!error) {
                         addFlag({title: "Success", description: "Ticket reopened successfully", type: "success"});
                         setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'open' } : t));
                       }
                     }}
                     className="mx-auto w-fit px-6 py-2.5 bg-themeElevated hover:bg-themePanel text-themeText font-bold text-xs tracking-normal rounded-xl transition-colors border border-themeBorder shadow-sm flex items-center justify-center gap-2"
                   >
                     <i className="fa-solid fa-unlock"></i> Reopen Ticket
                   </button>
                </div>
                ) : (
                <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec ml-1">Send a Reply</label>
                <textarea
                value={replyText[ticket.id] || ''}
                onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                placeholder="Type your response to the user..."
                className="w-full bg-themeElevated backdrop-blur-md border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent resize-none min-h-[100px]"
                />
                <div className="flex gap-3 justify-end">
                <button type="button" 
                onClick={() => handleReply(ticket.id, false)}
                disabled={submittingReply === ticket.id}
                className="px-6 py-2.5 bg-themePanel hover:bg-themeElevated text-themeText font-bold text-xs tracking-normal rounded-xl transition-colors border border-themeBorder"
                >
                {submittingReply === ticket.id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Send Reply'}
                </button>
                <button type="button" 
                onClick={() => handleReply(ticket.id, true)}
                disabled={submittingReply === ticket.id}
                className="px-6 py-2.5 bg-themeAccent hover:bg-themeAccent/80 text-themeApp font-bold text-xs tracking-normal rounded-xl transition-colors shadow-sm"
                >
                <i className="fa-solid fa-check-double mr-2"></i> Resolve & Close
                </button>
                </div>
                </div>
                )}
                </div>
              </>
            )
          })()}
       </div>
     )}
   </>
 )}
 </div>
 </div>
 </div>
 );
}
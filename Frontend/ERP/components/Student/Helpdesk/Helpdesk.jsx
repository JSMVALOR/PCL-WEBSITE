/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useNotification } from '../../../../Shared/context/NotificationContext';

export default function Helpdesk({ isEmbedded = false }) {
  const { userSession } = useERP();
  const { addFlag } = useNotification();

  // --- MAIN STATE ---
  const [tickets, setTickets] = useState(() => {
    const userId = userSession?.db_id || userSession?.id;
    if (!userId) return [];
    const cached = sessionStorage.getItem(`helpdesk_tickets_${userId}`);
    return cached ? JSON.parse(cached) : [];
  });

  // --- MODAL & FORM STATE ---
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const [ticketForm, setTicketForm] = useState({
    category: "IT Support",
    subject: "",
    description: ""
  });

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
      
      // Update selected ticket if it's open
      if (selectedTicket) {
        const updated = (data || []).find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error("Failed to sync helpdesk tickets:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTickets();
    
    const channel = supabase.channel('user_helpdesk_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'helpdesk_tickets' }, (payload) => {
         fetchTickets();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userSession]);

  // --- TICKET SUBMISSION ENGINE ---
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const userId = userSession?.db_id || userSession?.id;
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
          admin_reply: JSON.stringify([{ text: ticketForm.description, date: new Date().toISOString(), author: userSession?.name || 'User' }])
        });

      if (error) throw error;

      // Notify Admin
      const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      await supabase.from('notices').insert([{
        notice_id: noticeId,
        title: 'New Support Ticket',
        category: 'System Alert',
        target_audience: ['admin'],
        priority: 'normal',
        content: `A new support ticket (${ticketForm.subject}) has been raised under ${ticketForm.category}.`,
        author_name: userSession?.name || 'System',
        author_id: userId
      }]);

      const { data: adminUsers } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (adminUsers && adminUsers.length > 0) {
        await supabase.from('notifications').insert(adminUsers.map(a => ({
          recipient_id: a.id,
          title: 'New Support Ticket',
          message: `A new support ticket has been raised: ${ticketForm.subject}`,
          type: 'notice',
          action_link: 'helpdesk'
        })));
      }

      addFlag({ title: "Ticket Submitted", description: "Your support ticket has been routed to the Support Team.", type: "success" });
      setStatusMessage({ type: "success", text: "Ticket routed to the Support Team." });
      fetchTickets();

      setTimeout(() => {
        setShowTicketModal(false);
        setStatusMessage({ type: "", text: "" });
        setTicketForm({ category: "IT Support", subject: "", description: "" });
      }, 2000);

    } catch (error) {
      console.error("Ticket creation failed:", error);
      addFlag({ title: "Submission Failed", description: "Failed to submit ticket. Please try again.", type: "error" });
      setStatusMessage({ type: "error", text: "Failed to submit ticket. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    try {
      let thread = [];
      try { 
        thread = JSON.parse(selectedTicket.admin_reply); 
        if (!Array.isArray(thread)) throw new Error('Not array'); 
      } catch {
        if (selectedTicket.admin_reply && selectedTicket.admin_reply !== 'Awaiting Support Team Review') {
          thread = [{ text: selectedTicket.admin_reply, date: selectedTicket.updated_at || selectedTicket.created_at, author: 'Admin' }];
        }
      }
      
      const newReply = { text: replyText, date: new Date().toISOString(), author: userSession?.name || 'User' };
      thread.push(newReply);
      
            const { error } = await supabase
        .from('helpdesk_tickets')
        .update({ admin_reply: JSON.stringify(thread), status: 'open' })
        .eq('id', selectedTicket.id);

      if (error) throw error;
      
      // Notify Admin
      try {
        await supabase.from('notices').insert([{
          notice_id: `TKT-REPLY-${Date.now()}`,
          title: 'New Ticket Reply',
          category: 'System Alert',
          target_audience: ['admin'],
          content: `User ${userSession?.name || 'Student'} replied to ticket ${selectedTicket.ticket_id}.`,
          author_name: 'System',
          author_id: null
        }]);
        await supabase.from('notifications').insert([{
          recipient_id: 'admin',
          title: 'Ticket Reply',
          message: `User ${userSession?.name || 'Student'} replied to ticket ${selectedTicket.ticket_id}.`,
          type: 'notice',
          action_link: 'adminadmissions'
        }]);
      } catch (notifyErr) { console.warn("Failed to notify admin", notifyErr); }
      
      setReplyText("");
      
      const updatedTicket = { ...selectedTicket, admin_reply: JSON.stringify(thread), status: 'open' };
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      
      addFlag({ title: 'Reply Sent', description: 'Your reply has been added to the ticket.', type: 'success' });
    } catch (error) {
      console.error(error);
      addFlag({ title: 'Reply Failed', description: 'Could not send reply.', type: 'error' });
    } finally {
      setIsReplying(false);
    }
  };

  // --- UI HELPERS ---
  const getCategoryTheme = (category) => {
    if (category === 'IT Support') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (category === 'Finance') return 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20';
    if (category === 'Academic') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  };

  const parseThread = (replyString, fallbackDesc) => {
    let thread = [];
    try { 
      thread = JSON.parse(replyString); 
      if (!Array.isArray(thread)) throw new Error('Not array'); 
      // Ensure all objects have an author
      thread = thread.map(reply => ({ ...reply, author: reply.author || 'Admin' }));
    } catch {
      if (replyString && replyString !== 'Awaiting Support Team Review') {
        thread = [{ text: replyString, date: new Date().toISOString(), author: 'Admin' }];
      }
    }
    
    // If the thread is empty, or the first message isn't the initial user description, inject it!
    if ((thread.length === 0 || thread[0].author !== 'User') && fallbackDesc) {
      thread.unshift({ text: fallbackDesc, date: new Date().toISOString(), author: 'User' });
    }
    return thread;
  };

  return (
    <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
      <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-12" : "pb-10"}`}>

        <PageHeader
          icon="fa-solid fa-headset"
          title="Helpdesk Support"
          subtitle="Raise tickets for campus, academic, or IT issues."
          rightContent={
            <button type="button"
              onClick={() => setShowTicketModal(true)}
              className="px-6 py-3 bg-themeAccent hover:bg-themeAccentMuted text-themeApp rounded-xl text-sm font-semibold tracking-tight shadow-md flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 transition"
            >
              <i className="fa-solid fa-plus"></i> Raise New Ticket
            </button>
          }
        />

        <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in w-full max-w-5xl">
          <h2 className="text-xl font-bold text-themeText tracking-tight mb-2">
            <i className="fa-solid fa-ticket text-themeAccent/80 mr-2"></i> My Support Tickets
          </h2>

          {tickets.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center bg-themeElevated border border-dashed border-themeBorder rounded-3xl text-center px-4">
              <i className="fa-solid fa-clipboard-check text-5xl text-themeTextSec/50 mb-4"></i>
              <h3 className="text-lg font-black text-themeText">No Active Tickets</h3>
              <p className="text-sm font-medium text-themeTextSec mt-2">You haven't raised any support requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => {
                const thread = parseThread(ticket.admin_reply, ticket.description);
                const lastReply = thread[thread.length - 1];

                return (
                  <div 
                    key={ticket.id || ticket.ticket_id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-themeElevated border border-themeBorder shadow-premium rounded-themePanel p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 hover:border-themeAccent/50 cursor-pointer transition-all group"
                  >
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[11px] font-black tracking-widest text-themeTextSec bg-themePanel px-3 py-1 rounded-md border border-themeBorder">
                          {ticket.ticket_id}
                        </span>
                        <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${getCategoryTheme(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-themeText mb-1 truncate group-hover:text-themeAccent transition-colors">{ticket.subject}</h3>
                      <p className="text-xs font-semibold text-themeTextSec">Raised on: {new Date(ticket.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t border-themeBorder lg:border-t-0 lg:border-l lg:pl-6 w-full lg:w-[300px]">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center justify-center gap-2 border w-full lg:w-auto ${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {ticket.status === 'resolved' ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-clock"></i>}
                        {ticket.status === 'open' ? 'In Progress' : 'Resolved'}
                      </span>
                      
                      {lastReply && (
                        <div className="w-full flex items-start gap-2 bg-themePanel p-3 rounded-lg border border-themeBorder">
                          <i className={`fa-solid ${lastReply.author === 'Admin' ? 'fa-reply text-emerald-500' : 'fa-user text-blue-500'} mt-0.5 text-[10px]`}></i>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">{lastReply.author} • {new Date(lastReply.date).toLocaleDateString()}</span>
                            <span className="text-xs font-medium text-themeText truncate">{lastReply.text}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TICKET DETAIL MODAL */}
        {selectedTicket && createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-3xl bg-themeApp border border-themeBorder shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="p-6 border-b border-themeBorder bg-themeElevated shrink-0 flex justify-between items-start">
                <div className="flex flex-col min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-black tracking-widest text-themeTextSec bg-themePanel px-2 py-1 rounded border border-themeBorder">
                      {selectedTicket.ticket_id}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${getCategoryTheme(selectedTicket.category)}`}>
                      {selectedTicket.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${selectedTicket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {selectedTicket.status === 'open' ? 'In Progress' : 'Resolved'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-themeText break-words leading-tight">{selectedTicket.subject}</h3>
                </div>
                <button type="button" onClick={() => setSelectedTicket(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-themePanel border border-themeBorder text-themeTextSec hover:text-themeText transition-colors shrink-0">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-themeApp custom-scrollbar">
                {parseThread(selectedTicket.admin_reply, selectedTicket.description).map((reply, idx) => (
                  <div key={idx} className={`flex w-full ${reply.author === 'Admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${reply.author === 'Admin' ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">
                          {reply.author}
                        </span>
                        <span className="text-[9px] font-medium text-themeTextSec/60">
                          {new Date(reply.date).toLocaleString()}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed border ${
                        reply.author === 'Admin' 
                        ? 'bg-themeElevated border-themeBorder text-themeText rounded-tl-none' 
                        : 'bg-themeAccent/10 border-themeAccent/20 text-themeText rounded-tr-none'
                      }`}>
                        {reply.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status === 'open' && (
                <div className="p-4 sm:p-6 bg-themeElevated border-t border-themeBorder shrink-0">
                  <form onSubmit={handleReplySubmit} className="flex gap-3">
                    <input 
                      type="text" 
                      required 
                      placeholder="Type your reply..." 
                      className="flex-1 bg-themePanel border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none"
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                    />
                    <button 
                      disabled={isReplying || !replyText.trim()} 
                      type="submit" 
                      className="px-6 bg-themeAccent hover:bg-themeAccentMuted text-themeApp font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    >
                      {isReplying ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>, document.body
        )}

        {/* NEW TICKET MODAL */}
        {showTicketModal && createPortal(
          <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col h-full relative">
              <div className="p-6 lg:p-8 shrink-0 flex justify-between items-start relative z-10 border-b border-themeBorder/50">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-2 text-themeText flex items-center gap-3">
                    <i className="fa-solid fa-life-ring text-themeAccent"></i>
                    Create Support Ticket
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-themeTextSec">We usually respond within 24 hours.</p>
                </div>
                <button type="button" onClick={() => setShowTicketModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-themeElevated border border-themeBorder text-themeTextSec hover:text-themeText hover:bg-black/10 transition-colors shrink-0">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="p-6 lg:p-8 overflow-y-auto">
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5 max-w-3xl">
                  {statusMessage.text && (
                    <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-3 ${statusMessage.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      <i className={`fa-solid ${statusMessage.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                      {statusMessage.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Category</label>
                    <select required className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none" value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}>
                      <option>IT Support</option>
                      <option>Finance</option>
                      <option>Academic</option>
                      <option>Campus Facilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Subject</label>
                    <input type="text" required placeholder="Brief summary of the issue..." className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Detailed Description</label>
                    <textarea required rows="5" className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Explain your issue in detail..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}></textarea>
                  </div>

                  <button disabled={isSubmitting} type="submit" className="w-full bg-themeAccent hover:bg-themeAccentMuted text-themeApp font-bold text-sm py-4 rounded-xl transition-colors mt-2 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-paper-plane"></i> Submit Ticket</>}
                  </button>
                </form>
              </div>
            </div>
          </div>, document.body
        )}
      </div>
    </div>
  );
}

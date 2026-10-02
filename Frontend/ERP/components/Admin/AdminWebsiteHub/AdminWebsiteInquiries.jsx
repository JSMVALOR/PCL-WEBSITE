/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail, sendSystemWhatsApp } from "../../../lib/EmailService";

export default function AdminWebsiteInquiries({ isEmbedded = false }) {
 const [inquiries, setInquiries] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [replyText, setReplyText] = useState({});
 const [submittingReply, setSubmittingReply] = useState(null);
 const [selectedTicketId, setSelectedTicketId] = useState(null);

 useEffect(() => {
 fetchInquiries();
 }, []);

 const fetchInquiries = async () => {
 try {
 setIsLoading(true);
 const { data, error } = await supabase
 .from('helpdesk_tickets')
 .select('*')
 .eq('category', 'Public Inquiry')
 .order('created_at', { ascending: false });

 // Also check lowercase 'public_inquiry' just in case
 const { data: data2 } = await supabase
 .from('helpdesk_tickets')
 .select('*')
 .eq('category', 'public_inquiry')
 .order('created_at', { ascending: false });

 if (error) throw error;
 
 const combined = [...(data || []), ...(data2 || [])];
 // Remove duplicates if any
 const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
 unique.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
 
 setInquiries(unique);
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsLoading(false);
 }
 };

 const handleReply = async (ticketId, isClosing = false) => {
 const ticketData = inquiries.find(t => t.id === ticketId);
 if (!ticketData) return;

 const adminReply = replyText[ticketId] || '';
 if (isClosing && !adminReply && ticketData.status !== 'resolved') {
 window.erpDialog?.alert("Please provide a reply before resolving the inquiry.");
 return;
 }

 try {
 setSubmittingReply(ticketId);
 
 let thread = [];
 try { thread = JSON.parse(ticketData.admin_reply); if (!Array.isArray(thread)) throw new Error('Not array'); } catch {
   if (ticketData.admin_reply && ticketData.admin_reply !== 'Awaiting Support Team Review') thread = [{ text: ticketData.admin_reply, date: ticketData.updated_at || new Date().toISOString() }];
 }
 
 if (adminReply || isClosing) {
   thread.push({ text: adminReply || 'Closed by Admin', date: new Date().toISOString() });
 }

 const updatePayload = {
 status: isClosing ? 'resolved' : 'open',
 admin_reply: JSON.stringify(thread)
 };

 const { error } = await supabase
 .from('helpdesk_tickets')
 .update(updatePayload)
 .eq('id', ticketId);

 if (error) throw error;

 // Send email & WhatsApp if it's a public inquiry and has contact info in the description
 if (adminReply) {
 let contactEmail = null;
 let contactPhone = null;
 const emailMatch = ticketData.description.match(/Email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
 const phoneMatch = ticketData.description.match(/Phone:\s*([0-9\+\-\s]+)/);
 
 if (emailMatch && emailMatch[1]) contactEmail = emailMatch[1];
 if (phoneMatch && phoneMatch[1]) contactPhone = phoneMatch[1].trim().replace(/[^0-9]/g, '');
 
 if (contactEmail && sendSystemEmail) {
 try {
 await sendSystemEmail('TICKET_REPLY', {
 to_email: contactEmail,
 ticket_id: ticketData.ticket_id,
 admin_reply: adminReply
 });
 if (window.erpToast) window.erpToast.show("Email notification dispatched.", "success");
 } catch (e) { console.warn("Failed to send email reply", e); }
 }

 if (contactPhone && sendSystemWhatsApp) {
 try {
 // Add 91 prefix for Indian numbers if it's 10 digits
 const waNumber = contactPhone.length === 10 ? `91${contactPhone}` : contactPhone;
 await sendSystemWhatsApp(waNumber, `Hello! Regarding your inquiry to Prudentia College of Law (Ticket #${ticketData.ticket_id}):\n\n${adminReply}`);
 if (window.erpToast) window.erpToast.show("WhatsApp message dispatched.", "success");
 } catch (e) { console.warn("Failed to send WA reply", e); }
 }
 }

 setReplyText(prev => ({ ...prev, [ticketId]: '' }));
 fetchInquiries();
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setSubmittingReply(null);
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated dark:bg-themeElevated/20 ${!isEmbedded ? "min-h-screen bg-transparent text-themeText " : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"}`}>
 
 {!isEmbedded && (
 <div className="flex items-center gap-4 mb-2">
 <div className="w-12 h-12 rounded-xl bg-themeAccent/20 flex items-center justify-center shrink-0 border border-themeAccent/30 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
 <i className="fa-solid fa-envelope-open-text text-themeAccent text-xl"></i>
 </div>
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-themeText mb-1">Website Enquiries</h1>
 <p className="text-xs font-bold text-themeTextSec tracking-normal">Manage messages submitted through the public Contact Us form.</p>
 </div>
 </div>
 )}

 <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in">
 {isLoading ? (
 <div className="flex justify-center p-12 w-full">
 <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
 </div>
 ) : inquiries.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] rounded-[2rem] text-center px-4 shadow-premium">
 <i className="fa-solid fa-inbox text-4xl lg:text-5xl text-neutral-400 mb-3 lg:mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">Inbox Zero</h3>
 <p className="text-[10px] lg:text-[13px] font-medium text-themeTextSec mt-1 lg:mt-2">No public enquiries pending.</p>
 </div>
 ) : (
   <>
     {/* LEFT PANE: List of tickets */}
     <div className={`w-full ${selectedTicketId ? 'lg:w-[350px] xl:w-[400px] shrink-0 hidden lg:flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
       {inquiries.map(inquiry => (
          <div 
            key={inquiry.id} 
            onClick={() => setSelectedTicketId(inquiry.id)}
            className={`p-4 lg:p-5 rounded-themePanel border transition cursor-pointer flex flex-col gap-3 ${selectedTicketId === inquiry.id ? 'bg-themeElevated border-themeAccent shadow-md' : 'bg-themePanel/60 border-themeBorder dark:border-white/[0.08] hover:border-themeAccent/50'}`}
          >
            <div className="flex items-start justify-between gap-2">
               {inquiry.ticket_id && (
               <span className="text-[10px] font-bold text-themeTextSec tracking-normal bg-themeElevated dark:bg-themeElevated/90 px-2 py-1 rounded border border-themeBorder dark:border-white/[0.08]">
               {inquiry.ticket_id}
               </span>
               )}
               <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${inquiry.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
               {inquiry.status}
               </span>
            </div>
            <h3 className="text-sm lg:text-base font-bold tracking-tight text-themeText line-clamp-2">{inquiry.subject}</h3>
            
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-themeBorder/50">
               <i className="fa-regular fa-clock text-[10px] text-themeTextSec"></i>
               <span className="text-[11px] font-bold text-themeTextSec truncate">{new Date(inquiry.created_at).toLocaleDateString()}</span>
            </div>
          </div>
       ))}
     </div>

     {/* RIGHT PANE: Details */}
     {selectedTicketId && (
       <div className="flex-1 bg-themePanel/60 dark:bg-themePanel/60 backdrop-blur-3xl rounded-themePanel border border-themeBorder dark:border-white/[0.08] p-5 lg:p-8 flex flex-col animate-fade-in shadow-premium sticky top-24 h-max">
          {(() => {
            const inquiry = inquiries.find(t => t.id === selectedTicketId);
            if (!inquiry) return null;
            
            let thread = [];
            try { thread = JSON.parse(inquiry.admin_reply); if (!Array.isArray(thread)) throw new Error('Not array'); } catch {
              if (inquiry.admin_reply && inquiry.admin_reply !== 'Awaiting Support Team Review') thread = [{ text: inquiry.admin_reply, date: inquiry.updated_at || inquiry.created_at }];
            }

            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                   <div className="flex items-center gap-3">
                       <button type="button" onClick={() => setSelectedTicketId(null)} className="lg:hidden w-10 h-10 rounded-xl bg-themeElevated border border-themeBorder flex items-center justify-center text-themeTextSec">
                          <i className="fa-solid fa-arrow-left"></i>
                       </button>
                       <div>
                          <h2 className="text-xl lg:text-2xl font-black text-themeText tracking-tight mb-1">{inquiry.subject}</h2>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-themeTextSec">Received {new Date(inquiry.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                   </div>
                   {inquiry.status === 'resolved' && (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                        <i className="fa-solid fa-check-double"></i> Resolved
                      </span>
                   )}
                </div>

             <div className="flex flex-col gap-1 mb-4 border-b border-themeBorder/50 pb-4">
               {(() => {
                 let contactEmail = null;
                 let contactPhone = null;
                 const emailMatch = inquiry.description.match(/Email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
                 const phoneMatch = inquiry.description.match(/Phone:\s*([0-9\+\-\s]+)/);
                 if (emailMatch && emailMatch[1]) contactEmail = emailMatch[1];
                 if (phoneMatch && phoneMatch[1]) contactPhone = phoneMatch[1].trim();

                 return (
                   <>
                     {contactEmail && (
                       <a href={`mailto:${contactEmail}?subject=Reply to your Inquiry: ${inquiry.subject}`} className="text-xs font-bold text-themeTextSec hover:text-themeAccent transition-colors w-fit">
                         <i className="fa-solid fa-envelope mr-2 w-4"></i>{contactEmail}
                       </a>
                     )}
                     {contactPhone && (
                       <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}?text=Hi,%20this%20is%20regarding%20your%20inquiry%20to%20Prudentia%20College%20of%20Law.`} target="_blank" rel="noreferrer" className="text-xs font-bold text-themeTextSec hover:text-green-500 transition-colors w-fit">
                         <i className="fa-brands fa-whatsapp mr-2 w-4"></i>{contactPhone}
                       </a>
                     )}
                   </>
                 );
               })()}
             </div>

             <div className="bg-themeElevated p-5 rounded-2xl border border-themeBorder mb-6">
               <p className="text-sm font-medium text-themeText leading-relaxed whitespace-pre-wrap">{inquiry.description}</p>
             </div>

                {thread.length > 0 && (
                <div className="flex flex-col gap-4 mb-6">
                {thread.map((reply, idx) => (
                <div key={idx} className="bg-[var(--theme-accent)]/5 p-4 rounded-2xl border border-[var(--theme-accent)]/10 ml-4 lg:ml-8 relative">
                   <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-themeAccent flex items-center justify-center border-4 border-themeApp shadow-sm">
                      <i className="fa-solid fa-reply text-white text-[8px]"></i>
                   </div>
                   <span className="text-[10px] uppercase tracking-widest font-bold text-themeAccent block mb-2">Reply Sent (Email & WA) • {reply.date ? new Date(reply.date).toLocaleString() : 'Unknown Date'}</span>
                   <p className="text-sm font-bold text-themeText">{reply.text}</p>
                </div>
                ))}
                </div>
                )}

                <div className="mt-auto border-t border-themeBorder pt-6">
                {inquiry.status === 'resolved' ? (
                <div className="flex flex-col gap-4 text-center p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                   <span className="text-[13px] font-bold text-emerald-500 uppercase tracking-widest block"><i className="fa-solid fa-lock mr-2"></i> Enquiry Resolved & Closed</span>
                   <button type="button" 
                     onClick={async () => {
                       const { error } = await supabase.from('helpdesk_tickets').update({ status: 'open' }).eq('id', inquiry.id);
                       if (!error) {
                         if (window.erpToast) window.erpToast.show("Enquiry reopened successfully", "success");
                         fetchInquiries();
                       }
                     }}
                     className="mx-auto w-fit px-6 py-2.5 bg-themeElevated hover:bg-themePanel text-themeText font-bold text-xs tracking-normal rounded-xl transition-colors border border-themeBorder shadow-sm flex items-center justify-center gap-2"
                   >
                     <i className="fa-solid fa-unlock"></i> Reopen Enquiry
                   </button>
                </div>
                ) : (
                <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec ml-1">Send an Email Reply</label>
                <textarea
                value={replyText[inquiry.id] || ''}
                onChange={(e) => setReplyText(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                placeholder="Type your email response here..."
                className="w-full bg-themeElevated backdrop-blur-md border border-themeBorder rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent resize-none min-h-[100px]"
                />
                <div className="flex gap-3 justify-end">
                <button type="button" 
                onClick={() => handleReply(inquiry.id, false)}
                disabled={submittingReply === inquiry.id}
                className="px-6 py-2.5 bg-themePanel hover:bg-themeElevated text-themeText font-bold text-xs tracking-normal rounded-xl transition-colors border border-themeBorder"
                >
                {submittingReply === inquiry.id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Send Email Reply'}
                </button>
                <button type="button" 
                onClick={() => handleReply(inquiry.id, true)}
                disabled={submittingReply === inquiry.id}
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

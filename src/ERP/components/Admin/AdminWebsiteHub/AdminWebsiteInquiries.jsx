import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { sendSystemEmail } from "../../../../lib/EmailService";

export default function AdminWebsiteInquiries({ isEmbedded = false }) {
    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState({});
    const [submittingReply, setSubmittingReply] = useState(null);

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
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
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
            
            const updatePayload = {
                status: isClosing ? 'resolved' : 'open',
                updated_at: new Date().toISOString()
            };

            if (adminReply) {
                updatePayload.admin_reply = adminReply;
            }

            const { error } = await supabase
                .from('helpdesk_tickets')
                .update(updatePayload)
                .eq('id', ticketId);

            if (error) throw error;

            // Send email if it's a public inquiry and has an email in the description
            if (adminReply) {
                let contactEmail = null;
                const emailMatch = ticketData.description.match(/Email:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
                if (emailMatch && emailMatch[1]) {
                    contactEmail = emailMatch[1];
                }
                
                if (contactEmail && sendSystemEmail) {
                    try {
                        await sendSystemEmail('TICKET_REPLY', {
                            to_email: contactEmail,
                            ticket_id: ticketData.ticket_id,
                            admin_reply: adminReply
                        });
                    } catch (e) { console.warn("Failed to send email reply", e); }
                }
            }

            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
            fetchInquiries();
        } catch (error) {
            console.error("Failed to reply:", error);
            window.erpDialog?.alert("Failed to submit reply.");
        } finally {
            setSubmittingReply(null);
        }
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-themeElevated/20 ${!isEmbedded ? "min-h-screen bg-transparent text-themeText dark:text-themeText" : ""}`}>
            <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
                
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

                <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] text-center px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                            <i className="fa-solid fa-inbox text-4xl lg:text-5xl text-neutral-400 mb-3 lg:mb-4"></i>
                            <h3 className="text-sm lg:text-base font-black text-themeText">Inbox Zero</h3>
                            <p className="text-[10px] lg:text-[13px] font-medium text-themeTextSec mt-1 lg:mt-2">No public enquiries pending.</p>
                        </div>
                    ) : (
                        inquiries.map(inquiry => (
                            <div key={inquiry.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-5 lg:p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/10 transition flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {inquiry.ticket_id && (
                                                <span className="text-[10px] font-bold text-themeTextSec bg-black/5 dark:bg-themeElevated/90 px-2.5 py-1 rounded-md border border-black/[0.04] dark:border-white/[0.08]">
                                                    {inquiry.ticket_id}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-md border ${inquiry.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {inquiry.status === 'resolved' ? 'Resolved' : 'Pending'}
                                            </span>
                                        </div>
                                        <h3 className="text-base lg:text-lg font-semibold tracking-tight text-themeText mb-3">{inquiry.subject}</h3>
                                        <div className="text-xs lg:text-sm text-themeText bg-black/5 dark:bg-themeElevated/90 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08] whitespace-pre-wrap font-medium">
                                            {inquiry.description}
                                        </div>
                                        <p className="text-[10px] lg:text-[12px] font-medium text-themeTextSec mt-3">
                                            <i className="fa-regular fa-clock mr-1.5"></i> Received: {new Date(inquiry.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="border-t border-black/[0.04] dark:border-white/[0.08] pt-4 mt-2">
                                    {inquiry.status === 'resolved' ? (
                                        <div className="bg-black/5 dark:bg-themeElevated/90 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
                                            <span className="text-[12px] font-bold text-emerald-500 block mb-1">Your Reply</span>
                                            <p className="text-sm font-medium text-themeText">{inquiry.admin_reply}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row gap-3">
                                            <textarea
                                                value={replyText[inquiry.id] || ''}
                                                onChange={(e) => setReplyText(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                                                placeholder="Write your email reply to the sender..."
                                                className="flex-1 bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent resize-none min-h-[80px]"
                                            />
                                            <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                                                <button type="button" 
                                                    onClick={() => handleReply(inquiry.id, false)}
                                                    disabled={submittingReply === inquiry.id}
                                                    className="flex-1 lg:flex-none px-4 py-2 bg-themeAccent hover:bg-themeAccent/80 text-white font-black tracking-normal text-[11px] rounded-lg transition-colors border border-themeAccent/20 shadow-lg shadow-themeAccent/20"
                                                >
                                                    Send Reply
                                                </button>
                                                <button type="button" 
                                                    onClick={() => handleReply(inquiry.id, true)}
                                                    disabled={submittingReply === inquiry.id}
                                                    className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black tracking-normal text-[11px] rounded-lg transition-colors border border-emerald-500/20 shadow-lg shadow-emerald-500/20"
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

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

    // --- MODAL & FORM STATE ---
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        } catch (error) {
            console.error("Failed to sync helpdesk tickets:", error);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
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
                target_audience: ['admin'],
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
                setTicketForm({ category: "IT Support", subject: "", description: "" });
            }, 2000);

        } catch (error) {
            console.error("Ticket creation failed:", error);
            setStatusMessage({ type: "error", text: "Failed to submit ticket. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UI HELPERS ---
    const getCategoryTheme = (category) => {
        if (category === 'IT Support') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (category === 'Finance') return 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20';
        if (category === 'Academic') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
            <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

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
                    <h2 className="text-xl font-bold text-themeText tracking-tight mb-2"><i className="fa-solid fa-ticket text-themeAccent/80 mr-2"></i> My Support Tickets</h2>

                    {tickets.length === 0 ? (
                        <div className="w-full py-24 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 rounded-3xl text-center px-4">
                            <i className="fa-solid fa-clipboard-check text-5xl text-themeTextSec/50 mb-4"></i>
                            <h3 className="text-lg font-black text-themeText">No Active Tickets</h3>
                            <p className="text-sm font-medium text-themeTextSec mt-2">You haven't raised any support requests yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id || ticket.ticket_id} className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl shadow-sm border border-black/[0.04] dark:border-white/[0.08] p-5 lg:p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 hover:shadow-md transition">

                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[11px] font-black tracking-widest text-themeTextSec bg-black/5 dark:bg-white/10 px-3 py-1 rounded-md border border-black/5 dark:border-white/10">
                                                {ticket.ticket_id}
                                            </span>
                                            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${getCategoryTheme(ticket.category)}`}>
                                                {ticket.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-themeText mb-1">{ticket.subject}</h3>
                                        <p className="text-xs font-semibold text-themeTextSec">Raised on: {new Date(ticket.created_at || Date.now()).toLocaleDateString()}</p>
                                    </div>

                                    <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t border-black/5 dark:border-white/10 lg:border-t-0 lg:border-l lg:pl-6 w-full lg:w-auto">
                                        <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center justify-center gap-2 border w-full lg:w-auto ${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {ticket.status === 'resolved' ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-clock"></i>}
                                            {ticket.status === 'open' ? 'In Progress' : 'Resolved'}
                                        </span>
                                        <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/10 text-xs font-medium text-themeTextSec w-full lg:max-w-xs flex items-start gap-3">
                                            <i className="fa-solid fa-reply text-themeAccent mt-0.5"></i>
                                            <span className="leading-relaxed">{ticket.admin_reply}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* NEW TICKET MODAL */}
                {showTicketModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-3xl border border-white/20 shadow-2xl">

                            <div className="border-b border-black/5 dark:border-white/10 p-6 lg:p-8 shrink-0 flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black tracking-tight mb-1 text-themeText">Create Support Ticket</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">We usually respond within 24 hours.</p>
                                </div>
                                <button type="button" onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec hover:text-themeText hover:bg-black/10 transition-colors shrink-0">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div className="p-6 lg:p-8 overflow-y-auto">
                                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
                                    {statusMessage.text && (
                                        <div className={`p-4 rounded-xl border text-sm font-bold flex items-center gap-3 ${statusMessage.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            <i className={`fa-solid ${statusMessage.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                                            {statusMessage.text}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Category</label>
                                        <select required className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none" value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}>
                                            <option>IT Support</option>
                                            <option>Finance</option>
                                            <option>Academic</option>
                                            <option>Campus Facilities</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Subject</label>
                                        <input type="text" required placeholder="Brief summary of the issue..." className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-themeTextSec uppercase tracking-widest mb-2">Detailed Description</label>
                                        <textarea required rows="5" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Explain your issue in detail..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}></textarea>
                                    </div>

                                    <button disabled={isSubmitting} type="submit" className="w-full bg-themeAccent hover:bg-themeAccentMuted text-themeApp font-bold text-sm py-4 rounded-xl transition-colors mt-2 disabled:opacity-50 flex justify-center items-center gap-2">
                                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <><i className="fa-solid fa-paper-plane"></i> Submit Ticket</>}
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
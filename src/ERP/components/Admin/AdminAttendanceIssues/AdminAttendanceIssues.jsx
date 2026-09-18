/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminAttendanceIssues() {
    const [appeals, setAppeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchAppeals = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('helpdesk_tickets')
                .select(`
                    id, ticket_id, subject, description, status, created_at,
                    profiles!helpdesk_tickets_user_id_fkey(full_name, erp_id)
                `)
                .eq('category', 'Attendance')
                .order('created_at', { ascending: false });
            
            if (error) throw error;

            const mapped = (data || []).map(t => {
                let parsed = {};
                try { parsed = JSON.parse(t.description); } catch (e) {}
                return {
                    ...t,
                    student_name: t.profiles?.full_name || 'Unknown',
                    student_erp: t.profiles?.erp_id || 'N/A',
                    reason: parsed.reason || t.description,
                    session_id: parsed.session_id,
                    student_id: parsed.student_id,
                    record_id: parsed.record_id
                };
            });
            setAppeals(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    const handleAction = async (appeal, action) => {
        if(!appeal.session_id || !appeal.student_id) return window.erpDialog?.alert("Invalid payload. Missing session/student ID.");
        if(!window.confirm(`Are you sure you want to ${action} this appeal?`)) return;
        
        setProcessingId(appeal.id);
        try {
            if (action === 'grant') {
                // Update attendance record directly
                const { error: attError } = await supabase
                    .from('attendance_records')
                    .upsert({
                        session_id: appeal.session_id,
                        student_id: appeal.student_id,
                        status: 'present',
                        marked_by: 'admin_override'
                    }, { onConflict: 'session_id,student_id' });
                
                if (attError) throw attError;

                // Close ticket
                await supabase.from('helpdesk_tickets').update({
                    status: 'resolved',
                    admin_reply: 'Appeal Granted by Administration.'
                }).eq('id', appeal.id);
            } else {
                // Close ticket as rejected
                await supabase.from('helpdesk_tickets').update({
                    status: 'closed',
                    admin_reply: 'Appeal Rejected by Administration.'
                }).eq('id', appeal.id);
            }
            
            fetchAppeals();
            window.erpDialog?.alert(`Appeal successfully ${action}ed.`);
        } catch (error) {
            window.erpDialog?.alert("Failed to process appeal: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-gray-900 dark:text-white font-sans animate-fade-in pb-12">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
                
                <PageHeader 
                    icon="fa-solid fa-clipboard-question" 
                    title="Attendance Issues" 
                    subtitle="Review and override disputed attendance records."
                />

                {isLoading ? (
                    <div className="w-full py-20 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {appeals.length === 0 ? (
                            <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                <i className="fa-solid fa-clipboard-check text-4xl text-white/10 mb-4"></i>
                                <h3 className="text-base font-black text-gray-900 dark:text-white">No Issues Pending</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 mt-1">All attendance disputes have been resolved.</p>
                            </div>
                        ) : (
                            appeals.map(appeal => (
                                <div key={appeal.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block ${
                                                appeal.status === 'open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                appeal.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-white/5 text-gray-500 dark:text-white/50 border-gray-300 dark:border-white/10'
                                            }`}>
                                                {appeal.status}
                                            </span>
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{appeal.student_name}</h4>
                                            <p className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-white/50 uppercase">{appeal.student_erp}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/30 text-xs font-black">
                                            {appeal.student_name.charAt(0)}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">{appeal.subject}</p>
                                        <p className="text-xs font-medium text-white/70 leading-relaxed">"{appeal.reason}"</p>
                                    </div>

                                    {appeal.status === 'open' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <button 
                                                onClick={() => handleAction(appeal, 'grant')}
                                                disabled={processingId === appeal.id}
                                                className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-black transition-colors"
                                            >
                                                Grant
                                            </button>
                                            <button 
                                                onClick={() => handleAction(appeal, 'reject')}
                                                disabled={processingId === appeal.id}
                                                className="flex-1 py-3 bg-white/5 hover:bg-rose-500/10 border border-gray-300 dark:border-white/10 hover:border-rose-500/20 rounded-xl text-gray-500 dark:text-white/50 hover:text-rose-500 text-xs font-black transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

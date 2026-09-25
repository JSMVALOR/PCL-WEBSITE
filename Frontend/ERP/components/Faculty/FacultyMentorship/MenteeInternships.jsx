/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function MenteeInternships({ menteeId }) {
    const [internships, setInternships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchInternships();
    }, [menteeId]);

    const fetchInternships = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('student_experiences')
                .select('*')
                .eq('student_id', menteeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInternships(data || []);
        } catch (error) {
            console.error("Failed to fetch internships:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id, actionType) => {
        setActionLoading(id);
        try {
            const updates = { approval_status: actionType };
            const { error } = await supabase
                .from('student_experiences')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            window.erpDialog?.alert(`Internship marked as ${actionType.replace('_', ' ')} successfully.`);
            fetchInternships();
        } catch (error) {
            console.error("Failed to update status:", error);
            window.erpDialog?.alert("Failed to update status: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full py-16 flex flex-col items-center justify-center">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent mb-3"></i>
                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Loading Internships...</p>
            </div>
        );
    }

    if (internships.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4 m-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                    <i className="fa-solid fa-briefcase text-2xl text-amber-500"></i>
                </div>
                <h3 className="text-lg font-black tracking-tight text-themeText dark:text-white mb-2">No Internships Logged</h3>
                <p className="text-[12px] font-medium text-themeTextSec dark:text-white/50 max-w-sm">This mentee hasn't logged any practical training or internships yet.</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 flex flex-col gap-6 w-full animate-fade-in">
            <h2 className="text-xl font-bold tracking-tight text-themeText dark:text-white flex items-center gap-3">
                <i className="fa-solid fa-briefcase text-amber-500"></i> Internship Approvals
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {internships.map(exp => (
                    <div key={exp.id} className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-sm font-bold text-themeText dark:text-white">{exp.role_title} @ {exp.company_name}</h3>
                                <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-bold text-themeTextSec uppercase tracking-wider">{exp.type}</span>
                                {exp.approval_status === 'approved' && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Approved</span>}
                                {exp.approval_status === 'escalated_to_admin' && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">Escalated</span>}
                                {exp.approval_status === 'rejected' && <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">Rejected</span>}
                                {(!exp.approval_status || exp.approval_status === 'pending') && <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">Pending Review</span>}
                            </div>
                            <p className="text-[12px] text-themeTextSec dark:text-white/60 mb-2">{exp.duration} | {exp.location}</p>
                            <p className="text-[13px] text-themeText dark:text-white/80 line-clamp-2">{exp.description}</p>
                        </div>
                        
                        {(!exp.approval_status || exp.approval_status === 'pending') && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    disabled={actionLoading === exp.id}
                                    onClick={() => handleAction(exp.id, 'approved')}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                >
                                    Approve
                                </button>
                                <button 
                                    disabled={actionLoading === exp.id}
                                    onClick={() => handleAction(exp.id, 'escalated_to_admin')}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                >
                                    Escalate to Admin
                                </button>
                                <button 
                                    disabled={actionLoading === exp.id}
                                    onClick={() => handleAction(exp.id, 'rejected')}
                                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

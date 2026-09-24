/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveRequests({ onReviewRequest }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchRequests();
    }, []);

        const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data: leaves } = await supabase
                .from('faculty_leaves')
                .select('*')
                .order('created_at', { ascending: false });
            
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email');

            if (leaves && profiles) {
                const mapped = leaves.map(l => {
                    const fac = profiles.find(p => p.id === l.faculty_id);
                    const rep = profiles.find(p => p.id === l.replacement_faculty_id);
                    return { ...l, faculty: fac, replacement: rep };
                });
                setRequests(mapped);
            } else if (leaves) {
                setRequests(leaves);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

    return (
        <div className="animate-fade-in pb-12 w-full mt-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-black text-themeText tracking-tight">Leave Inbox</h2>
                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">Review and approve faculty requests</p>
                </div>
                
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                filter === f 
                                    ? 'bg-white dark:bg-themeElevated text-themeText shadow-sm' 
                                    : 'text-themeTextSec hover:text-themeText'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="w-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div></div>
            ) : filtered.length === 0 ? (
                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/70 dark:bg-themePanel/70 border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-themeTextSec/50 mb-4">
                        <i className="fa-solid fa-inbox text-2xl"></i>
                    </div>
                    <h3 className="text-sm font-black text-themeText mb-1">Inbox Empty</h3>
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest">No leaves match this filter.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map(req => (
                        <div key={req.id} className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-5 lg:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-themeAccent/30 transition-colors group">
                            
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 font-black">
                                    {req.faculty?.full_name?.charAt(0) || 'F'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-themeText mb-1">{req.faculty?.full_name || 'Unknown Faculty'}</h4>
                                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-3">{req.leave_type}</p>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-themeText">
                                            <i className="fa-solid fa-calendar-day text-themeTextSec"></i>
                                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-themeText">
                                            <i className="fa-solid fa-comment-dots text-themeTextSec"></i>
                                            <span className="truncate max-w-[200px]">{req.reason}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full xl:w-auto flex flex-col sm:flex-row items-center gap-4 border-t xl:border-0 border-black/5 dark:border-white/10 pt-4 xl:pt-0">
                                
                                <div className="flex items-center gap-4 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Status</span>
                                        <span className={`w-3 h-3 rounded-full ${
                                            req.status === 'approved' ? 'bg-emerald-500' :
                                            req.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                                        }`}></span>
                                    </div>
                                    <div className="w-px h-6 bg-black/10 dark:bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Substitute</span>
                                        {req.replacement_faculty_id ? (
                                            <i className={`fa-solid fa-user-tie text-sm ${req.replacement_status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}></i>
                                        ) : (
                                            <i className="fa-solid fa-minus text-themeTextSec/50 text-sm"></i>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onReviewRequest(req)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-themeAccent text-themeText dark:text-white font-black text-[11px] uppercase tracking-widest hover:bg-themeAccent/90 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Review & Action
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

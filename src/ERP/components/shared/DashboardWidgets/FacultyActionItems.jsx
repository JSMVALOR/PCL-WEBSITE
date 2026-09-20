/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';

export default function FacultyActionItems() {
    const { userSession } = useERP();
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchActions = async () => {
            try {
                const fid = userSession?.db_id || userSession?.id || 'default';
                const items = [];

                // Fetch mentee IDs first
                const { data: menteeData } = await supabase.from('mentorship').select('student_id').eq('faculty_id', fid);
                const menteeIds = (menteeData || []).map(m => m.student_id).filter(Boolean);
                
                const { data: leaves } = menteeIds.length > 0
                    ? await supabase
                    .from('leave_requests')
                    .select('id, student_id, start_date, end_date')
                    .eq('status', 'pending')
                    .in('student_id', menteeIds)
                    .limit(2)
                    : { data: [] };
                    
                if (leaves && leaves.length > 0) {
                    items.push({
                        id: 'leaves',
                        title: `${leaves.length} Pending Leave Requests`,
                        subtitle: 'Requires your approval',
                        icon: 'fa-calendar-minus',
                        color: 'text-rose-500',
                        bg: 'bg-rose-500/10'
                    });
                }

                // 2. Pending Assignments to Grade
                const { data: assignments } = await supabase
                    .from('assignment_submissions')
                    .select('id')
                    .eq('status', 'submitted')
                    .limit(10);
                    
                if (assignments && assignments.length > 0) {
                    items.push({
                        id: 'grade',
                        title: `${assignments.length} Assignments to Grade`,
                        subtitle: 'Ungraded student submissions',
                        icon: 'fa-pen-to-square',
                        color: 'text-amber-500',
                        bg: 'bg-amber-500/10'
                    });
                }

                // 3. System Alerts / Mentorship
                const { data: mentees } = await supabase
                    .from('mentorship')
                    .select('id')
                    .eq('faculty_id', fid)
                    .eq('status', 'active');
                    
                if (mentees && mentees.length > 0) {
                    items.push({
                        id: 'mentor',
                        title: 'Mentorship Reports Due',
                        subtitle: `Monthly review for ${mentees.length} mentees`,
                        icon: 'fa-users',
                        color: 'text-blue-500',
                        bg: 'bg-blue-500/10'
                    });
                }

                if (isMounted) {
                    setActions(items);
                    setLoading(false);
                }
            } catch (err) {
                console.warn(err);
                if (isMounted) setLoading(false);
            }
        };

        fetchActions();
        return () => { isMounted = false; };
    }, [userSession]);

    return (
        <div className="flex-1 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative flex flex-col shrink-0 h-[320px]">
            <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-inbox text-themeAccent"></i> Action Items
                </h3>
                {loading && <div className="w-3 h-3 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div>}
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {!loading && actions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                        <i className="fa-solid fa-check-double text-3xl mb-3 text-emerald-500"></i>
                        <p className="text-xs font-black uppercase tracking-widest text-themeText">All Caught Up</p>
                        <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">No pending actions</p>
                    </div>
                ) : (
                    actions.map((act, i) => (
                        <div key={i} className="p-4 bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-4 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bg} ${act.color} group-hover:scale-110 transition-transform`}>
                                <i className={`fa-solid ${act.icon}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-themeText truncate group-hover:text-themeAccent transition-colors">{act.title}</h4>
                                <p className="text-[10px] font-bold text-themeTextSec truncate uppercase tracking-widest mt-0.5">{act.subtitle}</p>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[10px] text-themeTextSec opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

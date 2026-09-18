/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from '../../shared/PageHeader/PageHeader';

export default function AdminHeroBanner({}) {
 const { userSession } = useERP();
 const [snapshot, setSnapshot] = useState({
 loading: true,
 pendingTickets: 0,
 pendingAdmissions: 0,
 pendingLeaves: 0,
 lastLog: "Fetching system status..."
 });

 useEffect(() => {
 let isMounted = true;
 const fetchSnapshotData = async () => {
 try {
 const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
 if (error) throw error;

 if (isMounted && data && data.tasks) {
 setSnapshot({
 loading: false,
 pendingTickets: data.tasks.tickets || 0,
 pendingAdmissions: data.tasks.admissions || 0,
 pendingLeaves: data.tasks.leaves || 0,
 lastLog: "System Synchronized"
 });
 }
 } catch (error) {
 console.error("Error fetching snapshot data:", error);
 if (isMounted) setSnapshot(prev => ({ ...prev, loading: false }));
 }
 };

 fetchSnapshotData();
 return () => { isMounted = false; };
 }, []);

 const adminName = userSession?.name || "Administrator";

  return (
    <PageHeader 
        icon="fa-solid fa-shield-halved" 
        title={`Good Morning, ${adminName.split(' ')[0]}.`}
        subtitle="Central Command Operations Center."
        rightContent={
            <div className="relative z-10 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 w-full lg:w-auto lg:min-w-[340px] shrink-0">
                <h3 className="text-[10px] font-black text-themeText uppercase tracking-widest mb-4 pb-2 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-chart-pie opacity-70 text-themeAccent"></i> Today's Snapshot</span>
                    {snapshot.loading && <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec"></i>}
                </h3>
                <ul className="flex flex-col gap-3 text-xs font-bold text-themeTextSec">
                    <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-themeAccent/10 text-themeAccent flex items-center justify-center"><i className="fa-solid fa-check"></i></div>
                        <span className="text-themeText">{snapshot.pendingLeaves} Leave requests pending.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"><i className="fa-solid fa-headset"></i></div>
                        <span className="text-themeText">{snapshot.pendingTickets} Unresolved support tickets.</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><i className="fa-solid fa-user-plus"></i></div>
                        <span className="text-themeText">{snapshot.pendingAdmissions} Pending admissions.</span>
                    </li>
                </ul>
            </div>
        }
    />
 );
}


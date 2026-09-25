/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminKPIGrid({ setActiveTab }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        students: { total: 0, byBatch: {} },
        faculty: { total: 0, list: [] },
        attendance: { present: 0, total: 0, rate: 0 },
        approvals: { total: 0, leaves: 0, docs: 0, grievances: 0 },
        fees: { collected: 0, pending: 0 }
    });

    useEffect(() => {
        let isMounted = true;
        const fetchKPIs = async () => {
            try {
                const { data: kpi, error } = await supabase.rpc('get_admin_kpi_stats');
                if (error) { 
                    console.warn("Dashboard stats error (RPC missing):", error.message); 
                    if (isMounted) setLoading(false); 
                    return; 
                }

                if (isMounted && kpi) {
                    const attTotal = Number(kpi.attendance?.total) || 0;
                    const attPresent = Number(kpi.attendance?.present) || 0;
                    const rate = attTotal > 0 ? ((attPresent / attTotal) * 100).toFixed(1) : 0;

                    const leaves = Number(kpi.approvals?.leaves) || 0;
                    const docs = Number(kpi.approvals?.docs) || 0;
                    const grievances = Number(kpi.approvals?.grievances) || 0;
                    const totalApprovals = leaves + docs + grievances;

                    setData({
                        students: { total: kpi.students?.total || 0, byBatch: kpi.students?.byBatch || {} },
                        faculty: { total: kpi.faculty?.total || 0, list: kpi.faculty?.list || [] },
                        attendance: { present: attPresent, total: attTotal, rate },
                        approvals: { total: totalApprovals, leaves, docs, grievances },
                        fees: { collected: Number(kpi.fees?.collected) || 0, pending: Number(kpi.fees?.pending) || 0 }
                    });
                }
            } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchKPIs();
        return () => { isMounted = false; };
    }, []);

    const formatCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
        return `₹${val}`;
    };

    const handleRefreshDatabase = async () => {
        const confirmed = window.confirm("WARNING: This will force a full resynchronization of the database metrics cache. This may temporarily impact performance. Are you sure you want to proceed?");
        if (!confirmed) return;
        
        setRefreshing(true);
        try {
            const { data: kpi, error } = await supabase.rpc('get_admin_kpi_stats');
            if (error) throw error;
            if (kpi) {
                const attTotal = Number(kpi.attendance?.total) || 0;
                const attPresent = Number(kpi.attendance?.present) || 0;
                const rate = attTotal > 0 ? ((attPresent / attTotal) * 100).toFixed(1) : 0;
                const leaves = Number(kpi.approvals?.leaves) || 0;
                const docs = Number(kpi.approvals?.docs) || 0;
                const grievances = Number(kpi.approvals?.grievances) || 0;
                setData({
                    students: { total: kpi.students?.total || 0, byBatch: kpi.students?.byBatch || {} },
                    faculty: { total: kpi.faculty?.total || 0, list: kpi.faculty?.list || [] },
                    attendance: { present: attPresent, total: attTotal, rate },
                    approvals: { total: leaves + docs + grievances, leaves, docs, grievances },
                    fees: { collected: Number(kpi.fees?.collected) || 0, pending: Number(kpi.fees?.pending) || 0 }
                });
            }
            if (window.erpDialog) window.erpDialog.alert("Database metrics synchronized successfully.", "Success");
        } catch (error) {
            console.error(error);
            if (window.toast) window.toast.error("Database synchronization failed.");
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-black text-themeText tracking-tight uppercase">System Overview</h3>
                <button 
                    onClick={handleRefreshDatabase} 
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <i className={`fa-solid fa-arrows-rotate ${refreshing ? 'animate-spin' : ''}`}></i> 
                    {refreshing ? 'Syncing DB...' : 'Refresh Database'}
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* 1. Students */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <button type="button" onClick={() => setActiveTab && setActiveTab('users')} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-themeText dark:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-themeBorder dark:border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.students.total}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Active Students</p>
                </div>
            </div>

            {/* 2. Faculty */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <button type="button" onClick={() => setActiveTab && setActiveTab('faculty')} className="hidden xl:inline-block text-[8px] font-bold text-themeText hover:text-themeText dark:text-white bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeAccent border border-themeBorder dark:border-white/5 px-2 py-1 rounded transition-colors cursor-pointer">Manage</button>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.faculty.total}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Active Faculty</p>
                </div>
            </div>

            {/* 3. Attendance */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-clipboard-user"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.attendance.rate}%</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Avg Attendance</p>
                </div>
            </div>

            {/* 4. Approvals */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-stamp"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.approvals.total || '--'}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Pending Approvals</p>
                </div>
            </div>

            {/* 5. Revenue */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{formatCurrency(data.fees.collected)}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Collected</p>
                </div>
            </div>

        </div>
        </div>
    );
}

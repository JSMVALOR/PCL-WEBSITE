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
            } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
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
            if (window.erpDialog) if(window.erpToast) window.erpToast.show("Database metrics synchronized successfully.", "success");
        } catch (error) {
            console.error(error);
            if (window.erpToast) window.erpToast.show("Database synchronization failed.", "error");
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4">
            <div className="flex justify-between items-center px-1 mb-2">
                <h3 className="text-sm font-black text-themeText tracking-tight uppercase">System Overview</h3>
                <button 
                    onClick={handleRefreshDatabase} 
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 bg-themeAccent/10 text-themeAccent border border-themeAccent/20 hover:bg-themeAccent/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <i className={`fa-solid fa-arrows-rotate ${refreshing ? 'animate-spin' : ''}`}></i> 
                    {refreshing ? 'Syncing DB...' : 'Refresh Database'}
                </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
                
                {/* 1. Students */}
                <div onClick={() => setActiveTab && setActiveTab('users')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.students.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Students</p>
                    </div>
                </div>

                {/* 2. Faculty */}
                <div onClick={() => setActiveTab && setActiveTab('faculty')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.faculty.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Faculty</p>
                    </div>
                </div>

                {/* 3. Attendance */}
                <div onClick={() => setActiveTab && setActiveTab('attendance')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.attendance.rate}%</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Attendance</p>
                    </div>
                </div>

                {/* 4. Approvals */}
                <div onClick={() => setActiveTab && setActiveTab('approvals')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl shrink-0 relative">
                        {data.approvals.total > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                        )}
                        <i className="fa-solid fa-clipboard-list"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.approvals.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Pending Actions</p>
                    </div>
                </div>

                {/* 5. Fees */}
                <div className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer bg-themePanel p-4 rounded-2xl border border-themeBorder shadow-sm hover:shadow-md hover:border-themeAccent/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{formatCurrency(data.fees.collected)}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Total Revenue</p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
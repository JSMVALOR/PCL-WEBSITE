/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { FacultySyllabusProgression, FacultyCourseHealth } from "../../shared/DashboardWidgets";
import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyDashboard({ setActiveTab }) {
    const [viewMode, setViewMode] = useState('dashboard');
    const { userSession, notices } = useERP();

    const [dashboardData, setDashboardData] = useState({
        stats: { averageAttendance: '--%', courseHealth: 'Syncing...', classesToday: 0, syllabusCoverage: '0%' },
        schedule: [],
        loading: true
    });

    useEffect(() => {
        let isMounted = true;
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Schedule from Supabase
                // Using RPC or direct query.
                const { data: scheduleData } = await supabase
                    .from('faculty_timetable')
                    .select('*')
                    .eq('faculty_id', userSession?.db_id || userSession?.id || 'default')
                    .order('start_time', { ascending: true });

                // 2. Fetch average stats from faculty_stats view or calculate locally
                const { data: statsData } = await supabase
                    .from('faculty_stats')
                    .select('*')
                    .eq('faculty_id', userSession?.db_id || userSession?.id || 'default')
                    .single();

                if (isMounted) {
                    setDashboardData({
                        stats: {
                            averageAttendance: statsData?.average_attendance ? `${statsData.average_attendance}%` : '0%',
                            courseHealth: statsData?.course_health || 'Optimal',
                            classesToday: scheduleData?.length || 0,
                            syllabusCoverage: statsData?.syllabus_coverage ? `${statsData.syllabus_coverage}%` : '0%'
                        },
                        schedule: scheduleData && scheduleData.length > 0 ? scheduleData : [],
                        loading: false
                    });
                }
            } catch (err) {
                console.warn(err);
                if (isMounted) setDashboardData(prev => ({ ...prev, loading: false }));
            }
        };
        fetchDashboardData();
        return () => { isMounted = false; };
    }, [userSession]);

    const getClassStatus = (start, end) => {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        if (currentMins >= startMins && currentMins <= endMins) return 'active';
        if (currentMins > endMins) return 'completed';
        return 'upcoming';
    };

    return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            
            <PageHeader 
                icon="fa-solid fa-chalkboard-user"
                title={`Welcome back, ${userSession?.name || "Professor"}`}
                subtitle="Overview of your academic responsibilities and daily itinerary."
                rightContent={
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shrink-0">
                        <button type="button" 
                            onClick={() => setViewMode('dashboard')}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${viewMode === 'dashboard' ? 'bg-white dark:bg-[#2C2C2E] text-themeAccent shadow-sm' : 'text-themeTextSec hover:text-themeText'}`}
                        >
                            <i className="fa-solid fa-chart-pie mr-2"></i> Dashboard
                        </button>
                        <button type="button" 
                            onClick={() => setViewMode('organization')}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${viewMode === 'organization' ? 'bg-white dark:bg-[#2C2C2E] text-themeAccent shadow-sm' : 'text-themeTextSec hover:text-themeText'}`}
                        >
                            <i className="fa-solid fa-sitemap mr-2"></i> Organization
                        </button>
                    </div>
                }
            />

            <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col animate-fade-in custom-scrollbar overflow-y-auto">
                {viewMode === 'organization' ? (
                    <OrganizationDirectory />
                ) : (
                    <>
                        {/* MAIN CONTENT WIDGETS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full animate-fade-in-up mt-2 mb-6">
                            <div className="col-span-1 lg:col-span-2 flex flex-col h-[360px]">
                                <FacultyCourseHealth />
                            </div>
                            <div className="col-span-1 flex flex-col h-[360px]">
                                <UpdatesCarousel userSession={userSession} notices={notices || []} onNoticesClick={() => setActiveTab('notices')} />
                            </div>
                        </div>

                        {/* QUICK STATS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 shrink-0">
                            {[
                                { label: 'Syllabus Coverage', value: dashboardData.stats.syllabusCoverage, icon: 'fa-book-open', color: 'text-blue-500' },
                                { label: 'Overall Attendance', value: dashboardData.stats.averageAttendance, icon: 'fa-user-check', color: 'text-emerald-500' },
                                { label: 'Classes Today', value: dashboardData.stats.classesToday || dashboardData.schedule.length, icon: 'fa-chalkboard-user', color: 'text-indigo-500' },
                                { label: 'Course Health', value: dashboardData.stats.courseHealth, icon: 'fa-heart-pulse', color: 'text-rose-500' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 relative group cursor-default">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
                                            <i className={`fa-solid ${stat.icon}`}></i>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black tracking-tight leading-none mb-1 text-themeText">{stat.value}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MAIN DASHBOARD SPLIT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column: Today's Schedule */}
                            <div className="lg:col-span-3 flex flex-col gap-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className={`${theme.text.heading} text-xl text-themeText tracking-tight`}><i className="fa-regular fa-clock text-themeTextSec opacity-70 mr-2"></i> Today's Itinerary</h2>
                                    <button type="button" onClick={() => setActiveTab('timetable')} className="text-[10px] font-black text-themeAccent hover:text-themeText uppercase tracking-widest transition-colors">
                                        Full Timetable &rarr;
                                    </button>
                                </div>

                                <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-2">
                                    {dashboardData.schedule.length === 0 ? (
                                        <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                                            <i className="fa-solid fa-mug-hot text-4xl text-themeTextSec opacity-50 mb-3"></i>
                                            <h3 className="text-sm font-black text-themeText">No Classes Today</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1">You have a clear itinerary.</p>
                                        </div>
                                    ) : dashboardData.schedule.map((cls) => {
                                        const status = getClassStatus(cls.start_time, cls.end_time);
                                        return (
                                            <div key={cls.id} className={`flex gap-6 p-5 rounded-xl transition duration-300 ${status === 'active' ? 'bg-themeAccent/5 border border-themeAccent/20' : `hover:bg-black/5 dark:hover:bg-white/5 border border-transparent ${status === 'completed' ? 'opacity-50 grayscale' : ''}`}`}>
                                                <div className="w-24 shrink-0 flex flex-col items-end pt-1">
                                                    <span className="text-xs font-black text-themeText">{cls.time}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${status === 'active' ? 'text-themeAccent' : 'text-themeTextSec'}`}>
                                                        {status === 'active' ? '● Live Now' : status}
                                                    </span>
                                                </div>
                                                <div className="w-px bg-black/10 dark:bg-white/10 relative">
                                                    <div className={`absolute top-2 -left-1 w-2.5 h-2.5 rounded-full border-[2px] border-themeApp ${status === 'active' ? 'bg-themeAccent shadow-[0_0_10px_rgba(var(--color-accent),0.5)]' : status === 'completed' ? 'bg-themeTextSec' : 'bg-themeBorderStrong'}`}></div>
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <h3 className="text-sm font-black text-themeText mb-1">{cls.subject}</h3>
                                                    <p className={`text-xs font-medium text-themeTextSec mb-3`}>{cls.batch}</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest flex items-center gap-1.5"><i className="fa-solid fa-location-dot opacity-70"></i> {cls.room}</span>
                                                        <button type="button" onClick={() => setActiveTab('attendance')} className="px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-themeAccent hover:text-white rounded text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                                            <i className="fa-solid fa-user-check"></i> Take Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

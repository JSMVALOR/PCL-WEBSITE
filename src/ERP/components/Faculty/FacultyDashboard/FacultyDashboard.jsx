/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import DirectorySidebarWidget from "../../shared/DirectorySidebarWidget/DirectorySidebarWidget";
import UpdatesCarousel from "../../shared/UpdatesCarousel/UpdatesCarousel";
import { DashboardGreetingBanner } from "../../shared/DashboardWidgets";
import FacultyActionItems from "../../shared/DashboardWidgets/FacultyActionItems";
import DashboardWorkSchedule from "../../shared/DashboardWidgets/DashboardWorkSchedule";

import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyDashboard({ setActiveTab }) {
    const [viewMode, setViewMode] = useState('dashboard');
    const { userSession, notices } = useERP();

    const [dashboardData, setDashboardData] = useState({
        stats: { avgAttendance: 0, mentees: 0, classesToday: 0, pendingGrading: 0 },
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

                // 2. Fetch REAL stats from raw tables
                const fid = userSession?.db_id || userSession?.id || 'default';
                
                // A. Mentees Assigned
                const { data: mentees } = await supabase.from('mentorship').select('id').eq('faculty_id', fid).eq('status', 'active');
                
                // B. Pending Grading
                const { data: assignments } = await supabase.from('assignment_submissions').select('id').eq('status', 'submitted');
                
                // C. Average Attendance (Real calculation from recent attendance records)
                // In a real app we'd join courses. For now, we fetch recent attendance where faculty might be involved or just system average if hod
                const { data: att } = await supabase.from('attendance').select('status').limit(100);
                let avgAtt = 0;
                if (att && att.length > 0) {
                    const present = att.filter(a => a.status === 'present').length;
                    avgAtt = Math.round((present / att.length) * 100);
                }

                if (isMounted) {
                    setDashboardData({
                        stats: {
                            avgAttendance: avgAtt,
                            mentees: mentees ? mentees.length : 0,
                            classesToday: scheduleData ? scheduleData.length : 0,
                            pendingGrading: assignments ? assignments.length : 0
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

    return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            
            <div className="flex-1 w-full w-full mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
                
                {/* LEFT SIDEBAR */}
                <div className="w-full xl:w-[280px] shrink-0 h-auto xl:h-full pb-6 xl:pb-0 overflow-y-auto custom-scrollbar pr-2">
                    <DirectorySidebarWidget role="faculty" />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-y-auto custom-scrollbar pb-10 xl:pb-0 pr-2">
                    
                    <DashboardGreetingBanner role="faculty" />
                    
                    <DashboardWorkSchedule role="faculty" />

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                        {[
                            { label: 'Pending Grading', value: dashboardData.stats.pendingGrading, icon: 'fa-pen-to-square', color: 'text-amber-500' },
                            { label: 'Avg Attendance', value: `${dashboardData.stats.avgAttendance}%`, icon: 'fa-user-check', color: 'text-emerald-500' },
                            { label: 'Classes Today', value: dashboardData.stats.classesToday, icon: 'fa-chalkboard-user', color: 'text-indigo-500' },
                            { label: 'Active Mentees', value: dashboardData.stats.mentees, icon: 'fa-users', color: 'text-blue-500' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center relative group">
                                <div className={`w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center ${stat.color} mb-3`}>
                                    <i className={`fa-solid ${stat.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-black text-themeText mb-0.5">{stat.value}</h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Row: Action Items & Updates Carousel */}
                    <div className="flex flex-col xl:flex-row gap-6 w-full shrink-0 mb-6">
                        
                        {/* Left: Real-time Action Items */}
                        <FacultyActionItems />

                        {/* Right: Updates Carousel */}
                        <div className="w-full xl:w-[420px] h-[320px] shrink-0">
                            <UpdatesCarousel userSession={userSession} notices={notices || []} onNoticesClick={() => setActiveTab('notices')} />
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
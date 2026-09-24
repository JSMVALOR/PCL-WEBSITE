/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../../context/ErpContext";
import { supabase } from "../../../../../Shared/lib/supabase/supabaseClient";
import { motion } from "framer-motion";

export default function FacultyTeachingDashboard({ onNavigate }) {
    const { userSession } = useERP();
    const [stats, setStats] = useState({ courses: 0, classesToday: 0, activeAssignments: 0 });
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userSession?.db_id) {
            // SWR: Load from cache instantly
            const cachedStats = sessionStorage.getItem(`jsmerp_faculty_dash_stats_${userSession.db_id}`);
            const cachedSched = sessionStorage.getItem(`jsmerp_faculty_dash_sched_${userSession.db_id}`);
            if (cachedStats && cachedSched) {
                setStats(JSON.parse(cachedStats));
                setTodaySchedule(JSON.parse(cachedSched));
                setIsLoading(false);
            }
            fetchDashboardData();
        }
    }, [userSession]);

    const fetchDashboardData = async () => {
        if (!userSession?.db_id) return;
        try {
            // 1. Fetch total courses (cohort_subjects)
            const { data: directSubs } = await supabase.from('cohort_subjects').select('id').eq('faculty_id', userSession.db_id);
            const allSubIds = (directSubs || []).map(s => s.id);
            
            // 2. Fetch today's schedule
            const currentDayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const { data: schedData } = await supabase
                .from('class_schedule')
                .select(`id, batch, day_of_week, start_time, end_time, room:academic_classrooms(name), subject:cohort_subjects(master_subjects(name))`)
                .eq('faculty_id', userSession.db_id)
                .eq('day_of_week', currentDayStr)
                .order('start_time', { ascending: true });

            // 3. Fetch active assignments
            const { count: assignCount } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('faculty_id', userSession.db_id);

            const newStats = {
                courses: allSubIds.length,
                classesToday: schedData ? schedData.length : 0,
                activeAssignments: assignCount || 0
            };
            const newSched = schedData || [];

            setStats(newStats);
            setTodaySchedule(newSched);

            sessionStorage.setItem(`jsmerp_faculty_dash_stats_${userSession.db_id}`, JSON.stringify(newStats));
            sessionStorage.setItem(`jsmerp_faculty_dash_sched_${userSession.db_id}`, JSON.stringify(newSched));
            setIsLoading(false);
        } catch (error) {
            console.error("Dashboard error:", error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent"></i>
                <p className="text-sm font-bold text-themeTextSec uppercase tracking-widest">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-2">
                
                <motion.div whileHover={{ y: -5 }} onClick={() => onNavigate("courses")} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 flex flex-col gap-4 cursor-pointer shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-themeAccent/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shadow-sm border border-themeAccent/20">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-themeTextSec/30 group-hover:text-themeAccent group-hover:translate-x-1 transition-all"></i>
                    </div>
                    <div className="relative z-10 mt-2">
                        <h2 className="text-3xl font-black text-themeText dark:text-white tracking-tight">{stats.courses}</h2>
                        <p className="text-sm font-bold text-themeTextSec mt-1 uppercase tracking-widest">Active Courses</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} onClick={() => onNavigate("assignments")} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 flex flex-col gap-4 cursor-pointer shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-themeAccent/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shadow-sm border border-themeAccent/20">
                            <i className="fa-solid fa-file-signature"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-themeTextSec/30 group-hover:text-themeAccent group-hover:translate-x-1 transition-all"></i>
                    </div>
                    <div className="relative z-10 mt-2">
                        <h2 className="text-3xl font-black text-themeText dark:text-white tracking-tight">{stats.activeAssignments}</h2>
                        <p className="text-sm font-bold text-themeTextSec mt-1 uppercase tracking-widest">Active Assignments</p>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} onClick={() => onNavigate("attendance")} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 flex flex-col gap-4 cursor-pointer shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-themeAccent/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shadow-sm border border-themeAccent/20">
                            <i className="fa-solid fa-user-check"></i>
                        </div>
                        <i className="fa-solid fa-arrow-right text-themeTextSec/30 group-hover:text-themeAccent group-hover:translate-x-1 transition-all"></i>
                    </div>
                    <div className="relative z-10 mt-2">
                        <h2 className="text-3xl font-black text-themeText dark:text-white tracking-tight">{stats.classesToday}</h2>
                        <p className="text-sm font-bold text-themeTextSec mt-1 uppercase tracking-widest">Classes Today</p>
                    </div>
                </motion.div>

            </div>

            {/* Bottom Row - Today's Schedule */}
            <div className="bg-white/40 dark:bg-themePanel/20 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-themeText dark:text-white flex items-center gap-3">
                        <i className="fa-solid fa-clock text-themeAccent"></i>
                        Today's Schedule
                    </h3>
                    <button onClick={() => onNavigate("timetable")} className="text-xs font-bold text-themeAccent hover:underline uppercase tracking-widest">
                        View Full Timetable
                    </button>
                </div>
                
                {todaySchedule.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {todaySchedule.map((cls, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/5 p-4 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-colors">
                                <div className="w-14 h-14 rounded-lg bg-themeAccent/10 text-themeAccent flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black uppercase">{cls.start_time.slice(0,5)}</span>
                                    <span className="text-[10px] font-medium opacity-70">to</span>
                                    <span className="text-[10px] font-black uppercase">{cls.end_time.slice(0,5)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-bold text-themeText dark:text-white truncate">
                                        {cls.subject?.master_subjects?.name || "Scheduled Class"}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs font-medium text-themeTextSec flex items-center gap-1">
                                            <i className="fa-solid fa-users text-[10px]"></i> Batch {cls.batch}
                                        </p>
                                        <p className="text-xs font-medium text-themeTextSec flex items-center gap-1">
                                            <i className="fa-solid fa-location-dot text-[10px]"></i> {cls.room?.name || "TBA"}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => onNavigate("attendance")} className="px-4 py-2 bg-themeAccent text-white text-xs font-bold rounded-lg hover:bg-themeAccent/90 transition-colors hidden sm:block shrink-0 shadow-md shadow-themeAccent/20">
                                    Take Attendance
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-dashed border-black/10 dark:border-white/10">
                        <div className="w-16 h-16 rounded-full bg-themeAccent/10 text-themeAccent flex items-center justify-center text-2xl mb-4">
                            <i className="fa-solid fa-mug-hot"></i>
                        </div>
                        <h4 className="text-base font-bold text-themeText dark:text-white">No Classes Today</h4>
                        <p className="text-sm text-themeTextSec mt-1">You have a free schedule for the rest of the day.</p>
                    </div>
                )}
            </div>

        </div>
    );
}

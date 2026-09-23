/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import { StudentActivityRings } from "../../shared/DashboardWidgets";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { calculateRelativeSemester } from "../../../utils/academicUtils";
import DirectorySidebarWidget from "../../shared/DirectorySidebarWidget/DirectorySidebarWidget";
import UpdatesCarousel from '../../shared/UpdatesCarousel/UpdatesCarousel';
import { DashboardGreetingBanner } from '../../shared/DashboardWidgets';
import DashboardWorkSchedule from '../../shared/DashboardWidgets/DashboardWorkSchedule';
import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';

export default function StudentDashboard({ setActiveTab }) {
 const { userSession, notices } = useERP();
 const [viewMode, setViewMode] = useState('dashboard');

 // --- STATE ---
 const AVAILABLE_ACTIONS = [
 { id: 'timetable', icon: 'fa-calendar-days', label: 'Timetable' },
 { id: 'attendance', icon: 'fa-user-check', label: 'Attendance' },
 { id: 'assignments', icon: 'fa-file-pen', label: 'Assignments' },
 { id: 'vault', icon: 'fa-box-archive', label: 'Course Vault' },
 { id: 'leave', icon: 'fa-calendar-minus', label: 'Apply Leave' },
 { id: 'fees', icon: 'fa-wallet', label: 'Pay Fees' },
 { id: 'library', icon: 'fa-book-open', label: 'Library' },
 { id: 'helpdesk', icon: 'fa-headset', label: 'Helpdesk' },
 ];
 
 const [quickActions, setQuickActions] = useState(() => {
 try {
 const saved = localStorage.getItem('pcl_quick_actions');
 if (saved) return JSON.parse(saved);
 } catch (e) {}
 return ['timetable', 'attendance', 'assignments', 'library'];
 });
 const [isEditingActions, setIsEditingActions] = useState(false);

 const toggleQuickAction = (id) => {
 setQuickActions(prev => {
 if (prev.includes(id)) {
 if (prev.length <= 1) return prev; // Keep at least one
 const next = prev.filter(a => a !== id);
 localStorage.setItem('pcl_quick_actions', JSON.stringify(next));
 return next;
 } else {
 if (prev.length >= 6) return prev; // Max 6 actions
 const next = [...prev, id];
 localStorage.setItem('pcl_quick_actions', JSON.stringify(next));
 return next;
 }
 });
 };

 const [profile, setProfile] = useState(null);
 const [mentor, setMentor] = useState(null);
 const [academicCycle, setAcademicCycle] = useState('normal'); // 'normal', 'exams', 'moots', 'internships', 'fees', 'results'

 const [stats, setStats] = useState({
 cgpa: 0.00,
 attendance: 100,
 assignmentsPending: 0,
 assignmentsSubmitted: 0,
 libraryIssued: 0,
 libraryDue: 0,
 schedule: [],
 deadlines: [],
 notices: [],
 events: []
 });

 // --- FETCH REAL DATA ---
 useEffect(() => {
 const fetchData = async () => {
 const sid = userSession?.db_id || userSession?.id;
 if (!sid) return;

 const { data: pData } = await supabase.from('profiles').select('*').eq('id', sid).single();
 if (pData) {
 setProfile(pData);
 setStats(prev => ({ ...prev, cgpa: pData.cgpa || 0.00 }));
 }

 const { data: mData } = await supabase.from('mentorship').select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, profile_picture_url)').eq('student_id', sid).eq('status', 'active').single();
 if (mData?.profiles) setMentor(mData.profiles);

            // Fetch CGPA from analytics
            const { data: analyticsData } = await supabase
                .from('student_semester_analytics')
                .select('cgpa')
                .eq('student_id', sid)
                .order('declared_on', { ascending: false })
                .limit(1)
                .single();
                
            setStats(prev => ({ ...prev, cgpa: analyticsData?.cgpa || 0.00 }));

            // Fetch Attendance with exemption logic (sync with Rings)
            const { data: attendance } = await supabase
                .from('attendance_records')
                .select('entry_status, session:class_sessions(date)')
                .eq('student_id', sid);
                
            const { data: leaves } = await supabase
                .from('leave_requests')
                .select('start_date, end_date')
                .eq('student_id', sid)
                .eq('status', 'approved');

            const isDateExempt = (dateString) => {
                if (!leaves || !dateString) return false;
                const target = new Date(dateString);
                return leaves.some(l => {
                    const s = new Date(l.start_date);
                    const e = new Date(l.end_date);
                    s.setHours(0,0,0,0);
                    e.setHours(23,59,59,999);
                    return target >= s && target <= e;
                });
            };

            if (attendance && attendance.length > 0) {
                let present = 0;
                let total = 0;
                attendance.forEach(a => {
                    const exempt = isDateExempt(a.session?.date);
                    if (exempt && (a.entry_status === 'absent' || !a.entry_status)) {
                        // skip total count
                    } else {
                        total++;
                        if (['present', 'late'].includes(a.entry_status)) present++;
                    }
                });
                const attendanceScore = total > 0 ? Math.round((present / total) * 100) : 0;
                setStats(prev => ({ ...prev, attendance: attendanceScore }));
            } else {
                setStats(prev => ({ ...prev, attendance: 0 }));
            }

            // Fetch Assignments: total from assignments table, submitted from submissions table
            const batchName = pData?.academic_batch || userSession?.academic_batch || '';
            const batchId = userSession?.batch_id;
            
            let totalQuery = supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active');
            if (batchId) totalQuery = totalQuery.eq('batch_id', batchId);
            else if (batchName) totalQuery = totalQuery.eq('batch', batchName);
            const { count: totalAssignments } = await totalQuery;

            const { count: submittedCount } = await supabase
                .from('assignment_submissions')
                .select('id', { count: 'exact', head: true })
                .eq('student_id', sid);

            const submitted = submittedCount || 0;
            const totalAvailable = totalAssignments || 0;
            const pending = Math.max(0, totalAvailable - submitted);
            setStats(prev => ({ ...prev, assignmentsSubmitted: submitted, assignmentsPending: pending, assignmentsTotal: totalAvailable }));
 };
 fetchData();
 }, [userSession]);



    return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 xl:overflow-hidden font-sans flex flex-col">
            
            <div className="relative z-20 w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
                
                {/* LEFT SIDEBAR */}
                <div className="w-full xl:w-[280px] flex flex-col shrink-0 h-auto xl:h-full pb-6 xl:pb-0 overflow-y-auto custom-scrollbar pr-2 lg:pr-4 sticky top-24 xl:top-0 z-30 self-start xl:self-auto">
                    <DirectorySidebarWidget role="student" />
                </div>

                {/* MAIN CONTENT (flex-1) */}
                <div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-y-auto custom-scrollbar pb-10 xl:pb-0 pr-2 lg:pr-4">
                    
                    <DashboardGreetingBanner role="student" />
                    
                    <DashboardWorkSchedule role="student" />

                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        {[
                            { label: 'Pending Tasks', val: stats.assignmentsPending || 0, icon: 'fa-list-check' },
                            { label: 'Attendance', val: `${stats.attendance}%`, icon: 'fa-user-check' },
                            { label: 'Assignments', val: `${stats.assignmentsSubmitted}/${stats.assignmentsTotal || 0}`, icon: 'fa-file-lines' },
                            { label: 'CGPA', val: stats.cgpa.toFixed(2), icon: 'fa-graduation-cap' }
                        ].map((m, i) => (
                            <div key={i} onClick={() => m.tab ? setActiveTab(m.tab) : null} className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:border-themeAccent/30 hover:bg-white/80 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec mb-3">
                                    <i className={`fa-solid ${m.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-black text-themeText mb-0.5">{m.val}</h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">{m.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts (Activity Rings + Notices) */}
                    <div className="flex flex-col xl:flex-row gap-6 w-full shrink-0">
                        <StudentActivityRings stats={stats} />
                        
                        {/* Campus Notices */}
                        <div className="flex-1 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative flex flex-col shrink-0">
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Campus Notices</h3>
                                <button onClick={() => setActiveTab('notices')} className="text-themeAccent text-xs hover:underline font-bold">View All</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {notices.length > 0 ? notices.slice(0, 5).map((n, i) => (
                                    <div key={i} className="p-4 bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <h4 className="text-sm font-bold text-themeText mb-1">{n.title}</h4>
                                        <p className="text-xs text-themeTextSec truncate">{n.content}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center opacity-50">
                                        <i className="fa-regular fa-bell-slash text-2xl mb-2"></i>
                                        <p className="text-xs font-bold uppercase tracking-widest">No New Notices</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
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
 const [dashboardNotices, setDashboardNotices] = useState([]);
 const [academicCycle, setAcademicCycle] = useState('normal'); // 'normal', 'exams', 'moots', 'internships', 'fees', 'results'

 const [stats, setStats] = useState({
 cgpa: 0.00,
 attendance: 0,
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

 const { data: mData } = await supabase.from('mentorship').select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, avatar_url)').eq('student_id', sid).eq('status', 'active').single();
 if (mData?.profiles) setMentor(mData.profiles);

 const { data: nData } = await supabase.from('notices').select('*').eq('status', 'PUBLISHED').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5);
 if (nData) setDashboardNotices(nData);

 // Fetch Attendance
 const { data: attData } = await supabase.from('attendance_records').select('entry_status, exit_status').eq('student_id', sid);
 if (attData && attData.length > 0) {
 const present = attData.filter(a => ['present', 'late'].includes(a.entry_status)).length;
 const total = attData.length;
 setStats(prev => ({ ...prev, attendance: Math.round((present / total) * 100) }));
 }

 // Fetch Assignments
 const { data: asgData } = await supabase.from('assignment_submissions').select('status').eq('student_id', sid);
 if (asgData) {
 const submitted = asgData.filter(a => a.status === 'submitted' || a.status === 'Submitted').length;
 const pending = asgData.filter(a => a.status === 'pending' || a.status === 'Pending').length;
 setStats(prev => ({ ...prev, assignmentsSubmitted: submitted, assignmentsPending: pending }));
 }
 };
 fetchData();
 }, [userSession]);



 return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            
            <div className="relative z-20 w-full w-full mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
                
                {/* LEFT SIDEBAR */}
                <div className="w-full xl:w-[280px] flex flex-col shrink-0 h-auto xl:h-full pb-6 xl:pb-0 overflow-y-auto custom-scrollbar pr-2">
                    <DirectorySidebarWidget role="student" />
                </div>

                {/* MAIN CONTENT (flex-1) */}
                <div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-y-auto custom-scrollbar pb-10 xl:pb-0 pr-2">
                    
                    <DashboardGreetingBanner role="student" />
                    
                    <DashboardWorkSchedule role="student" />

                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        {[
                            { label: 'Pending Tasks', val: stats.assignmentsPending || 0, icon: 'fa-list-check' },
                            { label: 'Attendance', val: `${stats.attendance}%`, icon: 'fa-user-check' },
                            { label: 'Assignments', val: `${stats.assignmentsSubmitted}/${stats.assignmentsPending + stats.assignmentsSubmitted}`, icon: 'fa-file-lines' },
                            { label: 'CGPA', val: stats.cgpa.toFixed(2), icon: 'fa-graduation-cap' }
                        ].map((m, i) => (
                            <div key={i} onClick={() => m.tab ? setActiveTab(m.tab) : null} className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:border-themeAccent/30 hover:bg-white/80 transition-all">
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
                        <div className="flex-1 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative flex flex-col shrink-0">
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Campus Notices</h3>
                                <button onClick={() => setActiveTab('notices')} className="text-themeAccent text-xs hover:underline font-bold">View All</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {dashboardNotices.length > 0 ? dashboardNotices.map((n, i) => (
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
/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import { StudentActivityRings, StudentTrajectoryChart } from "../../shared/DashboardWidgets";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { calculateRelativeSemester } from "../../../utils/academicUtils";
import { theme } from '../../../../Shared/theme';
import UpdatesCarousel from '../../shared/UpdatesCarousel/UpdatesCarousel';
import PageHeader from '../../shared/PageHeader/PageHeader';
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
 } catch(e) {}
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
 const { data: attData } = await supabase.from('attendance_records').select('status').eq('profile_id', sid);
 if (attData && attData.length > 0) {
 const present = attData.filter(a => a.status === 'present' || a.status === 'Present').length;
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
 <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-full">
 {/* WELCOME BANNER (Liquid Glass) */}
 <PageHeader 
 icon="fa-solid fa-house" 
 title={`Welcome back, ${profile?.full_name?.split(' ')[0] || "Student"}.`}
 subtitle="Overview of your academic progress and daily tasks." 
 rightContent={
 <motion.div 
 whileHover={{ scale: 1.02, rotateY: -2, rotateX: 2 }}
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 style={{ perspective: "1000px" }}
 className="relative z-10 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm dark:shadow-sm rounded-2xl p-6 w-full lg:w-auto lg:min-w-[340px] shrink-0"
 >
 <h3 className="text-[10px] lg:text-xs font-black text-themeText uppercase tracking-widest mb-5 pb-3 flex justify-between items-center relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-gradient-to-r after:from-white/20 after:to-transparent">
 <span className="flex items-center gap-2"><i className="fa-solid fa-chart-pie opacity-70 text-themeAccent"></i> Quick Snapshot</span>
 </h3>
 <ul className="flex flex-col gap-4 text-xs font-bold text-themeTextSec">
 <li className="flex items-center gap-3 group">
 <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center group-hover:bg-themeAccent/20 group-hover:text-themeAccent group-hover:border-themeAccent/50 transition-colors"><i className="fa-solid fa-graduation-cap"></i></div>
 <div className="flex-1"><p className="text-themeText group-hover:text-themeAccent transition-colors">CGPA</p><p className="text-[9px] uppercase tracking-widest opacity-60">Current Standing</p></div>
 <span className="text-sm text-themeText font-black">{stats.cgpa.toFixed(2)}</span>
 </li>
 <li className="flex items-center gap-3 group">
 <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors"><i className="fa-solid fa-user-check"></i></div>
 <div className="flex-1"><p className="text-themeText group-hover:text-emerald-400 transition-colors">Attendance</p><p className="text-[9px] uppercase tracking-widest opacity-60">Overall Average</p></div>
 <span className="text-sm text-themeText font-black">{stats.attendance}%</span>
 </li>
 <li className="flex items-center gap-3 group">
 <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors"><i className="fa-solid fa-file-lines"></i></div>
 <div className="flex-1"><p className="text-themeText group-hover:text-amber-400 transition-colors">Assignments</p><p className="text-[9px] uppercase tracking-widest opacity-60">Submitted</p></div>
 <span className="text-sm text-themeText font-black">{stats.assignmentsSubmitted}</span>
 </li>
 </ul>
 </motion.div>
 }
 />
 <div className="w-full mb-6 mt-4">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/10 w-fit shadow-inner">
                    <button 
                        onClick={() => setViewMode('dashboard')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            viewMode === 'dashboard' ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-[#007AFF] shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
                        }`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setViewMode('organization')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            viewMode === 'organization' ? 'bg-white/90 dark:bg-[#1C1C1E]/90 text-[#007AFF] shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
                        }`}
                    >
                        Organization
                    </button>
                </div>
            </div>

 

 {/* DASHBOARD / ORGANIZATION TOGGLE */}
            


 
 
            

            {viewMode === 'organization' ? (
                <div className="w-full animate-fade-in">
                    <OrganizationDirectory />
                </div>
            ) : (

 <div className="relative z-20 w-full flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 
 {/* LEFT MAIN REGION (Scrollable if needed on mobile, hidden scroll on desktop) */}
 <div className="flex-1 flex flex-col gap-6 lg:gap-8 overflow-visible xl:overflow-hidden custom-scrollbar pb-10 xl:pb-0">
 
 <AnimatePresence>
 {academicCycle === 'exams' && (
 <motion.div 
 initial={{ opacity: 0, height: 0, scale: 0.95 }}
 animate={{ opacity: 1, height: 'auto', scale: 1 }}
 exit={{ opacity: 0, height: 0, scale: 0.95 }}
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 className="bg-rose-500/10 backdrop-blur-2xl border border-rose-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0"
 >
 <div>
 <h3 className="text-lg font-black text-rose-500 mb-1 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation animate-pulse"></i> Semester Examinations</h3>
 <p className="text-sm font-bold text-rose-500/70">Download your Hall Ticket and view seating arrangements.</p>
 </div>
 <motion.button 
 whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
 onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} 
 className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
 >
 View Exam Portal →
 </motion.button>
 </motion.div>
 )}
 </AnimatePresence>
 
 

 
 {/* MAIN CONTENT WIDGETS */}
 <div className="flex flex-col md:flex-row gap-6 w-full animate-fade-in-up mt-2">
 <StudentActivityRings stats={stats} />
 <StudentTrajectoryChart />
 </div>

 {/* METRIC GRID */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 shrink-0 mt-auto pb-4 xl:pb-0">
 {[
 { label: 'Pending Tasks', val: stats.assignmentsPending || 0, icon: 'fa-list-check' },
 { label: 'Attendance', val: `${stats.attendance}%`, icon: 'fa-user-check' },
 { label: 'Assignments', val: `${stats.assignmentsSubmitted}/${stats.assignmentsPending + stats.assignmentsSubmitted}`, icon: 'fa-file-lines' },
 { label: 'CGPA', val: stats.cgpa.toFixed(2), icon: 'fa-graduation-cap' }
 ].map((m, i) => (
 <motion.div 
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 * i, type: "spring", stiffness: 400, damping: 30 }}
 whileHover={{ scale: 1.05, y: -5 }}
 whileTap={{ scale: 0.95 }}
 className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 relative group cursor-default flex flex-col justify-center"
 >
 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
 <div className="w-10 h-10 rounded-lg bg-black/20 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec mb-4 group-hover:scale-110 transition-transform">
 <i className={`fa-solid ${m.icon}`}></i>
 </div>
 <h3 className="text-2xl lg:text-3xl font-black text-themeText mb-1">{m.val}</h3>
 <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-80">{m.label}</p>
 </motion.div>
 ))}
 </div>

 </div>

 {/* RIGHT SIDEBAR (Fixed Width, Flex Column, Scrollable Content) */}
 <div className="w-full xl:w-[360px] flex flex-col gap-6 lg:gap-8 shrink-0 h-auto xl:h-full pb-24 xl:pb-0">

 

 
 {/* Quick Actions */}
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 30 }}
 className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm dark:shadow-sm rounded-2xl p-6 relative shrink-0"
 >
 <div className="flex justify-between items-center mb-5 relative z-10">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Quick Actions</h3>
 <motion.button 
 whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
 onClick={() => setIsEditingActions(!isEditingActions)}
 className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isEditingActions ? 'bg-themeAccent text-themeApp' : 'bg-black/20 dark:bg-white/10 text-themeTextSec hover:text-themeAccent'}`}
 >
 <i className={`fa-solid ${isEditingActions ? 'fa-check' : 'fa-pen'} text-[10px]`}></i>
 </motion.button>
 </div>

 <AnimatePresence mode="wait">
 {isEditingActions ? (
 <motion.div 
 key="edit"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="grid grid-cols-2 gap-2"
 >
 {AVAILABLE_ACTIONS.map((action, i) => {
 const isSelected = quickActions.includes(action.id);
 return (
 <motion.button 
 key={i}
 whileTap={{ scale: 0.95 }}
 onClick={() => toggleQuickAction(action.id)}
 className={`p-2.5 rounded-xl border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition ${isSelected ? 'bg-themeAccent/20 border-themeAccent/50 text-themeAccent' : 'bg-white/5 backdrop-blur-md border-black/5 dark:border-white/10 text-themeTextSec opacity-50 hover:opacity-100'}`}
 >
 <i className={`fa-solid ${action.icon} w-4 text-center`}></i>
 <span className="truncate">{action.label}</span>
 </motion.button>
 );
 })}
 <p className="col-span-2 text-[8px] text-themeTextSec text-center mt-2 uppercase tracking-widest opacity-50">Select up to 6 actions</p>
 </motion.div>
 ) : (
 <motion.div 
 key="view"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="grid grid-cols-2 gap-3"
 >
 {AVAILABLE_ACTIONS.filter(a => quickActions.includes(a.id)).map((action, i) => (
 <motion.button 
 key={i}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setActiveTab(action.id)}
 className="bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/20 p-4 rounded-xl hover:bg-white/15 hover:border-white/30 transition-colors flex flex-col items-center justify-center text-center gap-2 group"
 >
 <i className={`fa-solid ${action.icon} text-themeTextSec group-hover:text-themeAccent text-lg transition-colors`}></i>
 <span className="text-[9px] font-black uppercase tracking-widest text-themeText">{action.label}</span>
 </motion.button>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>

 {/* Campus Notices (Takes remaining height on desktop) */}
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 30 }}
 className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm dark:shadow-sm rounded-2xl p-6 relative flex flex-col flex-1"
 >
 <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Campus Notices</h3>
 <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('notices')} className="w-7 h-7 rounded-lg bg-black/20 dark:bg-white/10 flex items-center justify-center text-themeAccent">
 <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
 </motion.button>
 </div>
 <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
 {dashboardNotices.length > 0 ? dashboardNotices.map((n, i) => (
 <motion.div 
 whileHover={{ x: 4 }}
 key={i} 
 className="p-4 bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl cursor-pointer group hover:bg-white/15 hover:border-black/10 dark:border-white/20 transition-colors shrink-0 relative z-10" 
 onClick={() => setActiveTab('notices')}
 >
 <div className="flex items-start gap-3 mb-1.5">
 <div className="mt-1">
 {n.priority === 'CRITICAL' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>}
 {n.priority === 'URGENT' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
 {n.priority === 'IMPORTANT' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
 {n.priority !== 'CRITICAL' && n.priority !== 'URGENT' && n.priority !== 'IMPORTANT' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
 </div>
 <p className="text-xs font-bold text-themeText group-hover:text-themeAccent transition-colors leading-relaxed">{n.title}</p>
 </div>
 <p className="text-[8px] font-black uppercase tracking-widest text-themeTextSec pl-5">{n.category}</p>
 </motion.div>
 )) : (
 <div className="py-6 text-center opacity-50 flex flex-col items-center h-full justify-center">
 <div className="w-12 h-12 rounded-lg bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center mb-4">
 <i className="fa-regular fa-bell text-lg text-themeTextSec"></i>
 </div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">No new notices</p>
 </div>
 )}
 </div>
 </motion.div>

 </div>
 </div>
            )}
 </div>
 </div>
 );
}
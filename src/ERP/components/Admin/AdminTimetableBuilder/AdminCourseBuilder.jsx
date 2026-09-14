/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

import SemesterManager from "./tabs/SemesterManager";
import SubjectBuilder from "./tabs/SubjectBuilder";
import BarCompliance from "./BarCompliance";

export default function AdminCourseBuilder({ isHubView = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'semesters', 'subjects', 'schedule-builder', 'approvals'

 const [stats, setStats] = useState({
 programmes: 0,
 activeSemesters: 0,
 pendingApprovals: 0,
 timetableRows: 0,
 loading: true
 });

 useEffect(() => {
 const fetchStats = async () => {
 try {
 const { data: sems } = await supabase.from('academic_semesters').select('programme, is_active_globally');
 const progs = new Set(sems?.map(s => s.programme));
 const activeSems = sems?.filter(s => s.is_active_globally).length || 0;

 // Safely try fetching from timetable_requests and class_schedule (ignoring errors if tables are empty/missing)
 const { count: approvalsCount, error: err1 } = await supabase.from('timetable_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
 const { count: ttCount, error: err2 } = await supabase.from('class_schedule').select('*', { count: 'exact', head: true });

 setStats({
 programmes: progs.size || 0,
 activeSemesters: activeSems || 0,
 pendingApprovals: err1 ? 0 : (approvalsCount || 0),
 timetableRows: err2 ? 0 : (ttCount || 0),
 loading: false
 });
 } catch (err) {
 console.error(err);
 setStats(s => ({ ...s, loading: false }));
 }
 };
 fetchStats();
 }, []);

 const renderDashboard = () => (
 <div className="flex flex-col gap-8 animate-fade-in">
 {/* Hero Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-1 relative overflow-hidden group">
 <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
 <span className="text-3xl font-black text-themeText z-10">{stats.loading ? '-' : stats.programmes}</span>
 <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Programmes</span>
 </div>
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-1 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('semesters')}>
 <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
 <span className="text-3xl font-black text-themeText z-10">{stats.loading ? '-' : stats.activeSemesters}</span>
 <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Active Semesters</span>
 </div>
 
 
 </div>

 <div className="grid grid-cols-1 gap-8">
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-6">Welcome to the Command Center</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div onClick={() => setActiveTab('semesters')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-toggle-on text-2xl text-emerald-500"></i>
 <span className="block text-sm font-black text-themeText mt-2">Semester Manager</span>
 <span className="text-[10px] font-bold text-themeTextSec">Toggle the global academic state for the entire ERP.</span>
 </div>
 <div onClick={() => setActiveTab('subjects')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-palette text-2xl text-blue-500"></i>
 <span className="block text-sm font-black text-themeText mt-2">Subject Builder</span>
 <span className="text-[10px] font-bold text-themeTextSec">Create subjects and assign theme colors and faculties.</span>
 </div>
 
 
 
 <div onClick={() => setActiveTab('compliance')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-scale-balanced text-2xl text-indigo-500"></i>
 <span className="block text-sm font-black text-themeText mt-2">Bar Compliance</span>
 <span className="text-[10px] font-bold text-themeTextSec">Check Rule-28 compliance (minimum 36 teaching hours).</span>
 </div>
 
 </div>
 </div>
 </div>
 </div>
 );

 return (
 <div className={`w-full ${isHubView ? 'bg-transparent text-themeText font-sans' : 'min-h-screen bg-themeApp text-themeText font-sans pb-32'}`}>
 
 {/* Top Navigation Hub */}
 <div className={`${isHubView ? '' : 'max-w-[1400px] mx-auto px-4 lg:px-8 py-6'}`}>
 

 <PageHeader 
 icon="fa-solid fa-layer-group" 
 title="Course Builder" 
 subtitle="Global management for semesters, subjects, and academic compliance." 
 rightContent={
    <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/20 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">

 {[
 { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple' },
 { id: 'semesters', label: 'Semester Manager', icon: 'fa-toggle-on' },
 
 { id: 'subjects', label: 'Subject Builder', icon: 'fa-palette' },
 
 
 { id: 'compliance', label: 'Bar Compliance', icon: 'fa-scale-balanced' },
 
 ].map(tab => (
 <button type="button" 
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab.id 
 ? 'bg-themePanel/85 backdrop-blur-2xl text-themeAccent border border-white dark:border-white/20 scale-100 shadow-sm' 
 : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i> {tab.label}
 </button>
 ))}
 </div>
 } 
/>
 </div>


 <div className={`${isHubView ? 'w-full mt-2' : 'max-w-[1400px] mx-auto p-6 mt-4'}`}>
 {activeTab === 'dashboard' && renderDashboard()}
 {activeTab === 'semesters' && <SemesterManager />}
 
 {activeTab === 'subjects' && <SubjectBuilder />}
 
 
 {activeTab === 'compliance' && <BarCompliance />}
 
 </div>
 
 </div>
 );
}
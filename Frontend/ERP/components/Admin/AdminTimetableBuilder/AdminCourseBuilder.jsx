/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

import CohortManager from "./tabs/BatchManager";
import SubjectBuilder from "./tabs/SubjectBuilder";
import FacultyAllocator from "./tabs/FacultyAllocator";
import BarCompliance from "./BarCompliance";

export default function AdminCourseBuilder({ isHubView = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'semesters', 'subjects', 'schedule-builder', 'approvals'

 const [stats, setStats] = useState({
 programmes: 0,
 activeSemesters: 0, pendingApprovals: 0, timetableRows: 0,
 pendingApprovals: 0,
 timetableRows: 0,
 loading: true
 });

 useEffect(() => {
 const fetchStats = async () => {
 try {
 const { count: progs, error: e1 } = await supabase.from('academic_programs').select('*', { count: 'exact', head: true }).eq('status', 'active');
 const { count: cohorts, error: e2 } = await supabase.from('academic_batches').select('*', { count: 'exact', head: true }).eq('status', 'active');
 const { count: masterCount, error: e3 } = await supabase.from('master_subjects').select('*', { count: 'exact', head: true });
 const { count: activeClasses, error: e4 } = await supabase.from('cohort_subjects').select('*', { count: 'exact', head: true });

 setStats({
 programmes: e1 ? 0 : (progs || 0),
 activeSemesters: e2 ? 0 : (cohorts || 0),
 pendingApprovals: e3 ? 0 : (masterCount || 0), // Re-using variables to prevent huge UI refactors
 timetableRows: e4 ? 0 : (activeClasses || 0),
 loading: false
 });
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
 }
 };
 fetchStats();
 }, []);

 const renderDashboard = () => (
 <div className="flex flex-col gap-8 animate-fade-in">
 {/* Hero Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-1 relative overflow-hidden group">
 <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
 <span className="text-3xl font-semibold tracking-tight text-themeText z-10">{stats.loading ? '-' : stats.programmes}</span>
 <span className="text-[12px] font-medium text-themeTextSec z-10">Programmes</span>
 </div>
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-1 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('batches')}>
 <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
 <span className="text-3xl font-semibold tracking-tight text-themeText z-10">{stats.loading ? '-' : stats.activeSemesters}</span>
 <span className="text-[12px] font-medium text-themeTextSec z-10">Active Cohorts</span>
 </div>
 
 
 </div>

 <div className="grid grid-cols-1 gap-8">
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6">
 <h3 className="text-[13px] font-medium text-themeTextSec mb-6">Welcome to the Command Center</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div onClick={() => setActiveTab('batches')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-toggle-on text-2xl text-emerald-500"></i>
 <span className="block text-[15px] font-semibold text-themeText mt-2">Cohort & Program Manager</span>
 <span className="text-[10px] font-bold text-themeTextSec">Manage Academic Programs and Student Cohorts.</span>
 </div>
 <div onClick={() => setActiveTab('subjects')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-palette text-2xl text-blue-500"></i>
 <span className="block text-[15px] font-semibold text-themeText mt-2">Curriculum Vault</span>
 <span className="text-[10px] font-bold text-themeTextSec">Design master syllabus templates for degree programs.</span>
 </div>
 
 
 
 <div onClick={() => setActiveTab('compliance')} className="p-6 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-xl flex flex-col gap-2">
 <i className="fa-solid fa-scale-balanced text-2xl text-indigo-500"></i>
 <span className="block text-[15px] font-semibold text-themeText mt-2">Bar Compliance</span>
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
 <div className={`${isHubView ? '' : 'w-full mx-auto px-4 lg:px-8 py-6'}`}>
 

 <PageHeader 
 icon="fa-solid fa-layer-group" 
 title="Course Builder" 
 subtitle="Global management for semesters, subjects, and academic compliance." 
 />
 </div>

 <div className="w-full px-4 lg:px-8 mt-2 mb-8 flex overflow-x-auto no-scrollbar pb-2">
    <div className="flex p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/20 relative z-10 gap-1.5 w-max">
 {[
 { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple' },
 { id: 'batches', label: 'Cohort & Program Manager', icon: 'fa-toggle-on' },
 { id: 'subjects', label: 'Curriculum Vault', icon: 'fa-vault' },
 { id: 'allocator', label: 'Faculty Allocator', icon: 'fa-chalkboard-user' },
 { id: 'compliance', label: 'Bar Compliance', icon: 'fa-scale-balanced' },
 ].map(tab => (
 <button type="button" 
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab.id 
 ? 'bg-themePanel/85 backdrop-blur-2xl text-themeAccent border border-white dark:border-white/20 scale-100 shadow-sm' 
 : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-themeText dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse text-blue-500' : ''}`}></i> {tab.label}
 </button>
 ))}
    </div>
 </div>

 <div className={`${isHubView ? 'w-full mt-2' : 'w-full mx-auto p-6 mt-4'}`}>
 {activeTab === 'dashboard' && renderDashboard()}
 {activeTab === 'batches' && <CohortManager />}
 
 {activeTab === 'subjects' && <SubjectBuilder />}
 {activeTab === 'allocator' && <FacultyAllocator />}
 
 
 {activeTab === 'compliance' && <BarCompliance />}
 
 </div>
 
 </div>
 );
}
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function MentorshipDashboard({ setActiveTab }) {
 const [stats, setStats] = useState({
 totalFaculty: 0,
 totalStudents: 0,
 assignedStudents: 0,
 unassignedStudents: 0,
 avgMentees: 0,
 maxLoad: 0,
 minLoad: 0,
 loading: true
 });

 useEffect(() => {
 let isMounted = true;
 const fetchDashboardData = async () => {
 const cached = sessionStorage.getItem('jsmerp_mentorship_dash_stats');
 if (cached) {
 setStats(JSON.parse(cached));
 }
 try {
 // 1. Fetch total students
 const { count: studentCount, error: sErr } = await supabase
 .from('profiles')
 .select('*', { count: 'exact', head: true })
 .eq('role', 'student');
 
 if (sErr) throw sErr;

 // 2. Fetch all mentorship mappings
 const { data: mappings, error: mErr } = await supabase
 .from('mentorship')
 .select('faculty_id, student_id');
 
 if (mErr) throw mErr;

 if (!isMounted) return;

 const assignedStudentsCount = mappings.length;
 const unassignedStudentsCount = (studentCount || 0) - assignedStudentsCount;

 // 3. Compute workloads
 const loadMap = {};
 mappings.forEach(m => {
 loadMap[m.faculty_id] = (loadMap[m.faculty_id] || 0) + 1;
 });

 const workloads = Object.values(loadMap);
 const activeMentorsCount = workloads.length;
 const max = activeMentorsCount > 0 ? Math.max(...workloads) : 0;
 const min = activeMentorsCount > 0 ? Math.min(...workloads) : 0;
 const avg = activeMentorsCount > 0 ? Math.round((assignedStudentsCount / activeMentorsCount) * 10) / 10 : 0;

 const newStats = {
 totalFaculty: activeMentorsCount, // Or total faculty in system? Let's use Active Mentors
 totalStudents: studentCount || 0,
 assignedStudents: assignedStudentsCount,
 unassignedStudents: Math.max(0, unassignedStudentsCount),
 avgMentees: avg,
 maxLoad: max,
 minLoad: min,
 loading: false
 };

 setStats(newStats);
 sessionStorage.setItem('jsmerp_mentorship_dash_stats', JSON.stringify(newStats));

 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }));
 }
 };

 fetchDashboardData();
 return () => { isMounted = false; };
 }, []);

 return (
 <div className="flex flex-col gap-6 animate-fade-in pb-10">
 
 {/* Quick Actions */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <button type="button" onClick={() => setActiveTab('allocations')} className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-500 transition group active:scale-95">
 <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-users-rays text-lg group-hover:scale-110 transition-transform"></i>
 </div>
 <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center mt-1">Assign Mentors</span>
 </button>
 <button type="button" onClick={() => setActiveTab('transfers')} className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 hover:border-amber-500 transition group active:scale-95">
 <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-shuffle text-lg group-hover:scale-110 transition-transform"></i>
 </div>
 <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center mt-1">Reshuffle</span>
 </button>
 <button type="button" onClick={() => setActiveTab('transfers')} className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 transition group active:scale-95">
 <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-right-left text-lg group-hover:scale-110 transition-transform"></i>
 </div>
 <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center mt-1">Transfer Mentees</span>
 </button>
 <button type="button" onClick={() => setActiveTab('allocations')} className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-4 lg:p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500 transition group active:scale-95">
 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-themeText dark:text-white transition duration-300">
 <i className="fa-solid fa-file-csv text-lg group-hover:scale-110 transition-transform"></i>
 </div>
 <span className="text-[9px] lg:text-[13px] font-medium text-themeText text-center mt-1">Bulk Import</span>
 </button>
 </div>

 {/* Statistics */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* Primary Stats */}
 <div className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6">
 <h3 className={`font-bold tracking-tight text-sm tracking-tight text-themeText mb-6 flex items-center justify-between`}>
 <span>Overall Progress</span>
 <i className="fa-solid fa-chart-simple text-themeTextSec"></i>
 </h3>

 {stats.loading ? (
 <div className="w-full py-12 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent"></i></div>
 ) : (
 <div className="flex flex-col gap-6">
 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
 <div className="flex flex-col gap-1">
 <span className="text-4xl lg:text-5xl font-black text-themeText">{stats.assignedStudents}</span>
 <span className="text-[13px] font-medium text-emerald-500">Students Assigned</span>
 </div>
 <div className="flex flex-col gap-1 sm:text-right">
 <span className="text-2xl font-semibold tracking-tight text-themeText">{stats.unassignedStudents}</span>
 <span className="text-[13px] font-medium text-rose-500">Unassigned</span>
 </div>
 </div>
 
 <div className="w-full h-2.5 bg-themeElevated/90 backdrop-blur-2xl rounded-full overflow-hidden border border-black/5 dark:border-white/10">
 <div 
 className="h-full bg-indigo-500 transition duration-1000 ease-out rounded-full" 
 style={{ width: `${stats.totalStudents > 0 ? (stats.assignedStudents / stats.totalStudents) * 100 : 0}%` }}
 ></div>
 </div>

 <div className="grid grid-cols-2 gap-4 mt-2">
 <div className="bg-themeElevated/90 p-4 rounded-lg border border-themeBorder dark:border-white/5">
 <span className="text-2xl font-semibold tracking-tight text-themeText block mb-1">{stats.totalStudents}</span>
 <span className="text-[12px] font-medium text-themeTextSec">Total Students</span>
 </div>
 <div className="bg-themeElevated/90 p-4 rounded-lg border border-themeBorder dark:border-white/5">
 <span className="text-2xl font-semibold tracking-tight text-themeText block mb-1">{stats.totalFaculty}</span>
 <span className="text-[12px] font-medium text-themeTextSec">Active Mentors</span>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Workload Stats */}
 <div className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6 flex flex-col">
 <h3 className={`font-bold tracking-tight text-sm tracking-tight text-themeText mb-6 flex items-center justify-between`}>
 <span>Mentor Workload</span>
 <i className="fa-solid fa-scale-balanced text-themeTextSec"></i>
 </h3>

 {stats.loading ? (
 <div className="w-full flex-1 flex justify-center items-center"><i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeAccent"></i></div>
 ) : (
 <div className="flex-1 flex flex-col justify-center gap-5">
 <div className="flex items-center justify-between p-4 rounded-lg bg-themeElevated/90 border-l-2 border-indigo-500">
 <div className="flex flex-col">
 <span className="text-xs font-bold text-themeText">Average Load</span>
 <span className="text-[12px] font-medium text-themeTextSec mt-0.5">Mentees per Faculty</span>
 </div>
 <span className="text-xl font-semibold tracking-tight text-indigo-500">{stats.avgMentees}</span>
 </div>

 <div className="flex items-center justify-between p-4 rounded-lg bg-themeElevated/90 border border-themeBorder dark:border-white/5">
 <div className="flex flex-col">
 <span className="text-xs font-bold text-themeText">Largest Load</span>
 <span className="text-[12px] font-medium text-themeTextSec mt-0.5">Maximum Assigned</span>
 </div>
 <span className="text-xl font-semibold tracking-tight text-themeText">{stats.maxLoad}</span>
 </div>

 <div className="flex items-center justify-between p-4 rounded-lg bg-themeElevated/90 border border-themeBorder dark:border-white/5">
 <div className="flex flex-col">
 <span className="text-xs font-bold text-themeText">Smallest Load</span>
 <span className="text-[12px] font-medium text-themeTextSec mt-0.5">Minimum Assigned</span>
 </div>
 <span className="text-xl font-semibold tracking-tight text-themeText">{stats.minLoad}</span>
 </div>
 </div>
 )}
 </div>

 </div>
 </div>
 );
}

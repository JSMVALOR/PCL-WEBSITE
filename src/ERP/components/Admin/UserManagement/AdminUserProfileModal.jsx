/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminUserProfileModal({ user, isOpen, onClose }) {
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({
 totalLeaves: 0,
 approvedLeaves: 0,
 pendingLeaves: 0,
 attendancePercentage: 0,
 workload: 0,
 finishedClasses: 0,
 studentAvgAttendance: 0,
 });

 useEffect(() => {
 if (!isOpen || !user) return;

 const fetchProfileData = async () => {
 setLoading(true);
 try {
 if (user.role === "student") {
 // Fetch Student Leaves
 const { data: leaves } = await supabase
 .from("leave_requests")
 .select("status")
 .eq("student_id", user.db_id);

 const total = leaves?.length || 0;
 const approved = leaves?.filter(l => l.status === "approved").length || 0;
 const pending = leaves?.filter(l => l.status === "pending").length || 0;

 // Fetch Student Attendance
 const { data: att } = await supabase
 .from("attendance_records")
 .select("status")
 .eq("student_id", user.db_id);

 const totalAtt = att?.length || 0;
 const present = att?.filter(a => a.status === "present").length || 0;
 const attPerc = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

 setStats(s => ({
 ...s,
 totalLeaves: total,
 approvedLeaves: approved,
 pendingLeaves: pending,
 attendancePercentage: attPerc
 }));

 } else if (user.role === "faculty") {
 // Fetch Faculty Leaves
 const { data: leaves } = await supabase
 .from("faculty_leaves")
 .select("status")
 .eq("faculty_id", user.db_id);

 const total = leaves?.length || 0;
 const approved = leaves?.filter(l => l.status === "approved").length || 0;
 const pending = leaves?.filter(l => l.status === "pending").length || 0;

 // Fetch Workload (from class_schedule where faculty is assigned)
 const { data: sessions } = await supabase
 .from("attendance")
 .select("id, class_id")
 .eq("faculty_id", user.db_id);

 const finished = sessions?.length || 0;
 
 let workload = 0;
 try {
 const { count } = await supabase.from("class_schedule").select("*", { count: 'exact', head: true }).eq("faculty_id", user.db_id);
 workload = count || 0;
 } catch (e) {
 // ignore if class_schedule doesn't exist
 }

 let avgAtt = 0;
 if (finished > 0) {
 const sessionIds = sessions.map(s => s.id);
 // Fetch records for these sessions
 if (sessionIds.length > 0) {
 const { data: attRecords } = await supabase
 .from("attendance_records")
 .select("status")
 .in("session_id", sessionIds);
 
 const totalRecs = attRecords?.length || 0;
 const presRecs = attRecords?.filter(a => a.status === "present").length || 0;
 avgAtt = totalRecs > 0 ? Math.round((presRecs / totalRecs) * 100) : 0;
 }
 }

 setStats(s => ({
 ...s,
 totalLeaves: total,
 approvedLeaves: approved,
 pendingLeaves: pending,
 workload: workload,
 finishedClasses: finished,
 studentAvgAttendance: avgAtt
 }));
 }
 } catch (err) {
 console.error("Error fetching profile analytics:", err);
 } finally {
 setLoading(false);
 }
 };

 fetchProfileData();
 }, [isOpen, user]);

 if (!isOpen || !user) return null;

 return (
 <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in font-sans overflow-hidden">
 <div className="w-full max-w-5xl mx-auto flex flex-col h-screen relative z-10 bg-themePanel/85 backdrop-blur-2xl border-x border-white/5">
 
 {/* Header Profile Card */}
 <div className={`p-6 lg:p-8 bg-gradient-to-r ${user.role === 'student' ? 'from-themeAccent to-themeAccent/80' : 'from-blue-600 to-blue-500'} relative overflow-hidden shrink-0`}>
 <div className="absolute top-0 right-0 w-full max-w-[300px] md:w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
 
 <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors z-20">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>

 <div className="flex items-center gap-5 relative z-10">
 <div className="w-20 h-20 rounded-2xl bg-themePanel/85 backdrop-blur-2xl flex items-center justify-center shrink-0 overflow-hidden">
 <span className={`text-3xl font-black ${user.role === 'student' ? 'text-themeAccent' : 'text-blue-600'}`}>
 {user.name.charAt(0)}
 </span>
 </div>
 <div className="text-white min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-black/10 dark:border-white/20">
 {user.role}
 </span>
 <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1 border ${user.status === 'Active' ? 'bg-emerald-500/30 border-emerald-500/50' : 'bg-rose-500/30 border-rose-500/50'}`}>
 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
 {user.status}
 </div>
 </div>
 <h2 className="text-2xl font-black truncate">{user.name}</h2>
 <p className="text-white/90 text-xs lg:text-sm font-medium mt-1 truncate">
 {user.id} &bull; {user.email}
 </p>
 </div>
 </div>
 </div>

 {/* Content Area */}
 <div className="p-6 lg:p-8 bg-themeApp overflow-y-auto flex-1 flex flex-col gap-8 no-scrollbar">
 
 {/* Basic Info Section */}
 <div>
 <h4 className={`text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-4 flex items-center gap-2`}>
 <i className="fa-solid fa-address-card"></i> Core Assignment
 </h4>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-4 grid grid-cols-2 gap-4">
 <div>
 <span className={`text-[9px] font-bold uppercase tracking-widest text-[#8E8E93] block mb-1`}>
 {user.role === 'student' ? 'Academic Batch' : 'Department'}
 </span>
 <span className="text-sm font-black text-themeText">
 {user.batch || user.department || 'Not Assigned'}
 </span>
 </div>
 </div>
 </div>

 {loading ? (
 <div className="py-12 flex flex-col items-center justify-center gap-3">
 <i className={`fa-solid fa-circle-notch fa-spin text-2xl text-[#8E8E93]`}></i>
 <span className={`text-xs font-bold text-[#8E8E93]`}>Gathering Operations Analytics...</span>
 </div>
 ) : (
 <div className="flex flex-col gap-8 animate-fade-in">
 
 {/* Academic / Workload Analytics */}
 <div>
 <h4 className={`text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-4 flex items-center gap-2`}>
 <i className="fa-solid fa-chart-line"></i> Academic Metrics
 </h4>
 
 {user.role === "student" ? (
 <div className="grid grid-cols-1 gap-4">
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-5 flex items-center justify-between">
 <div>
 <span className={`text-[10px] font-black uppercase tracking-widest text-[#8E8E93] block mb-1`}>Semester Attendance</span>
 <span className="text-3xl font-black text-themeText">{stats.attendancePercentage}%</span>
 </div>
 <div className="w-12 h-12 rounded-full border-[4px] border-themeElevated relative flex items-center justify-center">
 <div className={`absolute inset-0 rounded-full border-[4px] border-transparent ${stats.attendancePercentage >= 75 ? 'border-t-emerald-500 border-r-emerald-500 border-b-emerald-500' : 'border-t-rose-500 border-r-rose-500'}`} style={{ transform: 'rotate(-45deg)' }}></div>
 <i className={`fa-solid ${stats.attendancePercentage >= 75 ? 'fa-check text-emerald-500' : 'fa-exclamation text-rose-500'}`}></i>
 </div>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-5 text-center">
 <span className={`text-[9px] font-black uppercase tracking-widest text-[#8E8E93] block mb-1`}>Assigned Workload</span>
 <span className="text-2xl font-black text-themeText">{stats.workload} Classes</span>
 </div>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-5 text-center">
 <span className={`text-[9px] font-black uppercase tracking-widest text-[#8E8E93] block mb-1`}>Classes Finished</span>
 <span className="text-2xl font-black text-blue-500">{stats.finishedClasses}</span>
 </div>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-5 text-center col-span-2 lg:col-span-1">
 <span className={`text-[9px] font-black uppercase tracking-widest text-[#8E8E93] block mb-1`}>Student Avg Att.</span>
 <span className={`text-2xl font-black ${stats.studentAvgAttendance >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
 {stats.studentAvgAttendance}%
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Leave Analytics */}
 <div>
 <h4 className={`text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-4 flex items-center gap-2`}>
 <i className="fa-solid fa-calendar-day"></i> Leave Record
 </h4>
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
 <span className="text-xl font-black text-themeText">{stats.totalLeaves}</span>
 <span className={`text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]`}>Total Applied</span>
 </div>
 <div className="bg-emerald-500/5 border-theme border-emerald-500/20 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
 <span className="text-xl font-black text-emerald-500">{stats.approvedLeaves}</span>
 <span className={`text-[9px] font-bold uppercase tracking-widest text-emerald-500/70`}>Approved</span>
 </div>
 <div className="bg-amber-500/5 border-theme border-amber-500/20 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
 <span className="text-xl font-black text-amber-500">{stats.pendingLeaves}</span>
 <span className={`text-[9px] font-bold uppercase tracking-widest text-amber-500/70`}>Pending</span>
 </div>
 </div>
 </div>
 
 </div>
 )}
 </div>

 </div>
 </div>
 );
}

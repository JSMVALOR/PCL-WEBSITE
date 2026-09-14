/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import { motion } from 'framer-motion';
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

// No sub-modules needed in expanded mode

export default function Mentorship() {
 const { userSession } = useERP();

 // --- MENTORSHIP STATE ---
 const [isLoading, setIsLoading] = useState(false);
 const [mentorData, setMentorData] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_mentor_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : null;
 });
 const [meetingHistory, setMeetingHistory] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_meetings_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });

 // --- GRIEVANCE AND UI STATE MOVED OUT ---
 // Grievances are handled centrally in StudentApprovals or Helpdesk

 // --- DATA FETCHING ---
 const fetchData = async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;

 setIsLoading(true);
 try {
 // 1. Mentorship Data
 const { data: allocData } = await supabase
 .from('mentorship')
 .select('faculty_id')
 .eq('student_id', studentId)
 .order('allocated_at', { ascending: false })
 .limit(1);

 let mentorId = allocData?.[0]?.faculty_id;
 
 if (mentorId) {
 const { data: mentor } = await supabase
 .from('profiles')
 .select('id, full_name, email, phone, department, profile_picture_url')
 .eq('id', mentorId)
 .single();
 
 if (mentor) {
 setMentorData(mentor);
 }
 }

 // 2. Meeting History (Logged by Faculty)
 const { data: meetingData } = await supabase
 .from('mentorship_meetings')
 .select('*')
 .eq('student_id', studentId)
 .order('scheduled_at', { ascending: false });
 
 if (meetingData) setMeetingHistory(meetingData);

 // Profiles no longer needed here as grievances are handled separately

 // Cache everything for zero-lag
 sessionStorage.setItem(`mentorship_mentor_${studentId}`, JSON.stringify(mentorId ? mentorData : null));
 sessionStorage.setItem(`mentorship_meetings_${studentId}`, JSON.stringify(meetingData || []));

 } catch (error) {
 console.error("Failed to fetch Support Hub data:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, [userSession]);


 // --- HANDLERS ---

 // UI Helpers
 const getStatusBadge = (status, isUrgent) => {
 if (isUrgent && status === 'pending') return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500/30">Urgent Pending</span>;
 switch (status) {
 case 'pending': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30">Pending</span>;
 case 'scheduled': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Accepted</span>;
 case 'declined': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-500/40 text-rose-500 border border-rose-500/30">Declined</span>;
 case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-500 border border-blue-500/30">Completed</span>;
 case 'resolved': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Resolved</span>;
 default: return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-neutral-500/20 text-neutral-400 border border-neutral-700">{status}</span>;
 }
 };

 return (
 <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
 <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">

 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">
 
 <PageHeader 
 icon="fa-solid fa-users"
 title="Mentorship Hub"
 subtitle="Manage your mentorship profile and official meetings."
 />

 {/* --- MENTORSHIP MODULE --- */}
 <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10 mt-2 items-start">
 
 {/* Left Column: Mentor Profile */}
 <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
 {/* Mentor Banner */}

 {mentorData ? (
 <div className="bg-themePanel/85 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 lg:p-8 relative overflow-hidden flex flex-col items-center justify-center gap-4 text-center border border-black/5 dark:border-white/10 w-full sm:max-w-xs sm:mx-auto lg:mx-0">
 <div className="absolute top-0 right-0 w-full h-full bg-themeAccent/5 blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
 
 <div className="relative shrink-0 z-10 group">
 <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-3xl font-black text-themeText group-hover:scale-105 transition-transform duration-500 overflow-hidden">
 {mentorData?.profile_picture_url ? (
 <img src={mentorData.profile_picture_url} alt="Mentor Avatar" className="w-full h-full object-cover" />
 ) : (
 <i className="fa-solid fa-user-tie text-4xl opacity-50"></i>
 )}
 </div>
 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center" title="Assigned & Active">
 <i className="fa-solid fa-check text-white text-xs font-black"></i>
 </div>
 </div>

 <div className="relative z-10 w-full">
 <p className="text-themeAccent font-black text-[9px] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
 <i className="fa-solid fa-star text-amber-500"></i> Faculty Mentor
 </p>
 <h2 className="text-xl font-black tracking-tight mb-1 text-themeText truncate">{(mentorData?.full_name || 'Unassigned')}</h2>
 <p className="text-themeTextSec text-[10px] font-bold uppercase tracking-widest mb-4 truncate">{(mentorData?.department || "Faculty")}</p>

 <a href={`mailto:${(mentorData?.email || "")}`} className="w-full py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-themeText transition flex items-center justify-center gap-2 group">
 <i className="fa-solid fa-envelope text-themeAccent group-hover:scale-125 transition-transform"></i> Email
 </a>
 </div>
 </div>
 ) : (
 <div className="w-full sm:max-w-xs py-12 text-center border-2 border-dashed border-black/5 dark:border-white/10 rounded-2xl bg-themeElevated/90 backdrop-blur-2xl px-4">
 <i className="fa-solid fa-user-slash text-4xl text-themeTextSec mb-3 opacity-50"></i>
 <h3 className="text-lg font-black text-themeText mb-1">No Mentor</h3>
 <p className="text-[10px] text-themeTextSec leading-relaxed">Contact admin to assign your mentor.</p>
 </div>
 )}

 
 </div>

 {/* Right Column: Ledger & Info */}
 <div className="flex-1 flex flex-col gap-6 lg:gap-8 w-full min-w-0">
 {/* INFO ALERT: Offline Meetings */}

 {/* Interactive Request Module */}
        <div className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-themeText font-black text-lg tracking-tight mb-1">Request a Session</h4>
              <p className="text-xs lg:text-sm text-themeTextSec font-medium">Propose a meeting topic to your mentor for review.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-themeAccent/20 flex items-center justify-center shrink-0 border border-themeAccent/30 text-themeAccent text-xl shadow-lg shadow-themeAccent/20">
              <i className="fa-solid fa-calendar-plus"></i>
            </div>
          </div>
          <button type="button" onClick={async () => {
              if(!mentorData) return window.erpDialog.alert("No mentor assigned.");
              const topic = await window.erpDialog.prompt("What is the primary topic of discussion?", "Request Mentorship Session");
              if(!topic) return;
              const dateStr = await window.erpDialog.prompt("Propose a Date & Time (e.g. Tomorrow at 10 AM):", "Propose Time");
              if(!dateStr) return;
              
              try {
                  const { error } = await supabase.from('mentorship_meetings').insert({
                      student_id: userSession?.db_id,
                      faculty_id: mentorData.id,
                      topic: topic,
                      status: 'pending',
                      notes: `Proposed Time: ${dateStr}`
                  });
                  if (error) throw error;
                  window.erpDialog.alert("Session requested successfully! Your mentor will review and schedule it.");
                  fetchData();
              } catch(err) {
                  window.erpDialog.alert("Failed to submit request: " + err.message);
              }
          }} disabled={!mentorData} className="mt-2 w-full sm:w-auto self-start px-6 py-3 rounded-xl bg-themeAccent text-[#050505] font-black uppercase tracking-widest text-xs hover:bg-themeAccent/90 transition shadow-lg disabled:opacity-50">
            Submit Request
          </button>
        </div>

 
 {/* Meeting History (Full Width) */}

 <div className={`flex flex-col gap-5 ${!mentorData && 'opacity-50 pointer-events-none'}`}>
 <h3 className="text-xl font-black text-themeText flex items-center gap-3 pl-1">
 <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-center shrink-0">
 <i className="fa-solid fa-clock-rotate-left text-themeAccent"></i>
 </div>
 Official Session Ledger
 </h3>

 <div className="flex flex-col gap-4">
 {meetingHistory.length > 0 ? (
 meetingHistory.map(meeting => (
 <div key={meeting.id} className={`bg-white/10 backdrop-blur-[60px] p-5 rounded-[1.5rem] border border-black/5 dark:border-white/10 relative overflow-hidden group flex flex-col sm:flex-row gap-5 items-start sm:items-center transition hover:bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 hover:border-themeAccent/50 group`}>
 <div className="flex flex-col shrink-0 min-w-[120px] bg-transparent p-4 rounded-xl border border-black/5 dark:border-white/10Strong text-center">
 <span className="text-themeAccent text-[10px] lg:text-xs font-black uppercase tracking-widest mb-1.5">
 {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })}
 </span>
 <span className="text-themeText font-black text-2xl lg:text-3xl leading-none mb-1.5">
 {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
 </span>
 <span className="text-themeTextSec text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
 {new Date(meeting.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2">
 <h4 className="text-themeText font-black text-base lg:text-lg truncate">{meeting.topic}</h4>
 {getStatusBadge(meeting.status, meeting.is_urgent)}
 </div>
 <p className="text-xs font-bold text-themeTextSec leading-relaxed">Logged by {mentorData?.full_name}</p>
 </div>

 {meeting.notes && (
 <button type="button" onClick={() => window.erpDialog.alert(meeting.notes, "Meeting Notes")} className="w-full sm:w-auto px-6 py-4 bg-black/30 backdrop-blur-md hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-themeText transition-colors shrink-0 active:scale-95 flex items-center justify-center">
 <i className="fa-regular fa-file-lines mr-2 text-themeAccent"></i> Read Log
 </button>
 )}
 </div>
 ))
 ) : (
 <div className="p-16 text-center bg-white/5 backdrop-blur-[60px] border-2 border-dashed border-black/5 dark:border-white/10 rounded-2xl">
 <i className="fa-solid fa-mug-hot text-5xl text-themeTextSec opacity-50 mb-5"></i>
 <p className="text-lg font-black text-themeText">No Sessions Logged</p>
 <p className="text-xs font-bold text-themeTextSec mt-2 max-w-sm mx-auto leading-relaxed">Your mentor has not logged any offline meetings with you yet. Sessions will appear here automatically once logged.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

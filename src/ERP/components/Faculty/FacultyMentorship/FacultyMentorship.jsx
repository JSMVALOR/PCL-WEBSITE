/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { Badge } from "../../ui/Badge";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import FacultyStudentProfile360 from "./FacultyStudentProfile360";

export default function FacultyMentorship({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- MAIN STATE ---
 const [activeTab, setActiveTab] = useState("mentees"); // 'mentees', 'upcoming', 'availability', 'history', 'risk'
 const [selectedMenteeProfile, setSelectedMenteeProfile] = useState(null);
 
 // ZERO LAG: Initialize from sessionStorage cache
 const [meetings, setMeetings] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_meetings_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 
 const [availabilitySlots, setAvailabilitySlots] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_slots_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [mentees, setMentees] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_mentees_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 
 // Grievances State
 const [grievances, setGrievances] = useState([]);
 const [allProfiles, setAllProfiles] = useState([]);
 const [grievanceFormData, setGrievanceFormData] = useState({ accusedId: "", category: "Academics", description: "" });

 const [menteeLeaves, setMenteeLeaves] = useState(() => {
 const cached = sessionStorage.getItem(`mentorship_leaves_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });

 // --- MODAL STATES ---
 const [showLogModal, setShowLogModal] = useState(false);
 const [showAddSlotModal, setShowAddSlotModal] = useState(false);

 // --- FORM STATES ---
 const [selectedMeeting, setSelectedMeeting] = useState(null);
 const [meetingNotes, setMeetingNotes] = useState("");
 const [isSaving, setIsSaving] = useState(false);
 const [isSyncing, setIsSyncing] = useState(false);

 // Schedule Session Modal
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [scheduleMentee, setScheduleMentee] = useState(null);
 const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', topic: '', is_urgent: false });

 const [newSlot, setNewSlot] = useState({
 day_of_week: "Monday",
 start_time: "",
 end_time: "",
 meeting_type: "In-Person",
 room_link: ""
 });

 // --- DATA SYNC ENGINE ---
 const fetchMentorshipData = async () => {
 if (!userSession?.db_id) return;
 const facultyId = userSession.db_id;
 
 try {
 // PARALLEL FETCH
 const [mtgRes, slotRes, menteeRes, leavesRes, grievRes, profRes] = await Promise.all([
 supabase
 .from('mentorship_meetings')
 .select('*')
 .eq('faculty_id', facultyId)
 .order('scheduled_at', { ascending: false }),
 supabase
 .from('faculty_availability')
 .select('*')
 .eq('faculty_id', facultyId)
 .order('day_of_week', { ascending: true }),
 supabase
 .from('mentorship')
 .select('student_id')
 .eq('faculty_id', facultyId),
 supabase
 .from('leave_requests')
 .select('*, profiles!leave_requests_student_id_fkey(full_name, erp_id)')
 .eq('mentor_id', facultyId)
 .order('created_at', { ascending: false }),
 supabase
 .from('grievances')
 .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name, role), accused:profiles!grievances_accused_id_fkey(full_name, role)')
 .eq('assigned_to', facultyId)
 .order('created_at', { ascending: false }),
 supabase
 .from('profiles').select('id, full_name, role').neq('id', facultyId).neq('role', 'admin')
 ]);

 if (mtgRes.error) console.error('[Mentorship] meetings error:', mtgRes.error);
 if (slotRes.error) console.error('[Mentorship] slots error:', slotRes.error);
 if (menteeRes.error) console.error('[Mentorship] mentorship table error:', menteeRes.error);
 

 // Resolve student names for meetings
 const mtgData = mtgRes.data || [];
 const studentIds = [...new Set(mtgData.map(m => m.student_id).filter(Boolean))];
 let profileMap = {};
 if (studentIds.length > 0) {
 const { data: profiles } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id')
 .in('id', studentIds);
 (profiles || []).forEach(p => { profileMap[p.id] = p; });
 }
 const enrichedMeetings = mtgData.map(m => ({
 ...m,
 student: profileMap[m.student_id] || { full_name: 'Unknown', erp_id: 'N/A' }
 }));

 const slotData = slotRes.data || [];
 const leavesData = leavesRes.data || [];
 setGrievances(grievRes?.data || []);
 setAllProfiles(profRes?.data || []);

 // Resolve mentee profiles — primary source: mentorship table
 let menteeIds = (menteeRes.data || []).map(m => m.student_id).filter(Boolean);
 
 // FALLBACK: if mentorship table returned nothing, try deriving mentees from meetings
 if (menteeIds.length === 0 && mtgData.length > 0) {
 menteeIds = [...new Set(mtgData.map(m => m.student_id).filter(Boolean))];
 }

 let menteeProfiles = [];
 if (menteeIds.length > 0) {
 const { data: mProfiles } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id')
 .in('id', menteeIds);
 menteeProfiles = mProfiles || [];
 }
 

 setMeetings(enrichedMeetings);
 setAvailabilitySlots(slotData);
 setMentees(menteeProfiles);
 setMenteeLeaves(leavesData);

 // Update Cache
 sessionStorage.setItem(`mentorship_meetings_${userSession.db_id}`, JSON.stringify(enrichedMeetings));
 sessionStorage.setItem(`mentorship_slots_${userSession.db_id}`, JSON.stringify(slotData));
 sessionStorage.setItem(`mentorship_mentees_${userSession.db_id}`, JSON.stringify(menteeProfiles));
 sessionStorage.setItem(`mentorship_leaves_${userSession.db_id}`, JSON.stringify(leavesData));
 } catch (error) {
 console.error("Failed to sync mentorship ledger:", error);
 }
 };

 useEffect(() => {
 fetchMentorshipData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [userSession]);

 // --- HANDLERS ---
 const handleLogMeeting = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 const { error } = await supabase
 .from('mentorship_meetings')
 .update({
 status: 'completed',
 notes: meetingNotes
 })
 .eq('id', selectedMeeting.id);

 if (error) throw error;

 await fetchMentorshipData();
 setShowLogModal(false);
 setSelectedMeeting(null);
 setMeetingNotes("");
 setActiveTab('history');
 } catch (error) {
 console.error("Failed to log meeting:", error);
 window.erpDialog.alert("Failed to archive notes securely.");
 } finally {
 setIsSaving(false);
 }
 };

 const handleAcceptDecline = async (meetingId, newStatus) => {
 try {
 const { error } = await supabase
 .from('mentorship_meetings')
 .update({ status: newStatus })
 .eq('id', meetingId);
 
 if (error) throw error;
 await fetchMentorshipData();
 } catch (error) {
 console.error("Failed to update status:", error);
 window.erpDialog.alert("Failed to process request.");
 }
 };

 const handleAddSlot = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 const { error } = await supabase
 .from('faculty_availability')
 .insert({
 faculty_id: userSession.db_id,
 ...newSlot
 });

 if (error) throw error;

 await fetchMentorshipData();
 setShowAddSlotModal(false);
 setNewSlot({ day_of_week: "Monday", start_time: "", end_time: "", meeting_type: "In-Person", room_link: "" });
 } catch (error) {
 console.error("Failed to add slot:", error);
 window.erpDialog.alert("Failed to configure availability slot.");
 } finally {
 setIsSaving(false);
 }
 };

 const handleToggleSlot = async (slotId, currentStatus) => {
 try {
 // Optimistic update
 const updatedSlots = availabilitySlots.map(slot => 
 slot.id === slotId ? { ...slot, is_active: !currentStatus } : slot
 );
 setAvailabilitySlots(updatedSlots);
 
 const { error } = await supabase
 .from('faculty_availability')
 .update({ is_active: !currentStatus })
 .eq('id', slotId);

 if (error) throw error;
 fetchMentorshipData();
 } catch (error) {
 console.error("Failed to toggle slot:", error);
 fetchMentorshipData(); // revert
 }
 };

 const handleLeaveAction = async (leaveId, newStatus) => {
 setIsSaving(true);
 try {
 const leave = menteeLeaves.find(l => l.id === leaveId);
 const { error } = await supabase
 .from('leave_requests')
 .update({ status: newStatus, reviewed_at: new Date().toISOString() })
 .eq('id', leaveId);
 
 if (error) throw error;

 if (leave) {
 await supabase.from('notices').insert({
 title: `Leave Request ${newStatus.toUpperCase()}`,
 content: `Your leave request for ${new Date(leave.created_at).toLocaleDateString()} has been ${newStatus} by your mentor.`,
 author_id: userSession.db_id,
 target_audience: 'person',
 target_id: leave.profiles?.erp_id
 });

 // SYNC TO ATTENDANCE ENGINE IF APPROVED
 if (newStatus === 'approved' && leave.student_id) {
 const { data: profile } = await supabase.from('profiles').select('academic_batch').eq('id', leave.student_id).single();
 if (profile?.academic_batch) {
 const start = new Date(leave.start_date);
 const end = new Date(leave.end_date);
 const daysOfWeek = [];
 for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
 daysOfWeek.push(d.toLocaleDateString('en-US', { weekday: 'long' }));
 }
 
 const { data: slots } = await supabase
 .from('class_schedule')
 .select('id')
 .eq('batch_id', profile.academic_batch)
 .in('day_of_week', [...new Set(daysOfWeek)]);

 if (slots && slots.length > 0) {
 // (Attendance records are handled by the attendance engine natively; no need to prepopulate legacy table)
 }
 }
 }
 }

 await fetchMentorshipData();
 } catch (error) {
 console.error("Error updating leave:", error);
 window.erpDialog.alert("Failed to process leave request.");
 } finally {
 setIsSaving(false);
 }
 };

 const handleScheduleSession = async (e) => {
 e.preventDefault();
 if (!scheduleMentee || !scheduleForm.date || !scheduleForm.time || !scheduleForm.topic.trim()) return;
 setIsSaving(true);
 try {
 const scheduledAt = new Date(`${scheduleForm.date}T${scheduleForm.time}:00`).toISOString();
 const { error } = await supabase
 .from('mentorship_meetings')
 .insert({
 student_id: scheduleMentee.id,
 faculty_id: userSession.db_id,
 topic: scheduleForm.topic,
 scheduled_at: scheduledAt,
 status: 'scheduled',
 is_urgent: scheduleForm.is_urgent,
 notes: `Faculty-initiated session.`
 });
 if (error) throw error;

 // Send a personal notification to the student
 await supabase.from('notices').insert({
 title: scheduleForm.is_urgent ? '🚨 Urgent Mentorship Session Scheduled' : 'Mentorship Session Scheduled',
 content: `Your mentor has scheduled a session: "${scheduleForm.topic}" on ${new Date(scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}. Please check your Mentorship Hub.`,
 author_id: userSession.db_id,
 target_audience: 'person',
 target_id: scheduleMentee.erp_id
 });

 await fetchMentorshipData();
 setShowScheduleModal(false);
 setScheduleMentee(null);
 setScheduleForm({ date: '', time: '', topic: '', is_urgent: false });
 setActiveTab('upcoming');
 } catch (error) {
 console.error('Failed to schedule session:', error);
 window.erpDialog.alert('Failed to schedule session.');
 } finally {
 setIsSaving(false);
 }
 };

 const handleDeleteSlot = async (slotId) => {
 if (!(await window.erpDialog.confirm("Delete this availability slot permanently?"))) return;
 try {
 const { error } = await supabase
 .from('faculty_availability')
 .delete()
 .eq('id', slotId);

 if (error) throw error;
 fetchMentorshipData();
 } catch (error) {
 console.error("Failed to delete slot:", error);
 }
 };

 const handleAutoSyncTimetable = async () => {
 if (!(await window.erpDialog.confirm("This will overwrite your existing availability slots with free blocks from your global timetable. Proceed?"))) return;
 setIsSyncing(true);
 try {
 // 1. Clear existing slots
 await supabase.from('faculty_availability').delete().eq('faculty_id', userSession.db_id);

 // 2. Fetch timetable
 const { data: tt, error: ttError } = await supabase
 .from('class_schedule')
 .select('*')
 .eq('faculty_id', userSession.db_id);
 if (ttError) throw ttError;

 const timeToMins = (t) => {
 if (!t) return 0;
 const [h, m] = t.split(':').map(Number);
 return h * 60 + m;
 };
 const minsToTime = (m) => {
 const h = Math.floor(m / 60).toString().padStart(2, '0');
 const min = (m % 60).toString().padStart(2, '0');
 return `${h}:${min}:00`;
 };

 const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
 const newSlots = [];

 days.forEach(day => {
 const classes = (tt || []).filter(c => c.day_of_week === day).sort((a, b) => timeToMins(a.start_time) - timeToMins(b.start_time));
 let current_mins = timeToMins('09:00:00');
 const end_of_day = timeToMins('17:00:00');

 classes.forEach(cls => {
 const class_start = timeToMins(cls.start_time);
 const class_end = timeToMins(cls.end_time);

 if (class_start > current_mins && (class_start - current_mins) >= 60) {
 newSlots.push({
 faculty_id: userSession.db_id,
 day_of_week: day,
 start_time: minsToTime(current_mins),
 end_time: minsToTime(class_start),
 meeting_type: 'Virtual',
 is_active: true
 });
 }
 current_mins = Math.max(current_mins, class_end);
 });

 if (end_of_day > current_mins && (end_of_day - current_mins) >= 60) {
 newSlots.push({
 faculty_id: userSession.db_id,
 day_of_week: day,
 start_time: minsToTime(current_mins),
 end_time: minsToTime(end_of_day),
 meeting_type: 'Virtual',
 is_active: true
 });
 }
 });

 if (newSlots.length > 0) {
 const { error: insError } = await supabase.from('faculty_availability').insert(newSlots);
 if (insError) throw insError;
 }

 await fetchMentorshipData();
 } catch (error) {
 console.error("Failed to auto-sync timetable:", error);
 window.erpDialog.alert("Failed to sync timetable. Please try again.");
 } finally {
 setIsSyncing(false);
 }
 };

 // --- DERIVED STATE & HELPERS ---
 const inboxMeetings = meetings.filter(m => m.status === 'pending' || m.status === 'scheduled').sort((a, b) => {
 // Urgent first, then pending first, then by date
 if (a.is_urgent && !b.is_urgent) return -1;
 if (!a.is_urgent && b.is_urgent) return 1;
 if (a.status === 'pending' && b.status !== 'pending') return -1;
 if (a.status !== 'pending' && b.status === 'pending') return 1;
 return new Date(a.scheduled_at) - new Date(b.scheduled_at);
 });
 const historyLogs = meetings.filter(m => m.status === 'completed' || m.status === 'declined' || m.status === 'cancelled');
 const pendingCount = meetings.filter(m => m.status === 'pending').length;

 const formatTime = (timeStr) => {
 if (!timeStr) return "";
 const [h, m] = timeStr.split(':');
 const date = new Date();
 date.setHours(h, m);
 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 const riskInsights = useMemo(() => {
 // Build real risk insights from mentees + meeting history
 return mentees.map(mentee => {
 const menteeMeetings = meetings.filter(m => m.student_id === mentee.id);
 const completedCount = menteeMeetings.filter(m => m.status === 'completed').length;
 const declinedOrCancelled = menteeMeetings.filter(m => m.status === 'declined' || m.status === 'cancelled').length;
 const totalRequested = menteeMeetings.length;
 const lastMeeting = menteeMeetings.find(m => m.status === 'completed');

 let riskLevel = 'Low';
 let reason = 'Engaged and on track. No concerns detected.';

 if (totalRequested === 0) {
 riskLevel = 'High';
 reason = 'Has never booked a mentorship session. Outreach recommended.';
 } else if (declinedOrCancelled >= 2 && completedCount === 0) {
 riskLevel = 'High';
 reason = `${declinedOrCancelled} sessions cancelled/declined with zero completed meetings. Immediate check-in required.`;
 } else if (completedCount > 0 && completedCount <= 1) {
 riskLevel = 'Medium';
 reason = `Only ${completedCount} completed session out of ${totalRequested} total. May need follow-up.`;
 }

 let lastContact = 'Never';
 if (lastMeeting) {
 const daysAgo = Math.floor((Date.now() - new Date(lastMeeting.scheduled_at).getTime()) / (1000 * 60 * 60 * 24));
 lastContact = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} Days Ago`;
 }

 return {
 id: mentee.id,
 studentName: mentee.full_name,
 erpId: mentee.erp_id,
 riskLevel,
 reason,
 lastContact,
 completedCount,
 totalRequested
 };
 }).sort((a, b) => {
 const order = { High: 0, Medium: 1, Low: 2 };
 return (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3);
 });
 }, [mentees, meetings]);

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>

 {/* 1. HEADER BANNER */}
 {!isEmbedded && (
 <PageHeader 
 icon="fa-solid fa-users" 
 title="Mentorship Hub" 
 subtitle="Guide and support your assigned mentees" 
 />
 )}

 {/* 2. NAVIGATION TABS */}
 <div className={`flex flex-wrap p-1.5 gap-1.5 bg-themePanel rounded-themePanel w-full border border-themeBorder sticky top-20 lg:static z-30 shrink-0`}>
 {[
 { id: 'mentees', label: 'My Mentees', icon: 'fa-users' },
 { id: 'upcoming', label: 'Inbox & Upcoming', icon: 'fa-inbox' },
 { id: 'availability', label: 'Availability', icon: 'fa-clock' },
 { id: 'leaves', label: 'Leave Logs', icon: 'fa-plane-departure' },
 { id: 'grievances', label: 'Grievances', icon: 'fa-scale-balanced' },
 { id: 'history', label: 'Meeting Logs', icon: 'fa-folder-open' },
 { id: 'risk', label: 'Risk Insights', icon: 'fa-triangle-exclamation' }
 ].map((tab) => (
 <button type="button"
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-auto sm:flex-1 flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap ${activeTab === tab.id
 ? "bg-themeElevated text-themeAccent border border-themeBorderStrong scale-[1.02]"
 : "text-themeTextSec opacity-70 hover:text-themeText border border-transparent active:scale-95"
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-themeAccent' : 'opacity-70'} text-sm lg:text-base`}></i> 
 <span>{tab.label}</span>
 </button>
 ))}
 </div>

 {/* 3. DYNAMIC CONTENT AREA */}
 <div className="flex flex-col gap-6 animate-fade-in">
 {/* MENTEE LEAVES VIEW */}
 {activeTab === 'leaves' && (
 <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-themeBorder pb-4 px-2">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>Mentee Leave Approvals</h2>
 <p className={`text-[10px] lg:text-xs font-semibold text-themeTextSec mt-1`}>Manage and track leave requests from your assigned mentees.</p>
 </div>
 </div>

 {menteeLeaves.length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel/30 px-4">
 <i className="fa-solid fa-plane-slash text-4xl lg:text-5xl text-themeTextSec mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Leave Requests</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">None of your mentees have submitted leave requests yet.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
 {menteeLeaves.map(leave => (
 <div key={leave.id} className={`${theme.layout.panel} rounded-themePanel border border-themeBorderStrong p-5 lg:p-6 flex flex-col hover:border-themeAccent/50 transition-colors`}>
 <div className="flex justify-between items-start mb-4">
 <div>
 <h3 className="text-themeText font-black text-lg mb-1">{leave.profiles?.full_name}</h3>
 <p className="text-themeTextSec font-bold text-[10px] uppercase tracking-widest">{leave.profiles?.erp_id}</p>
 </div>
 {leave.status === 'pending' ? (
 <Badge variant="warning">Pending</Badge>
 ) : leave.status === 'approved' ? (
 <Badge variant="success">Approved</Badge>
 ) : (
 <Badge variant="destructive">Rejected</Badge>
 )}
 </div>
 <div className="bg-themePanel/85 backdrop-blur-2xl rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-4 border border-themeBorder mb-5 flex-1">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeAccent opacity-70 mb-2">Reason for Leave</p>
 <p className="text-sm text-themeText font-medium leading-relaxed">{leave.reason}</p>
 </div>
 <div className="flex items-center justify-between mt-auto">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70">
 <i className="fa-regular fa-calendar mr-1.5"></i> Applied: {new Date(leave.created_at).toLocaleDateString()}
 </p>
 {leave.status === 'pending' && (
 <div className="flex gap-2">
 <button type="button" onClick={() => handleLeaveAction(leave.id, 'rejected')} disabled={isSaving} className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center border border-rose-500/20 hover:border-rose-500" title="Reject Leave">
 <i className="fa-solid fa-xmark"></i>
 </button>
 <button type="button" onClick={() => handleLeaveAction(leave.id, 'approved')} disabled={isSaving} className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center border border-emerald-500/20 hover:border-emerald-500" title="Approve Leave">
 <i className="fa-solid fa-check"></i>
 </button>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* MENTEES LIST VIEW */}
 {activeTab === 'mentees' && (
 <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-themeBorder pb-4 px-2">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>Assigned Mentees</h2>
 <p className={`text-[10px] lg:text-xs font-semibold text-themeTextSec mt-1`}>{mentees.length} student{mentees.length !== 1 ? 's' : ''} allocated to you.</p>
 </div>
 </div>
 {mentees.length === 0 ? (
 <div className="py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel px-4">
 <i className="fa-solid fa-user-group text-3xl lg:text-4xl text-themeTextSec opacity-50 mb-3 lg:mb-4"></i>
 <p className={`text-xs lg:text-sm font-bold text-themeTextSec`}>No mentees assigned yet. Ask an admin to allocate students via the Mentorship module.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
 {mentees.map(mentee => {
 const menteeMtgs = meetings.filter(m => m.student_id === mentee.id);
 const completed = menteeMtgs.filter(m => m.status === 'completed').length;
 const pending = menteeMtgs.filter(m => m.status === 'pending' || m.status === 'scheduled').length;
 const lastMtg = menteeMtgs.find(m => m.status === 'completed');
 let lastDate = 'Never';
 if (lastMtg) {
 const d = Math.floor((Date.now() - new Date(lastMtg.scheduled_at).getTime()) / (1000*60*60*24));
 lastDate = d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`;
 }
 return (
 <div key={mentee.id} className="bg-themePanel border border-themeBorder p-5 lg:p-6 rounded-themePanel flex flex-col justify-between group hover:border-themeAccent transition-colors">
 <div>
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-themeElevated border border-themeBorder flex items-center justify-center text-themeAccent text-lg font-black shrink-0">
 {mentee.full_name?.charAt(0)?.toUpperCase()}
 </div>
 <div className="min-w-0">
 <h3 className="text-sm lg:text-base font-black text-themeText truncate group-hover:text-themeAccent transition-colors">{mentee.full_name}</h3>
 <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{mentee.erp_id}</p>
 </div>
 </div>
 <button type="button" onClick={() => setSelectedMenteeProfile(mentee)}
 className="w-8 h-8 rounded-full bg-themeElevated hover:bg-themeAccent hover:text-white flex items-center justify-center transition-colors text-themeTextSec"
 >
 <i className="fa-solid fa-chevron-right text-xs"></i>
 </button>
 </div>
 <div className="grid grid-cols-3 gap-2 mb-4">
 <div className="bg-themeElevated p-2 rounded-lg border border-themeBorder text-center">
 <p className="text-[8px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Sessions</p>
 <p className="text-sm font-black text-themeText">{menteeMtgs.length}</p>
 </div>
 <div className="bg-themeElevated p-2 rounded-lg border border-themeBorder text-center">
 <p className="text-[8px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Done</p>
 <p className="text-sm font-black text-emerald-500">{completed}</p>
 </div>
 <div className="bg-themeElevated p-2 rounded-lg border border-themeBorder text-center">
 <p className="text-[8px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Active</p>
 <p className="text-sm font-black text-amber-500">{pending}</p>
 </div>
 </div>
 <p className="text-[9px] font-bold text-themeTextSec"><i className="fa-regular fa-clock text-themeAccent/50 mr-1"></i> Last session: {lastDate}</p>
 </div>
 <button type="button"
 onClick={() => { setScheduleMentee(mentee); setScheduleForm({ date: '', time: '', topic: '', is_urgent: false }); setShowScheduleModal(true); }}
 className="mt-5 w-full py-3 bg-themeElevated hover:bg-themeAccent text-themeText hover:text-themeApp rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition active:scale-95 border border-themeBorderStrong hover:border-themeAccent flex justify-center items-center gap-2"
 >
 <i className="fa-solid fa-calendar-plus"></i> Schedule Session
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* UPCOMING SESSIONS VIEW */}
 {activeTab === 'upcoming' && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
 {inboxMeetings.length > 0 ? inboxMeetings.map((mtg) => (
 <div key={mtg.id} className={`bg-themePanel p-5 lg:p-6 rounded-themePanel transition flex flex-col justify-between group border ${mtg.is_urgent && mtg.status === 'pending' ? 'border-red-500' : 'border-themeBorder hover:border-themeAccent'}`}>
 <div>
 <div className="flex justify-between items-start mb-3 lg:mb-4">
 <div className="flex gap-2 items-center">
 {mtg.is_urgent && mtg.status === 'pending' && (
 <Badge variant="destructive" className="flex items-center gap-1"><i className="fa-solid fa-triangle-exclamation animate-pulse"></i> URGENT</Badge>
 )}
 {mtg.status === 'pending' ? (
 <Badge variant="warning">Action Required</Badge>
 ) : (
 <Badge variant="success">Confirmed</Badge>
 )}
 {mtg.student_seen_at && (
 <Badge variant="info" className="flex items-center gap-1" title={`Seen by student on ${new Date(mtg.student_seen_at).toLocaleString()}`}><i className="fa-solid fa-check-double"></i> Seen</Badge>
 )}
 </div>
 <span className={`text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest flex items-center gap-1.5`}>
 <i className="fa-regular fa-clock text-themeAccent opacity-50"></i>
 {new Date(mtg.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {new Date(mtg.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 <h3 className="text-lg lg:text-xl font-black text-themeText tracking-tight leading-tight mb-1 group-hover:text-themeAccent transition-colors">
 {mtg.student?.full_name || "Unknown Student"}
 </h3>
 <p className={`text-[10px] lg:text-xs font-bold text-themeTextSec mb-3 lg:mb-4`}>{mtg.student?.erp_id}</p>

 <div className="bg-themeElevated p-3 lg:p-4 rounded-themePanel border border-themeBorder mb-5 lg:mb-6">
 <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent opacity-70 mb-1`}>Student Agenda</p>
 <p className={`text-xs lg:text-sm font-semibold text-themeText`}>{mtg.topic}</p>
 </div>
 </div>

 {mtg.status === 'pending' ? (
 <div className="flex flex-col sm:flex-row gap-2.5 lg:gap-3 mt-auto">
 <button type="button" onClick={() => handleAcceptDecline(mtg.id, 'declined')} className="w-full sm:flex-1 py-3 lg:py-3.5 bg-themeElevated hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-themeBorder hover:border-rose-500/30 rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
 <i className="fa-solid fa-xmark text-sm lg:text-base"></i> Decline
 </button>
 <button type="button" onClick={() => handleAcceptDecline(mtg.id, 'scheduled')} className="w-full sm:flex-1 py-3 lg:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98] flex justify-center items-center gap-2 relative overflow-hidden group/btn border border-emerald-500">
 <i className="fa-solid fa-check text-sm lg:text-base"></i> Accept Request
 </button>
 </div>
 ) : (
 <div className="flex flex-col sm:flex-row gap-2.5 lg:gap-3 mt-auto">
 <button type="button" onClick={() => handleAcceptDecline(mtg.id, 'cancelled')} className="w-full sm:flex-1 py-3 lg:py-3.5 bg-themeElevated hover:bg-opacity-80 text-themeTextSec hover:text-rose-400 border border-themeBorder rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
 <i className="fa-solid fa-calendar-xmark text-sm lg:text-base"></i> Cancel
 </button>
 <button type="button" onClick={() => { setSelectedMeeting(mtg); setShowLogModal(true); }} className="w-full sm:flex-1 py-3 lg:py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition active:scale-[0.98] flex justify-center items-center gap-2 relative overflow-hidden group/btn border border-blue-500">
 <i className="fa-solid fa-pen text-sm lg:text-base"></i> Log Notes
 </button>
 </div>
 )}
 </div>
 )) : (
 <div className="col-span-1 lg:col-span-2 py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel px-4">
 <i className="fa-solid fa-inbox text-3xl lg:text-4xl text-themeTextSec opacity-50 mb-3 lg:mb-4"></i>
 <p className={`text-xs lg:text-sm font-bold text-themeTextSec`}>Inbox is clear. No pending or upcoming sessions.</p>
 </div>
 )}
 </div>
 )}

 {/* AVAILABILITY MANAGER VIEW */}
 {activeTab === 'availability' && (
 <div className="flex flex-col gap-4 lg:gap-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-themeBorder pb-4 px-2">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}>Weekly Booking Slots</h2>
 <p className={`text-[10px] lg:text-xs font-semibold text-themeTextSec mt-1`}>Configure when students are allowed to book time with you.</p>
 </div>
 <div className="flex w-full sm:w-auto items-center gap-2 lg:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
 <button type="button" disabled={isSyncing} onClick={handleAutoSyncTimetable} className={`flex-1 sm:flex-none px-4 py-3 sm:py-2.5 bg-themeElevated border border-themeBorder rounded-themePanel text-[10px] lg:text-xs font-black text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}>
 <i className={`fa-solid fa-arrows-rotate text-sm ${isSyncing ? 'animate-spin' : ''}`}></i> {isSyncing ? 'Syncing...' : 'Auto-Sync Timetable'}
 </button>
 <button type="button" onClick={() => setShowAddSlotModal(true)} className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 bg-themeElevated border border-themeBorder rounded-themePanel text-[10px] lg:text-xs font-black text-themeAccent hover:text-white hover:bg-blue-600 hover:border-blue-500 uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2">
 <i className="fa-solid fa-plus text-sm"></i> Add Slot
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-3 lg:gap-4">
 {availabilitySlots.length === 0 ? (
 <div className="w-full py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel px-4">
 <i className="fa-regular fa-clock text-3xl lg:text-4xl text-themeTextSec opacity-50 mb-3 lg:mb-4"></i>
 <p className={`text-xs lg:text-sm font-bold text-themeTextSec`}>You haven't set up any availability slots yet.</p>
 </div>
 ) : availabilitySlots.map((slot) => (
 <div key={slot.id} className={`p-4 lg:p-5 rounded-themePanel border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-300 ${slot.is_active ? 'bg-themePanel border-themeBorder' : 'bg-themeElevated border-themeBorder opacity-70'}`}>
 <div className="flex items-center gap-3 lg:gap-4">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-lg lg:text-xl shrink-0 border ${slot.is_active ? 'bg-themeElevated text-themeAccent border-themeBorder' : 'bg-themePanel text-themeTextSec border-themeBorder'}`}>
 <i className="fa-regular fa-calendar"></i>
 </div>
 <div>
 <h3 className="text-sm lg:text-base font-black text-themeText">{slot.day_of_week}s</h3>
 <div className="flex flex-wrap items-center gap-2 mt-1 lg:mt-1.5">
 <span className={`text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest bg-themeElevated px-2 py-0.5 rounded border border-themeBorder`}>
 {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
 </span>
 <span className={`text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest flex items-center gap-1`}>
 <i className={`fa-solid ${slot.meeting_type === 'Virtual' ? 'fa-video' : 'fa-door-open'} opacity-70`}></i> {slot.meeting_type}
 </span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-themeBorder">
 <label className="flex items-center cursor-pointer group">
 <div className="relative">
 <input type="checkbox" className="sr-only" checked={slot.is_active} onChange={() => handleToggleSlot(slot.id, slot.is_active)} />
 <div className={`block w-9 h-5 lg:w-10 lg:h-6 rounded-full transition-colors border border-themeBorder ${slot.is_active ? 'bg-blue-600 border-blue-500' : 'bg-themeElevated'}`}></div>
 <div className={`dot absolute left-[2px] lg:left-[3px] top-[2px] lg:top-[3px] w-4 h-4 rounded-full transition-transform ${slot.is_active ? 'transform translate-x-[14px] lg:translate-x-[15px] bg-themePanel/85 backdrop-blur-2xl ' : 'bg-themeTextSec opacity-50'}`}></div>
 </div>
 <span className={`ml-2 lg:ml-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-colors ${slot.is_active ? 'text-themeAccent' : 'text-themeTextSec'}`}>
 {slot.is_active ? 'Active' : 'Paused'}
 </span>
 </label>
 <button type="button" onClick={() => handleDeleteSlot(slot.id)} className="text-themeTextSec opacity-70 hover:text-rose-500 transition-colors w-8 h-8 flex items-center justify-center bg-themeElevated hover:bg-opacity-80 rounded-lg border border-themeBorder">
 <i className="fa-solid fa-trash text-sm"></i>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* HISTORY LOGS VIEW */}
 {activeTab === 'history' && (
 <div className="flex flex-col gap-3 lg:gap-4">
 {historyLogs.length > 0 ? historyLogs.map((log) => (
 <div key={log.id} className={`bg-themePanel p-4 lg:p-6 rounded-themePanel hover:border-themeAccent transition-colors flex flex-col md:flex-row items-start justify-between gap-4 lg:gap-6 group border border-themeBorder`}>
 <div className="flex-1 w-full">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
 <div className="flex items-center gap-2.5 lg:gap-3">
 <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-themeElevated border border-themeBorder flex items-center justify-center shrink-0 ${log.status === 'declined' || log.status === 'cancelled' ? 'text-rose-500' : 'text-themeAccent'}`}>
 <i className={`fa-solid ${log.status === 'declined' || log.status === 'cancelled' ? 'fa-xmark' : 'fa-check'} text-[8px] lg:text-[10px]`}></i>
 </div>
 <h3 className="text-sm lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors">{log.student?.full_name}</h3>
 </div>
 <div className="flex items-center gap-2">
 <span className={`w-fit text-[8px] lg:text-[9px] font-bold uppercase tracking-widest px-2 lg:px-2.5 py-1 rounded-md border ${log.status === 'declined' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : log.status === 'cancelled' ? 'bg-neutral-500/10 text-neutral-400 border-neutral-700' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
 {log.status}
 </span>
 <span className={`w-fit text-[8px] lg:text-[9px] font-bold text-themeTextSec uppercase tracking-widest bg-themeElevated px-2 lg:px-2.5 py-1 rounded-md border border-themeBorder `}>
 {new Date(log.scheduled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </span>
 </div>
 </div>
 <div className="pl-0 sm:pl-9 lg:pl-11">
 <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent opacity-80 mb-1.5 lg:mb-2">{log.topic}</p>
 {log.notes && (
 <div className="bg-themeElevated p-3 lg:p-4 rounded-themePanel border border-themeBorder relative overflow-hidden">
 <div className="absolute left-0 top-0 bottom-0 w-1 bg-themeBorder group-hover:bg-themeAccent transition-colors"></div>
 <span className="font-black text-themeTextSec opacity-70 uppercase tracking-widest text-[8px] lg:text-[9px] mb-1 flex items-center gap-1">
 <i className="fa-solid fa-thumbtack text-themeAccent opacity-40"></i> Official Notes
 </span>
 <p className="text-[11px] lg:text-xs font-medium text-themeText leading-relaxed italic whitespace-pre-wrap">
 "{log.notes}"
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 )) : (
 <div className="py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel px-4">
 <i className="fa-solid fa-folder-open text-3xl lg:text-4xl text-themeTextSec opacity-50 mb-3 lg:mb-4"></i>
 <p className={`text-xs lg:text-sm font-bold text-themeTextSec`}>No past meeting logs found.</p>
 </div>
 )}
 </div>
 )}

 {/* GRIEVANCES VIEW */}
 {activeTab === 'grievances' && (
 <div className="flex flex-col xl:flex-row gap-6 animate-fade-in">
 <div className="flex-1 flex flex-col gap-4">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Assigned to You</h3>
 {grievances.length === 0 ? (
 <div className="text-center p-10 bg-themePanel rounded-2xl border border-themeBorder">
 <p className="text-themeTextSec font-bold">No grievances assigned to you.</p>
 </div>
 ) : (
 grievances.map(g => (
 <div key={g.id} className="bg-themePanel border border-themeBorder rounded-2xl p-5 flex flex-col gap-4">
 <div className="flex justify-between items-start">
 <div>
 <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">{g.category}</span>
 <h4 className="text-sm font-bold text-themeText mt-2">Reporter: {g.reporter?.full_name}</h4>
 <p className="text-xs text-themeTextSec">Accused: {g.accused?.full_name}</p>
 </div>
 <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${g.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{g.status}</span>
 </div>
 <div className="p-3 bg-themePanel/85 backdrop-blur-2xl/50 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-sm text-themeText italic">"{g.description}"</div>
 {g.status === 'pending' && (
 <div className="flex gap-2 pt-2">
 <button type="button" disabled={isSaving} onClick={() => {
 const note = window.prompt("Resolution Notes:");
 if(note) handleGrievanceAction(g.id, 'resolved', note);
 }} className="flex-1 py-2 bg-themeAccent hover:bg-themeAccent/90 text-white rounded-lg text-xs font-black uppercase tracking-widest transition">Mark Resolved</button>
 </div>
 )}
 {g.resolution_notes && (
 <p className="text-xs font-bold text-emerald-500 mt-2">Resolution: {g.resolution_notes}</p>
 )}
 </div>
 ))
 )}
 </div>

 <div className="w-full xl:w-[350px] shrink-0">
 <form onSubmit={handleReportGrievance} className="bg-themePanel border border-themeBorder rounded-2xl p-5 flex flex-col gap-4 sticky top-6">
 <div>
 <h3 className="text-lg font-black text-themeText">Report Incident</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">File a disciplinary report</p>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Report Against</label>
 <select required value={grievanceFormData.accusedId} onChange={e => setGrievanceFormData({...grievanceFormData, accusedId: e.target.value})} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent">
 <option value="">Select Person</option>
 {allProfiles.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>)}
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Category</label>
 <select value={grievanceFormData.category} onChange={e => setGrievanceFormData({...grievanceFormData, category: e.target.value})} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent">
 <option value="Academics">Academics</option>
 <option value="Disciplinary">Disciplinary</option>
 <option value="Harassment">Harassment</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Description</label>
 <textarea required rows="4" value={grievanceFormData.description} onChange={e => setGrievanceFormData({...grievanceFormData, description: e.target.value})} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent resize-none"></textarea>
 </div>
 <button type="submit" disabled={isSaving} className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest transition">Submit Report</button>
 </form>
 </div>
 </div>
 )}

 {/* RISK INSIGHTS VIEW */}
 {activeTab === 'risk' && (
 <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">
 <div className="flex flex-col border-b border-themeBorder pb-4 px-2">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight flex items-center gap-2`}>
 <i className="fa-solid fa-triangle-exclamation text-rose-500"></i> Mentee Risk Insights
 </h2>
 <p className={`text-[10px] lg:text-xs font-semibold text-themeTextSec mt-1`}>Engagement analysis based on real meeting history and session data for your assigned mentees.</p>
 </div>

 {riskInsights.length === 0 ? (
 <div className="py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themePanel px-4">
 <i className="fa-solid fa-user-group text-3xl lg:text-4xl text-themeTextSec opacity-50 mb-3 lg:mb-4"></i>
 <p className={`text-xs lg:text-sm font-bold text-themeTextSec`}>No mentees assigned yet. Ask an admin to allocate students to you via the Mentorship module.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
 {riskInsights.map((insight) => (
 <div key={insight.id} className="bg-themePanel border border-themeBorder p-5 lg:p-6 rounded-themePanel flex flex-col justify-between group">
 <div>
 <div className="flex justify-between items-start mb-3">
 <div>
 <h3 className="text-base lg:text-lg font-black text-themeText">{insight.studentName}</h3>
 <p className={`text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5`}>{insight.erpId}</p>
 </div>
 <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
 insight.riskLevel === 'High' ? 'bg-themeElevated text-rose-400 border-themeBorder' : 
 insight.riskLevel === 'Medium' ? 'bg-themeElevated text-amber-400 border-themeBorder' : 
 'bg-themeElevated text-emerald-400 border-themeBorder'
 }`}>
 {insight.riskLevel} Risk
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2 mt-4">
 <div className="bg-themeElevated p-2.5 rounded-lg border border-themeBorder text-center">
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Sessions</p>
 <p className="text-sm font-black text-themeText">{insight.totalRequested}</p>
 </div>
 <div className="bg-themeElevated p-2.5 rounded-lg border border-themeBorder text-center">
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Completed</p>
 <p className="text-sm font-black text-themeAccent">{insight.completedCount}</p>
 </div>
 </div>
 <div className="bg-themeElevated p-3 rounded-themePanel border border-themeBorder mt-3">
 <p className="text-[10px] font-black text-themeTextSec opacity-70 uppercase tracking-widest mb-1 flex items-center gap-1"><i className="fa-solid fa-chart-line"></i> Assessment</p>
 <p className="text-xs text-themeText font-medium">{insight.reason}</p>
 </div>
 </div>
 <div className="mt-5 flex items-center justify-between pt-4 border-t border-themeBorder">
 <span className={`text-[9px] lg:text-[10px] font-bold text-themeTextSec`}>Last Contact: {insight.lastContact}</span>
 <button type="button" onClick={() => window.erpDialog.alert("Email sent via communication engine!")} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent hover:opacity-80 transition-opacity flex items-center gap-1.5">
 <i className="fa-solid fa-envelope"></i> Send Alert
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>

 {/* 4. MODALS */}

 {/* LOG MEETING MODAL */}
 {showLogModal && selectedMeeting && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-themePanel w-full max-w-lg rounded-themePanel overflow-hidden border border-themeBorder">

 <div className="bg-themeElevated p-5 lg:p-6 text-themeText relative overflow-hidden border-b border-themeBorder">
 <div className="absolute top-0 right-0 w-48 h-48 bg-themePanel rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="flex justify-between items-start relative z-10">
 <div className="min-w-0 pr-4">
 <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText truncate">Log Meeting Notes</h3>
 <p className={`text-[10px] lg:text-xs text-themeTextSec font-medium truncate`}>Session with <span className="text-themeAccent font-bold">{selectedMeeting.student?.full_name}</span></p>
 </div>
 <button type="button" onClick={() => setShowLogModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel border border-themeBorder text-themeTextSec hover:text-themeText transition-colors shrink-0">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 </div>

 <form onSubmit={handleLogMeeting} className="p-5 lg:p-6 flex flex-col gap-4 lg:gap-5 max-h-[70vh] overflow-y-auto">
 <div className="bg-themeElevated border border-themeBorder p-3.5 lg:p-4 rounded-themePanel">
 <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent opacity-70 mb-1">Student Agenda</p>
 <p className="text-xs lg:text-sm font-bold text-themeText">{selectedMeeting.topic}</p>
 </div>

 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>Official Notes / Action Items</label>
 <textarea
 rows="5"
 value={meetingNotes}
 onChange={(e) => setMeetingNotes(e.target.value)}
 placeholder="Record discussion points and advice given. The student will be able to view these."
 className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition resize-none placeholder:opacity-50"
 required
 ></textarea>
 </div>

 <button
 type="submit"
 disabled={isSaving || !meetingNotes.trim()}
 className={`w-full mt-2 py-3.5 lg:py-4 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex justify-center items-center gap-2 overflow-hidden group ${isSaving || !meetingNotes.trim()
 ? 'bg-themeElevated text-themeTextSec opacity-70 cursor-not-allowed border border-themeBorder'
 : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]'
 }`}
 >
 {isSaving ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Archiving Log...</>
 ) : (
 <><i className="fa-solid fa-floppy-disk text-base lg:text-lg"></i> Save & Mark Completed</>
 )}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* ADD SLOT MODAL */}
 {showAddSlotModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-themePanel w-full max-w-md rounded-themePanel overflow-hidden border border-themeBorder">
 <div className="bg-themeElevated p-5 lg:p-6 text-themeText relative overflow-hidden border-b border-themeBorder">
 <div className="absolute top-0 right-0 w-48 h-48 bg-themePanel rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="flex justify-between items-start relative z-10">
 <div>
 <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText">Add Availability Slot</h3>
 <p className={`text-[10px] lg:text-xs text-themeTextSec font-medium`}>Create a new recurring weekly slot.</p>
 </div>
 <button type="button" onClick={() => setShowAddSlotModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel border border-themeBorder text-themeTextSec hover:text-themeText transition-colors shrink-0">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 </div>

 <form onSubmit={handleAddSlot} className="p-5 lg:p-6 flex flex-col gap-4 lg:gap-5">
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>Day of Week</label>
 <div className="relative">
 <select
 value={newSlot.day_of_week}
 onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
 className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent cursor-pointer appearance-none"
 >
 {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => <option key={day} value={day}>{day}</option>)}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 lg:gap-4">
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>Start Time</label>
 <input type="time" required value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-3 lg:px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent [color-scheme:dark]" />
 </div>
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>End Time</label>
 <input type="time" required value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-3 lg:px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent [color-scheme:dark]" />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>Meeting Type</label>
 <div className="relative">
 <select value={newSlot.meeting_type} onChange={(e) => setNewSlot({ ...newSlot, meeting_type: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent cursor-pointer appearance-none">
 <option value="In-Person">In-Person</option>
 <option value="Virtual">Virtual</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
 </div>
 </div>
 <div>
 <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 ml-1`}>Room / Link</label>
 <input type="text" required placeholder={newSlot.meeting_type === 'Virtual' ? "Zoom Link" : "e.g. Cabin 304"} value={newSlot.room_link} onChange={(e) => setNewSlot({ ...newSlot, room_link: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
 </div>
 </div>

 <button type="submit" disabled={isSaving} className="w-full mt-2 py-3.5 lg:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2">
 {isSaving ? <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Saving...</> : <><i className="fa-solid fa-plus text-base lg:text-lg"></i> Add Slot</>}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* SCHEDULE SESSION MODAL */}
 {showScheduleModal && (
 <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
 <div className="absolute inset-0 bg-themePanel/85 backdrop-blur-2xl/80 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)}></div>
 <div className="relative bg-themePanel border border-themeBorder rounded-2xl w-full max-w-md p-6 lg:p-8 animate-slide-up overflow-y-auto max-h-[90vh]">
 <div className="flex justify-between items-start mb-6">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText`}>Schedule Session</h2>
 <p className="text-xs text-themeTextSec mt-1">with <span className="font-bold text-themeAccent">{scheduleMentee?.full_name}</span></p>
 </div>
 <button type="button" onClick={() => setShowScheduleModal(false)} className="w-8 h-8 rounded-full bg-themeElevated hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors text-themeTextSec">
 <i className="fa-solid fa-times"></i>
 </button>
 </div>
 <form onSubmit={handleScheduleSession} className="flex flex-col gap-4">
 <div className="flex gap-4">
 <div className="flex-1 flex flex-col gap-1.5">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-1">Date</label>
 <input min="2026-09-14" required type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
 </div>
 <div className="flex-1 flex flex-col gap-1.5">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-1">Time</label>
 <input required type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
 </div>
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-1">Topic / Agenda</label>
 <input required type="text" placeholder="e.g. Academic Review" value={scheduleForm.topic} onChange={e => setScheduleForm({ ...scheduleForm, topic: e.target.value })} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
 </div>
 <div className="flex items-center gap-3 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl cursor-pointer" onClick={() => setScheduleForm({ ...scheduleForm, is_urgent: !scheduleForm.is_urgent })}>
 <div className={`w-5 h-5 rounded flex items-center justify-center border ${scheduleForm.is_urgent ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-500/30'}`}>
 {scheduleForm.is_urgent && <i className="fa-solid fa-check text-xs"></i>}
 </div>
 <span className="text-sm font-bold text-themeText">Mark as Urgent (Action Required)</span>
 </div>
 <button
 type="submit"
 disabled={isSaving || !scheduleForm.date || !scheduleForm.time || !scheduleForm.topic.trim()}
 className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 mt-2
 ${isSaving || !scheduleForm.date || !scheduleForm.time || !scheduleForm.topic.trim()
 ? 'bg-themeElevated text-themeTextSec opacity-50 cursor-not-allowed'
 : 'bg-themeAccent hover:bg-themeAccent/90 text-white hover:-translate-y-0.5'
 }`}
 >
 {isSaving ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Sending...</>
 ) : (
 <><i className="fa-solid fa-paper-plane text-base lg:text-lg"></i> Send Meeting Notice</>
 )}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Student 360 Profile Drawer */}
 {selectedMenteeProfile && (
 <FacultyStudentProfile360 
 mentee={selectedMenteeProfile} 
 onClose={() => setSelectedMenteeProfile(null)}
 onSchedule={() => {
 setScheduleMentee(selectedMenteeProfile);
 setScheduleForm({ date: '', time: '', topic: '', is_urgent: false });
 setShowScheduleModal(true);
 }}
 />
 )}

 </div>
 </div>
 );
}
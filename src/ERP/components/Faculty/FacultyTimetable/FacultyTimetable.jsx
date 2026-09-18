/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { Badge } from "../../ui/Badge";
import WeeklyChart from "../../shared/WeeklyChart";
import SubjectFlipCard from "../../shared/SubjectFlipCard";

const SUBJECT_COLORS = {
 blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500' },
 emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500' },
 purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500' },
 orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500' },
 rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500' },
 amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500' },
 gray: { bg: 'bg-themeElevated', text: 'text-themeTextSec', border: 'border-themeBorder', solid: 'bg-themeBorderStrong' }
};

export default function FacultyTimetable({}) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('timeline');
 const [selectedLecture, setSelectedLecture] = useState(null);
 const [currentTime, setCurrentTime] = useState(new Date());
 const [requestType, setRequestType] = useState('Extra Class');

 const [schedule, setSchedule] = useState(() => {
 const cached = sessionStorage.getItem(`fac_schedule_${userSession?.id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [requests, setRequests] = useState(() => {
 const cached = sessionStorage.getItem(`fac_scheduleReqs_${userSession?.id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [mySubjects, setMySubjects] = useState(() => {
 const cached = sessionStorage.getItem(`fac_scheduleSubs_${userSession?.id}`);
 return cached ? JSON.parse(cached) : [];
 });

 // Form State for Request
 const [reqSubjectId, setReqSubjectId] = useState('');
 const [reqScheduleId, setReqScheduleId] = useState('');
 const [reqDate, setReqDate] = useState('');
 const [reqNewDay, setReqNewDay] = useState('Monday');
 const [reqStartTime, setReqStartTime] = useState('');
 const [reqEndTime, setReqEndTime] = useState('');
 const [reqReason, setReqReason] = useState('');

 const fetchData = async () => {
 if (!userSession?.id) return;
 try {
 // 1. Fetch Schedule
 const { data: schedData, error: schedErr } = await supabase
 .from('class_schedule')
 .select(`
 id, batch, day_of_week, start_time, end_time,
 subjects!inner(id, name, theme_color, faculty_id),
 room:academic_classrooms(name)
 `)
 .eq('subjects.faculty_id', userSession.db_id);

 if (schedErr) throw schedErr;

 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
 const nowTime = new Date();
 const currentMins = nowTime.getHours() * 60 + nowTime.getMinutes();
 
 const formattedSched = (schedData || []).map(s => {
 const sTime = s.start_time.slice(0, 5);
 const eTime = s.end_time.slice(0, 5);
 
 const sMins = parseInt(sTime.split(':')[0]) * 60 + parseInt(sTime.split(':')[1]);
 const eMins = parseInt(eTime.split(':')[0]) * 60 + parseInt(eTime.split(':')[1]);
 
 let status = 'upcoming';
 if (currentMins >= eMins) status = 'past';
 else if (currentMins >= sMins && currentMins < eMins) status = 'current';

 return {
 id: s.id,
 day: daysMap[s.day_of_week],
 time: sTime,
 endTime: eTime,
 subject: s.subjects?.name,
 subjectId: s.subjects?.id,
 color: s.subjects?.theme_color,
 room: s.room?.name,
 semester: s.batch,
 status
 };
 });
 formattedSched.sort((a, b) => parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')));
 setSchedule(formattedSched);
 sessionStorage.setItem(`fac_schedule_${userSession.db_id}`, JSON.stringify(formattedSched));

 // 2. Fetch Requests
 const { data: reqData } = await supabase
 .from('timetable_requests')
 .select(`*, subject:subjects(name)`)
 .eq('faculty_id', userSession.db_id)
 .order('created_at', { ascending: false });
 if (reqData) {
 setRequests(reqData);
 sessionStorage.setItem(`fac_scheduleReqs_${userSession.db_id}`, JSON.stringify(reqData));
 }

 // 3. Fetch Subjects
 const { data: subData } = await supabase.from('subjects').select('*').eq('faculty_id', userSession.db_id);
 if (subData) {
 setMySubjects(subData);
 sessionStorage.setItem(`fac_scheduleSubs_${userSession.db_id}`, JSON.stringify(subData));
 if (subData.length > 0 && !reqSubjectId) setReqSubjectId(subData[0].id);
 }

 } catch (err) {
 console.error("Failed to fetch faculty timetable data:", err);
 }
 };

 useEffect(() => {
 fetchData();
 }, [userSession?.id]);

 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 60000);
 return () => clearInterval(timer);
 }, []);

 const submitRequest = async (e) => {
 e.preventDefault();
 try {
 let finalReason = reqReason;
 if (requestType === 'Permanent Shift') {
 finalReason = `Shift to ${reqNewDay}. ` + reqReason;
 }

 const { error } = await supabase.from('timetable_requests').insert([{
 faculty_id: userSession.db_id,
 subject_id: reqSubjectId,
 schedule_id: reqScheduleId || null,
 request_type: requestType,
 requested_date: reqDate || null,
 requested_start_time: reqStartTime || null,
 requested_end_time: reqEndTime || null,
 reason: finalReason,
 status: 'Pending'
 }]);

 if (error) throw error;
 
 setReqReason('');
 fetchData();
 window.erpDialog?.alert("Request submitted successfully to Admin!");
 } catch (err) {
 console.error("Failed to submit request:", err);
 window.erpDialog?.alert("Error submitting request.");
 }
 };

 const renderTimeline = () => {
 const actualDayNum = new Date().getDay();
 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
 let currentDayName = daysMap[actualDayNum];
 if (currentDayName === 'Sunday') currentDayName = 'Monday';

 const todayClasses = schedule.filter(c => c.day === currentDayName);


 if (todayClasses.length === 0) return (
 <div className="bg-themePanel border border-themeBorder border-dashed rounded-2xl p-12 flex flex-col items-center justify-center opacity-50 mt-4">
 <i className="fa-regular fa-calendar text-4xl mb-4 text-themeTextSec"></i>
 <p className="text-sm font-bold text-themeTextSec">No classes scheduled for today.</p>
 </div>
 );

 return (
 <div className="flex flex-col relative py-4 animate-fade-in">
 <div className="absolute left-[72px] right-0 h-px bg-themeAccent z-10 flex items-center top-[30%] opacity-50">
 <div className="absolute -left-16 text-[10px] font-black tracking-widest text-themeAccent bg-themeApp pr-2">
 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 <div className="w-1.5 h-1.5 rounded-full bg-themeAccent -ml-1"></div>
 </div>

 {todayClasses.map((lec) => {
 const c = SUBJECT_COLORS[lec.color] || SUBJECT_COLORS.gray;
 const isPast = lec.status === 'past';
 const isCurrent = lec.status === 'current';
 
 return (
 <div key={lec.id} className={`flex gap-6 relative group ${isPast ? 'opacity-40 grayscale-[50%]' : ''}`}>
 <div className="w-16 flex flex-col items-end shrink-0 pt-4">
 <span className="text-[14px] font-medium text-themeText">{lec.time}</span>
 <span className="text-[9px] font-bold text-themeTextSec">{lec.endTime}</span>
 </div>
 
 <div className="relative w-px bg-themeBorder flex-col flex items-center">
 <div className={`w-3 h-3 rounded-full border-[3px] border-themeApp z-10 mt-4 transition-colors ${isCurrent ? c.solid + ' animate-pulse' : 'bg-themeBorderStrong group-hover:' + c.solid}`}></div>
 </div>

 <div className="flex-1 pb-8 pt-2">
 <div 
 onClick={() => setSelectedLecture(lec)}
 className={`w-full rounded-2xl p-5 border transition cursor-pointer flex justify-between items-start ${isCurrent ? `${c.bg} ${c.border} scale-[1.02]` : 'bg-themePanel border-themeBorder hover:border-themeBorderStrong hover:scale-[1.01]'}`}
 >
 <div>
 <div className="flex items-center gap-2 mb-2">
 <div className={`w-2 h-2 rounded-full ${c.solid}`}></div>
 <h3 className={`text-lg font-semibold tracking-tight tracking-tight ${isCurrent ? c.text : 'text-themeText'}`}>{lec.subject}</h3>
 </div>
 <div className="flex items-center gap-4 mt-3">
 <span className="text-xs font-bold text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap"></i> {lec.semester}</span>
 <span className="text-xs font-bold text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {lec.room}</span>
 </div>
 </div>
 
 <button type="button" onClick={() => window.erpDialog.alert("Please navigate to the Academic Hub -> Attendance module to mark attendance.")} className="bg-emerald-500 hover:opacity-90 text-themeApp px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity">
 Mark Attd
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
 };

 const renderWeeklyGrid = () => (
 <div className="hidden lg:flex flex-col gap-4 animate-fade-in w-full">
 <WeeklyChart schedule={schedule} onLectureClick={(lecture) => setSelectedLecture(lecture)} role="faculty" />
 </div>
 );

 const renderRequests = () => (
 <div className="flex flex-col gap-6 animate-fade-in w-full">
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6">
 <h3 className="text-[14px] font-medium tracking-normal text-themeTextSec mb-4">Request Form</h3>
 <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Request Type</label>
 <select value={requestType} onChange={e => setRequestType(e.target.value)} className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none">
 <option value="Extra Class">Extra Class</option>
 <option value="One-Time Reschedule">One-Time Reschedule</option>
 <option value="Permanent Shift">Permanent Shift</option>
 <option value="Substitution">Substitution</option>
 </select>
 </div>
 {(requestType === 'One-Time Reschedule' || requestType === 'Permanent Shift') && (
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Original Class (To Shift)</label>
 <select value={reqScheduleId} onChange={e => setReqScheduleId(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none">
 <option value="">Select a class...</option>
 {schedule.map(s => <option key={s.id} value={s.id}>{s.subject} - {s.day} {s.time}</option>)}
 </select>
 </div>
 )}
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Subject</label>
 <select value={reqSubjectId} onChange={e => setReqSubjectId(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none">
 {mySubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 {requestType === 'Permanent Shift' ? (
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">New Day of Week</label>
 <select value={reqNewDay} onChange={e => setReqNewDay(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none">
 {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
 </select>
 </div>
 ) : (
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Requested Date</label>
 <input min="2026-09-14" type="date" value={reqDate} onChange={e => setReqDate(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
 </div>
 )}
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">New Start Time</label>
 <input type="time" value={reqStartTime} onChange={e => setReqStartTime(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">New End Time</label>
 <input type="time" value={reqEndTime} onChange={e => setReqEndTime(e.target.value)} required className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" />
 </div>
 <div className="lg:col-span-3">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Reason</label>
 <input type="text" value={reqReason} onChange={e => setReqReason(e.target.value)} required placeholder="Brief reason for request..." className="w-full bg-themeElevated border border-themeBorderStrong focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div className="lg:col-span-3 flex justify-end">
 <button type="submit" className="btn-erp">Submit Request</button>
 </div>
 </form>
 </div>

 <div className="flex flex-col gap-4">
 <h3 className="text-[14px] font-medium tracking-normal text-themeTextSec mt-2">Request History</h3>
 {requests.length === 0 ? (
 <p className="text-xs font-bold text-themeTextSec">No requests found.</p>
 ) : requests.map(req => (
 <div key={req.id} className="bg-themePanel border border-themeBorder rounded-2xl p-5 flex items-center justify-between">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <span className="px-2 py-1 bg-themeElevated border border-themeBorderStrong rounded-md text-[12px] font-medium text-themeTextSec">{req.request_type}</span>
 <span className={`text-[13px] font-medium ${
 req.status === 'Approved' ? 'text-emerald-500' : 
 req.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'
 }`}>{req.status}</span>
 </div>
 <h4 className="text-[15px] font-semibold text-themeText">{req.subject?.name}</h4>
 <p className="text-xs font-bold text-themeTextSec mt-1">
 {new Date(req.requested_date).toLocaleDateString()} ({req.requested_start_time?.slice(0,5)} - {req.requested_end_time?.slice(0,5)})
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 );

 const LectureSideSheet = ({ isEmbedded = false }) => {
 if (!selectedLecture) return null;
 const c = SUBJECT_COLORS[selectedLecture.color] || SUBJECT_COLORS.gray;

 return (
 <div className="fixed inset-0 z-50 flex justify-end">
 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedLecture(null)}></div>
 <div className="relative w-full max-w-md bg-themeApp h-full border-l border-themeBorder flex flex-col animate-[slideInRight_0.3s_ease-out]">
 <div className={`${c.bg} p-6 border-b ${c.border} relative overflow-hidden`}>
 <div className={`absolute top-0 right-0 w-48 h-48 ${c.solid} opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`}></div>
 <div className="flex justify-between items-start mb-6 relative z-10">
 <Badge variant="outline" className={`${c.text} ${c.border}`}>{selectedLecture.day}, {selectedLecture.time} - {selectedLecture.endTime}</Badge>
 <button type="button" onClick={() => setSelectedLecture(null)} className="w-8 h-8 rounded-full bg-black/10 hover:bg-gray-50 dark:bg-black/20 text-themeText flex items-center justify-center transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 <h2 className={`text-2xl font-semibold tracking-tight tracking-tight mb-2 ${c.text} relative z-10`}>{selectedLecture.subject}</h2>
 <div className="flex items-center gap-4 text-xs font-bold text-themeTextSec relative z-10">
 <span className="flex items-center gap-1.5"><i className="fa-solid fa-graduation-cap"></i> {selectedLecture.semester}</span>
 <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {selectedLecture.room}</span>
 </div>
 </div>
 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
 <button type="button" onClick={() => window.erpDialog.alert("Please navigate to the Academic Hub -> Attendance module to mark attendance.")} className="w-full bg-emerald-500 hover:opacity-90 text-themeApp py-4 rounded-xl text-[15px] font-semibold tracking-normal transition-opacity flex items-center justify-center gap-2">
 <i className="fa-solid fa-clipboard-check text-lg"></i> Launch Attendance Interface
 </button>
 </div>
 </div>
 </div>
 );
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <PageHeader 
 icon="fa-solid fa-calendar-days"
 title="Teaching Workspace"
 subtitle="Manage syllabus, attendance, and timetable requests."
 rightContent={
 <div className="relative z-10 w-full lg:w-auto shrink-0 mt-4 md:mt-0">
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {['Timeline', 'Week', 'Requests'].map(tab => (
 <button type="button" 
 key={tab}
 onClick={() => setActiveTab(tab.toLowerCase())}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab.toLowerCase() 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-themeText border border-black/10 dark:border-white/40 scale-100' 
 : 'text-themeTextSec opacity-80 hover:text-themeText hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>
 </div>
 }
 />

 <div className="flex flex-col xl:flex-row gap-8 items-start">
 <div className="flex-1 w-full min-w-0 overflow-x-auto pb-4">
 {activeTab === 'timeline' && renderTimeline()}
 {activeTab === 'week' && (
 <>
 {renderWeeklyGrid()}
 <div className="lg:hidden p-8 border border-themeBorder border-dashed rounded-2xl text-center flex flex-col items-center justify-center bg-themePanel mt-4">
 <i className="fa-solid fa-desktop text-3xl text-themeTextSec mb-4"></i>
 <h3 className="text-[15px] font-semibold text-themeText mb-1">Desktop Recommended</h3>
 <p className="text-xs font-bold text-themeTextSec">The weekly timetable chart requires a larger screen. Please use a tablet or desktop, or switch to the 'Timeline' view.</p>
 </div>
 </>
 )}
 {activeTab === 'requests' && renderRequests()}
 </div>

 <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-32">
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 relative overflow-hidden group">
 <div className="absolute -right-12 -top-12 w-32 h-32 bg-themeAccent/10 rounded-full blur-2xl transition"></div>
 <h3 className="text-[13px] font-medium text-themeTextSec mb-4">Today's Pulse</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <span className="text-3xl font-semibold tracking-tight text-themeText">{schedule.length}</span>
 <span className="text-[12px] font-medium text-themeTextSec">Classes</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-3xl font-semibold tracking-tight text-amber-500">{requests.filter(r => r.status === 'Pending').length}</span>
 <span className="text-[12px] font-medium text-themeTextSec">Pending Reqs</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <LectureSideSheet />
 </div>
 </div>
 );
}
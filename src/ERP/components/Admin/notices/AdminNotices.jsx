/* © 2026 JSM VALOR. All Rights Reserved. */
"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import TargetAudienceSelector from "../../shared/TargetAudienceSelector";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminNotices({ isHubView = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState("broadcast"); // broadcast, events

 // --- BROADCAST STATE ---
 const [notices, setNotices] = useState([]);
 const [isPublishing, setIsPublishing] = useState(false);
 
 // Broadcast Form
 const [title, setTitle] = useState("");
 const [content, setContent] = useState("");
 const [category, setCategory] = useState("General");
 const [priority, setPriority] = useState("normal");
 const [targetAudience, setTargetAudience] = useState(['All']);
 const [requiresAck, setRequiresAck] = useState(false);

 // --- EVENTS STATE ---
 const [events, setEvents] = useState([]);
 const [isScheduling, setIsScheduling] = useState(false);
 
 // Events Form
 const [eventTitle, setEventTitle] = useState("");
 const [eventStartDate, setEventStartDate] = useState("");
 const [eventEndDate, setEventEndDate] = useState("");
 const [eventType, setEventType] = useState("academic");
 const [eventDesc, setEventDesc] = useState("");

 // --- DATA FETCHING ---
 useEffect(() => {
 fetchNotices();
 fetchEvents();
 }, []);

 const fetchNotices = async () => {
 try {
 const { data, error } = await supabase
 .from('notices')
 .select('*')
 .limit(300)
 .order('created_at', { ascending: false });
 if (!error && data) setNotices(data);
 } catch (err) {
 console.error("Error fetching notices:", err);
 }
 };

 const fetchEvents = async () => {
 try {
 const { data, error } = await supabase
 .from('academic_calendar')
 .select('*')
 .limit(300)
 .order('start_date', { ascending: true });
 if (!error && data) setEvents(data);
 } catch (err) {
 console.error("Error fetching events:", err);
 }
 };

 // --- HANDLERS ---
 const handlePublishNotice = async (e) => {
 e.preventDefault();
 setIsPublishing(true);
 try {
 const { error } = await supabase.from('notices').insert([{
 title,
 content,
 category,
 priority,
 target_audience: targetAudience,
 requires_acknowledgement: requiresAck,
 author_id: userSession?.db_id
 }]);

 if (error) throw error;
 
 setTitle("");
 setContent("");
 setPriority("normal");
 setRequiresAck(false);
 fetchNotices();
 } catch (err) {
 console.error("Failed to publish notice:", err);
 window.erpDialog?.alert("Failed to publish notice. Check console.");
 } finally {
 setIsPublishing(false);
 }
 };

 const handleScheduleEvent = async (e) => {
 e.preventDefault();
 setIsScheduling(true);
 try {
 const { error } = await supabase.from('academic_calendar').insert([{
 title: eventTitle,
 start_date: eventStartDate,
 end_date: eventEndDate || null,
 type: eventType,
 description: eventDesc,
 created_by: userSession?.db_id
 }]);

 if (error) throw error;
 
 setEventTitle("");
 setEventStartDate("");
 setEventEndDate("");
 setEventDesc("");
 fetchEvents();
 } catch (err) {
 console.error("Failed to schedule event:", err);
 window.erpDialog?.alert("Failed to schedule event. Check console.");
 } finally {
 setIsScheduling(false);
 }
 };

 const handleDeleteNotice = async (id) => {
 if (!confirm("Retract this broadcast?")) return;
 await supabase.from('notices').delete().eq('id', id);
 fetchNotices();
 };

 const handleDeleteEvent = async (id) => {
 if (!confirm("Cancel this event?")) return;
 await supabase.from('academic_calendar').delete().eq('id', id);
 fetchEvents();
 };

 // --- RENDERERS ---
 const renderBroadcastTab = () => (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Form */}
 <div className="lg:col-span-5 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 h-max">
 <h2 className="text-xl font-black text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-satellite-dish text-themeAccent"></i> New Broadcast
 </h2>
 <form onSubmit={handlePublishNotice} className="flex flex-col gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. End Semester Exam Schedule" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Category</label>
 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="Academic">Academic</option>
 <option value="Administrative">Administrative</option>
 <option value="General">General</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Priority</label>
 <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="normal">Normal</option>
 <option value="high">High</option>
 <option value="urgent">Urgent</option>
 </select>
 </div>
 </div>
 <div>
 <TargetAudienceSelector value={targetAudience} onChange={setTargetAudience} role="admin" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Content</label>
 <textarea value={content} onChange={e => setContent(e.target.value)} required rows="5" className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Draft the official notification here..."></textarea>
 </div>
 <label className="flex items-center gap-3 p-4 bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl cursor-pointer">
 <input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="accent-themeAccent w-4 h-4" />
 <div>
 <span className="text-sm font-bold text-themeText block">Require Acknowledgement</span>
 <span className="text-[10px] font-bold text-themeTextSec">Force recipients to digitally sign that they have read this.</span>
 </div>
 </label>
 <button type="submit" disabled={isPublishing} className="btn-erp">
 {isPublishing ? 'Broadcasting...' : 'Publish Notice'}
 </button>
 </form>
 </div>

 {/* List */}
 <div className="lg:col-span-7 flex flex-col gap-4">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Active Broadcasts</h3>
 {notices.map(n => (
 <div key={n.id} className="p-6 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl flex flex-col gap-3 relative overflow-hidden group">
 {n.priority === 'urgent' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
 <div className="flex justify-between items-start">
 <div className="flex gap-2">
 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
 n.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border-black/5 dark:border-white/10'
 }`}>{n.priority}</span>
 <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border border-black/5 dark:border-white/10">{n.category}</span>
 </div>
 <button type="button" onClick={() => handleDeleteNotice(n.id)} className="text-themeTextSec hover:text-rose-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
 </div>
 <h4 className="text-lg font-black text-themeText">{n.title}</h4>
 <p className="text-sm font-bold text-themeTextSec whitespace-pre-wrap">{n.content}</p>
 <div className="flex gap-4 mt-2 pt-3 border-t border-white/5">
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-regular fa-clock mr-1"></i> {new Date(n.created_at).toLocaleString()}</span>
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-solid fa-users mr-1"></i> {n.target_audience.join(', ')}</span>
 {n.requires_acknowledgement && <span className="text-[10px] font-bold text-emerald-500"><i className="fa-solid fa-signature mr-1"></i> Requires Signature</span>}
 </div>
 </div>
 ))}
 </div>
 </div>
 );

 const renderEventsTab = () => (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Form */}
 <div className="lg:col-span-5 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-6 h-max">
 <h2 className="text-xl font-black text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-calendar-plus text-themeAccent"></i> Schedule Event
 </h2>
 <form onSubmit={handleScheduleEvent} className="flex flex-col gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Event Title</label>
 <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Guest Lecture" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Start Date</label>
 <input min="2026-09-14" type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} required className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">End Date (Optional)</label>
 <input min="2026-09-14" type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" />
 </div>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Type</label>
 <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="academic">Academic</option>
 <option value="holiday">Holiday</option>
 <option value="extracurricular">Extracurricular</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Description</label>
 <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} required rows="3" className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Short event description..."></textarea>
 </div>
 <button type="submit" disabled={isScheduling} className="btn-erp">
 {isScheduling ? 'Scheduling...' : 'Add to Calendar'}
 </button>
 </form>
 </div>

 {/* List */}
 <div className="lg:col-span-7 flex flex-col gap-4">
 <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Upcoming Calendar</h3>
 {events.map(e => (
 <div key={e.id} className="p-6 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl flex justify-between items-center group">
 <div className="flex gap-4 items-center">
 <div className="w-16 h-16 rounded-xl bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
 <span className="text-[10px] font-black uppercase tracking-widest text-themeAccent">{new Date(e.start_date).toLocaleString('default', { month: 'short' })}</span>
 <span className="text-xl font-black text-themeText">{new Date(e.start_date).getDate()}</span>
 </div>
 <div>
 <h4 className="text-base font-black text-themeText">{e.title}</h4>
 <p className="text-xs font-bold text-themeTextSec mt-1">{e.description}</p>
 {e.end_date && e.end_date !== e.start_date && (
 <p className="text-[10px] font-bold text-themeTextSec mt-1">Ends: {new Date(e.end_date).toLocaleDateString()}</p>
 )}
 </div>
 </div>
 <button type="button" onClick={() => handleDeleteEvent(e.id)} className="text-themeTextSec hover:text-rose-500 transition-colors p-2"><i className="fa-solid fa-trash-can"></i></button>
 </div>
 ))}
 </div>
 </div>
 );

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 ${!isHubView && 'px-4 lg:px-8'}`}>
 
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-bullhorn" title="Broadcast & Events Center" subtitle="Publish official notices across the ERP and manage the academic calendar." />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themePanel/85 backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`}>
 <button type="button" onClick={() => setActiveTab('broadcast')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'broadcast' ? 'bg-themeAccent text-white border border-themeAccent scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-themePanel/85 backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-satellite-dish"></i> Notices
 </button>
 <button type="button" onClick={() => setActiveTab('events')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'events' ? 'bg-themeAccent text-white border border-themeAccent scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-themePanel/85 backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-calendar-day"></i> Events
 </button>
 </div>

 {activeTab === 'broadcast' ? renderBroadcastTab() : renderEventsTab()}
 
 </div>
 </div>
 );
}
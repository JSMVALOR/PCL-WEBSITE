/* © 2026 JSM VALOR. All Rights Reserved. */
"use client";

import React, { useState, useEffect } from "react";
import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../lib/EmailService';
import TargetAudienceSelector from "../../shared/TargetAudienceSelector";
import PageHeader from "../../shared/PageHeader/PageHeader";
import AcademicCalendarGrid from "./AcademicCalendarGrid";
import EventsBoard from "../../notices/EventsBoard";

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
 const [externalLink, setExternalLink] = useState("");
 const [isPublicWebsite, setIsPublicWebsite] = useState(false);

 // --- EVENTS STATE ---
 const [events, setEvents] = useState([]);
 const [isScheduling, setIsScheduling] = useState(false);
 
 // Events Form
 const [eventTitle, setEventTitle] = useState("");
 const [eventStartDate, setEventStartDate] = useState("");
 const [eventEndDate, setEventEndDate] = useState("");
 const [eventType, setEventType] = useState("academic");
 const [eventDesc, setEventDesc] = useState("");
 const [isPublic, setIsPublic] = useState(false);
 const [eventLocation, setEventLocation] = useState("");
 const [eventImageUrl, setEventImageUrl] = useState("");

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
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 const fetchEvents = async () => {
 try {
 const { data, error } = await supabase
 .from('academic_calendar')
 .select('*')
 .limit(300)
 .order('start_date', { ascending: true });
 if (!error && data) setEvents(data);
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
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
 author_id: userSession?.db_id,
 external_link: externalLink || null
 ,
 notice_id: `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
 author_name: userSession?.full_name || userSession?.name || 'Admin'
 }]);

 if (error) throw error;
 
 if (isPublicWebsite) {
 try {
 await supabase.from('admin_notices').insert([{
 
 title,
 content,
 category: 'Notice',
 is_public: true,
 external_link: externalLink || null
 
 }]);
 } catch(e) { console.error("Could not insert to admin_notices", e); }
 }

 
// NOTIFICATIONS INJECTION
try {
 const { data: users } = await supabase.from('profiles').select('id, erp_id, role, academic_batch');
 if (users && users.length > 0) {
 let recipientIds = [];
 if (targetAudience.includes('All')) {
 recipientIds = users.map(u => u.id);
 } else {
 users.forEach(u => {
 if (targetAudience.includes('Student') && u.role === 'student') recipientIds.push(u.id);
 else if (targetAudience.includes('Faculty') && u.role === 'faculty') recipientIds.push(u.id);
 else if (u.academic_batch && targetAudience.includes(u.academic_batch)) recipientIds.push(u.id);
 else if (targetAudience.includes(u.erp_id)) recipientIds.push(u.id);
 });
 }
 
 // Deduplicate
 recipientIds = [...new Set(recipientIds)];
 
 if (recipientIds.length > 0) {
 const notifs = recipientIds.map(rid => ({
 recipient_id: rid,
 title: 'New Broadcast: ' + title,
 message: content.substring(0, 50) + '...',
 type: 'notice'
 }));
 await supabase.from('notifications').insert(notifs);
 }
 }
} catch(e) { console.error('Failed to send real-time notifications', e); }

 // NOTIFICATIONS
 if (priority === 'urgent' || priority === 'high') {
 // We send a mock general broadcast email to a representative group
 // In production, we'd query targetAudience users and batch send.
 sendSystemEmail('GENERAL_BROADCAST', {
 to_email: 'all_students@prudentiacollege.edu',
 subject: `[${priority.toUpperCase()}] ${title}`,
 title: title,
 content: content,
 priority: priority
 }).catch(e => console.error("Email error:", e));
 }

 setTitle("");
 setContent("");
 setPriority("normal");
 setExternalLink("");
 setIsPublicWebsite(false);
 fetchNotices();
 if (window.erpToast) window.erpToast.show("Broadcast published successfully!", "success");
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
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
 end_date: eventEndDate || eventStartDate,
 type: eventType,
 description: eventDesc
 }]);

 if (isPublic) {
 await supabase.from('admin_events').insert([{
 title: eventTitle,
 event_date: eventStartDate,
 description: eventDesc,
 event_type: eventType,
 is_active: true,
 is_public: true
 }]);
 }

 if (error) throw error;
 
 setEventTitle("");
 setEventStartDate("");
 setEventEndDate("");
 setEventDesc("");
 fetchEvents();
 if (window.erpToast) window.erpToast.show("Event scheduled successfully!", "success"); 
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsScheduling(false);
 }
 };

 const handleDeleteNotice = async (id) => {
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this notice?", r)))) return;
 try {
 await supabase.from('notices').delete().eq('id', id);
 fetchNotices();
 if(window.erpToast) window.erpToast.show("Notice deleted successfully.", "success");
 } catch (e) {
 if(window.erpToast) window.erpToast.show("Failed to delete notice.", "error");
 }
 };

 const handleDeleteEvent = async (id) => {
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this event?", r)))) return;
 try {
 await supabase.from('academic_calendar').delete().eq('id', id);
 fetchEvents();
 if(window.erpToast) window.erpToast.show("Event deleted successfully.", "success");
 } catch (e) {
 if(window.erpToast) window.erpToast.show("Failed to delete event.", "error");
 }
 };

 // --- RENDERERS ---
 const renderBroadcastTab = () => (
 <div className="flex flex-col gap-12 w-full">
 {/* Form */}
 <div className="w-full">
 <h2 className="text-xl font-semibold tracking-tight text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-satellite-dish text-themeAccent"></i> New Broadcast
 </h2>
 <form onSubmit={handlePublishNotice} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="col-span-1 lg:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. End Semester Exam Schedule" />
 </div>
 <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Category</label>
 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="Academic">Academic</option>
 <option value="Administrative">Administrative</option>
 <option value="General">General</option>
 </select>
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Priority</label>
 <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="normal">Normal</option>
 <option value="high">High</option>
 <option value="urgent">Urgent</option>
 </select>
 </div>
 </div>
 <div className="col-span-1 lg:col-span-2 relative z-[60]">
 <TargetAudienceSelector value={targetAudience} onChange={setTargetAudience} role="admin" />
 </div>
 <div className="col-span-1 lg:col-span-4">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Content</label>
 <textarea value={content} onChange={e => setContent(e.target.value)} required rows="5" className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Draft the official notification here..."></textarea>
 </div>
 
 <div className="col-span-1 lg:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">External Link (Optional)</label>
 <input type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="https://..." />
 </div>

 
 
 <label className="col-span-1 lg:col-span-2 flex items-center justify-between p-4 bg-themeElevated border border-themeBorder rounded-xl cursor-pointer h-fit">
 <div>
 <span className="text-sm font-bold text-themeText block">Publish to Public Website</span>
 <span className="text-[10px] font-bold text-themeTextSec">Make this broadcast visible on the main website</span>
 </div>
 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isPublicWebsite ? 'bg-themeAccent' : 'bg-themeBorder'}`}>
 <div className={`w-4 h-4 bg-themePanel rounded-full transition-transform ${isPublicWebsite ? 'translate-x-4' : 'translate-x-0'}`}></div>
 </div>
 <input type="checkbox" checked={isPublicWebsite} onChange={e => setIsPublicWebsite(e.target.checked)} className="hidden" />
 </label>

 <div className="col-span-1 lg:col-span-4 flex justify-end mt-2">
 <button type="submit" disabled={isPublishing} className="btn-erp disabled:cursor-not-allowed w-full md:w-auto">
 {isPublishing ? 'Broadcasting...' : 'Publish Notice'}
 </button>
 </div>
 </form>
 </div>

 {/* List */}
 <div className="w-full flex flex-col gap-4">
 <h3 className="text-[13px] font-medium text-themeTextSec mb-2">Active Broadcasts</h3>
 <div className="flex overflow-x-auto snap-x no-scrollbar gap-6 pb-6">
 {notices.map(n => (
 <div key={n.id} className="min-w-[320px] max-w-[320px] snap-start bg-themePanel p-6 rounded-2xl border border-themeBorder flex flex-col gap-3 relative overflow-hidden group transition-opacity hover:opacity-80 shrink-0">
 {n.priority === 'urgent' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
 <div className="flex justify-between items-start">
 <div className="flex gap-2">
 <span className={`text-[12px] font-medium px-2 py-1 rounded-md border ${
 n.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-themeElevated text-themeTextSec border-themeBorder'
 }`}>{n.priority}</span>
 <span className="text-[12px] font-medium px-2 py-1 rounded-md bg-themeElevated text-themeTextSec border border-themeBorder">{n.category}</span>
 </div>
 <HoldButton size="sm" onHold={() => handleDeleteNotice(n.id)} radius={8} backgroundColor="transparent" fillColor="#f43f5e" textColor="#8E8E93" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
 </div>
 <h4 className="text-lg font-semibold tracking-tight text-themeText">{n.title}</h4>
 <p className="text-sm font-bold text-themeTextSec whitespace-pre-wrap">{n.content}</p>
 <div className="flex gap-4 mt-2 pt-3 border-t border-themeBorder ">
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-regular fa-clock mr-1"></i> {new Date(n.created_at).toLocaleString()}</span>
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-solid fa-users mr-1"></i> {Array.isArray(n.target_audience) && n.target_audience.join ? n.target_audience.join(', ') : typeof n.target_audience === 'string' ? n.target_audience : 'Unknown'}</span>
 
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );

 const renderEventsTab = () => (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Form */}
 <div className="lg:col-span-5 bg-themePanel/70 dark:bg-themePanel/[0.03] backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-none rounded-2xl p-6 h-max">
 <h2 className="text-xl font-semibold tracking-tight text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-calendar-plus text-themeAccent"></i> Schedule Event
 </h2>
 <form onSubmit={handleScheduleEvent} className="flex flex-col gap-4">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Event Title</label>
 <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Guest Lecture" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Start Date</label>
 <input min="2026-09-14" type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} required className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" />
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">End Date (Optional)</label>
 <input min="2026-09-14" type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" />
 </div>
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Type</label>
 <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="academic">Academic</option>
 <option value="holiday">Holiday</option>
 <option value="extracurricular">Extracurricular</option>
 </select>
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Description</label>
 <textarea value={eventDesc} onChange={e => setEventDesc(e.target.value)} required rows="3" className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Short event description..."></textarea>
 </div>
 
 {/* Public Event Toggle */}
 <div className="flex flex-col gap-3 p-4 bg-themeElevated border border-themeBorder rounded-xl">
 <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
 <div>
 <h4 className="text-sm font-black text-themeText tracking-tight">Publish to Website</h4>
 <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">Make event visible publicly</p>
 </div>
 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isPublic ? 'bg-themeAccent' : 'bg-themeBorder'}`}>
 <div className={`w-4 h-4 bg-themePanel rounded-full transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`}></div>
 </div>
 </div>
 
 {isPublic && (
 <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-themeBorder ">
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1.5 block">Location</label>
 <input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} className="w-full bg-themePanel border border-themeBorder rounded-lg px-3 py-2 text-xs font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Main Auditorium" />
 </div>
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1.5 block">Banner Image URL</label>
 <input type="url" value={eventImageUrl} onChange={e => setEventImageUrl(e.target.value)} className="w-full bg-themePanel border border-themeBorder rounded-lg px-3 py-2 text-xs font-bold text-themeText focus:border-themeAccent outline-none" placeholder="https://..." />
 </div>
 </div>
 )}
 </div>
 <button type="submit" disabled={isScheduling} className="btn-erp disabled:cursor-not-allowed">
 {isScheduling ? 'Scheduling...' : 'Add to Calendar'}
 </button>
 </form>
 </div>

 {/* List */}
 <div className="lg:col-span-7 flex flex-col gap-4">
 <h3 className="text-[13px] font-medium text-themeTextSec mb-2">Upcoming Calendar</h3>
 {events.map(e => (
 <div key={e.id} className="p-6 bg-themePanel/70 dark:bg-themePanel/[0.03] backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-none rounded-2xl flex justify-between items-center group">
 <div className="flex gap-4 items-center">
 <div className="w-16 h-16 rounded-xl bg-themeElevated border border-themeBorder flex flex-col items-center justify-center shrink-0">
 <span className="text-[13px] font-medium text-themeAccent">{new Date(e.start_date).toLocaleString('default', { month: 'short' })}</span>
 <span className="text-xl font-semibold tracking-tight text-themeText">{new Date(e.start_date).getDate()}</span>
 </div>
 <div>
 <h4 className="text-base font-black text-themeText">{e.title}</h4>
 <p className="text-xs font-bold text-themeTextSec mt-1">{e.description}</p>
 {e.end_date && e.end_date !== e.start_date && (
 <p className="text-[10px] font-bold text-themeTextSec mt-1">Ends: {new Date(e.end_date).toLocaleDateString()}</p>
 )}
 </div>
 </div>
 <HoldButton size="sm" onHold={() => handleDeleteEvent(e.id)} radius={8} backgroundColor="transparent" fillColor="#f43f5e" textColor="#8E8E93" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
 </div>
 ))}
 </div>
 </div>
 );

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>
 
 {/* Header and Tabs */}
 {!isHubView && (
 <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
 <PageHeader 
 icon="fa-solid fa-bullhorn" 
 title="System Broadcast" 
 subtitle="Publish notices & manage calendar" 
 />
 </div>
)}

 
 <div className={`flex flex-col gap-6 lg:gap-8 ${!isHubView && 'px-4 lg:px-8 mt-6'}`}>
<div className="flex w-full border-b border-themeBorder dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6">
 <button type="button" onClick={() => setActiveTab('broadcast')} className={`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'broadcast' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}`}>
 <i className="fa-solid fa-satellite-dish"></i> Notices
 </button>
 <button type="button" onClick={() => setActiveTab('events')} className={`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'events' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}`}>
 <i className="fa-solid fa-calendar-day"></i> Events
 </button>
 <button type="button" onClick={() => setActiveTab('grid')} className={`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'grid' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}`}>
 <i className="fa-solid fa-table-cells"></i> Calendar Grid
 </button>
 </div>

 {activeTab === 'broadcast' ? renderBroadcastTab() : activeTab === 'events' ? <EventsBoard /> : <AcademicCalendarGrid />}
 </div>
 </div>
 
 
 </div>
 );
}
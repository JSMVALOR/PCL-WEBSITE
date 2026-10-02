/* © 2026 JSM VALOR. All Rights Reserved. */
"use client";

import React, { useState, useEffect } from "react";
import { useNotification } from '../../../../Shared/context/NotificationContext.jsx';
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
 const [publicNotices, setPublicNotices] = useState([]);
 const [isPublishing, setIsPublishing] = useState(false);
 const [selectedNotice, setSelectedNotice] = useState(null);
 const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
 const { addFlag } = useNotification();
 
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
 .neq('category', 'System Alert') // Exclude personal system alerts
 .limit(300)
 .order('created_at', { ascending: false });

 const { data: publicData } = await supabase
 .from('admin_notices')
 .select('*')
 .eq('category', 'Notice');
 
 if (publicData) {
     setPublicNotices(publicData);
 }
 
 if (!error && data) {
     const globalBroadcasts = data.filter(n => n.target_audience !== 'person');
     setNotices(globalBroadcasts);
 }
 } catch (err) { console.error(err); addFlag({title: "Action Failed", description: "An error occurred. Please try again.", type: "error"}); }
 };

 const fetchEvents = async () => {
 try {
 const { data, error } = await supabase
 .from('academic_calendar')
 .select('*')
 .limit(300)
 .order('start_date', { ascending: true });
 if (!error && data) setEvents(data);
 } catch (err) { console.error(err); addFlag({title: "Action Failed", description: "An error occurred. Please try again.", type: "error"}); }
 };

 // --- HANDLERS ---
 const handleTogglePublic = async (notice) => {
   const isCurrentlyPublic = publicNotices.some(pn => pn.title === notice.title && pn.is_public);
   try {
     if (isCurrentlyPublic) {
       const pn = publicNotices.find(pn => pn.title === notice.title);
       if (pn) await supabase.from('admin_notices').update({ is_public: false }).eq('id', pn.id);
     } else {
       const pn = publicNotices.find(pn => pn.title === notice.title);
       if (pn) {
          await supabase.from('admin_notices').update({ is_public: true }).eq('id', pn.id);
       } else {
          await supabase.from('admin_notices').insert([{
            title: notice.title,
            content: notice.content,
            category: 'Notice',
            is_public: true,
            external_link: notice.external_link || null,
            author_name: notice.author_name || 'Admin',
            author_id: notice.author_id || userSession?.db_id
          }]);
       }
     }
     fetchNotices();
     addFlag({ title: "Visibility Updated", description: "Website visibility updated successfully.", type: "success" });
   } catch(e) {
      console.error(e);
      addFlag({title: "Update Failed", description: "Failed to update visibility.", type: "error"});
   }
 };
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
      const { error: insertErr } = await supabase.from('admin_notices').insert([{
        title,
        content,
        category: 'Notice',
        is_public: true,
        external_link: externalLink || null,
        author_name: userSession?.full_name || userSession?.name || 'Admin',
        author_id: userSession?.db_id
      }]);
      if (insertErr) console.error("Error inserting to admin_notices:", insertErr);
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

 // ---- WHATSAPP INTEGRATION FOR BROADCASTS ----
 try {
   let targetPhones = new Set();
   
   // 1. Check if Global
   if (targetAudience.includes('All') || targetAudience.includes('Student') || targetAudience.includes('Faculty')) {
       const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
       if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
           globalSet.value.forEach(id => targetPhones.add(id));
       }
   }
   
   // 2. Check for specific batches
   const { data: allBatches } = await supabase.from('academic_batches').select('name, whatsapp_group_id');
   if (allBatches) {
       allBatches.forEach(b => {
           if (targetAudience.includes(b.name) && b.whatsapp_group_id) {
               targetPhones.add(b.whatsapp_group_id);
           }
       });
   }
   
   // Insert into queue
   if (targetPhones.size > 0) {
       const waNotifs = Array.from(targetPhones).map(phone => ({
           phone,
           message: `*[${category.toUpperCase()}] ${title}*\n\n${content}${externalLink ? '\n\nLink: ' + externalLink : ''}\n\n- Prudentia College of Law`,
           status: 'PENDING'
       }));
       await supabase.from('whatsapp_queue').insert(waNotifs);
   }
 } catch (e) {
   console.error("Failed to queue WA messages for broadcast", e);
 }
 // --------------------------------------------

 
 if (recipientIds.length > 0) {
 const notifs = recipientIds.map(rid => ({
 recipient_id: rid,
 title: 'New Broadcast: ' + title,
 message: content.substring(0, 50) + '...',
 type: 'notice',
 action_link: 'notices'
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
 addFlag({title: "Broadcast Published", description: "Broadcast published successfully!", type: "success"});
 } catch (err) { console.error(err); addFlag({title: "Publish Failed", description: "An error occurred. Please try again.", type: "error"}); } finally {
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
 
 // If it's a holiday or campus leave, notify everyone
 if (eventType === 'holiday' || eventType === 'campus_leave') {
   const { data: users } = await supabase.from('profiles').select('id, email, full_name');
   if (users && users.length > 0) {
     // Create bell notifications
     const notifs = users.map(u => ({
       recipient_id: u.id,
       title: `Upcoming ${eventType === 'holiday' ? 'Holiday' : 'Campus Leave'}`,
       message: `${eventTitle} is scheduled on ${new Date(eventStartDate).toLocaleDateString()}`,
       type: 'notice',
       action_link: 'notices'
     }));
     await supabase.from('notifications').insert(notifs);
     
     // Note: In production we would batch send an email to all users here using EmailService.
     // For this prototype, we'll log it or send to a test group.
      // For this prototype, we'll log it or send to a test group.
    }
    // ---- WHATSAPP INTEGRATION ----
    try {
      const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
      if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
        const groupNotifs = globalSet.value.map(groupId => ({
          phone: groupId,
          message: `*Official Notice: ${eventType === 'holiday' ? 'Holiday' : 'Campus Leave'}*\n\n${eventTitle}\nDate: ${new Date(eventStartDate).toLocaleDateString()}\n\n${eventDesc}`,
          status: 'PENDING',
          recipient_name: 'Global Broadcast',
          template_id: 'NOTICE_BROADCAST'
        }));
        if (groupNotifs.length > 0) {
          await supabase.from('whatsapp_queue').insert(groupNotifs);
        }
      }
    } catch (e) {
      console.error("Failed to queue WhatsApp broadcasts", e);
    }
    // -----------------------------
  }

 
 setEventTitle("");
 setEventStartDate("");
 setEventEndDate("");
 setEventDesc("");
 fetchEvents();
 if (isPublic) { addFlag({title: "Event Scheduled", description: "Event scheduled successfully!", type: "success"}); } else { addFlag({title: "Event Scheduled", description: "Event scheduled successfully!", type: "success"}); }
 } catch (err) { console.error(err); addFlag({title: "Scheduling Failed", description: "An error occurred. Please try again.", type: "error"}); } finally {
 setIsScheduling(false);
 }
 };

 const handleDeleteNotice = async (id) => {
 if (!(await window.erpDialog.confirm("Are you sure you want to delete this broadcast?"))) return;
 try {
 await supabase.from('notices').delete().eq('id', id);
 fetchNotices();
 addFlag({title: "Notice Deleted", description: "Notice deleted successfully.", type: "success"});
 } catch (e) {
 addFlag({title: "Delete Failed", description: "Failed to delete notice.", type: "error"});
 }
 };

 const handleDeleteEvent = async (id) => {
 if (!(await window.erpDialog.confirm("Are you sure you want to delete this event?"))) return;
 try {
 await supabase.from('academic_calendar').delete().eq('id', id);
 fetchEvents();
 addFlag({title: "Event Deleted", description: "Event deleted successfully.", type: "success"});
 } catch (e) {
 addFlag({title: "Delete Failed", description: "Failed to delete event.", type: "error"});
 }
 };

 // --- RENDERERS ---
 const renderBroadcastTab = () => {
   if (viewMode === 'detail' && selectedNotice) {
     return (
       <div className="flex flex-col gap-8 w-full animate-fade-in">
         <button onClick={() => setViewMode('list')} className="w-max flex items-center gap-2 text-sm font-bold text-themeTextSec hover:text-themeText transition-colors border border-themeBorder bg-themeElevated px-4 py-2 rounded-xl">
           <i className="fa-solid fa-arrow-left"></i> Back to Broadcasts
         </button>
         
         <div className="bg-themePanel p-8 lg:p-12 rounded-3xl border border-themeBorder flex flex-col gap-8 shadow-sm">
           <div className="flex flex-col gap-4 border-b border-themeBorder pb-8">
             <div className="flex gap-2">
               <span className={`text-[12px] font-medium px-3 py-1.5 rounded-md border tracking-widest uppercase ${
                 selectedNotice.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-themeElevated text-themeTextSec border-themeBorder'
               }`}>{selectedNotice.priority}</span>
               <span className="text-[12px] font-medium px-3 py-1.5 rounded-md bg-themeElevated text-themeTextSec border border-themeBorder tracking-widest uppercase">{selectedNotice.category}</span>
             </div>
             <h2 className="text-3xl lg:text-4xl font-black text-themeText tracking-tight leading-tight">{selectedNotice.title}</h2>
             
             <div className="flex flex-wrap items-center gap-6 mt-2">
               <span className="text-xs font-bold text-themeTextSec flex items-center gap-2"><i className="fa-regular fa-clock text-themeAccent"></i> {new Date(selectedNotice.created_at).toLocaleString()}</span>
               <span className="text-xs font-bold text-themeTextSec flex items-center gap-2"><i className="fa-solid fa-users text-themeAccent"></i> {Array.isArray(selectedNotice.target_audience) && selectedNotice.target_audience.join ? selectedNotice.target_audience.join(', ') : typeof selectedNotice.target_audience === 'string' ? selectedNotice.target_audience : 'Unknown'}</span>
               <span className="text-xs font-bold text-themeTextSec flex items-center gap-2"><i className="fa-solid fa-user-pen text-themeAccent"></i> {selectedNotice.author_name || 'Admin'}</span>
             </div>
           </div>

           <div className="text-base font-medium text-themeText whitespace-pre-wrap leading-relaxed bg-themeElevated/30 p-6 md:p-8 rounded-2xl border border-themeBorder/50">
             {selectedNotice.content}
           </div>

           {selectedNotice.external_link && (
             <div>
               <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Attached External Link</label>
               <a href={selectedNotice.external_link} target="_blank" rel="noreferrer" className="text-sm font-bold text-themeAccent hover:underline break-all inline-flex items-center gap-2 bg-themeAccent/10 px-4 py-3 rounded-xl">
                 <i className="fa-solid fa-arrow-up-right-from-square"></i> {selectedNotice.external_link}
               </a>
             </div>
           )}

           <div className="pt-8 border-t border-themeBorder max-w-xl">
             <h4 className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest mb-4">Website Integration</h4>
             <label className="flex items-center justify-between p-5 bg-themeElevated border border-themeBorder rounded-2xl cursor-pointer hover:border-themeAccent transition-colors">
               <div>
                 <span className="text-base font-black text-themeText block flex items-center gap-3">
                   Live on Public Website
                   {publicNotices.some(pn => pn.title === selectedNotice.title && pn.is_public) && (
                     <span className="flex h-2.5 w-2.5">
                       <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                     </span>
                   )}
                 </span>
                 <span className="text-[11px] font-bold text-themeTextSec mt-1 block">Toggle this switch to immediately show or hide this notice on the public website.</span>
               </div>
               <div className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-inner shrink-0 ${publicNotices.some(pn => pn.title === selectedNotice.title && pn.is_public) ? 'bg-emerald-500' : 'bg-themeBorder'}`}>
                 <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-md ${publicNotices.some(pn => pn.title === selectedNotice.title && pn.is_public) ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
               <input type="checkbox" checked={publicNotices.some(pn => pn.title === selectedNotice.title && pn.is_public)} onChange={() => handleTogglePublic(selectedNotice)} className="hidden" />
             </label>
           </div>
         </div>
       </div>
     );
   }

   return (
 <div className="flex flex-col gap-12 w-full animate-fade-in">
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
 <span className="text-[10px] font-bold text-themeTextSec">Push to Website Announcement Bar</span>
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
 {notices.map(n => {
   const isLive = publicNotices.some(pn => pn.title === n.title && pn.is_public);
   return (
 <div key={n.id} onClick={() => { setSelectedNotice(n); setViewMode('detail'); }} className="min-w-[320px] max-w-[320px] snap-start bg-themePanel p-6 rounded-2xl border border-themeBorder flex flex-col gap-3 relative overflow-hidden group transition-all hover:border-themeAccent hover:-translate-y-1 cursor-pointer shrink-0 shadow-sm hover:shadow-md">
 {n.priority === 'urgent' && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>}
 <div className="flex justify-between items-start">
 <div className="flex gap-2">
 <span className={`text-[12px] font-medium px-2 py-1 rounded-md border ${
 n.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-themeElevated text-themeTextSec border-themeBorder'
 }`}>{n.priority}</span>
 <span className="text-[12px] font-medium px-2 py-1 rounded-md bg-themeElevated text-themeTextSec border border-themeBorder">{n.category}</span>
 </div>
 <div className="flex items-center gap-3">
   {isLive && (
     <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20" title="Live on Public Website">
       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
     </div>
   )}
   <button onClick={(e) => { e.stopPropagation(); handleDeleteNotice(n.id); }} className="text-themeTextSec hover:text-rose-500 transition p-1" title="Delete Broadcast"><HugeiconsIcon icon={Delete02Icon} size={16} /></button>
 </div>
 </div>
 <h4 className="text-lg font-semibold tracking-tight text-themeText">{n.title}</h4>
 <p className="text-sm font-bold text-themeTextSec whitespace-pre-wrap line-clamp-3">{n.content}</p>
 <div className="flex gap-4 mt-2 pt-3 border-t border-themeBorder ">
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-regular fa-clock mr-1"></i> {new Date(n.created_at).toLocaleString()}</span>
 <span className="text-[10px] font-bold text-themeTextSec"><i className="fa-solid fa-users mr-1"></i> {Array.isArray(n.target_audience) && n.target_audience.join ? n.target_audience.join(', ') : typeof n.target_audience === 'string' ? n.target_audience : 'Unknown'}</span>
 </div>
 </div>
 )})}
 </div>
 </div>
 </div>
   );
 };

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
<option value="news">News</option>
 <option value="campus_leave">Campus Leave</option>
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
 <button onClick={() => handleDeleteEvent(e.id)} className="text-themeTextSec hover:text-rose-500 transition p-2" title="Delete Event"><HugeiconsIcon icon={Delete02Icon} size={16} /></button>
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
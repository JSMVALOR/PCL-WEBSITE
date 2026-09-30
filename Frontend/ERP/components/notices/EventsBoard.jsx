/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
"use client";

import React, { useState } from "react";
import HoldButton from '../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useERP } from "../../context/ErpContext";
import PageHeader from "../shared/PageHeader/PageHeader";

export default function EventsBoard({ isDashboardWidget = false }) {
 const { userSession, events, addEvent, deleteEvent } = useERP();

 // Form State
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [eventDate, setEventDate] = useState("");
 const [location, setLocation] = useState("");
 const [imageUrl, setImageUrl] = useState("");
 const [isPublic, setIsPublic] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 

 const role = userSession?.role || "student";
 const canCreate = role === "faculty" || role === "admin";

 const handleCreateSubmit = async (e) => {
 e.preventDefault();
 if (!title || !eventDate) return;
 setIsSubmitting(true);
 try {
 const { success, error } = await addEvent({
 title,
 description,
 event_date: eventDate,
 location: location.trim() || "TBA",
 image_url: imageUrl.trim() || null,
 is_public: isPublic
 });

 if (!success && error) throw error;
 
 setTitle("");
 setDescription("");
 setEventDate("");
 setLocation("");
 setImageUrl("");
 setIsPublic(false);
 
 if (window.erpToast) window.erpToast.show("Event published successfully!", "success");
 else if (window.erpToast) window.erpToast.show("Event published successfully!", "success");

 } catch (error) { 
 console.error(error); 
 if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); 
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id) => {
 await deleteEvent(id);
 };
 
 // Sort events correctly (Active vs Past)
 const activeEvents = events.filter(e => new Date(e.event_date) >= new Date(new Date().setHours(0,0,0,0))).sort((a,b) => new Date(a.event_date) - new Date(b.event_date));
 const pastEvents = events.filter(e => new Date(e.event_date) < new Date(new Date().setHours(0,0,0,0))).sort((a,b) => new Date(b.event_date) - new Date(a.event_date));
 
 const displayEvents = isDashboardWidget ? activeEvents.slice(0, 5) : [...activeEvents, ...pastEvents];

 return (
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-[fadeIn_0.4s_ease-out]">
 

 {canCreate && !isDashboardWidget && (
 <div className="bg-themePanel shadow-sm border border-themeBorder dark:border-white/[0.08] shadow-none rounded-3xl p-6 lg:p-8">
 <h2 className="text-xl font-bold tracking-tight text-themeText flex items-center gap-2 mb-6">
 <i className="fa-solid fa-calendar-plus text-themeAccent"></i> Publish New Event
 </h2>
 <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="col-span-1 lg:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Event Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Annual Moot Court" />
 </div>
 <div className="col-span-1 lg:col-span-1">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Date</label>
 <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required className="w-full bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none [color-scheme:dark]" />
 </div>
 <div className="col-span-1 lg:col-span-1">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Location</label>
 <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Main Auditorium" />
 </div>
 
 <div className="col-span-1 lg:col-span-4">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Description</label>
 <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Describe the event details..."></textarea>
 </div>
 
 <div className="col-span-1 lg:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Banner Image URL</label>
 <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="https://..." />
 </div>

 <label className="col-span-1 lg:col-span-2 flex items-center justify-between p-4 bg-themeElevated backdrop-blur-3xl border border-themeBorder rounded-xl cursor-pointer h-fit">
 <div>
 <h4 className="text-[13px] font-bold text-themeText">Publish to Public Website</h4>
 <p className="text-[11px] font-medium text-themeTextSec mt-0.5">Make this event visible on the main website</p>
 </div>
 <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isPublic ? 'bg-themeAccent' : 'bg-black/10 '}`}>
 <div className={`w-4 h-4 bg-themePanel rounded-full transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0'}`}></div>
 </div>
 <input type="checkbox" className="hidden" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
 </label>
 
 <div className="col-span-1 lg:col-span-4 flex justify-end">
 <button type="submit" disabled={isSubmitting} className="bg-themeAccent hover:bg-themeAccent/90 text-themeApp px-8 py-3.5 rounded-xl font-bold text-[13px] transition-all shadow-lg shadow-themeAccent/20 disabled:opacity-50">
 {isSubmitting ? 'Publishing...' : 'Publish Event'}
 </button>
 </div>
 </form>
 </div>
 )}

 {/* EVENTS GRID */}
 <div className="flex flex-col gap-4">
 {displayEvents.length === 0 ? (
 <div className="w-full py-12 flex flex-col items-center justify-center text-center">
 <i className="fa-solid fa-calendar-xmark text-4xl text-themeTextSec opacity-50 mb-4"></i>
 <h3 className="text-lg font-bold text-themeText">No Events Available</h3>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {displayEvents.map(event => {
 const isPast = new Date(event.event_date) < new Date(new Date().setHours(0,0,0,0));
 return (
 <div key={event.id} className="bg-themePanel shadow-sm border border-themeBorder dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden flex flex-col group relative">
 {event.image_url && (
 <div className="w-full h-40 overflow-hidden relative">
 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
 <img src={event.image_url} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
 </div>
 )}
 <div className="p-6 flex-1 flex flex-col">
 <div className="flex justify-between items-start mb-3">
 <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${isPast ? 'bg-themeElevated text-themeTextSec' : 'bg-themeAccent/10 text-themeAccent'}`}>
 {isPast ? 'Past Event' : 'Upcoming'}
 </span>
 {canCreate && (
 <HoldButton size="sm" onHold={() => handleDelete(event.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
 )}
 </div>
 <h3 className="text-lg font-bold text-themeText leading-tight mb-2">{event.title}</h3>
 <p className="text-[13px] text-themeTextSec line-clamp-2 mb-4 flex-1">{event.description}</p>
 
 <div className="pt-4 border-t border-themeBorder flex flex-col gap-2">
 <div className="flex items-center gap-2 text-[12px] font-semibold text-themeTextSec">
 <i className="fa-regular fa-calendar w-4 text-center"></i>
 {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
 </div>
 <div className="flex items-center gap-2 text-[12px] font-semibold text-themeTextSec">
 <i className="fa-solid fa-location-dot w-4 text-center"></i>
 {event.location}
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 
 </div>
 );
}

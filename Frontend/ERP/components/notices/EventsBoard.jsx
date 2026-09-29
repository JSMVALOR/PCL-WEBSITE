/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
"use client";

import React, { useState } from "react";

import HoldButton from '../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useERP } from "../../context/ErpContext";
import { theme } from '../../../Shared/theme';

export default function EventsBoard() {
    const { userSession, events, addEvent, deleteEvent, updateEventGallery } = useERP();

    // --- STATE ---
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [location, setLocation] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Gallery State
    const [galleryInput, setGalleryInput] = useState("");
    const [isGalleryUpdating, setIsGalleryUpdating] = useState(false);

    const role = userSession?.role || "student";
    const canCreate = role === "faculty" || role === "admin";

    // --- SAFE THEME MAPPING ---
    const themeStyles = {
        student: { glow: "bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated", iconBox: "text-purple-400", hoverBorder: "hover:border-purple-200", hoverText: "group-hover:text-purple-600", readText: "text-purple-600" },
        faculty: { glow: "bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated", iconBox: "text-blue-400", hoverBorder: "hover:border-blue-200", hoverText: "group-hover:text-blue-600", readText: "text-blue-600" }
    };
    const currentTheme = themeStyles[role === "faculty" ? "faculty" : "student"] || themeStyles.student;

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !eventDate) return;

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
            
            setIsCreateModalOpen(false);
            setTitle("");
            setDescription("");
            setEventDate("");
            setLocation("");
            setImageUrl("");
            setIsPublic(false);

        } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        
        const { success } = await deleteEvent(id);
        if (success) setSelectedEvent(null);
        else window.erpDialog?.alert("Failed to delete event.");
    };

    const handleAddGalleryImage = async () => {
        if (!galleryInput.trim() || !selectedEvent) return;
        setIsGalleryUpdating(true);
        const currentUrls = selectedEvent.image_urls || [];
        const newUrls = [...currentUrls, galleryInput.trim()];
        
        const { success, data } = await updateEventGallery(selectedEvent.id, newUrls);
        if (success && data && data.length > 0) {
            setSelectedEvent(data[0]); // Update local modal state with latest DB record
            setGalleryInput("");
        } else {
            window.erpDialog?.alert("Failed to add image to gallery.");
        }
        setIsGalleryUpdating(false);
    };

    return (
        <div className="w-full flex flex-col gap-6 lg:gap-8 animate-[fadeIn_0.4s_ease-out]">
            {/* 1. HEADER BANNER */}
            <div className="relative w-full overflow-hidden border border-black/[0.04] dark:border-white/[0.08] bg-gradient-to-r from-purple-500/5 via-transparent to-transparent py-8 rounded-3xl shrink-0">
                <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2 md:px-6">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${currentTheme.iconBox}`}>
                            <i className="fa-solid fa-calendar-star"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">College Events</h1>
                            <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Upcoming & Past Campus Activities</p>
                        </div>
                    </div>
                    {canCreate && (
                        <button type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-purple-600 text-white px-6 py-3.5 rounded-xl font-bold text-[13px] tracking-wide hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
                        >
                            <i className="fa-solid fa-calendar-plus"></i> Add Event
                        </button>
                    )}
                </div>
            </div>

            {/* 1.5 ACTION REQUIRED BANNER */}
            {canCreate && events.some(e => new Date(e.event_date) < new Date() && (!e.image_urls || e.image_urls.length === 0)) && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-triangle-exclamation text-rose-500 text-xl"></i>
                        <div>
                            <h3 className="text-rose-500 font-bold text-sm tracking-wide">Action Required: Upload Event Photos</h3>
                            <p className="text-themeTextSec text-xs">You have past events missing photo galleries. Click on a past event below to upload photos.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. EVENTS GRID */}
            {(!events || events.length === 0) ? (
                <div className="w-full py-12 flex flex-col items-center justify-center border-b border-black/5 dark:border-white/10 text-center px-4">
                    <i className="fa-solid fa-calendar-xmark text-4xl text-themeTextSec opacity-50 mb-4"></i>
                    <h3 className={`${theme.text.heading} text-lg text-themeText`}>No upcoming events</h3>
                    <p className={`${theme.text.secondary} text-xs font-semibold mt-1`}>Check back later for exciting college events!</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto snap-x no-scrollbar gap-6 pb-6">
                    {events.map((evt) => {
                        const evtDate = new Date(evt.event_date);
                        const isPast = evtDate < new Date();
                        return (
                        <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`min-w-[320px] max-w-[320px] shrink-0 snap-start bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.01] ${isPast ? 'opacity-60' : ''}`}
                        >
                            {evt.image_url ? (
                                <div className="h-40 w-full overflow-hidden border-b-theme border-themeBorder dark:border-white/5">
                                    <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-20 w-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border-b-theme border-themeBorder dark:border-white/5 flex items-center justify-center text-3xl text-themeTextSec opacity-20">
                                    <i className="fa-solid fa-calendar-day"></i>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[12px] font-medium px-2.5 py-1 rounded-md border-theme bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border-black/5 dark:border-white/10 ${isPast ? 'text-themeTextSec' : 'text-purple-400'}`}>
                                        {isPast ? 'Past Event' : 'Upcoming'}
                                    </span>
                                    {evt.is_public && (
                                        <span className="text-[10px] text-blue-500 bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-black/5 dark:border-white/10 px-2 py-1 rounded-md flex items-center gap-1" title="Public Website">
                                            <i className="fa-solid fa-globe"></i>
                                        </span>
                                    )}
                                </div>

                                <h3 className={`${theme.text.heading} text-lg text-themeText leading-tight mb-2 ${currentTheme.hoverText} transition-colors`}>
                                    {evt.title}
                                </h3>
                                <p className={`${theme.text.secondary} text-sm line-clamp-2 mb-4 leading-relaxed`}>
                                    {evt.description}
                                </p>
                            </div>

                            <div className="px-6 py-4 bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border-t-theme border-themeBorder dark:border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-themeTextSec opacity-80 tracking-normal">
                                    <i className="fa-regular fa-clock"></i> {evtDate.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <span className={`text-[13px] font-medium ${currentTheme.readText} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    Details &rarr;
                                </span>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* 3. READING MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-themeApp w-full h-[100dvh] md:h-auto md:max-h-[90vh] max-w-2xl md:rounded-2xl overflow-hidden border-0 md:border border-black/5 dark:border-white/10 shadow-2xl flex flex-col">

                        <div className={`p-6 text-themeText dark:text-white relative bg-purple-600`}>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <span className="text-[13px] font-medium text-white/70 mb-2 block">
                                        College Event
                                    </span>
                                    <h3 className={`${theme.text.heading} text-2xl tracking-tight mb-1 text-themeText dark:text-white`}>{selectedEvent.title}</h3>
                                </div>
                                <button type="button" onClick={() => setSelectedEvent(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-black/20 hover:bg-black/40 transition-colors shrink-0 text-themeText dark:text-white">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b-theme border-themeBorder dark:border-white/5">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-themeTextSec tracking-normal">Date & Time</p>
                                    <p className={`${theme.text.heading} text-sm text-themeText flex items-center gap-2`}>
                                        <i className="fa-regular fa-calendar text-purple-500"></i>
                                        {new Date(selectedEvent.event_date).toLocaleString("en-GB", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-themeTextSec tracking-normal">Location</p>
                                    <p className={`${theme.text.heading} text-sm text-themeText flex items-center gap-2`}>
                                        <i className="fa-solid fa-location-dot text-rose-500"></i>
                                        {selectedEvent.location || "TBA"}
                                    </p>
                                </div>
                            </div>

                            {selectedEvent.image_url && (
                                <div className="mb-6 border border-themeBorder dark:border-white/5 rounded-xl overflow-hidden">
                                    <img src={selectedEvent.image_url} alt="Event" className="w-full h-auto object-cover max-h-96" />
                                </div>
                            )}

                            <div className={`${theme.text.secondary} prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap`}>
                                {selectedEvent.description}
                            </div>

                            {/* 3.5 GALLERY UPLOADER (For Past Events) */}
                            {new Date(selectedEvent.event_date) < new Date() && (
                                <div className="mt-8 border-t-theme border-themeBorder dark:border-white/5 pt-6">
                                    <h4 className={`${theme.text.heading} text-lg text-themeText mb-4`}>Event Photo Gallery</h4>
                                    
                                    {selectedEvent.image_urls && selectedEvent.image_urls.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {selectedEvent.image_urls.map((url, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-themeBorder dark:border-white/5">
                                                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-themeTextSec text-xs italic mb-4">No photos uploaded for this event yet.</p>
                                    )}

                                    {canCreate && (
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                placeholder="Paste image URL here..."
                                                value={galleryInput}
                                                onChange={(e) => setGalleryInput(e.target.value)}
                                                className={`flex-1 ${theme.layout.input} rounded-xl px-4 py-2 text-sm`}
                                            />
                                            <button type="button"
                                                onClick={handleAddGalleryImage}
                                                disabled={isGalleryUpdating || !galleryInput.trim()}
                                                className="bg-purple-600 text-themeText dark:text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isGalleryUpdating ? 'Adding...' : 'Add Image'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button type="button"
                                    onClick={() => setSelectedEvent(null)}
                                    className={`flex-1 py-4 bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated hover:opacity-80 text-themeText rounded-xl text-[14px] font-medium tracking-normal transition-opacity flex items-center justify-center gap-2 border border-black/5 dark:border-white/10`}
                                >
                                    <i className="fa-solid fa-check-double text-themeAccent"></i> Close Event
                                </button>
                                
                                {(role === 'admin' || userSession?.db_id === selectedEvent.author_id) && (
                                    <HoldButton size="sm" onHold={() => handleDelete(selectedEvent.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                Delete
            </HoldButton>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* 4. FULLSCREEN CREATE EVENT MODAL */}
            {isCreateModalOpen && canCreate && (
                <div className="fixed inset-0 z-[100] w-full h-[100dvh] bg-themeApp flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                    <div className="absolute top-0 right-0 w-full max-w-[600px] h-[600px] bg-themeAccent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-60"></div>
                    
                    {/* Header */}
                    <div className="w-full flex-shrink-0 px-6 py-6 lg:px-12 lg:py-8 flex justify-between items-center relative z-10 border-b border-themeBorder dark:border-white/5 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-themeAccent/10 flex items-center justify-center text-themeAccent text-xl border border-themeAccent/20">
                                <i className="fa-solid fa-calendar-plus"></i>
                            </div>
                            <div>
                                <h3 className={`${theme.text.heading} text-2xl tracking-tight text-themeText`}>Add College Event</h3>
                                <p className={`${theme.text.secondary} text-sm mt-0.5`}>Publish a new event, seminar, or extracurricular activity.</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeText transition-colors shrink-0">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    
                    {/* Form Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative z-10 no-scrollbar">
                        <div className="max-w-4xl mx-auto w-full">
                            <form onSubmit={handleCreateEvent} className="flex flex-col gap-8">
                                
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Event Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Annual Tech Symposium"
                                            className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-base font-bold text-themeText focus:border-themeAccent outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={eventDate}
                                                onChange={(e) => setEventDate(e.target.value)}
                                                className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-base font-bold text-themeText focus:border-themeAccent outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Location</label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="e.g. Main Auditorium"
                                                className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-base font-bold text-themeText focus:border-themeAccent outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Detailed Description</label>
                                        <textarea
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter comprehensive event details..."
                                            rows={6}
                                            className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-base font-bold text-themeText focus:border-themeAccent outline-none transition-colors resize-none"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Banner Image URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://example.com/banner.jpg"
                                            className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 text-base font-bold text-themeText focus:border-themeAccent outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {canCreate && (
                                    <label className="flex items-center justify-between p-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                                        <div>
                                            <span className="text-base font-bold text-themeText block">Promote on Public Website</span>
                                            <span className="text-sm font-medium text-themeTextSec">Make this event visible to external visitors on the public site.</span>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isPublic ? 'bg-themeAccent' : 'bg-black/10 dark:bg-white/10'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={isPublic} 
                                            onChange={(e) => setIsPublic(e.target.checked)} 
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                <div className="flex justify-end gap-4 mt-4 pb-12">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="btn-erp-secondary px-8 py-4 text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-erp px-10 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Adding Event...</>
                                        ) : (
                                            <><i className="fa-solid fa-calendar-check mr-2"></i> Confirm & Add Event</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

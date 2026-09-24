/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminAcademicCalendar({ isHubView }) {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 
 const [formData, setFormData] = useState({
 id: null,
 title: '',
 date: '',
 description: '',
 event_type: 'Academic', // Academic, Holiday, Exam, Event
 is_active: true,
 image_url: ''
 });
 
 
 const [uploading, setUploading] = useState(false);

 useEffect(() => {
 fetchEvents();
 }, []);

 const [pdfUrl, setPdfUrl] = useState('');
 const [savingPdf, setSavingPdf] = useState(false);

 const fetchEvents = async () => {
 try {
 setLoading(true);
 const { data, error } = await supabase
 .from('academic_events')
 .select('*')
 .order('start_date', { ascending: true });
 
 if (error) throw error;
      const { data: settingData } = await supabase.from('system_settings').select('value').eq('key', 'academic_calendar_pdf').single();
      if (settingData?.value?.url) {
          setPdfUrl(settingData.value.url);
      }
      
 setEvents(data || []);
 } catch (error) {
 console.error("Error fetching academic events:", error);
 // Ignore if table doesn't exist yet
 } finally {
 setLoading(false);
 }
 };

 const handleInputChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));
 };

 

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 setUploading(true);
 let finalImageUrl = formData.image_url;

 // Convert Google Drive link to direct image link if it's a drive link
 if (finalImageUrl && finalImageUrl.includes('drive.google.com/file/d/')) {
 const match = finalImageUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
 if (match && match[1]) {
 finalImageUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
 }
 }

 if (formData.id) {
 // Update
 const { error } = await supabase
 .from('academic_events')
 .update({
 title: formData.title,
 date: formData.start_date,
 description: formData.description,
 event_type: formData.event_type,
 is_active: formData.is_active,
 image_url: finalImageUrl
 })
 .eq('id', formData.id);
 if (error) throw error;
      const { data: settingData } = await supabase.from('system_settings').select('value').eq('key', 'academic_calendar_pdf').single();
      if (settingData?.value?.url) {
          setPdfUrl(settingData.value.url);
      }
      
 alert("Event updated successfully!");
 } else {
 // Insert
 const { error } = await supabase
 .from('academic_events')
 .insert([{
 title: formData.title,
 date: formData.start_date,
 description: formData.description,
 event_type: formData.event_type,
 is_active: formData.is_active,
 image_url: finalImageUrl
 }]);
 if (error) throw error;
      const { data: settingData } = await supabase.from('system_settings').select('value').eq('key', 'academic_calendar_pdf').single();
      if (settingData?.value?.url) {
          setPdfUrl(settingData.value.url);
      }
      
 alert("Event added successfully!");
 }
 
 setFormData({ id: null, title: '', start_date: '', description: '', event_type: 'Academic', is_active: true, image_url: '' });
 
 setIsEditing(false);
 fetchEvents();
 } catch (error) {
 console.error("Error saving event:", error);
 alert("Error saving event. Make sure the Supabase table and storage bucket exist.");
 } finally {
 setUploading(false);
 }
 };

 const handleEdit = (event) => {
 setFormData({
 id: event.id,
 title: event.title,
 date: event.start_date,
 description: event.description,
 event_type: event.event_type,
 is_active: event.is_active,
 image_url: event.image_url || ''
 });
 
 setIsEditing(true);
 };

 const handleDelete = async (id) => {
 
 try {
 const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
 if (error) throw error;
      const { data: settingData } = await supabase.from('system_settings').select('value').eq('key', 'academic_calendar_pdf').single();
      if (settingData?.value?.url) {
          setPdfUrl(settingData.value.url);
      }
      
 alert("Event deleted.");
 fetchEvents();
 } catch (error) {
 console.error("Error deleting event:", error);
 alert("Error deleting event.");
 }
 };

 const getEventTypeColor = (type) => {
 switch(type) {
 case 'Holiday': return 'bg-red-500/20 text-red-500 border-red-500/30';
 case 'Exam': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
 case 'Event': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
 default: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
 }
 };

 
 const handleSavePdf = async (e) => {
    e.preventDefault();
    setSavingPdf(true);
    try {
        const { error } = await supabase.from('system_settings').upsert({
            key: 'academic_calendar_pdf',
            value: { url: pdfUrl },
            description: 'URL for the downloadable Academic Calendar PDF'
        });
        if (error) throw error;
        window.erpDialog?.alert("PDF URL updated successfully!");
    } catch (err) {
        console.error(err);
        window.erpDialog?.alert("Failed to update PDF URL.");
    } finally {
        setSavingPdf(false);
    }
 };
 
 return (
 <div className={`flex flex-col gap-6 ${isHubView ? '' : 'p-6'}`}>
 {!isHubView && (
 <div>
 <h2 className={`font-bold tracking-tight text-2xl text-themeText dark:text-white`}>Academic Calendar Builder</h2>
 <p className="text-white/70 text-sm mt-1">Manage events, holidays, and important dates.</p>
 </div>
 )}
 
 
                {/* PDF Form Column */}
                <div className="lg:col-span-3 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] mb-6 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-themeTextSec uppercase tracking-wider mb-2">Global Calendar PDF (URL)</label>
                        <input 
                            type="url" 
                            value={pdfUrl}
                            onChange={(e) => setPdfUrl(e.target.value)}
                            className="w-full bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent outline-none"
                            placeholder="https://example.com/calendar.pdf"
                        />
                    </div>
                    <button onClick={handleSavePdf} disabled={savingPdf} className="px-6 py-3 bg-themeAccent hover:bg-themeAccent/90 text-white font-black text-sm rounded-xl transition-colors shadow-lg shadow-themeAccent/20">
                        {savingPdf ? 'Saving...' : 'Save PDF'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 
 {/* Form Column */}
 <div className="lg:col-span-1 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] h-fit">
 <h3 className={`font-bold tracking-tight text-xl text-themeText dark:text-white mb-4`}>
 {isEditing ? 'Edit Event' : 'Add New Event'}
 </h3>
 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
 <div>
 <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Event Title</label>
 <input 
 type="text" 
 name="title"
 required
 value={formData.title}
 onChange={handleInputChange}
 className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent transition-colors"
 placeholder="e.g. Fall Semester Begins"
 />
 </div>
 
 <div>
 <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Date</label>
 <input min="2026-09-14" 
 type="date" 
 name="start_date"
 required
 value={formData.start_date}
 onChange={handleInputChange}
 className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent transition-colors"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Event Type</label>
 <select 
 name="event_type"
 value={formData.event_type}
 onChange={handleInputChange}
 className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent transition-colors"
 >
 <option value="Academic">Academic (Term start, Registration, etc)</option>
 <option value="Holiday">Holiday (College Closed)</option>
 <option value="Exam">Examination</option>
 <option value="Event">Special Event (Convocation, etc)</option>
 </select>
 </div>
 
 <div>
 <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Description</label>
 <textarea 
 name="description"
 required
 value={formData.description}
 onChange={handleInputChange}
 className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-2.5 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent transition-colors min-h-[100px]"
 placeholder="Details about the event..."
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Google Drive Link to Event Image (Optional)</label>
 <input 
 type="url" 
 placeholder="https://drive.google.com/file/d/.../view"
 value={formData.image_url}
 onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
 className="w-full animate-fade-in bg-themeBg border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-themeText dark:text-white focus:outline-none focus:border-black/[0.04] dark:border-white/[0.08]Accent focus:ring-1 focus:ring-themeAccent transition text-sm"
 />
 <p className="text-[10px] text-themeTextSec dark:text-white/50 mt-1">Make sure the link is set to "Anyone with the link can view"</p>
 
 {formData.image_url && (
 <div className="mt-3 text-xs text-white/60 flex items-center gap-2 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.08]">
 <img 
 src={formData.image_url.includes('drive.google.com/file/d/') ? `https://drive.google.com/uc?export=view&id=${formData.image_url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]}` : formData.image_url} 
 alt="Event Preview" 
 className="w-12 h-12 object-cover rounded-md border border-black/[0.04] dark:border-white/[0.08] bg-themeBg"
 onError={(e) => { e.target.style.display = 'none'; }}
 />
 <span>Image Preview (will be hidden if invalid)</span>
 </div>
 )}
 </div>

 <div className="flex items-center gap-2 mt-2">
 <input 
 type="checkbox" 
 id="is_active" 
 name="is_active"
 checked={formData.is_active}
 onChange={handleInputChange}
 className="w-4 h-4 rounded border-black/[0.04] dark:border-white/[0.08] bg-themeBg text-themeAccent focus:ring-themeAccent"
 />
 <label htmlFor="is_active" className="text-sm text-white/80 cursor-pointer">Visible to Public</label>
 </div>

 <div className="flex gap-3 mt-4">
 <button 
 type="submit" 
 disabled={uploading}
 className="btn-erp"
 >
 {uploading ? 'Saving...' : (isEditing ? 'Update Event' : 'Add Event')}
 </button>
 {isEditing && (
 <button 
 type="button" 
 onClick={() => {
 setIsEditing(false);
 setFormData({ id: null, title: '', start_date: '', description: '', event_type: 'Academic', is_active: true, image_url: '' });
 
 }}
 className="px-4 py-3 bg-themeBg border border-black/[0.04] dark:border-white/[0.08] text-themeText dark:text-white hover:bg-themeBorder/50 rounded-lg transition-colors"
 >
 Cancel
 </button>
 )}
 </div>
 </form>
 </div>

 {/* List Column */}
 <div className="lg:col-span-2 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.08]">
 <h3 className={`font-bold tracking-tight text-xl text-themeText dark:text-white mb-4`}>All Events</h3>
 
 {loading ? (
 <div className="flex justify-center items-center py-12">
 <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-3xl"></i>
 </div>
 ) : events.length === 0 ? (
 <div className="text-center py-12 text-themeTextSec dark:text-white/50">
 <i className="fa-regular fa-calendar-xmark text-4xl mb-3"></i>
 <p>No academic events found.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-3">
 {events.map((event) => (
 <div key={event.id} className={`flex items-start justify-between p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08] bg-themeBg transition hover:border-black/[0.04] dark:border-white/[0.08]Accent/50 ${!event.is_active ? 'opacity-60' : ''}`}>
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-3">
 <span className="text-themeText dark:text-white font-bold text-lg">{event.title}</span>
 <span className={`text-[10px] tracking-normal font-bold px-2 py-0.5 rounded-full border ${getEventTypeColor(event.event_type)}`}>
 {event.event_type}
 </span>
 {!event.is_active && (
 <span className="text-[10px] tracking-normal font-bold px-2 py-0.5 rounded-full bg-themeBorder text-white/70">Hidden</span>
 )}
 </div>
 <div className="text-themeAccent font-medium text-sm">
 <i className="fa-regular fa-calendar mr-2"></i>
 {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
 </div>
 <p className="text-white/70 text-sm mt-1">{event.description}</p>
 </div>
 <div className="flex gap-4 items-center">
 {event.image_url && (
 <div className="hidden sm:block">
 <img src={event.image_url} alt={event.title} className="w-16 h-16 object-cover rounded-lg border border-black/[0.04] dark:border-white/[0.08]" />
 </div>
 )}
 <div className="flex flex-col gap-2">
 <button type="button" 
 onClick={() => handleEdit(event)}
 className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
 >
 <i className="fa-solid fa-pen text-xs"></i>
 </button>
 <HoldButton size="sm" onHold={() => handleDelete(event.id)} radius={8} backgroundColor="rgba(239,68,68,0.1)" fillColor="#ef4444" textColor="#ef4444" doneLabel="" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 
 </div>
 </div>
 );
}

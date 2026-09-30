/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import TargetAudienceSelector from '../../shared/TargetAudienceSelector';

export default function FacultyBroadcastForm({ onNoticePublished, onCancel }) {
 const { userSession } = useERP();
 const [isPublishing, setIsPublishing] = useState(false);
 
 // Broadcast Form State
 const [title, setTitle] = useState("");
 const [content, setContent] = useState("");
 const [category, setCategory] = useState("Academic");
 const [priority, setPriority] = useState("normal");
 const [targetAudience, setTargetAudience] = useState([]);
 
 const handlePublish = async (e) => {
 e.preventDefault();
 if (targetAudience.length === 0) {
 window.erpDialog?.alert("Please select at least one target audience (batch or individual).");
 return;
 }

 setIsPublishing(true);
 try {

 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 const { error } = await supabase.from('notices').insert([{
 notice_id: noticeId,
 title,
 content,
 category,
 priority,
 target_audience: targetAudience,
 author_id: userSession?.db_id,
 author_name: userSession?.name
 }]);

 if (error) throw error;
 
 setTitle("");
 setContent("");
 setPriority("normal");
 setTargetAudience([]);
 
 if (onNoticePublished) onNoticePublished();
 } catch (err) {
 console.error("Failed to publish notice:", err);
 window.erpDialog?.alert(`Failed to publish notice: ${err?.message || JSON.stringify(err)}`);
 } finally {
 setIsPublishing(false);
 }
 };

 return (
 <div className="animate-fade-in relative flex flex-col h-full">
 <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-start bg-themePanel/50 /10 backdrop-blur-xl relative z-10 shrink-0">
 <div>
 <h2 className="text-xl lg:text-2xl font-black tracking-tight text-themeText mb-1">{userSession?.role === "admin" ? "Administrative Broadcast" : "Faculty Broadcast"}</h2>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec ">Send official notices directly to assigned batches or students.</p>
 </div>
 <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-xl bg-themeElevated border border-themeBorder text-themeTextSec hover:text-themeText hover:bg-black/10 transition-colors shrink-0">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>

 <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
 <form id="faculty-broadcast-form" onSubmit={handlePublish} className="flex flex-col gap-6 max-w-3xl mx-auto">
 
 <div>
 <TargetAudienceSelector value={targetAudience} onChange={setTargetAudience} role={userSession?.role || "faculty"} />
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2">Notice Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-100 /20 border border-themeBorder rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-blue-500 outline-none transition" placeholder="e.g. Rescheduling Tomorrow's Lecture" />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2">Category</label>
 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 /20 border border-themeBorder rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-blue-500 outline-none appearance-none transition">
 <option value="Academic">Academic</option>
 <option value="Assignment">Assignment</option>
 <option value="Examination">Examination</option>
 <option value="General">General</option>
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2">Priority</label>
 <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-gray-100 /20 border border-themeBorder rounded-2xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-blue-500 outline-none appearance-none transition">
 <option value="normal">Normal</option>
 <option value="high">High</option>
 <option value="urgent">Urgent</option>
 </select>
 </div>
 </div>
 
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec mb-2">Content</label>
 <textarea value={content} onChange={e => setContent(e.target.value)} required rows="6" className="w-full bg-gray-100 /20 border border-themeBorder rounded-2xl px-4 py-3.5 text-sm font-medium text-themeText focus:border-blue-500 outline-none resize-none transition shadow-inner" placeholder="Draft your message here..."></textarea>
 </div>
 
 

 </form>
 </div>

 <div className="p-6 lg:p-8 border-t border-themeBorder bg-themePanel/50 /10 backdrop-blur-xl flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
 <button type="button" onClick={onCancel} className="px-6 py-3.5 rounded-xl text-sm font-bold text-themeTextSec hover:bg-themeElevated hover:text-themeText dark:hover:text-themeApp transition">
 Cancel
 </button>
 <button type="submit" form="faculty-broadcast-form" disabled={isPublishing} className="px-8 py-3.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-themeApp shadow-xl shadow-blue-500/20 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
 {isPublishing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
 {isPublishing ? 'Broadcasting...' : 'Broadcast Notice'}
 </button>
 </div>
 </div>
 );
}

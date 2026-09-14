/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
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
 const [requiresAck, setRequiresAck] = useState(false);

 const handlePublish = async (e) => {
 e.preventDefault();
 if (targetAudience.length === 0) {
 window.erpDialog?.alert("Please select at least one target audience (batch or individual).");
 return;
 }

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
 setTargetAudience([]);
 
 if (onNoticePublished) onNoticePublished();
 } catch (err) {
 console.error("Failed to publish notice:", err);
 window.erpDialog?.alert("Failed to publish notice. Check console.");
 } finally {
 setIsPublishing(false);
 }
 };

 return (
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-2xl overflow-hidden animate-fade-in relative flex flex-col h-full">
 <div className="p-4 md:p-6 lg:p-8 border-b border-black/10 dark:border-white/20 flex justify-between items-center bg-transparent/20">
 <div>
 <h2 className="text-2xl font-black text-themeText tracking-tight">{userSession?.role === "admin" ? "Administrative Broadcast" : "Faculty Broadcast"}</h2>
 <p className="text-xs font-bold text-themeTextSec mt-1">Send official notices directly to your assigned batches or specific students.</p>
 </div>
 <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 text-themeTextSec hover:text-rose-500 hover:border-rose-500/30 transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>

 <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
 <form id="faculty-broadcast-form" onSubmit={handlePublish} className="flex flex-col gap-6 max-w-3xl mx-auto">
 
 <div>
 <TargetAudienceSelector value={targetAudience} onChange={setTargetAudience} role={userSession?.role || "faculty"} />
 </div>

 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Notice Title</label>
 <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none" placeholder="e.g. Rescheduling Tomorrow's Lecture" />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Category</label>
 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="Academic">Academic</option>
 <option value="Assignment">Assignment</option>
 <option value="Examination">Examination</option>
 <option value="General">General</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Priority</label>
 <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none appearance-none">
 <option value="normal">Normal</option>
 <option value="high">High</option>
 <option value="urgent">Urgent</option>
 </select>
 </div>
 </div>
 
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Content</label>
 <textarea value={content} onChange={e => setContent(e.target.value)} required rows="6" className="w-full bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent outline-none resize-none" placeholder="Draft your message here..."></textarea>
 </div>
 
 <label className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:border-themeAccent/50 transition-colors">
 <input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="accent-themeAccent w-4 h-4" />
 <div>
 <span className="text-sm font-bold text-themeText block">Require Digital Acknowledgement</span>
 <span className="text-[10px] font-bold text-themeTextSec">Force students to sign that they have read this notice.</span>
 </div>
 </label>

 </form>
 </div>

 <div className="p-6 border-t border-black/10 dark:border-white/20 bg-transparent/50 flex justify-end gap-4 shrink-0">
 <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-themeText transition hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
 Cancel
 </button>
 <button type="submit" form="faculty-broadcast-form" disabled={isPublishing} className="px-8 py-3 bg-themeAccent hover:opacity-90 text-themeApp rounded-xl text-xs font-black uppercase tracking-widest transition-opacity flex items-center gap-2">
 {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
 {isPublishing ? 'Broadcasting...' : 'Broadcast Notice'}
 </button>
 </div>
 </div>
 );
}

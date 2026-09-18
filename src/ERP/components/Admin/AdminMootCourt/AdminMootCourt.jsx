/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminMootCourt({ isEmbedded = false,  isHubView = false }) {
 const [activeTab, setActiveTab] = useState("moots"); // "moots" | "bids"
 const [moots, setMoots] = useState([]);
 const [bids, setBids] = useState([]);
 
 // Create Moot State
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [mootForm, setMootForm] = useState({ moot_name: "",
 level: "National",
 event_date: "",
 venue: "",
 description: ""
 });

 useEffect(() => {
 fetchMoots();
 fetchBids();
 }, []);

 const fetchMoots = async () => {
 try {
 const { data, error } = await supabase.from('moot_competitions').select('*').order('event_date', { ascending: false });
 if (!error && data) {
 setMoots(data);
 }
 } catch (error) {
 console.error("Error fetching moots:", error);
 }
 };

 const fetchBids = async () => {
 try {
 const { data, error } = await supabase
 .from('moot_bids')
 .select(`
 id, moot_id, student_id, research_memo, status, created_at,
 profiles!moot_bids_student_id_fkey(full_name, erp_id),
 moot_competitions!moot_bids_moot_id_fkey(moot_name)
 `)
 .order('created_at', { ascending: false });
 if (!error && data) {
 setBids(data);
 }
 } catch (error) {
 console.error("Error fetching bids:", error);
 }
 };

 const handleCreateMoot = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const { error } = await supabase.from('moot_competitions').insert({ ...mootForm,
 status: "Upcoming"
 });
 if (error) throw error;
 window.erpDialog.alert("Moot Created successfully");
 setShowCreateModal(false);
 setMootForm({ moot_name: "", level: "National", event_date: "", venue: "", description: "" });
 fetchMoots();
 } catch (err) {
 console.error("Error creating moot", err);
 window.erpDialog.alert("Failed to create moot.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleSelectBid = async (bidId) => {
 try {
 const { error } = await supabase.from('moot_bids').update({ status: 'Selected' }).eq('id', bidId);
 if (error) throw error;
 window.erpDialog.alert("Student Selected!");
 fetchBids();
 } catch (err) {
 console.error("Error selecting bid", err);
 window.erpDialog.alert("Failed to select student.");
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-gavel" title="Moot Court Society Admin" subtitle="Create competitions and blindly evaluate research memos." rightContent={
<>
<button type="button"
 onClick={() => setShowCreateModal(true)}
 className="w-full lg:w-auto px-6 py-3 bg-themePanel/85 backdrop-blur-2xl hover:bg-white/90 text-themeAccent rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center justify-center gap-2 border border-white/50"
 >
 <i className="fa-solid fa-plus"></i> Create Moot
 </button>
 </>
} />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themePanel/85 backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`}>
 <button type="button" onClick={() => setActiveTab('moots')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'moots' ? 'bg-themeAccent text-gray-900 dark:text-white border border-themeAccent scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-themePanel/85 backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-list"></i> Competitions
 </button>
 <button type="button" onClick={() => setActiveTab('bids')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'bids' ? 'bg-emerald-500 text-gray-900 dark:text-white border border-emerald-400 scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-themePanel/85 backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-user-ninja"></i> Blind Evaluation Bids
 </button>
 </div>

 {activeTab === 'moots' && (
 <div className="flex flex-col gap-4">
 {moots.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-themePanel">
 <i className="fa-solid fa-gavel text-4xl mb-4 opacity-50"></i>
 <p>No active moot competitions.</p>
 </div>
 ) : (
 moots.map(moot => (
 <div key={moot.id} className="bg-themePanel/85 backdrop-blur-2xl p-5 rounded-themePanel border border-gray-200 dark:border-white/5 flex justify-between items-center">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText">{moot.moot_name}</h3>
 <p className="text-xs text-themeTextSec mt-1">{moot.level} • {moot.venue} • {moot.event_date}</p>
 </div>
 <span className="px-3 py-1 bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-md text-[10px] font-black text-themeAccent uppercase">
 {moot.status}
 </span>
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'bids' && (
 <div className="flex flex-col gap-5">
 {bids.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-themePanel">
 <i className="fa-solid fa-file-contract text-4xl mb-4 opacity-50"></i>
 <p>No bids received yet.</p>
 </div>
 ) : (
 bids.map(bid => {
 const mootName = bid.moot_competitions?.moot_name || "Unknown Moot";
 const isSelected = bid.status === 'SELECTED';
 return (
 <div key={bid.id} className={`bg-themePanel/85 backdrop-blur-2xl p-6 rounded-themePanel border-theme ${isSelected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-200 dark:border-white/5'}`}>
 <div className="flex justify-between items-start mb-4">
 <div>
 <span className="text-[13px] font-medium text-themeAccent bg-themeElevated/90 backdrop-blur-2xl px-2 py-1 rounded-md border border-black/5 dark:border-white/10">
 {mootName}
 </span>
 <h3 className="text-base font-black text-themeText mt-3 mb-1">
 {isSelected ? bid.profiles?.full_name : "Anonymous Candidate"}
 </h3>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">
 {isSelected ? bid.profiles?.erp_id : "ID hidden during blind evaluation"}
 </p>
 </div>
 {isSelected && (
 <span className="text-[13px] font-medium text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-lg border-theme border-emerald-500/30">
 <i className="fa-solid fa-check-circle mr-1"></i> Selected
 </span>
 )}
 </div>
 <div className="bg-themeApp p-4 rounded-lg border border-gray-200 dark:border-white/5 mb-4">
 <p className="text-[14px] font-medium text-themeTextSec tracking-normal mb-2"><i className="fa-solid fa-book-open"></i> Research Memo</p>
 <p className="text-sm text-themeText whitespace-pre-wrap">{bid.research_memo}</p>
 </div>
 {!isSelected && (
 <button type="button" onClick={() => handleSelectBid(bid.id)} className="w-full py-3 bg-themeElevated/90 backdrop-blur-2xl hover:bg-emerald-500/20 text-emerald-400 border border-black/5 dark:border-white/10 hover:border-emerald-500/50 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
 <i className="fa-solid fa-check"></i> Select for Team
 </button>
 )}
 </div>
 );
 })
 )}
 </div>
 )}

 {/* CREATE MOOT MODAL */}
 {showCreateModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-themeApp w-full max-w-lg rounded-themePanel overflow-hidden border border-gray-200 dark:border-white/5 flex flex-col max-h-[90vh]">
 <div className="bg-themePanel/85 backdrop-blur-2xl p-6 border-b-theme border-gray-200 dark:border-white/5 flex justify-between items-center">
 <h3 className="text-xl font-semibold tracking-tight text-themeText">Create Moot Competition</h3>
 <button type="button" onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-themeTextSec hover:text-themeText flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
 </div>
 <form onSubmit={handleCreateMoot} className="p-6 flex flex-col gap-4 overflow-y-auto">
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Moot Name</label>
 <input type="text" value={mootForm.moot_name} onChange={e => setMootForm({ ...mootForm, moot_name: e.target.value})} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none focus:border-themeAccent" required />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Level</label>
 <select value={mootForm.level} onChange={e => setMootForm({ ...mootForm, level: e.target.value})} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none">
 <option value="National">National</option>
 <option value="International">International</option>
 <option value="Internal">Internal</option>
 </select>
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Event Date</label>
 <input min="2026-09-14" type="date" value={mootForm.event_date} onChange={e => setMootForm({ ...mootForm, event_date: e.target.value})} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none" required />
 </div>
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Venue</label>
 <input type="text" value={mootForm.venue} onChange={e => setMootForm({ ...mootForm, venue: e.target.value})} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none" required />
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Description</label>
 <textarea rows="3" value={mootForm.description} onChange={e => setMootForm({ ...mootForm, description: e.target.value})} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none resize-none" required></textarea>
 </div>
 <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-lg text-[13px] font-medium transition active:scale-[0.98]">
 {isSubmitting ? "Saving..." : "Create Competition"}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
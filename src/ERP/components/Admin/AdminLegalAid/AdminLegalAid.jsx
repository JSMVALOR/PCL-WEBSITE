/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminLegalAid({ isEmbedded = false,  isHubView = false }) {
 const [diaries, setDiaries] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchDiaries();
 }, []);

 const fetchDiaries = async () => {
 try {
 // Also join with users table to get student name if possible. 
 // In a simple setup, we just select all from cle_diaries.
 const { data, error } = await supabase
 .from('cle_diaries')
 .select('*, student:users(name, roll_number)')
 .order('created_at', { ascending: false });
 
 if (error) {
 if (error.code === '42P01') {
 setDiaries([]);
 } else {
 throw error;
 }
 } else {
 setDiaries(data || []);
 }
 } catch (err) {
 console.error("Failed to load CLE diaries", err);
 } finally {
 setIsLoading(false);
 }
 };

 const handleStatusUpdate = async (id, status) => {
 try {
 const { error } = await supabase
 .from('cle_diaries')
 .update({ status })
 .eq('id', id);
 
 if (error) throw error;
 fetchDiaries();
 } catch (err) {
 console.error("Failed to update status", err);
 window.erpDialog.alert("Failed to update status");
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 {/* Header */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-hand-holding-hand" title="Legal Aid Clinic (CLE)" subtitle="Review and verify student clinic diaries." />
 )}

 <div className="bg-themePanel/85 backdrop-blur-2xl rounded-themePanel border border-themeBorder dark:border-white/5 p-6">
 <h2 className="text-xl font-bold text-themeText mb-4">Pending CLE Diaries</h2>
 
 {isLoading ? (
 <div className="text-themeTextSec py-8 text-center">Loading...</div>
 ) : diaries.length === 0 ? (
 <div className="text-center py-12 border-2 border-dashed border-themeBorder dark:border-white/5 rounded-themePanel">
 <i className="fa-solid fa-check-double text-4xl text-neutral-600 mb-4"></i>
 <p className="text-themeTextSec font-bold">No pending CLE Diaries to review.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-4">
 {diaries.map(d => (
 <div key={d.id} className="bg-themeElevated/90 backdrop-blur-2xl p-5 rounded-themePanel border border-themeBorder dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <span className={`text-[13px] font-medium px-2 py-1 rounded ${d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-theme border-emerald-500/20' : d.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-theme border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-theme border-amber-500/20'}`}>
 {d.status}
 </span>
 <span className="text-themeText font-bold text-sm">Week {d.week_number}</span>
 <span className="text-themeTextSec text-xs ml-auto">
 {d.student ? `${d.student.name} (${d.student.roll_number || 'N/A'})` : 'Student ID: ' + d.student_id}
 </span>
 </div>
 <h3 className="font-bold text-lg text-themeText mb-1">{d.case_title}</h3>
 <p className="text-xs text-themeTextSec mb-2"><i className="fa-solid fa-gavel mr-1"></i> {d.court_name}</p>
 <div className="bg-themePanel/85 backdrop-blur-2xl p-3 rounded border border-black/5 dark:border-white/10">
 <p className="text-[13px] font-medium text-themeTextSec opacity-70 mb-1">Learning Outcome</p>
 <p className="text-xs text-themeText italic leading-relaxed">"{d.learning_outcome}"</p>
 </div>
 </div>
 <div className="flex flex-row md:flex-col gap-2 shrink-0">
 {d.status === 'pending' && (
 <>
 <SlideCommit
                label="Slide to Approve"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={() => handleStatusUpdate(d.id, 'approved')}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 <button type="button" onClick={() => handleStatusUpdate(d.id, 'rejected')} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-themeText dark:text-white font-bold text-xs rounded transition-colors flex-1 text-center">
 <i className="fa-solid fa-xmark mr-1"></i> Reject
 </button>
 </>
 )}
 {d.status !== 'pending' && (
 <button type="button" onClick={() => handleStatusUpdate(d.id, 'pending')} className="px-4 py-2 bg-themePanel/85 backdrop-blur-2xl border border-themeBorder dark:border-white/5 hover:bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec font-bold text-xs rounded transition-colors w-full text-center">
 Reset Status
 </button>
 )}
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
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function ElectiveBidding() {
 const { userSession } = useERP();
 const [electives, setElectives] = useState([]);
 const [assignments, setAssignments] = useState([]);
 const [selectedBids, setSelectedBids] = useState({}); // { subject_id: faculty_id }
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 const fetchElectives = async () => {
 try {
 // Fetch subjects that are electives
 const { data: subData, error: subErr } = await supabase
 .from("subjects")
 .select("*")
 .eq("is_elective", true);
 if (subErr) throw subErr;
 setElectives(subData || []);

 // Fetch faculty assignments for these subjects
 const { data: assignData, error: assignErr } = await supabase
 .from("faculty_assignments")
 .select("*");
 if (assignErr) throw assignErr;
 
 // Filter to only assignments for the electives
 const electiveIds = (subData || []).map(s => s.id || s.code);
 const filteredAssignments = (assignData || []).filter(a => electiveIds.includes(a.subject_id || a.subject_name));
 setAssignments(filteredAssignments);
 } catch (err) {
 console.error("Failed to load electives:", err);
 }
 };
 fetchElectives();
 }, []);

 const handleBidChange = (subjectId, facultyId) => {
 setSelectedBids(prev => ({
 ...prev,
 [subjectId]: facultyId
 }));
 };

 const submitBids = async () => {
 if (!userSession?.db_id) return;
 setIsSubmitting(true);
 try {
 const bidsToInsert = Object.entries(selectedBids).map(([subjectId, facultyId]) => ({
 student_id: userSession.db_id,
 subject_id: subjectId,
 faculty_id: facultyId
 }));

 if (bidsToInsert.length === 0) {
 window.erpDialog.alert("Please select at least one elective to bid.");
 return;
 }

 const { error } = await supabase.from("elective_bids").insert(bidsToInsert);
 if (error) throw error;
 window.erpDialog.alert("Bids submitted successfully!");
 } catch (err) {
 console.error(err);
 window.erpDialog.alert("Error submitting bids.");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in">
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-6 border border-black/10 dark:border-white/20 flex flex-col gap-2">
 <h1 className={`${theme.text.heading} text-2xl tracking-tight text-themeText mb-1`}>Elective Bidding</h1>
 <p className={`${theme.text.secondary} text-sm font-medium`}>Bid for your preferred electives and faculty for the upcoming semester.</p>
 </div>

 {electives.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded">No electives available for bidding.</div>
 ) : (
 <div className="flex flex-col gap-6">
 {electives.map(subject => {
 const subjectAssignments = assignments.filter(a => (a.subject_id === subject.id || a.subject_name === subject.code || a.subject_id === subject.code));
 
 return (
 <div key={subject.id || subject.code} className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 p-6 rounded-[2rem] border border-black/10 dark:border-white/20 flex flex-col gap-4">
 <div className="flex justify-between items-center border-b-theme border-black/10 dark:border-white/20 pb-4">
 <div>
 <h3 className="text-xl font-bold text-themeText">{subject.name}</h3>
 <span className="text-xs font-bold text-themeAccent uppercase tracking-widest">{subject.code} • {subject.credits} Credits</span>
 </div>
 {subject.max_seats && (
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-4 py-2 rounded border border-black/5 dark:border-white/10 text-sm font-bold text-themeText">
 Max Seats: {subject.max_seats}
 </div>
 )}
 </div>
 
 <div>
 <p className="text-sm font-bold text-themeTextSec mb-3">Select Preferred Faculty:</p>
 {subjectAssignments.length === 0 ? (
 <p className="text-sm text-rose-400">No faculty assigned to this elective yet.</p>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
 {subjectAssignments.map(assign => {
 const isSelected = selectedBids[subject.id || subject.code] === assign.faculty_id;
 return (
 <div 
 key={assign.id} 
 onClick={() => handleBidChange(subject.id || subject.code, assign.faculty_id)}
 className={`p-4 rounded-[2rem] border-2 cursor-pointer transition ${isSelected ? 'border-themeAccent bg-themeAccent/10' : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:border-themeAccent/50'}`}
 >
 <p className="font-bold text-themeText">{assign.faculty_name || 'Faculty ID: ' + assign.faculty_id}</p>
 <p className="text-xs text-themeTextSec mt-1">Section: {assign.section_name}</p>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
 })}

 <div className="flex justify-end mt-4">
 <button 
 onClick={submitBids} 
 disabled={isSubmitting}
 className="btn-erp"
 >
 {isSubmitting ? "Submitting..." : "Submit Bids"}
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

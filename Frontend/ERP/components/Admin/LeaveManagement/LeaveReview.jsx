/* © 2026 JSM VALOR. All Rights Reserved. */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import React, { useState } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveReview({ request, onClose, onAssignReplacement }) {
 const [isProcessing, setIsProcessing] = useState(false);

 // Use actual classes affected or show empty state
 const affectedClasses = request.classes_affected || [];

 const handleAction = async (actionType) => {
 setIsProcessing(true);
 try {
 let updatePayload = {};

 if (actionType === 'Reject') {
 const remarks = window.prompt("Reason for rejection:");
 if (!remarks) return; // cancelled
 updatePayload = { status: 'Rejected', admin_remarks: remarks };
 } 
 else if (actionType === 'Approve') {
 updatePayload = { status: 'Approved', replacement_status: 'Not Required' };
 }
 else if (actionType === 'ApproveAndReplace') {
 updatePayload = { status: 'Approved', replacement_status: 'Pending' };
 }

 const { error } = await supabase
 .from('faculty_leaves')
 .update(updatePayload)
 .eq('id', request.id);

 if (error) throw error;

 // Simple mock audit log
 await supabase.from('leave_audit_logs').insert([{
 leave_id: request.id,
 action: actionType === 'Reject' ? 'Rejected Leave' : 'Approved Leave',
 performed_by: 'Admin',
 details: `Action taken via ERP by Admin`
 }]);

 // Notify Requester
 if (request.faculty_id) {
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: `Leave Request ${actionType === 'Reject' ? 'Rejected' : 'Approved'}`,
 category: 'System Alert',
 target_audience: 'person',
 target_id: request.faculty_id,
 priority: 'high',
 content: `Your leave request from ${new Date(request.start_date).toLocaleDateString()} to ${new Date(request.end_date).toLocaleDateString()} has been ${actionType === 'Reject' ? 'Rejected' : 'Approved'}.`,
 author_name: 'Admin',
 author_id: null
 }]);
 }

 window.erpDialog?.alert(`Leave request has been updated successfully.`);

 // If replacing, ideally we trigger the replacement engine modal.
 if (actionType === 'ApproveAndReplace') {
 if(onAssignReplacement) onAssignReplacement();
 return; // Don't call onClose
 }

 onClose();

 } catch (error) {
 console.error("Error updating leave:", error);
 window.erpDialog?.alert("Failed to process leave request.", "error");
 } finally {
 setIsProcessing(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
 
 {/* Header Profile Card */}
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-6 relative overflow-hidden">
 <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong rounded-full flex items-center justify-center text-xl lg:text-2xl text-themeTextSec shrink-0">
 <i className="fa-solid fa-user"></i>
 </div>
 <div>
 <h2 className={`font-bold tracking-tight text-xl lg:text-2xl text-themeText`}>{request.faculty?.name || 'Faculty Member'}</h2>
 <div className="flex flex-wrap gap-4 mt-2">
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-themeTextSec">Employee ID</p>
 <p className="text-xs lg:text-sm font-bold text-themeText mt-0.5">FAC-{request.faculty_id?.substring(0,6).toUpperCase() || 'N/A'}</p>
 </div>
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-themeTextSec">Department</p>
 <p className="text-xs lg:text-sm font-bold text-themeText mt-0.5">{request.faculty?.department || 'School of Law'}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Leave Details & Warning */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 <div className="lg:col-span-2 flex flex-col gap-6">
 {/* Details Box */}
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-6">
 
 <div className="flex justify-between items-start mb-6 border-b-[length:var(--border-width)] border-themeBorder dark:border-white/5 pb-6">
 <div>
 <p className="text-[13px] font-medium text-themeTextSec">Leave Type</p>
 <div className="flex items-center gap-2 mt-1">
 <div className={`w-2 h-2 rounded-full bg-${request.policy?.color_theme || 'blue'}-500`}></div>
 <p className="text-lg font-semibold tracking-tight text-themeText">{request.policy?.name || 'General Leave'}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-[13px] font-medium text-themeTextSec">Duration</p>
 <p className="text-sm font-bold text-themeText mt-1">
 {new Date(request.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(request.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
 </p>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal mt-0.5">{request.days} Days</p>
 </div>
 </div>

 <div className="mb-6">
 <p className="text-[13px] font-medium text-themeTextSec mb-2">Reason Provided</p>
 <div className="bg-themeElevated/90 backdrop-blur-2xl p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08]Strong">
 <p className="text-sm text-themeText italic leading-relaxed">"{request.reason}"</p>
 </div>
 </div>

 <div>
 <p className="text-[13px] font-medium text-themeTextSec mb-3">Classes Affected</p>
 {affectedClasses.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {affectedClasses.map((cls, idx) => (
 <span key={idx} className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08]Strong px-3 py-1.5 rounded-md text-[10px] lg:text-xs font-bold text-themeText">
 {cls}
 </span>
 ))}
 </div>
 ) : (
 <p className="text-xs text-themeTextSec italic">No classes scheduled during this period.</p>
 )}
 </div>
 
 <div className="mt-6 pt-6 border-t-[length:var(--border-width)] border-themeBorder dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <p className="text-[13px] font-medium text-themeTextSec">Class Replacement Status</p>
 <span className="bg-rose-500/10 border-[length:var(--border-width)] border-rose-500/20 text-rose-500 px-3 py-1 rounded text-[9px] lg:text-[13px] font-medium w-fit">
 {request.replacement_status === 'Assigned' ? 'Assigned' : 'Not Assigned'}
 </span>
 </div>
 </div>
 </div>

 <div className="flex flex-col gap-6">
 {/* Warning Note */}
 <div className="bg-amber-500/5 border-[length:var(--border-width)] border-amber-500/20 rounded-themePanel p-5">
 <div className="flex items-center gap-2 mb-3 text-amber-500">
 <i className="fa-solid fa-triangle-exclamation"></i>
 <span className="text-[14px] font-medium tracking-normal">Important</span>
 </div>
 <p className="text-xs text-amber-600/80 font-medium leading-relaxed mb-3">
 Faculty must produce valid supporting documents to the administration whenever requested.
 </p>
 <p className="text-[10px] text-amber-600/60 font-medium leading-relaxed">
 Submitting false information may lead to disciplinary action as per university regulations.
 </p>
 </div>

 {/* Actions Box */}
 {request.status === 'Pending' && (
 <div className="bg-white/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 flex flex-col gap-3">
 <SlideCommit
                label="Slide to Approve"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={() => handleAction('ApproveAndReplace')}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 <SlideCommit
                label="Slide to Approve"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={() => handleAction('Approve')}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 <button type="button" 
 onClick={() => handleAction('Reject')}
 disabled={isProcessing}
 className="w-full py-3 bg-themeElevated/90 backdrop-blur-2xl hover:bg-rose-500 hover:text-themeText dark:text-white text-rose-500 border border-black/[0.04] dark:border-white/[0.08]Strong rounded-xl text-[14px] font-medium tracking-normal transition"
 >
 Reject
 </button>
 </div>
 )}
 </div>

 </div>

 </div>
 );
}

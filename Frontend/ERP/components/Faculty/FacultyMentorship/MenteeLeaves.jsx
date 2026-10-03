/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../lib/EmailService';

export default function MenteeLeaves({ menteeId }) {
 const [leaves, setLeaves] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if(menteeId) fetchLeaves();
 }, [menteeId]);

 const fetchLeaves = async () => {
 setLoading(true);
 try {
 const { data } = await supabase
 .from('leave_requests')
 .select('*')
 .eq('student_id', menteeId)
 .order('created_at', { ascending: false });
 if (data) setLeaves(data);
 } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setLoading(false);
 }
 };

 const handleAction = async (leave, status) => {
 try {
 let updatePayload = { status };
 let remarks = "";

 if (status === 'rejected') {
 remarks = await window.erpDialog?.prompt("Please enter a reason for rejecting this leave:", "Reject Leave") || window.prompt("Reason for rejection:");
 if (!remarks) return;
 updatePayload.admin_remarks = remarks;
 }

 const { error } = await supabase.from('leave_requests').update(updatePayload).eq('id', leave.id);
 if (error) throw error;
 
 fetchLeaves();
 window.erpToast?.show?.(`Leave marked as ${status}`, 'success');

 // Dispatch Email & WhatsApp
 try {
 // Fetch student profile for email & phone
 const { data: profile } = await supabase.from('profiles').select('full_name, email, phone').eq('id', menteeId).single();
 
 if (profile) {
 if (status === 'rejected') {
 await sendSystemEmail('LEAVE_REJECTED', {
 to_email: profile.email,
 student_name: profile.full_name,
 leave_type: leave.leave_type || 'Leave',
 start_date: leave.from_date || leave.start_date,
 end_date: leave.to_date || leave.end_date,
 reason: remarks
 });
 if (profile.phone) {
 await supabase.from('whatsapp_queue').insert({
 phone: profile.phone,
 message: `📋 *Leave Rejected ❌*\n\nStudent: ${profile.full_name}\nType: ${leave.leave_type || 'Leave'}\nDates: ${new Date(leave.from_date || leave.start_date).toLocaleDateString()} to ${new Date(leave.to_date || leave.end_date).toLocaleDateString()}\nStatus: *REJECTED*\n📝 Reason: ${remarks}\n\n— Prudentia College of Law`,
 recipient_name: profile.full_name
 });
 }
 } else {
 await sendSystemEmail('LEAVE_APPROVED', {
 to_email: profile.email,
 student_name: profile.full_name,
 leave_type: leave.leave_type || 'Leave',
 start_date: leave.from_date || leave.start_date,
 end_date: leave.to_date || leave.end_date
 });
 if (profile.phone) {
 await supabase.from('whatsapp_queue').insert({
 phone: profile.phone,
 message: `📋 *Leave Approved ✅*\n\nStudent: ${profile.full_name}\nType: ${leave.leave_type || 'Leave'}\nDates: ${new Date(leave.from_date || leave.start_date).toLocaleDateString()} to ${new Date(leave.to_date || leave.end_date).toLocaleDateString()}\nStatus: *APPROVED*\n\n— Prudentia College of Law`,
 recipient_name: profile.full_name
 });
 }
 }
 }
 } catch (notifyErr) {
 console.warn("Notification dispatch failed:", notifyErr);
 }
 
 } catch (e) { console.error(e); window.erpToast?.show?.("An error occurred.", 'error'); }
 };

 const exportToExcel = () => {
 if (!leaves.length) return;
 
 let tableHTML = `
 <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
 <head><meta charset="utf-8"></head>
 <body>
 <table border="1" style="font-family: Arial, sans-serif; border-collapse: collapse;">
 <thead>
 <tr style="background-color: #4F46E5; color: white; font-weight: bold; font-size: 14px;">
 <th style="padding: 10px;">ID</th>
 <th style="padding: 10px;">Category</th>
 <th style="padding: 10px;">Reason</th>
 <th style="padding: 10px;">From Date</th>
 <th style="padding: 10px;">To Date</th>
 <th style="padding: 10px;">Status</th>
 <th style="padding: 10px;">Requested On</th>
 </tr>
 </thead>
 <tbody>
 `;

 leaves.forEach(l => {
 const statusColor = l.status === 'approved' ? '#10B981' : l.status === 'rejected' ? '#EF4444' : '#F59E0B';
 tableHTML += `
 <tr>
 <td style="padding: 8px;">${l.id}</td>
 <td style="padding: 8px;">${l.category || "General"}</td>
 <td style="padding: 8px;">${l.reason || ""}</td>
 <td style="padding: 8px;">${l.from_date}</td>
 <td style="padding: 8px;">${l.to_date}</td>
 <td style="padding: 8px; color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${l.status}</td>
 <td style="padding: 8px;">${new Date(l.created_at).toLocaleString()}</td>
 </tr>
 `;
 });

 tableHTML += `</tbody></table></body></html>`;
 
 const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
 const url = URL.createObjectURL(blob);
 
 const link = document.createElement("a");
 link.href = url;
 link.download = `Mentee_Leaves_${menteeId}.xls`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
 <div className="flex justify-between items-center">
 <div>
 <h2 className="text-xl font-black tracking-tight text-themeText">Leave Approvals</h2>
 <p className="text-xs font-bold text-themeTextSec mt-1">Manage and export mentee time-off requests.</p>
 </div>
 {leaves.length > 0 && (
 <button onClick={exportToExcel} className="btn-erp bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
 <i className="fa-solid fa-file-excel mr-2"></i> Export XL
 </button>
 )}
 </div>

 {loading ? (
 <div className="flex justify-center p-10"><i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-2xl"></i></div>
 ) : leaves.length === 0 ? (
 <div className="bg-themeElevated rounded-2xl border-2 border-dashed border-themeBorder p-10 text-center">
 <p className="text-sm font-bold text-themeTextSec">No leave requests found.</p>
 </div>
 ) : (
 <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
 {leaves.map(l => (
 <div key={l.id} className="bg-themePanel/50 dark:bg-themePanel/50 border border-themeBorder p-5 rounded-2xl flex flex-col gap-4">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="text-sm font-black text-themeText">{l.category || "General Leave"}</h4>
 <p className="text-xs text-themeTextSec mt-1">{l.reason}</p>
 <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-2">
 <i className="fa-regular fa-calendar mr-1"></i> {l.from_date} to {l.to_date}
 </p>
 </div>
 <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
 l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
 l.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
 'bg-amber-500/10 text-amber-500'
 }`}>
 {l.status}
 </span>
 </div>
 {l.status === 'pending' && (
 <div className="flex gap-2 pt-4 border-t border-themeBorder">
 <button onClick={() => handleAction(l, 'approved')} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-black transition-colors">Approve</button>
 <button onClick={() => handleAction(l, 'rejected')} className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-black transition-colors">Reject</button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 );
}

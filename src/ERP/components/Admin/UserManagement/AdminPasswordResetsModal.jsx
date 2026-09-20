/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { notifyBatchWhatsApp } from '../../../../Shared/utils/whatsappIntegration';

export default function AdminPasswordResetsModal({ onClose }) {
 const [requests, setRequests] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [processingId, setProcessingId] = useState(null);
 const [error, setError] = useState('');

 useEffect(() => {
 fetchRequests();
 }, []);

 const fetchRequests = async () => {
 setIsLoading(true);
 setError('');
 try {
 const { data, error: fetchError } = await supabase
 .from('erp_password_reset_requests')
 .select('*')
 .eq('status', 'pending')
 .order('created_at', { ascending: false });
 
 if (fetchError) throw fetchError;
 setRequests(data || []);
 } catch (err) {
 console.error(err);
 setError('Failed to fetch requests.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleApprove = async (request) => {
 setProcessingId(request.id);
 try {
 // 1. Get the user's profile to find their ID and phone number
 const { data: profiles, error: profileError } = await supabase
 .from('profiles')
 .select('id, contact_number, email, name')
 .eq('erp_id', request.institutional_id.toUpperCase());

 if (profileError || !profiles || profiles.length === 0) {
 throw new Error('User profile not found for ID: ' + request.institutional_id);
 }

 const user = profiles[0];

 // 2. Generate a secure temporary password
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
 let tempPassword = "Jsm#";
 for (let i = 0; i < 6; i++) {
 tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
 }

 // 3. Update the password using the secure RPC
 const { data: rpcData, error: rpcError } = await supabase.rpc('admin_force_password_update', {
 target_user_id: user.id,
 new_password: tempPassword
 });

 if (rpcError) {
 throw new Error('Failed to update password in Auth layer: ' + rpcError.message);
 }

 // 4. Send WhatsApp Notification
 const message = `*Prudentia College of Law - IT Support*\n\nHello ${user.name},\nYour password reset request for ID: ${request.institutional_id.toUpperCase()} has been approved.\n\n*Temporary Password:* ${tempPassword}\n\nPlease login immediately and update your password in the Credentials portal.`;
 
 // If contact_number exists, send to it, else use erp_id as fallback
 const destination = user.contact_number || request.institutional_id.toUpperCase();
 await notifyBatchWhatsApp(destination, message);

 // 5. Mark request as approved
 await supabase
 .from('erp_password_reset_requests')
 .update({ 
 status: 'approved',
 resolved_at: new Date().toISOString()
 })
 .eq('id', request.id);

 // Remove from local list
 setRequests(prev => prev.filter(r => r.id !== request.id));

 } catch (err) {
 console.error(err);
 alert('Error processing approval: ' + err.message);
 } finally {
 setProcessingId(null);
 }
 };

 const handleReject = async (requestId) => {
 if (!(await window.erpDialog?.confirm("Are you sure you want to reject this request?"))) return;
 setProcessingId(requestId);
 try {
 await supabase
 .from('erp_password_reset_requests')
 .update({ 
 status: 'rejected',
 resolved_at: new Date().toISOString()
 })
 .eq('id', requestId);
 
 setRequests(prev => prev.filter(r => r.id !== requestId));
 } catch (err) {
 console.error(err);
 alert('Error rejecting request.');
 } finally {
 setProcessingId(null);
 }
 };

 return (
 <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in font-sans overflow-hidden">
 {/* Close Button - Fixed to top right */}
 <button 
 type="button"
 onClick={onClose}
 className="absolute top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 rounded-full bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec hover:text-themeText transition outline-none z-[250] cursor-pointer hover:scale-110"
 >
 <i className="fa-solid fa-times text-xl"></i>
 </button>

 {/* Subtle Background Effects */}
 <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-themeAccent opacity-[0.05] mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
 </div>

 <div className="w-full mx-auto p-6 lg:p-12 flex flex-col h-screen relative z-10">

 <div className="mb-8">
 <h2 className="text-2xl font-semibold tracking-tight text-themeText tracking-tight mb-2">Password Reset Requests</h2>
 <p className="text-xs font-bold text-themeTextSec leading-relaxed">
 Review and approve institutional password reset requests. Approved requests will automatically generate a temporary password and dispatch it via WhatsApp.
 </p>
 </div>

 {error && (
 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold flex items-start gap-3 mb-6">
 <i className="fa-solid fa-circle-exclamation shrink-0 mt-0.5"></i> 
 <span className="leading-relaxed">{error}</span>
 </div>
 )}

 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-12 text-themeTextSec gap-3">
 <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
 <span className="text-xs font-bold uppercase tracking-wider">Loading Requests...</span>
 </div>
 ) : requests.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-themeTextSec gap-3 opacity-60">
 <i className="fa-solid fa-shield-check text-4xl"></i>
 <span className="text-sm font-bold uppercase tracking-wider">No Pending Requests</span>
 </div>
 ) : (
 requests.map(req => (
 <div key={req.id} className="bg-themeApp border border-themeBorder dark:border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-2 py-1 bg-themeElevated/90 backdrop-blur-2xl rounded text-[10px] font-black uppercase tracking-wider text-themeText">
 {req.institutional_id.toUpperCase()}
 </span>
 <span className="text-[10px] text-themeTextSec font-medium">
 {new Date(req.created_at).toLocaleString()}
 </span>
 </div>
 <p className="text-sm text-themeText leading-relaxed">
 "{req.reason}"
 </p>
 </div>
 <div className="flex items-center gap-3 w-full md:w-auto">
 <button type="button"
 onClick={() => handleReject(req.id)}
 disabled={processingId === req.id}
 className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-themeElevated/90 backdrop-blur-2xl hover:bg-rose-500/10 text-rose-500 text-xs font-bold transition-colors disabled:opacity-50"
 >
 Reject
 </button>
 <button type="button"
 onClick={() => handleApprove(req)}
 disabled={processingId === req.id}
 className="flex-1 md:flex-none px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-themeText dark:text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {processingId === req.id ? (
 <i className="fa-solid fa-circle-notch fa-spin"></i>
 ) : (
 <>Approve <i className="fa-brands fa-whatsapp"></i></>
 )}
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 );
}

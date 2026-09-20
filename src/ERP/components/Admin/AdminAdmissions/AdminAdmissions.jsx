/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { sendSystemEmail } from '../../../lib/EmailService';
import PageHeader from "../../shared/PageHeader/PageHeader";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ;
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
 auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminAdmissions({ isEmbedded = false,  isHubView = false }) {
 const [applications, setApplications] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [filter, setFilter] = useState("all");
 const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);
 const [isTogglingStatus, setIsTogglingStatus] = useState(false);

 // Automation Modal State
 const [showProvisionModal, setShowProvisionModal] = useState(false);
 const [provisionLogs, setProvisionLogs] = useState([]);
 const [provisionStatus, setProvisionStatus] = useState("idle"); // idle, running, success, error
 const [generatedCredentials, setGeneratedCredentials] = useState(null);
 const logsEndRef = useRef(null);

 useEffect(() => {
 logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [provisionLogs]);

 useEffect(() => {
 fetchApplications();
 }, []);

 const fetchApplications = async () => {
 setIsLoading(true);
 try {
 // Fetch applications
 const { data: appData, error: appError } = await supabase
 .from("admissions_applications")
 .select("*")
 .order("created_at", { ascending: false }).limit(500);

 if (appError) {
 console.warn("Table admissions_applications might not exist or no rows:", appError);
 } else {
 setApplications(appData || []);
 }

 // Fetch admissions status
 const { data: settingsData, error: settingsError } = await supabase
 .from("system_settings")
 .select("value")
 .eq("key", "admissions_status")
 .single();
 
 if (!settingsError && settingsData?.value) {
 setIsAdmissionsOpen(settingsData.value.is_open !== false);
 }
 } catch (error) {
 console.error("Error fetching applications:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleToggleAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newState = !isAdmissionsOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: newState } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 setIsAdmissionsOpen(newState);
 (window.erpDialog?.alert || alert)(`Admissions are now ${newState ? 'OPEN' : 'CLOSED'}`);
 } catch (error) {
 (window.erpDialog?.alert || alert)("Failed to toggle admissions status");
 } finally {
 setIsTogglingStatus(false);
 }
 };

 const addLog = (msg) => {
 setProvisionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
 };

 const handleReject = async (id) => {
 try {
 const { error } = await supabase.from("admissions_applications").update({ status: 'rejected' }).eq("id", id);
 if (error) throw error;
 fetchApplications();
 } catch (error) {
 (window.erpDialog?.alert || alert)("Failed to reject application.");
 }
 };

 const handleApprovePipeline = async (app) => {
 if (!(await window.erpDialog?.confirm(`Are you sure you want to approve ${app.name} and provision their ERP account?`))) return;

 setShowProvisionModal(true);
 setProvisionStatus("running");
 setProvisionLogs([
 `[SYSTEM] Initializing Admission Automation Pipeline for ${app.name}...`,
 `[SYSTEM] Contact Email: ${app.email}`
 ]);

 try {
 // 1. ID Generation
 let shortcut = "BBL"; // BBA LLB default
 if (app.program && app.program.includes("BA LLB")) shortcut = "BAL";
 if (app.program && app.program.trim() === "LLB") shortcut = "LLB";

 const prefix = `26${shortcut}`;
 addLog(`[SYSTEM] Calculating sequential ERP ID for prefix ${prefix}...`);
 
 const { data: highestIdData } = await supabase
 .from('profiles')
 .select('erp_id')
 .ilike('erp_id', `${prefix}%`)
 .order('erp_id', { ascending: false })
 .limit(1);
 
 let nextNum = 1;
 if (highestIdData && highestIdData.length > 0 && highestIdData[0].erp_id) {
 const lastId = highestIdData[0].erp_id;
 const numPart = lastId.replace(prefix, '');
 const parsedNum = parseInt(numPart, 10);
 if (!isNaN(parsedNum)) nextNum = parsedNum + 1;
 }
 
 const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
 addLog(`[SUCCESS] Generated ERP ID: ${generatedId}`);

 // 2. Mark as approved and save ERP ID
 addLog("[DATABASE] Updating application status to Approved and assigning ERP ID...");
 const { error: updateError } = await supabase.from("admissions_applications").update({ status: 'approved', 
 erp_id: generatedId 
 }).eq("id", app.id);
 if (updateError) throw updateError;

 // 3. Generate Password & Auth
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 let generatedPassword = "Jsm#";
 for (let i = 0; i < 6; i++) generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));

 addLog(`[AUTH] Registering secure credentials in Supabase Edge Network...`);
 const { data: authData, error: authError } = await provisionClient.auth.signUp({ email: app.email,
 password: generatedPassword });

 if (authError) {
 if (authError.message.includes("already registered")) {
 addLog(`[WARNING] A user with email ${app.email} is already registered in Auth.`);
 throw new Error("User already exists in Authentication system.");
 } else {
 throw authError;
 }
 }
 if (!authData.user) throw new Error("Auth creation failed silently.");

 // 4. Create Profile
 addLog(`[DATABASE] Registering ${generatedId} in active student profiles...`);
 const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user.id,
 erp_id: generatedId,
 full_name: app.name,
 email: app.email,
 role: 'student',
 academic_batch: app.program || 'BA LLB',
 department: 'Law',
 status: 'Active'
 });

 if (profileError) throw profileError;

 // 4.5 Generate Fee Invoice
 addLog(`[FINANCE] Generating initial ₹50,000 admission fee invoice...`);
 const invoiceDate = new Date();
 invoiceDate.setDate(invoiceDate.getDate() + 14); // Due in 14 days
 const { error: invoiceError } = await supabase.from('fee_invoices').insert({ student_id: authData.user.id,
 title: 'Semester 1 Tuition Fee',
 amount: 50000,
 due_date: invoiceDate.toISOString().split('T')[0],
 type: 'Tuition',
 status: 'pending'
 });
 if (invoiceError) {
 addLog(`[WARNING] Failed to generate invoice: ${invoiceError.message}. Please generate manually.`);
 } else {
 addLog(`[SUCCESS] Initial fee invoice generated successfully.`);
 }

 // 5. Send Welcome Email
 addLog(`[EMAIL] Dispatching secure welcome letter and credentials via EmailJS...`);
 try {
 await sendSystemEmail('ONBOARDING', {
 to_email: app.email,
 erp_id: generatedId,
 password: generatedPassword,
 login_url: window.location.origin
 });
 addLog(`[SUCCESS] Welcome letter successfully dispatched to ${app.email}!`);
 } catch (emailErr) {
 console.error("EmailJS Error:", emailErr);
 addLog(`[WARNING] Email dispatch failed: ${emailErr.message}. The account was created successfully, but credentials must be provided manually.`);
 }

 setProvisionStatus("success");
 setGeneratedCredentials({ id: generatedId, password: generatedPassword });
 addLog(`[SYSTEM] Pipeline complete! ${app.name} is officially enrolled.`);
 fetchApplications(); // Refresh list to remove from pending
 } catch (error) {
 setProvisionStatus("error");
 addLog(`[FATAL ERROR] ${error.message}`);
 addLog(`[SYSTEM] Pipeline aborted. Please resolve the issue and try again.`);
 }
 };

 const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter);

 return (
 <div className={`w-full animate-fade-in selection:bg-themeAccent/30 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-transparent text-themeText dark:text-white" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8" : "pb-10"}`}>
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-user-graduate" title="Admissions Command Center" subtitle="Review and process incoming website applications." rightContent={
<>
<div className="flex gap-3 w-full lg:w-auto">
 <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 border border-black/10 dark:border-white/20 backdrop-blur-md ${isAdmissionsOpen ? 'bg-rose-500/20 hover:bg-rose-500 text-themeText dark:text-white' : 'bg-emerald-500/20 hover:bg-emerald-500 text-themeText dark:text-white'}`}
 >
 <i className={`fa-solid ${isAdmissionsOpen ? 'fa-lock' : 'fa-lock-open'}`}></i>
 {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </div>
 </>
} />
 )}

 <div className={`flex items-center justify-between relative z-10 flex-wrap gap-4`}>
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-gray-100 dark:bg-themeApp backdrop-blur-2xl backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {['all', 'pending', 'approved', 'rejected'].map(f => (
 <button type="button" 
 key={f}
 onClick={() => setFilter(f)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${
 filter === f 
 ? 'bg-themeAccent text-themeText dark:text-white border border-themeBorder dark:border-white/5Accent scale-100' 
 : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white dark:bg-[#121212] backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {f}
 </button>
 ))}
 </div>

 {isHubView && (
 <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border ${isAdmissionsOpen ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'}`}
 >
 <i className={`fa-solid ${isAdmissionsOpen ? 'fa-lock' : 'fa-lock-open'}`}></i>
 {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 )}
 </div>

 {isLoading ? (
 <div className="flex justify-center p-12">
 <div className="animate-spin w-8 h-8 border-4 border-themeBorder dark:border-white/5Accent border-t-transparent rounded-full"></div>
 </div>
 ) : (
 <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl rounded-2xl border border-themeBorder dark:border-white/5 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-gray-100 dark:bg-themeApp backdrop-blur-2xl border-b-theme border-themeBorder dark:border-white/5 text-xs tracking-normal text-themeTextSec dark:text-white/50 font-black">
 <tr>
 <th className="p-4 border-r-theme border-themeBorder dark:border-white/5">Applicant</th>
 <th className="p-4 border-r-theme border-themeBorder dark:border-white/5">Program</th>
 <th className="p-4 border-r-theme border-themeBorder dark:border-white/5">Marks / Exams</th>
 <th className="p-4 border-r-theme border-themeBorder dark:border-white/5">Date</th>
 <th className="p-4 border-r-theme border-themeBorder dark:border-white/5">Status</th>
 <th className="p-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-themeBorder">
 {filteredApps.length === 0 ? (
 <tr><td colSpan="6" className="p-8 text-center text-themeTextSec dark:text-white/50 font-black tracking-normal">No applications found.</td></tr>
 ) : (
 filteredApps.map(app => (
 <tr key={app.id} className="hover:bg-gray-100 dark:bg-themeApp backdrop-blur-2xl transition-colors group">
 <td className="p-4 border-r-theme border-themeBorder dark:border-white/5">
 <p className="font-black text-themeText dark:text-white">{app.name}</p>
 <p className="text-xs text-themeTextSec dark:text-white/50 font-medium mt-1">{app.email}</p>
 <p className="text-xs text-themeTextSec dark:text-white/50 font-medium mt-0.5">{app.phone}</p>
 </td>
 <td className="p-4 text-[15px] font-semibold text-themeText dark:text-white border-r-theme border-themeBorder dark:border-white/5">{app.program}</td>
 <td className="p-4 border-r-theme border-themeBorder dark:border-white/5">
 <p className="text-xs text-themeText dark:text-white font-black tracking-normal mb-1">
 10th: <span className="text-indigo-400">{app.marks_10th}</span> | 12th: <span className="text-emerald-400">{app.marks_inter}</span>
 </p>
 {app.exam_tglawcet && <p className="text-xs text-themeText dark:text-white font-black tracking-normal">TGLAWCET: <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{app.exam_tglawcet}</span></p>}
 {app.exam_clat && <p className="text-xs text-themeText dark:text-white font-black tracking-normal mt-1">CLAT: <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{app.exam_clat}</span></p>}
 {app.exam_other && <p className="text-[10px] text-themeTextSec dark:text-white/50 font-bold tracking-normal mt-2">Other Exam: {app.exam_other}</p>}
 {app.family_in_legal === 'Yes' && <p className="text-[10px] text-themeTextSec dark:text-white/50 font-bold tracking-normal mt-1">Legal Family: {app.family_in_legal_who}</p>}
 </td>
 <td className="p-4 text-xs text-themeTextSec dark:text-white/50 font-medium border-r-theme border-themeBorder dark:border-white/5">
 {new Date(app.created_at).toLocaleDateString()}
 </td>
 <td className="p-4 border-r-theme border-themeBorder dark:border-white/5">
 <span className={`px-2.5 py-1 rounded-md text-[13px] font-medium border border-themeBorder dark:border-white/5 inline-block mb-2 ${
 app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
 app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
 'bg-amber-500/10 text-amber-400 border-amber-500/30'
 }`}>
 {app.status}
 </span>
 {app.erp_id && <p className="text-[13px] font-medium text-themeTextSec dark:text-white/50">ID: <span className="text-themeText dark:text-white select-all">{app.erp_id}</span></p>}
 </td>
 <td className="p-4 text-right space-x-2">
 {app.status === 'pending' && (
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button type="button" onClick={() => handleApprovePipeline(app)} className="w-8 h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText dark:text-white rounded-lg transition" title="Approve">
 <i className="fa-solid fa-check"></i>
 </button>
 <button type="button" onClick={() => handleReject(app.id)} className="w-8 h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white rounded-lg transition" title="Reject">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Automation Pipeline Modal */}
 {showProvisionModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-themeBorder dark:border-white/5 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[500px]">
 <div className="bg-gray-100 dark:bg-themeApp backdrop-blur-2xl border-b-theme border-themeBorder dark:border-white/5 p-5 flex justify-between items-center shrink-0">
 <div className="flex items-center gap-3">
 <i className="fa-solid fa-robot text-themeAccent text-xl"></i>
 <span className="font-mono text-[15px] font-semibold text-themeText dark:text-white tracking-widest uppercase">Pipeline Execution</span>
 </div>
 {provisionStatus !== "running" && (
 <button type="button" onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }} className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-100 dark:bg-themeApp backdrop-blur-2xl rounded-full border border-black/5 dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 )}
 </div>

 {provisionStatus === "success" && generatedCredentials ? (
 <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-center text-center bg-emerald-500/5">
 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mb-4">
 <i className="fa-solid fa-check"></i>
 </div>
 <h3 className={`font-black tracking-normal text-2xl text-themeText dark:text-white mb-1`}>Student Provisioned!</h3>
 <p className={`text-sm font-medium text-themeTextSec dark:text-white/50 mb-6 tracking-normal`}>Securely share these credentials with the student.</p>

 <div className="w-full max-w-sm bg-transparent p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col gap-5 text-left">
 <div className="flex flex-col gap-2">
 <span className="text-[13px] font-medium text-themeTextSec dark:text-white/50 ml-1">Generated ERP ID</span>
 <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-themeBorder dark:border-white/5 p-3 rounded-lg text-base font-black text-themeText dark:text-white tracking-widest select-all text-center">
 {generatedCredentials.id}
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <span className="text-[13px] font-medium text-themeTextSec dark:text-white/50 ml-1">Temporary Password</span>
 <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-themeBorder dark:border-white/5 p-3 rounded-lg text-base font-black text-themeText dark:text-white tracking-widest select-all text-center">
 {generatedCredentials.password}
 </div>
 </div>
 <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 leading-relaxed text-center mt-2">These credentials have been emailed to the applicant. They will be prompted to change their password upon first login.</p>
 </div>
 </div>
 ) : (
 <div className="flex-1 bg-transparent p-5 font-mono text-xs md:text-sm overflow-y-auto flex flex-col gap-1.5">
 {provisionLogs.map((log, i) => (
 <div key={i} className={`font-bold
 ${log.includes('[FATAL ERROR]') || log.includes('[WARNING]') ? 'text-rose-500' : ''}
 ${log.includes('[SUCCESS]') ? 'text-emerald-400' : ''}
 ${log.includes('[AUTH]') ? 'text-amber-400' : ''}
 ${log.includes('[DATABASE]') || log.includes('[EMAIL]') ? 'text-indigo-400' : ''}
 ${log.includes('[SYSTEM]') ? 'text-blue-400' : ''}
 ${log.includes('[FINANCE]') ? 'text-emerald-400' : ''}
 ${!log.match(/\[(FATAL ERROR|WARNING|SUCCESS|AUTH|DATABASE|EMAIL|SYSTEM|FINANCE)\]/) ? 'text-white/80' : ''}
 `}>
 {log}
 </div>
 ))}
 {provisionStatus === "running" && (
 <div className="text-themeTextSec dark:text-white/50 animate-pulse font-black mt-2">_</div>
 )}
 <div ref={logsEndRef} />
 </div>
 )}

 <div className="bg-gray-100 dark:bg-themeApp backdrop-blur-2xl border-t-theme border-themeBorder dark:border-white/5 p-4 shrink-0 flex justify-end">
 {provisionStatus === "running" ? (
 <div className="text-amber-400 font-mono text-[15px] font-semibold tracking-widest animate-pulse px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded">PIPELINE ACTIVE...</div>
 ) : (
 <button type="button"
 onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }}
 className="bg-transparent hover:bg-neutral-800 text-themeText dark:text-white border border-black/5 dark:border-white/10 px-6 py-2.5 font-black tracking-normal rounded-lg transition-colors"
 >
 {provisionStatus === "success" ? "Done & Close" : "Close Pipeline"}
 </button>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
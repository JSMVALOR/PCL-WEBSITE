/* © 2026 JSM VALOR. All Rights Reserved. */
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { sendSystemEmail, sendSystemWhatsApp } from '../../../lib/EmailService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ;
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
 auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminAdmissions({ isEmbedded = false, isHubView = false }) {
 const [applications, setApplications] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [filter, setFilter] = useState("all");
 const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);
 const [isSpotOpen, setIsSpotOpen] = useState(false);
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
 console.error("🚨 DATABASE FETCH ERROR:", appError);
 if(window.erpToast) window.erpToast.show("Error fetching applications: " + appError.message, "error");
 console.warn("Table admissions_applications might not exist or no rows:", appError);
 } else {
 
  const mergeApplications = (apps) => {
    const merged = {};
    apps.forEach(app => {
      const key = (app.name || "").trim().toLowerCase();
      if (!merged[key]) {
        merged[key] = {
          ...app,
          allEmails: app.email ? [app.email] : [],
          allPhones: app.phone ? [app.phone] : [],
          duplicateCount: 1,
          duplicateIds: [app.id]
        };
      } else {
        merged[key].duplicateCount++;
        merged[key].duplicateIds.push(app.id);
        if (app.email && !merged[key].allEmails.includes(app.email)) merged[key].allEmails.push(app.email);
        if (app.phone && !merged[key].allPhones.includes(app.phone)) merged[key].allPhones.push(app.phone);
      }
    });
    return Object.values(merged);
  };

        setApplications(mergeApplications(appData || []));
 }

 // Fetch admissions status
 const { data: settingsData, error: settingsError } = await supabase
 .from("system_settings")
 .select("value")
 .eq("key", "admissions_status")
 .single();
 
 if (!settingsError && settingsData?.value) {
 setIsAdmissionsOpen(settingsData.value.is_open !== false);
 setIsSpotOpen(settingsData.value.is_spot === true);
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
 value: { is_open: newState, is_spot: isSpotOpen } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 setIsAdmissionsOpen(newState);
 if(window.erpToast) window.erpToast.show(`Admissions are now ${newState ? 'OPEN' : 'CLOSED'}`, "info");
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle admissions status", "info");
 } finally {
 setIsTogglingStatus(false);
 }
 };

 const handleToggleSpotAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newSpotState = !isSpotOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: isAdmissionsOpen, is_spot: newSpotState } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 setIsSpotOpen(newSpotState);
 if(window.erpToast) window.erpToast.show(`Spot Admissions are now ${newSpotState ? 'OPEN' : 'CLOSED'}`, "info");
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle spot admissions status", "info");
 } finally {
 setIsTogglingStatus(false);
 }
 };

 const addLog = (msg) => {
 setProvisionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
 };

 const handleReject = async (app) => {
 const reason = await window.erpDialog?.prompt(
 `Please enter the reason for rejecting ${app.name}'s application. This message will be included in the email sent to the applicant.`,
 "Reject Application",
 "Your application did not meet the minimum requirements at this time."
 );
 
 if (reason === null) return; // User cancelled
 
 try {
 const { error } = await supabase.from("admissions_applications").update({ status: 'rejected' }).in("id", app.duplicateIds);
 if (error) throw error;

 // Send rejection email
 try {
 await sendSystemEmail('APPLICATION_REJECTED', {
 to_email: app.email,
 student_name: app.name,
 program: app.program || 'Law Program',
 reason: reason
 });
 if (app.phone) {
 sendSystemWhatsApp(app.phone, null, { template_id: 'APPLICATION_REJECTED', variables: { student_name: app.name, program: app.program || 'Law Program', reason: reason || '' }, recipient_name: app.name }).catch(e => console.error('WA failed:', e));
 }
 } catch (emailErr) {
 console.warn("Rejection email failed:", emailErr);
 }

 // Show undoable toast
 if (window.erpToast?.undoable) {
 window.erpToast.undoable(`${app.name}'s application has been rejected.`, async () => {
 await supabase.from("admissions_applications").update({ status: 'pending' }).in("id", app.duplicateIds);
 fetchApplications();
 }, 10000);
 } else {
 window.erpToast?.show?.('Application rejected successfully.', 'success');
 }

 fetchApplications();
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to reject application.", "info");
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
 .from('admissions_applications')
 .select('erp_id')
 .ilike('erp_id', `${prefix}%`)
 .not('erp_id', 'is', null)
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
 }).in("id", app.duplicateIds);
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
 status: 'Active',
 joining_date: new Date().toISOString(),
 application_date: app.created_at,
 application_number: app.id,
 admission_type: app.admission_type || 'Management Quota'
 });

 if (profileError) throw profileError;

 // 5. Send Welcome Email
 addLog(`[EMAIL] Dispatching secure setup link via Supabase...`);
 try {
  // ADDED: Send the actual credentials email
 await sendSystemEmail('FIRST_CREDENTIALS', {
 to_email: app.email,
 student_name: app.name,
 erp_id: generatedId,
 password: generatedPassword,
 portal_link: window.location.origin
 });
 addLog(`[SUCCESS] First credentials sent successfully to ${app.email}!`);
  if (app.phone) { sendSystemWhatsApp(app.phone, null, { template_id: 'FIRST_CREDENTIALS', variables: { name: app.name, erp_id: generatedId, password: generatedPassword }, recipient_name: app.name }).catch(e => console.error('WA failed:', e)); }
 if (app.phone) {
 sendSystemWhatsApp(app.phone, null, { template_id: 'FIRST_CREDENTIALS', variables: { name: app.name, erp_id: generatedId, password: generatedPassword }, recipient_name: app.name }).catch(e => console.error('WA failed:', e));
 }
 } catch (emailErr) {

 console.error("Supabase Email Error:", emailErr);
 addLog(`[WARNING] Link dispatch failed: ${emailErr.message}. The account was created successfully, but credentials must be provided manually.`);
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
 <div className={`w-full animate-fade-in selection:bg-themeAccent/30 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-transparent text-themeText " : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 xl:pb-8" : "pb-10"}`}>
 {/* Header and Tabs */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-user-graduate" title="Admissions Command Center" subtitle="Review and process incoming website applications." rightContent={
<>
<div className="flex gap-3 w-full lg:w-auto">
 <button type="button"
 onClick={handleToggleSpotAdmissions}
 disabled={isTogglingStatus}
 className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 border border-themeBorder backdrop-blur-md ${isSpotOpen ? 'bg-amber-500/20 hover:bg-amber-500 text-themeText' : 'bg-transparent hover:bg-themePanel text-themeTextSec'}`}
 >
 <i className={`fa-solid ${isSpotOpen ? 'fa-bolt' : 'fa-bolt-slash'}`}></i>
 {isTogglingStatus ? '...' : (isSpotOpen ? 'Close Spot Admissions' : 'Open Spot Admissions')}
 </button>
 <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 border border-themeBorder backdrop-blur-md ${isAdmissionsOpen ? 'bg-rose-500/20 hover:bg-rose-500 text-themeText ' : 'bg-emerald-500/20 hover:bg-emerald-500 text-themeText '}`}
 >
 <i className={`fa-solid ${isAdmissionsOpen ? 'fa-lock' : 'fa-lock-open'}`}></i>
 {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </div>
 </>
} />
 )}

 <div className={`flex items-center justify-between relative z-10 flex-wrap gap-4`}>
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themeApp dark:bg-themeApp backdrop-blur-2xl backdrop-blur-md rounded-2xl border border-themeBorder gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {['all', 'pending', 'approved', 'rejected'].map(f => (
 <button type="button" 
 key={f}
 onClick={() => setFilter(f)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max ${
 filter === f 
 ? 'bg-themeAccent text-themeApp border border-themeBorder Accent scale-100' 
 : 'text-themeTextSec hover:text-themeText hover:bg-themePanel shadow-sm border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {f}
 </button>
 ))}
 </div>

 {isHubView && (
 <>
 <button type="button"
 onClick={handleToggleSpotAdmissions}
 disabled={isTogglingStatus}
 className={`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border ${isSpotOpen ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20' : 'bg-transparent text-themeTextSec border-themeBorder'}`}
 >
 <i className={`fa-solid ${isSpotOpen ? 'fa-bolt' : 'fa-bolt-slash'}`}></i>
 {isSpotOpen ? 'Close Spot' : 'Open Spot'}
 </button>
 <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border ${isAdmissionsOpen ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'}`}
 >
 <i className={`fa-solid ${isAdmissionsOpen ? 'fa-lock' : 'fa-lock-open'}`}></i>
 {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </>
 )}
 </div>

  {isLoading ? (
 <div className="flex justify-center p-20">
 <div className="animate-spin w-10 h-10 border-4 border-themeAccent/20 border-t-themeAccent rounded-full"></div>
 </div>
 ) : (
 <div className="w-full">
 {filteredApps.length === 0 ? (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4 bg-themePanel/50 backdrop-blur-3xl border border-themeBorder rounded-3xl shadow-xl">
 <div className="w-20 h-20 rounded-full bg-themeAccent/5 flex items-center justify-center mb-4">
 <i className="fa-solid fa-inbox text-3xl text-themeAccent/40"></i>
 </div>
 <h3 className="text-xl font-black text-themeText tracking-tight mb-2">No Applications Found</h3>
 <p className="text-sm font-medium text-themeTextSec">Waiting for new candidates to apply.</p>
 </motion.div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 <AnimatePresence mode="popLayout">
 {filteredApps.map((app, idx) => (
 <motion.div 
 layout
 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.9, y: -20 }}
 transition={{ duration: 0.4, delay: idx * 0.05, type: "spring", bounce: 0.3 }}
 key={app.id} 
 className="group relative bg-themePanel/80 hover:bg-themeApp backdrop-blur-2xl border border-themeBorder/60 hover:border-themeAccent/30 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-themeAccent/10 transition-all duration-500 flex flex-col"
 >
 {/* Status Badge absolute top right */}
 <div className="absolute top-6 right-6">
 <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
 app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
 app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]' :
 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
 }`}>
  {app.status}</span>
  {app.duplicateCount > 1 && (
    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border bg-purple-500/10 text-purple-500 border-purple-500/20 mt-2 block text-center">
      {app.duplicateCount} Submissions
    </span>
  )}
 </div>
 
 <div className="flex flex-col mb-6 pr-24">
 <h4 className="font-black text-themeText text-xl tracking-tight mb-1 group-hover:text-themeAccent transition-colors">{app.name}</h4>
 <p className="text-sm font-bold text-themeAccent/80">{app.program}</p>
 </div>
 
 <div className="flex flex-col gap-2 mb-6">
 <div className="flex items-start gap-3 text-[13px] font-medium text-themeTextSec">
 <div className="w-8 h-8 rounded-full bg-themeApp border border-themeBorder flex items-center justify-center shrink-0 mt-0.5 group-hover:border-themeAccent/30 transition-colors">
 <i className="fa-solid fa-envelope text-themeText/60 group-hover:text-themeAccent transition-colors"></i>
 </div>
 <div className="flex flex-col gap-1 min-w-0">
 {app.allEmails.map((em, idx) => (
 <span key={idx} className={`truncate ${idx > 0 ? 'text-themeAccent' : ''}`}>
 {em} {idx > 0 && <span className="text-[9px] font-bold uppercase tracking-widest ml-2 border border-themeAccent/30 px-1 rounded-sm">Diff</span>}
 </span>
 ))}
 </div>
 </div>
 <div className="flex items-start gap-3 text-[13px] font-medium text-themeTextSec">
 <div className="w-8 h-8 rounded-full bg-themeApp border border-themeBorder flex items-center justify-center shrink-0 mt-0.5 group-hover:border-themeAccent/30 transition-colors">
 <i className="fa-solid fa-phone text-themeText/60 group-hover:text-themeAccent transition-colors"></i>
 </div>
 <div className="flex flex-col gap-1">
 {app.allPhones.map((ph, idx) => (
 <span key={idx} className={idx > 0 ? 'text-amber-500' : ''}>
 {ph} {idx > 0 && <span className="text-[9px] font-bold uppercase tracking-widest ml-2 border border-amber-500/30 px-1 rounded-sm">Diff</span>}
 </span>
 ))}
 </div>
 </div>
 </div>
 
 <div className="bg-themeApp/50 rounded-2xl p-4 border border-themeBorder/40 flex flex-wrap gap-x-6 gap-y-3 mb-6 flex-1">
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec/70 mb-1">10th Marks</span>
 <span className="font-black text-themeText text-sm">{app.marks_10th}</span>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec/70 mb-1">12th Marks</span>
 <span className="font-black text-themeText text-sm">{app.marks_inter}</span>
 </div>
 {app.exam_tglawcet && (
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500/70 mb-1">TGLAWCET</span>
 <span className="font-black text-amber-400 text-sm">{app.exam_tglawcet}</span>
 </div>
 )}
 {app.exam_clat && (
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70 mb-1">CLAT</span>
 <span className="font-black text-emerald-400 text-sm">{app.exam_clat}</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between mt-auto pt-2">
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec mb-0.5">Applied On</span>
 <span className="font-semibold text-xs text-themeText">{new Date(app.created_at).toLocaleDateString()}</span>
 </div>
 
 {app.erp_id ? (
 <div className="flex flex-col items-end">
 <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-0.5">ERP ID Assigned</span>
 <span className="font-black text-xs text-themeText bg-themeApp px-2 py-1 rounded-md border border-themeBorder select-all">{app.erp_id}</span>
 </div>
 ) : app.status === 'pending' ? (
 <div className="flex gap-2">
 <button type="button" onClick={() => handleApprovePipeline(app)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeApp hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300" title="Approve">
 <i className="fa-solid fa-check text-lg"></i>
 </button>
 <button type="button" onClick={() => handleReject(app)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeApp hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-300" title="Reject">
 <i className="fa-solid fa-xmark text-lg"></i>
 </button>
 </div>
 ) : null}
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>
 )}

 {/* Automation Pipeline Modal */}
 {showProvisionModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-themePanel shadow-sm border border-themeBorder rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[500px]">
 <div className="bg-themeApp dark:bg-themeApp backdrop-blur-2xl border-b-theme border-themeBorder p-5 flex justify-between items-center shrink-0">
 <div className="flex items-center gap-3">
 <i className="fa-solid fa-robot text-themeAccent text-xl"></i>
 <span className="font-mono text-[15px] font-semibold text-themeText tracking-widest uppercase">Pipeline Execution</span>
 </div>
 {provisionStatus !== "running" && (
 <button type="button" onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }} className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-themeApp dark:bg-themeApp backdrop-blur-2xl rounded-full border border-themeBorder text-themeTextSec hover:text-themeText transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 )}
 </div>

 {provisionStatus === "success" && generatedCredentials ? (
 <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-center text-center bg-emerald-500/5">
 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mb-4">
 <i className="fa-solid fa-check"></i>
 </div>
 <h3 className={`font-black tracking-normal text-2xl text-themeText mb-1`}>Student Provisioned!</h3>
 <p className={`text-sm font-medium text-themeTextSec mb-6 tracking-normal`}>Securely share these credentials with the student.</p>

 <div className="w-full max-w-sm bg-transparent p-6 rounded-2xl border border-themeBorder flex flex-col gap-5 text-left">
 <div className="flex flex-col gap-2">
 <span className="text-[13px] font-medium text-themeTextSec ml-1">Generated ERP ID</span>
 <div className="bg-themePanel shadow-sm border border-themeBorder p-3 rounded-lg text-base font-black text-themeText tracking-widest select-all text-center">
 {generatedCredentials.id}
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <span className="text-[13px] font-medium text-themeTextSec ml-1">Temporary Password</span>
 <div className="bg-themePanel shadow-sm border border-themeBorder p-3 rounded-lg text-base font-black text-themeText tracking-widest select-all text-center">
 {generatedCredentials.password}
 </div>
 </div>
 <p className="text-[10px] font-bold text-themeTextSec leading-relaxed text-center mt-2">These credentials have been emailed to the applicant. They will be prompted to change their password upon first login.</p>
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
 ${!log.match(/\[(FATAL ERROR|WARNING|SUCCESS|AUTH|DATABASE|EMAIL|SYSTEM|FINANCE)\]/) ? 'text-themeApp/80' : ''}
 `}>
 {log}
 </div>
 ))}
 {provisionStatus === "running" && (
 <div className="text-themeTextSec animate-pulse font-black mt-2">_</div>
 )}
 <div ref={logsEndRef} />
 </div>
 )}

 <div className="bg-themeApp dark:bg-themeApp backdrop-blur-2xl border-t-theme border-themeBorder p-4 shrink-0 flex justify-end">
 {provisionStatus === "running" ? (
 <div className="text-amber-400 font-mono text-[15px] font-semibold tracking-widest animate-pulse px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded">PIPELINE ACTIVE...</div>
 ) : (
 <button type="button"
 onClick={() => { setShowProvisionModal(false); setGeneratedCredentials(null); }}
 className="bg-transparent hover:bg-neutral-800 text-themeText border border-themeBorder px-6 py-2.5 font-black tracking-normal rounded-lg transition-colors"
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
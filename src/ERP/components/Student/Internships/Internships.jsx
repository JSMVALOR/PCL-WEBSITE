/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import CLETracker from "./CLETracker";

// --- CACHE HELPERS ---
const CK = { exp: 'int_experiences', noc: 'int_nocs', prac: 'int_practical' };
const readCache = (key, fallback) => {
 try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
 catch { return fallback; }
};
const writeCache = (key, data) => {
 try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// --- SHARED STYLES ---
const INPUT_CLS = "w-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-[2rem] px-4 py-3 text-xs lg:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition";
const LABEL_CLS = "block text-[9px] lg:text-[13px] font-medium text-gray-500 dark:text-white/50 opacity-70 mb-1.5 ml-1";

export default function Internships({}) {
 const { userSession } = useERP();

 // --- MAIN STATE ---
 const [view, setView] = useState("ledger"); // 'ledger', 'noc', 'cle'

 // --- INSTANT STATE FROM CACHE ---
 const [experiences, setExperiences] = useState(() => readCache(CK.exp, []));
 const [nocRequests, setNocRequests] = useState(() => readCache(CK.noc, []));
 const [practicalLogs, setPracticalLogs] = useState(() => readCache(CK.prac, []));

 // --- CARD EXPAND STATE ---
 const [expandedCard, setExpandedCard] = useState(null);

 // --- MODAL STATES ---
 const [showExpModal, setShowExpModal] = useState(false);
 const [showNocModal, setShowNocModal] = useState(false);
 const [showPracModal, setShowPracModal] = useState(false);
 const [showDailyLogModal, setShowDailyLogModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitSuccess, setSubmitSuccess] = useState(false);
 const [shareExpOnSubmit, setShareExpOnSubmit] = useState(true);

 // NOC file ref
 
 const [nocUrl, setNocUrl] = useState('');

 // --- FORM STATES ---
 const [expForm, setExpForm] = useState({ company_name: "", role_title: "", location: "", duration: "", description: "", type: "Corporate", status: "completed", certificate_notes: "" });
 const [nocForm, setNocForm] = useState({ company_name: "", start_date: "", end_date: "" });
 const [pracForm, setPracForm] = useState({ title: "", type: "Court Visit", date_logged: "", hours: "", description: "" });
 const [dailyLogForm, setDailyLogForm] = useState({ experience_id: "", date: "", entry: "" });

 // --- PARALLEL DATA FETCH ---
 const fetchAll = useCallback(async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;

 const [expRes, nocRes, pracRes] = await Promise.allSettled([
 supabase.from('student_experiences').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
 supabase.from('noc_requests').select('*').eq('student_id', studentId).order('applied_on', { ascending: false }),
 supabase.from('practical_training_logs').select('*').eq('student_id', studentId).order('date_logged', { ascending: false })
 ]);

 if (expRes.status === 'fulfilled' && expRes.value.data) {
 setExperiences(expRes.value.data);
 writeCache(CK.exp, expRes.value.data);
 }
 if (nocRes.status === 'fulfilled' && nocRes.value.data) {
 setNocRequests(nocRes.value.data);
 writeCache(CK.noc, nocRes.value.data);
 }
 if (pracRes.status === 'fulfilled' && pracRes.value.data) {
 setPracticalLogs(pracRes.value.data);
 writeCache(CK.prac, pracRes.value.data);
 }
 }, [userSession]);

 useEffect(() => { fetchAll(); }, [fetchAll]);

 // --- SUBMISSION HANDLERS ---
 const handleExpSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { error } = await supabase.from('student_experiences').insert({
 student_id: studentId,
 company_name: expForm.company_name,
 role_title: expForm.role_title,
 location: expForm.location,
 duration: expForm.duration,
 description: expForm.description,
 type: expForm.type,
 status: expForm.status,
 certificate_notes: expForm.certificate_notes || null,
 daily_logs: JSON.stringify([])
 });
 if (error) throw error;
 setSubmitSuccess(true);
 fetchAll();
 
 if (shareExpOnSubmit) {
 shareToLinkedIn(null, expForm);
 }

 setTimeout(() => {
 setShowExpModal(false);
 setSubmitSuccess(false);
 setShareExpOnSubmit(true);
 setExpForm({ company_name: "", role_title: "", location: "", duration: "", description: "", type: "Corporate", status: "completed", certificate_notes: "" });
 }, 2000);
 } catch (err) {
 console.error("Experience log failed:", err);
 window.erpDialog?.alert("Failed to log experience.");
 } finally { setIsSubmitting(false); }
 };

 const handlePrintNoc = (req) => {
 const printWindow = window.open('', '', 'width=800,height=1000');
 printWindow.document.write(`
 <html>
 <head>
 <title>No Objection Certificate - ${userSession?.full_name}</title>
 <style>
 body { font-family: 'Arial', sans-serif; padding: 60px; line-height: 1.8; color: #000; background: #fff; }
 h1 { text-align: center; font-size: 24px; text-decoration: underline; margin-bottom: 40px; text-transform: uppercase; }
 .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #000; padding-bottom: 20px; }
 .header h2 { margin: 0; font-size: 28px; }
 .content { font-size: 16px; text-align: justify; }
 .footer { margin-top: 100px; display: flex; justify-content: space-between; }
 .sig { border-top: 1px solid #000; padding-top: 5px; width: 200px; text-align: center; }
 </style>
 </head>
 <body>
 <div className="header">
 <h2>Prudentia College of Law</h2>
 <p>Office of the Registrar | Career & Placement Cell</p>
 </div>
 <h1>No Objection Certificate (NOC)</h1>
 <div className="content">
 <p>To Whom It May Concern,</p>
 <p>This is to certify that <strong>${userSession?.full_name || 'the student'}</strong> is a bonafide student of Prudentia College of Law.</p>
 <p>The college has <strong>No Objection</strong> to the student pursuing an internship at <strong>${req.company_name}</strong> for the duration of <strong>${req.duration}</strong>.</p>
 <p>This certificate is issued at the request of the student for the specific purpose of the aforementioned internship and does not absolve the student from fulfilling their mandatory academic attendance and examination requirements.</p>
 <p>We wish the student success in their endeavor.</p>
 </div>
 <div className="footer">
 <div className="sig">HOD Signature<br/>(${req.hod_name})</div>
 <div className="sig">Registrar / Dean</div>
 </div>
 <script>
 window.onload = ({ isEmbedded = false }) => { window.print(); };
 </script>
 </body>
 </html>
 `);
 printWindow.document.close();
 };

 const handleNocSubmit = async (e) => {
 e.preventDefault();
 if (!nocUrl) { window.erpDialog?.alert("Google Drive Link is required for NOC."); return; }
 if (!nocUrl.includes('drive.google.com')) { window.erpDialog?.alert("Please enter a valid Google Drive link."); return; }
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { error } = await supabase.from('noc_requests').insert({
 student_id: studentId,
 company_name: nocForm.company_name,
 duration: `${nocForm.start_date} to ${nocForm.end_date}`,
 offer_letter_path: nocUrl,
 status: 'pending_mentor',
 mentor_name: "Assigned Mentor",
 hod_name: "Pending"
 });
 if (error) throw error;
 setSubmitSuccess(true);
 fetchAll();
 setTimeout(() => { setShowNocModal(false); setSubmitSuccess(false); setNocUrl(''); setNocForm({ company_name: "", start_date: "", end_date: "" }); }, 50);
 } catch (err) {
 console.error("NOC failed:", err);
 window.erpDialog?.alert("Failed to route NOC request.");
 } finally { setIsSubmitting(false); }
 };

 const handlePracSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { error } = await supabase.from('practical_training_logs').insert({
 student_id: studentId,
 ...pracForm
 });
 if (error) throw error;
 setSubmitSuccess(true);
 fetchAll();
 setTimeout(() => { setShowPracModal(false); setSubmitSuccess(false); setPracForm({ title: "", type: "Court Visit", date_logged: "", hours: "", description: "" }); }, 50);
 } catch (err) {
 console.error("Practical log failed:", err);
 window.erpDialog?.alert("Failed to log practical hours.");
 } finally { setIsSubmitting(false); }
 };

 const handleDailyLogSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const exp = experiences.find(x => x.id === dailyLogForm.experience_id);
 if (!exp) throw new Error("Experience not found");

 let existingLogs = [];
 try { existingLogs = typeof exp.daily_logs === 'string' ? JSON.parse(exp.daily_logs) : (exp.daily_logs || []); }
 catch { existingLogs = []; }

 const updatedLogs = [...existingLogs, { date: dailyLogForm.date, entry: dailyLogForm.entry, logged_at: new Date().toISOString() }];

 const { error } = await supabase
 .from('student_experiences')
 .update({ daily_logs: JSON.stringify(updatedLogs) })
 .eq('id', dailyLogForm.experience_id);
 if (error) throw error;

 setSubmitSuccess(true);
 fetchAll();
 setTimeout(() => { setShowDailyLogModal(false); setSubmitSuccess(false); setDailyLogForm({ experience_id: "", date: "", entry: "" }); }, 50);
 } catch (err) {
 console.error("Daily log failed:", err);
 window.erpDialog?.alert("Failed to add daily log entry.");
 } finally { setIsSubmitting(false); }
 };

 // --- CALCULATIONS ---
 const totalPracticalHours = practicalLogs.reduce((acc, curr) => acc + parseInt(curr.hours || 0), 0);
 const REQUIRED_HOURS = 100;
 const hoursProgress = Math.min((totalPracticalHours / REQUIRED_HOURS) * 100, 100);

 const shareToLinkedIn = (e, item) => {
 if (e) e.stopPropagation();
 const text = `I'm thrilled to share my latest experience: ${item.role_title} at ${item.company_name}!\n\nType: ${item.type}\nDuration: ${item.duration}\n\n#PCLUniversity #LawSchool #Experience`;
 const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
 window.open(url, '_blank', 'width=800,height=600');
 };

 // --- UI HELPERS ---
 const getTypeTheme = (type) => {
 switch (type) {
 case 'Corporate': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
 case 'Litigation': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
 case 'NGO': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
 case 'Judiciary': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
 case 'Court Visit': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
 case 'Legal Aid Clinic': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
 default: return "bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 border-black/10 dark:border-white/20";
 }
 };

 const TABS = [
 { id: 'ledger', label: 'Experience Ledger', icon: 'fa-history' },
 { id: 'noc', label: 'NOC Requests', icon: 'fa-file-signature' },
 { id: 'cle', label: 'CLE Diaries', icon: 'fa-book-open' }
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-[#1A1A1A] ${!isEmbedded ? "min-h-screen bg-themeApp text-gray-900 dark:text-white" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <PageHeader 
 icon="fa-solid fa-briefcase" 
 title="Internships" 
 subtitle="Track and manage your professional placements." 
 />
 
 {/* ═══════════════ HEADER & TABS ═══════════════ */}
 <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 ${theme.layout.panel} p-6 lg:p-8 rounded-[2rem] backdrop-blur-md`}>
 

 <div className="flex p-1.5 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-[2rem] w-full lg:w-fit overflow-x-auto no-scrollbar min-w-max border border-black/10 dark:border-white/20">
 {TABS.map(tab => (
 <button type="button"
 key={tab.id}
 onClick={() => setView(tab.id)}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === tab.id
 ? theme.action.rowActive + " justify-center"
 : "text-gray-500 dark:text-white/50 opacity-70 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-[#1A1A1A]/50"
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${view === tab.id ? '' : 'opacity-50'}`}></i> <span className="hidden sm:inline">{tab.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* ═══════════════ EXPERIENCE LEDGER ═══════════════ */}
 {view === "ledger" && (
 <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
 
 {/* --- SECTION 1: CORPORATE INTERNSHIPS --- */}
 <div className="flex flex-col gap-6">
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 pb-4">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-gray-900 dark:text-white flex items-center gap-2`}><i className="fa-solid fa-building text-themeAccent"></i> Corporate & External Internships</h2>
 <p className="text-[10px] lg:text-xs text-gray-500 dark:text-white/50 font-medium mt-1">Verified experiences sync to your digital resume.</p>
 </div>
 <button type="button" onClick={() => setShowExpModal(true)} className="px-5 py-2.5 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Log Experience
 </button>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
 {experiences.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-briefcase text-4xl lg:text-5xl text-neutral-600/50 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No experiences logged yet. Build your resume by adding one.</p>
 </div>
 ) : (
 experiences.map((log) => {
 const isExpanded = expandedCard === log.id;
 let dailyLogs = [];
 try { dailyLogs = typeof log.daily_logs === 'string' ? JSON.parse(log.daily_logs) : (log.daily_logs || []); }
 catch { dailyLogs = []; }

 return (
 <div key={log.id} className={`${theme.layout.panel} rounded-[2rem] border-gray-200 dark:border-white/5 ${isExpanded ? 'border-gray-200 dark:border-white/5' : 'border-black/10 dark:border-white/20'} hover:border-gray-200 dark:border-white/5 transition group flex flex-col`}>
 <div className="p-5 lg:p-6 cursor-pointer" onClick={() => setExpandedCard(isExpanded ? null : log.id)}>
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-2">
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-gray-200 dark:border-white/5 ${log.status === 'ongoing' ? 'bg-themeAccent/10 text-themeAccent border-gray-200 dark:border-white/5Accent/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
 {log.status}
 </span>
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-gray-200 dark:border-white/5 ${getTypeTheme(log.type)}`}>
 {log.type}
 </span>
 </div>
 <div className="flex items-center gap-3">
 {log.is_verified && <i className="fa-solid fa-badge-check text-emerald-400" title="Verified"></i>}
 <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
 <i className="fa-solid fa-chevron-down text-[10px]"></i>
 </div>
 </div>
 </div>

 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white tracking-tight leading-tight mb-1 group-hover:text-themeAccent transition-colors">
 {log.role_title}
 </h3>
 <p className="text-xs lg:text-sm font-bold text-gray-500 dark:text-white/50"><i className="fa-regular fa-building mr-1"></i> {log.company_name}</p>

 <div className="flex items-center gap-3 mt-4 text-[9px] lg:text-[10px] font-bold text-gray-500 dark:text-white/50 opacity-80 tracking-normal">
 <span className="flex items-center gap-1.5 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong px-2.5 py-1 rounded-md border border-black/10 dark:border-white/20"><i className="fa-regular fa-calendar text-themeAccent"></i> {log.duration}</span>
 <span className="flex items-center gap-1.5 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong px-2.5 py-1 rounded-md border border-black/10 dark:border-white/20"><i className="fa-solid fa-location-dot text-themeAccent"></i> {log.location}</span>
 </div>
 </div>

 {isExpanded && (
 <div className="border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 animate-fade-in bg-gray-100 dark:bg-[#1A1A1A]/20 rounded-b-themePanel">
 <div className="px-5 lg:px-6 py-5">
 <p className={`text-[12px] font-medium ${theme.text.muted} mb-2`}>Description</p>
 <p className="text-[11px] lg:text-xs text-gray-500 dark:text-white/50 leading-relaxed bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-4 rounded-[2rem] italic">
 "{log.description}"
 </p>
 </div>

 {log.certificate_notes && (
 <div className="px-5 lg:px-6 pb-5">
 <p className={`text-[12px] font-medium text-emerald-400 mb-2`}><i className="fa-solid fa-certificate mr-1"></i> Certificate Notes</p>
 <p className="text-[11px] lg:text-xs text-gray-500 dark:text-white/50 leading-relaxed bg-emerald-500/5 p-4 rounded-[2rem] border-gray-200 dark:border-white/5 border-emerald-500/20">
 {log.certificate_notes}
 </p>
 </div>
 )}

 <div className="px-5 lg:px-6 pb-5">
 <div className="flex items-center justify-between mb-3">
 <p className={`text-[12px] font-medium text-blue-400`}><i className="fa-solid fa-timeline mr-1"></i> Daily Logs ({dailyLogs.length})</p>
 <button type="button" onClick={(e) => { e.stopPropagation(); setDailyLogForm({ experience_id: log.id, date: '', entry: '' }); setShowDailyLogModal(true); }} className="text-[9px] font-black text-themeAccent tracking-normal flex items-center gap-1.5 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong px-3 py-1.5 rounded-md border border-black/10 dark:border-white/20 hover:border-gray-200 dark:border-white/5 hover:bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong transition">
 <i className="fa-solid fa-plus text-[8px]"></i> Add Entry
 </button>
 </div>

 {dailyLogs.length === 0 ? (
 <div className="py-6 text-center bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-[2rem]">
 <i className="fa-regular fa-note-sticky text-xl text-neutral-600/50 mb-2"></i>
 <p className={`text-[10px] ${theme.text.muted}`}>No daily log entries. Keep a journal of your tasks!</p>
 </div>
 ) : (
 <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
 {dailyLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
 <div key={i} className="flex items-start gap-3 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-3.5 rounded-[2rem] hover:border-gray-200 dark:border-white/5 transition-colors">
 <div className="w-7 h-7 rounded-full bg-blue-500/10 border-gray-200 dark:border-white/5 border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
 <i className="fa-solid fa-pen-nib text-blue-400 text-[10px]"></i>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[12px] font-medium text-gray-500 dark:text-white/50 opacity-80 mb-1">
 {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </p>
 <p className="text-[11px] lg:text-xs text-gray-900 dark:text-white font-medium leading-relaxed">{entry.entry}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="px-5 lg:px-6 pb-6 pt-4 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 flex flex-col gap-3 bg-white dark:bg-[#121212]/30">
 <button type="button" onClick={(e) => shareToLinkedIn(e, log)} className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-gray-900 dark:text-white rounded-[2rem] text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 group/btn">
 <i className="fa-brands fa-linkedin text-sm group-hover/btn:scale-110 transition-transform"></i> Share to LinkedIn
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* --- SECTION 2: PRACTICAL TRAINING & COURT VISITS --- */}
 <div className="flex flex-col gap-6">
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 pb-4">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-gray-900 dark:text-white flex items-center gap-2`}><i className="fa-solid fa-scale-balanced text-themeAccent"></i> Practical & Clinical Training</h2>
 <p className="text-[10px] lg:text-xs text-gray-500 dark:text-white/50 font-medium mt-1">Mandatory clinical courses and court visits tracking.</p>
 </div>
 <button type="button" onClick={() => setShowPracModal(true)} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-gray-200 dark:border-white/5 border-emerald-500/20 rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Add Practical Log
 </button>
 </div>

 {/* Progress Panel */}
 <div className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem]`}>
 <div className="flex justify-between items-end mb-3">
 <p className={`text-[9px] lg:text-[10px] font-black text-gray-500 dark:text-white/50 tracking-normal`}><span className="text-themeAccent text-lg lg:text-xl">{totalPracticalHours}</span> / {REQUIRED_HOURS} Hours Logged</p>
 <span className={`text-[12px] font-medium px-2 py-1 rounded border-gray-200 dark:border-white/5 ${hoursProgress >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 border-black/10 dark:border-white/20'}`}>
 {hoursProgress >= 100 ? 'Completed' : 'In Progress'}
 </span>
 </div>
 <div className="h-2.5 lg:h-3 w-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-full overflow-hidden border border-black/10 dark:border-white/20">
 <div className={`h-full rounded-full transition duration-1000 relative overflow-hidden ${hoursProgress >= 100 ? 'bg-emerald-500' : hoursProgress >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${hoursProgress}%` }}>
 <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
 {practicalLogs.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-gavel text-4xl lg:text-5xl text-neutral-600/50 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No practical training hours logged.</p>
 </div>
 ) : (
 practicalLogs.map((log) => (
 <div key={log.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] flex flex-col justify-between hover:border-gray-200 dark:border-white/5 transition group`}>
 <div>
 <div className="flex justify-between items-start mb-4">
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-gray-200 dark:border-white/5 ${getTypeTheme(log.type)}`}>
 {log.type}
 </span>
 <span className="text-[10px] lg:text-[14px] font-medium text-gray-900 dark:text-white bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong px-3 py-1 rounded-md border border-black/10 dark:border-white/20">{log.hours} Hours</span>
 </div>
 <h3 className="text-base lg:text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-1.5 group-hover:text-themeAccent transition-colors">{log.title}</h3>
 <p className={`text-[8px] lg:text-[9px] font-bold text-gray-500 dark:text-white/50 opacity-70 tracking-normal mb-4`}><i className="fa-regular fa-calendar mr-1"></i> {new Date(log.date_logged).toLocaleDateString('en-GB')}</p>
 <p className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-[#1A1A1A]/50 p-3 lg:p-4 rounded-[2rem] border-l-2 border-gray-200 dark:border-white/5Accent italic leading-relaxed line-clamp-3">
 "{log.description}"
 </p>
 </div>
 <div className="mt-5 pt-4 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 flex items-center justify-between">
 <span className={`text-[8px] lg:text-[12px] font-medium px-2.5 py-1.5 rounded-lg border-gray-200 dark:border-white/5 ${log.is_verified ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
 <i className={`fa-solid ${log.is_verified ? 'fa-check-circle' : 'fa-clock'} mr-1`}></i> {log.is_verified ? 'Verified' : 'Pending Verification'}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}

 {/* ═══════════════ NOC REQUESTS ═══════════════ */}
 {view === "noc" && (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
 <div className="flex justify-between items-center border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 pb-4 px-2">
 <div>
 <h2 className={`${theme.text.heading} text-xl lg:text-2xl text-gray-900 dark:text-white tracking-tight`}>Active NOC Requests</h2>
 <p className="text-[10px] lg:text-xs text-gray-500 dark:text-white/50 font-medium mt-1">Official permissions for internships.</p>
 </div>
 <button type="button" onClick={() => setShowNocModal(true)} className="text-[10px] lg:text-[14px] font-medium text-themePanel bg-themeText tracking-normal flex items-center gap-2 px-5 py-2.5 rounded-[2rem] transition active:scale-[0.98] hover:bg-themeText/90">
 <i className="fa-solid fa-paper-plane"></i> <span className="hidden sm:inline">New Request</span>
 </button>
 </div>

 <div className="flex flex-col gap-4 lg:gap-5">
 {nocRequests.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-file-signature text-4xl lg:text-5xl text-neutral-600/50 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No NOC requests found.</p>
 </div>
 ) : (
 nocRequests.map((req) => (
 <div key={req.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-gray-200 dark:border-white/5 transition group`}>
 <div className="flex-1">
 <h3 className="text-base lg:text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-themeAccent transition-colors">{req.company_name}</h3>
 <p className={`text-[10px] lg:text-xs font-bold text-gray-500 dark:text-white/50 mb-3 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong px-3 py-1.5 rounded-lg w-fit`}><i className="fa-regular fa-calendar mr-1.5 text-themeAccent"></i> {req.duration}</p>
 <p className={`text-[8px] lg:text-[12px] font-medium text-gray-500 dark:text-white/50 opacity-70`}>Applied: {new Date(req.applied_on).toLocaleDateString('en-GB')}</p>
 </div>

 {/* Approval Pipeline */}
 <div className="w-full lg:w-auto bg-gray-100 dark:bg-[#1A1A1A]/50 border border-black/10 dark:border-white/20 rounded-[2rem] p-4 flex items-center justify-between sm:justify-center gap-3 sm:gap-6 shrink-0">
 <div className="flex flex-col items-center gap-2 w-20 text-center">
 <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] lg:text-xs border-2 transition-colors ${req.status === 'approved' || req.status === 'pending_hod'
 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
 : 'bg-amber-500/10 border-amber-500 text-amber-400'
 }`}>
 <i className={`fa-solid ${req.status === 'approved' || req.status === 'pending_hod' ? 'fa-check' : 'fa-hourglass-half'}`}></i>
 </div>
 <p className="text-[8px] lg:text-[12px] font-medium text-gray-900 dark:text-white">Mentor</p>
 </div>
 <div className={`w-8 sm:w-16 lg:w-20 h-0.5 -mt-6 transition-colors duration-500 ${req.status === 'approved' || req.status === 'pending_hod' ? 'bg-emerald-500' : 'bg-themeBorderStrong'}`}></div>
 <div className="flex flex-col items-center gap-2 w-20 text-center">
 <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] lg:text-xs border-2 transition-colors ${req.status === 'approved'
 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
 : req.status === 'pending_hod' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong border-gray-200 dark:border-white/5 text-neutral-600'
 }`}>
 <i className={`fa-solid ${req.status === 'approved' ? 'fa-check' : req.status === 'pending_hod' ? 'fa-hourglass-half' : 'fa-lock'}`}></i>
 </div>
 <p className={`text-[8px] lg:text-[12px] font-medium ${req.status === 'approved' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50 opacity-70'}`}>HOD</p>
 </div>
 </div>

 {/* Download */}
 <div className="w-full lg:w-auto shrink-0 flex items-center justify-center">
 {req.status === 'approved' ? (
 <button type="button" onClick={() => handlePrintNoc(req)} className="w-full lg:w-auto bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-gray-200 dark:border-white/5 border-emerald-500/20 px-6 py-3.5 rounded-[2rem] text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2">
 <i className="fa-solid fa-print text-lg"></i> Print NOC
 </button>
 ) : (
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} disabled className="w-full lg:w-auto bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 opacity-50 border border-black/10 dark:border-white/20 px-6 py-3.5 rounded-[2rem] text-[13px] font-medium cursor-not-allowed flex items-center justify-center gap-2">
 <i className="fa-solid fa-lock"></i> Locked
 </button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* ═══════════════ CLE DIARIES ═══════════════ */}
 {view === "cle" && (
 <div className="animate-fade-in">
 <CLETracker />
 </div>
 )}

 {/* ═══════════════ MODALS ═══════════════ */}

 {/* A. LOG EXPERIENCE MODAL */}
 {showExpModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowExpModal(false)}>
 <div className="bg-transparent w-full max-w-xl rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-5 lg:p-6 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white tracking-tight mb-1">Log Legal Experience</h3>
 <p className="text-[10px] lg:text-xs text-emerald-400 font-bold tracking-normal"><i className="fa-solid fa-link mr-1"></i> Will sync to CV Builder</p>
 </div>
 <button type="button" onClick={() => setShowExpModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleExpSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div><label className={LABEL_CLS}>Company / Firm</label><input type="text" value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })} className={INPUT_CLS} required /></div>
 <div><label className={LABEL_CLS}>Role Title</label><input type="text" value={expForm.role_title} onChange={e => setExpForm({ ...expForm, role_title: e.target.value })} className={INPUT_CLS} placeholder="e.g. Legal Intern" required /></div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div><label className={LABEL_CLS}>Location</label><input type="text" value={expForm.location} onChange={e => setExpForm({ ...expForm, location: e.target.value })} className={INPUT_CLS} placeholder="e.g. New Delhi" required /></div>
 <div><label className={LABEL_CLS}>Duration</label><input type="text" value={expForm.duration} onChange={e => setExpForm({ ...expForm, duration: e.target.value })} className={INPUT_CLS} placeholder="e.g. Jun 2025 - Jul 2025" required /></div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label className={LABEL_CLS}>Type</label>
 <div className="relative">
 <select value={expForm.type} onChange={e => setExpForm({ ...expForm, type: e.target.value })} className={`${INPUT_CLS} appearance-none cursor-pointer`}>
 <option>Corporate</option><option>Litigation</option><option>NGO</option><option>Judiciary</option><option>Research</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none text-xs"></i>
 </div>
 </div>
 <div>
 <label className={LABEL_CLS}>Status</label>
 <div className="relative">
 <select value={expForm.status} onChange={e => setExpForm({ ...expForm, status: e.target.value })} className={`${INPUT_CLS} appearance-none cursor-pointer`}>
 <option value="completed">Completed</option><option value="ongoing">Ongoing</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none text-xs"></i>
 </div>
 </div>
 </div>
 <div><label className={LABEL_CLS}>Description (For CV)</label><textarea rows="3" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Describe your responsibilities and achievements..." required></textarea></div>
 <div><label className={LABEL_CLS}><i className="fa-solid fa-certificate mr-1 text-emerald-400"></i> Certificate Notes (Optional)</label><textarea rows="2" value={expForm.certificate_notes} onChange={e => setExpForm({ ...expForm, certificate_notes: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Type certificate details, completion notes, or reference info..."></textarea></div>
 
 <div className="flex items-center gap-3 bg-[#0a66c2]/10 p-4 rounded-[2rem] border-gray-200 dark:border-white/5 border-[#0a66c2]/20 cursor-pointer hover:bg-[#0a66c2]/20 transition-colors" onClick={() => setShareExpOnSubmit(!shareExpOnSubmit)}>
 <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${shareExpOnSubmit ? 'bg-[#0a66c2] text-gray-900 dark:text-white' : 'bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong'}`}>
 {shareExpOnSubmit && <i className="fa-solid fa-check text-xs"></i>}
 </div>
 <div>
 <p className="text-xs font-bold text-[#0a66c2] leading-none mb-1.5"><i className="fa-brands fa-linkedin mr-1"></i> Draft LinkedIn Post</p>
 <p className={`text-[10px] text-[#0a66c2]/70 leading-none font-bold`}>Automatically open LinkedIn to share your success</p>
 </div>
 </div>

 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-gray-200 dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Experience Logged</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Writing to Ledger..." : "Log Experience"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* B. NOC MODAL */}
 {showNocModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowNocModal(false)}>
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-5 lg:p-6 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white tracking-tight mb-1">Request NOC</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.secondary}`}>Will be routed directly to your assigned mentor.</p>
 </div>
 <button type="button" onClick={() => setShowNocModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleNocSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div><label className={LABEL_CLS}>Company / Firm Name</label><input type="text" value={nocForm.company_name} onChange={e => setNocForm({ ...nocForm, company_name: e.target.value })} className={INPUT_CLS} required /></div>
 <div className="grid grid-cols-2 gap-5">
 <div><label className={LABEL_CLS}>Start Date</label><input min="2026-09-14" type="date" value={nocForm.start_date} onChange={e => setNocForm({ ...nocForm, start_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required /></div>
 <div><label className={LABEL_CLS}>End Date</label><input min="2026-09-14" type="date" value={nocForm.end_date} onChange={e => setNocForm({ ...nocForm, end_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required /></div>
 </div>
 <div>
 <label className={LABEL_CLS}>Google Drive Link to Offer Letter (Required)</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
 <i className="fa-brands fa-google-drive text-gray-500 dark:text-white/50"></i>
 </div>
 <input 
 type="url" 
 placeholder="https://drive.google.com/file/d/.../view" 
 value={nocUrl} 
 onChange={e => setNocUrl(e.target.value)} 
 className={`${INPUT_CLS} pl-11`} 
 required 
 />
 </div>
 <p className="text-[9px] text-gray-500 dark:text-white/50 mt-2"><i className="fa-solid fa-circle-info mr-1"></i> Ensure the link is set to "Anyone with the link can view"</p>
 </div>
 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-gray-200 dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> NOC Routed to Mentor</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Routing to Mentor..." : "Submit NOC Request"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* C. PRACTICAL LOG MODAL */}
 {showPracModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowPracModal(false)}>
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-5 lg:p-6 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white tracking-tight mb-1">Add Practical Log</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.secondary}`}>Log hours for mandatory clinical courses.</p>
 </div>
 <button type="button" onClick={() => setShowPracModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handlePracSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div className="grid grid-cols-2 gap-5">
 <div>
 <label className={LABEL_CLS}>Type</label>
 <div className="relative">
 <select value={pracForm.type} onChange={e => setPracForm({ ...pracForm, type: e.target.value })} className={`${INPUT_CLS} appearance-none cursor-pointer`}>
 <option>Court Visit</option><option>Legal Aid Clinic</option><option>Chamber Observation</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none text-xs"></i>
 </div>
 </div>
 <div><label className={LABEL_CLS}>Hours</label><input type="number" min="1" max="24" value={pracForm.hours} onChange={e => setPracForm({ ...pracForm, hours: e.target.value })} className={INPUT_CLS} required /></div>
 </div>
 <div><label className={LABEL_CLS}>Location / Institution</label><input type="text" value={pracForm.title} onChange={e => setPracForm({ ...pracForm, title: e.target.value })} className={INPUT_CLS} placeholder="e.g. High Court of AP" required /></div>
 <div><label className={LABEL_CLS}>Date</label><input min="2026-09-14" type="date" value={pracForm.date_logged} onChange={e => setPracForm({ ...pracForm, date_logged: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required /></div>
 <div><label className={LABEL_CLS}>Observations</label><textarea rows="3" value={pracForm.description} onChange={e => setPracForm({ ...pracForm, description: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="What did you observe or do?" required></textarea></div>
 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-gray-200 dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Practical Hours Logged</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050505] rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Logging..." : "Submit Practical Log"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* D. DAILY LOG MODAL */}
 {showDailyLogModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowDailyLogModal(false)}>
 <div className="bg-transparent w-full max-w-md rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong p-5 lg:p-6 border-gray-200 dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white tracking-tight mb-1">Add Daily Log Entry</h3>
 <p className={`text-[10px] lg:text-xs text-blue-400 font-bold tracking-normal`}><i className="fa-solid fa-timeline mr-1"></i> Internship Journal</p>
 </div>
 <button type="button" onClick={() => setShowDailyLogModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-gray-200 dark:border-white/5 border-gray-200 dark:border-white/5BorderStrong text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleDailyLogSubmit} className="p-5 lg:p-6 flex flex-col gap-5">
 <div><label className={LABEL_CLS}>Date</label><input min="2026-09-14" type="date" value={dailyLogForm.date} onChange={e => setDailyLogForm({ ...dailyLogForm, date: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required /></div>
 <div><label className={LABEL_CLS}>What did you do today?</label><textarea rows="4" value={dailyLogForm.entry} onChange={e => setDailyLogForm({ ...dailyLogForm, entry: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Describe the work, cases reviewed, tasks completed..." required></textarea></div>
 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-gray-200 dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Entry Added</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Saving..." : "Add Log Entry"}</button>
 )}
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
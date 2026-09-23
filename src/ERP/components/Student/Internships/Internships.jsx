/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import CLETracker from "./CLETracker";

// --- CACHE HELPERS ---
const CK = { exp: 'int_experiences', noc: 'int_perms', prac: 'int_practical' };
const readCache = (key, fallback) => {
 try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
 catch { return fallback; }
};
const writeCache = (key, data) => {
 try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// --- COMPRESSION HELPERS (Under 2KB Goal) ---
const uint8ToBase64 = (u8Arr) => {
    let CHUNK_SIZE = 0x8000;
    let index = 0;
    let result = '';
    while (index < u8Arr.length) {
        result += String.fromCharCode.apply(null, u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, u8Arr.length)));
        index += CHUNK_SIZE;
    }
    return btoa(result);
};

const LZW = {
    compress: (uncompressed) => {
        if (!uncompressed) return "";
        const dict = new Map();
        for (let i = 0; i < 256; i++) dict.set(String.fromCharCode(i), i);
        let c = uncompressed.charAt(0);
        let res = [];
        let dictSize = 256;
        for (let i = 1; i < uncompressed.length; i++) {
            let wc = c + uncompressed.charAt(i);
            if (dict.has(wc)) c = wc;
            else {
                res.push(dict.get(c));
                dict.set(wc, dictSize++);
                c = String(uncompressed.charAt(i));
            }
        }
        if (c !== "") res.push(dict.get(c));
        return uint8ToBase64(new Uint8Array(new Uint16Array(res).buffer));
    },
    decompress: (compressedBase64) => {
        if (!compressedBase64) return "";
        try {
            const buffer = new Uint16Array(Uint8Array.from(atob(compressedBase64), c => c.charCodeAt(0)).buffer);
            const compressed = Array.from(buffer);
            const dict = new Map();
            for (let i = 0; i < 256; i++) dict.set(i, String.fromCharCode(i));
            let w = String.fromCharCode(compressed[0]);
            let res = w;
            let dictSize = 256;
            for (let i = 1; i < compressed.length; i++) {
                let entry = "";
                const k = compressed[i];
                if (dict.has(k)) entry = dict.get(k);
                else if (k === dictSize) entry = w + w.charAt(0);
                else return null;
                res += entry;
                dict.set(dictSize++, w + entry.charAt(0));
                w = entry;
            }
            return res;
        } catch { return compressedBase64; } 
    }
};

const packLogs = (logs) => {
    const tuples = logs.map(l => [l.date, l.entry, l.logged_at]);
    return "LZW:" + LZW.compress(JSON.stringify(tuples));
};

const unpackLogs = (packed) => {
    if (!packed) return [];
    if (typeof packed !== 'string') return packed;
    let rawJson = packed;
    if (packed.startsWith("LZW:")) {
        rawJson = LZW.decompress(packed.slice(4));
    }
    try {
        const parsed = JSON.parse(rawJson);
        return parsed.map(item => Array.isArray(item) ? { date: item[0], entry: item[1], logged_at: item[2] } : item);
    } catch { return []; }
};

// --- SHARED STYLES ---
const INPUT_CLS = "w-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-[2rem] px-4 py-3 text-xs lg:text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeBorder dark:border-white/5Accent transition";
const LABEL_CLS = "block text-[9px] lg:text-[13px] font-medium text-themeTextSec dark:text-white/50 opacity-70 mb-1.5 ml-1";

export default function Internships({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- MAIN STATE ---
 const [view, setView] = useState("ledger"); // 'ledger', 'noc', 'cle'

 // --- INSTANT STATE FROM CACHE ---
 const [experiences, setExperiences] = useState(() => readCache(CK.exp, []));
 const [permissions, setPermissions] = useState(() => readCache(CK.noc, []));
 const [practicalLogs, setPracticalLogs] = useState(() => readCache(CK.prac, []));

 // --- CARD EXPAND STATE ---
 const [expandedCard, setExpandedCard] = useState(null);

 // --- MODAL STATES ---
 const [showExpModal, setShowExpModal] = useState(false);
 const [showPermModal, setShowPermModal] = useState(false);
 const [showPracModal, setShowPracModal] = useState(false);
 const [showDailyLogModal, setShowDailyLogModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitSuccess, setSubmitSuccess] = useState(false);
 const [shareExpOnSubmit, setShareExpOnSubmit] = useState(true);
 const [showLinkedInDraftModal, setShowLinkedInDraftModal] = useState(false);
 const [linkedInDraftText, setLinkedInDraftText] = useState('');

 // NOC file ref
 
 const [permUrl, setPermUrl] = useState('');

 // --- FORM STATES ---
 const [expForm, setExpForm] = useState({ company_name: "", role_title: "", location: "", start_date: "", end_date: "", description: "", type: "Corporate", status: "completed", certificate_notes: "" });
 const [permForm, setPermForm] = useState({ company_name: "", start_date: "", end_date: "" });
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
 setPermissions(nocRes.value.data);
 writeCache(CK.noc, nocRes.value.data);
 }
 if (pracRes.status === 'fulfilled' && pracRes.value.data) {
 setPracticalLogs(pracRes.value.data);
 writeCache(CK.prac, pracRes.value.data);
 }
 }, [userSession]);

 useEffect(() => { fetchAll(); }, [fetchAll]);

 const calculateWeeks = (start, end) => {
 if (!start || !end) return 0;
 const s = new Date(start);
 const e = new Date(end);
 if (s > e) return 0;
 return Math.round((e - s) / (1000 * 60 * 60 * 24 * 7));
 };

 const generateLinkedInDraft = (exp) => {
 const durationStr = `${calculateWeeks(exp.start_date, exp.end_date)} Weeks`;
 return `I'm thrilled to share my latest experience as a ${exp.role_title} at ${exp.company_name}!\n\nOver the course of ${durationStr}, I had the opportunity to dive deep into the legal industry.\n\nKey takeaways:\n${exp.description}\n\n#PCLUniversity #LawSchool #Internship #${exp.type.replace(/\s+/g, '')} #LegalExperience`;
 };

 // --- SUBMISSION HANDLERS ---
 const handleExpSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 
 const weeks = calculateWeeks(expForm.start_date, expForm.end_date);
 const shortStart = new Date(expForm.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
 const shortEnd = new Date(expForm.end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
 const durationStr = `${weeks} Weeks (${shortStart} - ${shortEnd})`;

 const { error } = await supabase.from('student_experiences').insert({
 student_id: studentId,
 company_name: expForm.company_name,
 role_title: expForm.role_title,
 location: expForm.location,
 duration: durationStr,
 description: expForm.description,
 type: expForm.type,
 status: expForm.status,
 certificate_notes: expForm.certificate_notes || null,
 daily_logs: packLogs([])
 });
 if (error) throw error;
 setSubmitSuccess(true);
 fetchAll();
 
 if (shareExpOnSubmit) {
 setLinkedInDraftText(generateLinkedInDraft(expForm));
 setShowLinkedInDraftModal(true);
 }

 setTimeout(() => {
 setShowExpModal(false);
 setSubmitSuccess(false);
 setExpForm({ company_name: "", role_title: "", location: "", start_date: "", end_date: "", description: "", type: "Corporate", status: "completed", certificate_notes: "" });
 }, 1500);
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

 const handlePermSubmit = async (e) => {
 e.preventDefault();
 if (!permUrl) { window.erpDialog?.alert("Google Drive Link is required."); return; }
 if (!permUrl.includes('drive.google.com')) { window.erpDialog?.alert("Please enter a valid Google Drive link."); return; }
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const { error } = await supabase.from('noc_requests').insert({
 student_id: studentId,
 company_name: permForm.company_name,
 duration: `${permForm.start_date} to ${permForm.end_date}`,
 offer_letter_path: permUrl,
 status: 'pending_mentor',
 mentor_name: "Assigned Mentor",
 hod_name: "Pending"
 });
 if (error) throw error;
 setSubmitSuccess(true);
 fetchAll();
 setTimeout(() => { setShowPermModal(false); setSubmitSuccess(false); setPermUrl(''); setPermForm({ company_name: "", start_date: "", end_date: "" }); }, 50);
 } catch (err) {
 console.error("Permission request failed:", err);
 window.erpDialog?.alert("Failed to route Permission request.");
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

 let existingLogs = unpackLogs(exp.daily_logs);

 const updatedLogs = [...existingLogs, { date: dailyLogForm.date, entry: dailyLogForm.entry, logged_at: new Date().toISOString() }];

 const { error } = await supabase
 .from('student_experiences')
 .update({ daily_logs: packLogs(updatedLogs) })
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
 const text = item.draft || `I'm thrilled to share my latest experience: ${item.role_title} at ${item.company_name}!\n\nType: ${item.type}\nDuration: ${item.duration}\n\n#PCLUniversity #LawSchool #Experience`;
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
 default: return "bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 border-black/10 dark:border-white/20";
 }
 };

 const TABS = [
 { id: 'ledger', label: 'Experience Ledger', icon: 'fa-history' },
 { id: 'cle', label: 'CLE Diaries', icon: 'fa-book-open' }
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-white" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 <PageHeader 
 icon="fa-solid fa-briefcase" 
 title="Internships" 
 subtitle="Track and manage your professional placements." 
 />
 
 {/* ═══════════════ HEADER & TABS ═══════════════ */}
 <div className="flex p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar min-w-max shadow-sm">
 {TABS.map(tab => (
 <button type="button"
 key={tab.id}
 onClick={() => setView(tab.id)}
 className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${view === tab.id
 ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white"
 : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${view === tab.id ? '' : 'opacity-50'}`}></i> <span className="hidden sm:inline">{tab.label}</span>
 </button>
 ))}
 </div>

 {/* ═══════════════ EXPERIENCE LEDGER ═══════════════ */}
 {view === "ledger" && (
 <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in">
 
 {/* --- SECTION 1: CORPORATE INTERNSHIPS --- */}
 <div className="flex flex-col gap-6">
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 pb-4">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText dark:text-white flex items-center gap-2`}><i className="fa-solid fa-building text-themeAccent"></i> Corporate & External Internships</h2>
 <p className="text-[10px] lg:text-xs text-themeTextSec dark:text-white/50 font-medium mt-1">Verified experiences sync to your digital resume.</p>
 </div>
 <div className="flex items-center gap-3">
 <button type="button" onClick={() => setShowPermModal(true)} className="px-5 py-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-paper-plane"></i> Apply Permission
 </button>
 <button type="button" onClick={() => setShowExpModal(true)} className="px-5 py-2.5 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Log Experience
 </button>
 </div>
 </div>
 
 {permissions.length > 0 && (
 <div className="flex flex-col gap-4 mb-4 mt-2">
 <h3 className="text-sm font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest"><i className="fa-solid fa-paper-plane mr-1.5 text-blue-500"></i> Active Applications</h3>
 <div className="flex flex-col gap-3">
 {permissions.map(p => (
 <div key={p.id} className="bg-themePanel dark:bg-white/5 border-themeBorder dark:border-white/5 p-4 rounded-2xl border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h4 className="text-sm font-bold text-themeText dark:text-white">{p.company_name}</h4>
 <p className="text-[10px] lg:text-xs text-themeTextSec dark:text-white/50 font-medium">{p.duration}</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${p.status === 'approved_by_mentor' || p.status === 'approved_by_admin' || p.status === 'approved' ? 'bg-emerald-500' : p.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></div>
 <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest ${p.status === 'approved_by_mentor' || p.status === 'approved_by_admin' || p.status === 'approved' ? 'text-emerald-500' : p.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
 {p.status.replace(/_/g, ' ')}
 </span>
 </div>
 {(p.status === 'approved_by_mentor' || p.status === 'approved_by_admin' || p.status === 'approved') && (
 <button type="button" onClick={() => handlePrintNoc(p)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
 <i className="fa-solid fa-print"></i> NOC
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
 {experiences.length === 0 ? (
 <div className="w-full py-10 lg:py-12 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-briefcase text-4xl lg:text-5xl text-neutral-600/50 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No experiences logged yet. Build your resume by adding one.</p>
 </div>
 ) : (
 experiences.map((log) => {
 const isExpanded = expandedCard === log.id;
 let dailyLogs = unpackLogs(log.daily_logs);

 return (
 <div key={log.id} className={`${theme.layout.panel} rounded-[2rem] border-themeBorder dark:border-white/5 ${isExpanded ? 'border-themeBorder dark:border-white/5' : 'border-black/10 dark:border-white/20'} hover:border-themeBorder dark:border-white/5 transition group flex flex-col`}>
 <div className="p-5 lg:p-6 cursor-pointer" onClick={() => setExpandedCard(isExpanded ? null : log.id)}>
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-2">
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-themeBorder dark:border-white/5 ${log.status === 'ongoing' ? 'bg-themeAccent/10 text-themeAccent border-themeBorder dark:border-white/5Accent/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
 {log.status}
 </span>
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-themeBorder dark:border-white/5 ${getTypeTheme(log.type)}`}>
 {log.type}
 </span>
 </div>
 <div className="flex items-center gap-3">
 {log.is_verified && <i className="fa-solid fa-badge-check text-emerald-400" title="Verified"></i>}
 <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
 <i className="fa-solid fa-chevron-down text-[10px]"></i>
 </div>
 </div>
 </div>

 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight leading-tight mb-1 group-hover:text-themeAccent transition-colors">
 {log.role_title}
 </h3>
 <p className="text-xs lg:text-sm font-bold text-themeTextSec dark:text-white/50"><i className="fa-regular fa-building mr-1"></i> {log.company_name}</p>

 <div className="flex items-center gap-3 mt-4 text-[9px] lg:text-[10px] font-bold text-themeTextSec dark:text-white/50 opacity-80 tracking-normal">
 <span className="flex items-center gap-1.5 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong px-2.5 py-1 rounded-md border border-black/10 dark:border-white/20"><i className="fa-regular fa-calendar text-themeAccent"></i> {log.duration}</span>
 <span className="flex items-center gap-1.5 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong px-2.5 py-1 rounded-md border border-black/10 dark:border-white/20"><i className="fa-solid fa-location-dot text-themeAccent"></i> {log.location}</span>
 </div>
 </div>

 {isExpanded && (
 <div className="border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 animate-fade-in bg-gray-100 dark:bg-themeApp/20 rounded-b-themePanel">
 <div className="px-5 lg:px-6 py-5">
 <p className={`text-[12px] font-medium ${theme.text.muted} mb-2`}>Description</p>
 <p className="text-[11px] lg:text-xs text-themeTextSec dark:text-white/50 leading-relaxed bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-4 rounded-[2rem] italic">
 "{log.description}"
 </p>
 </div>

 {log.certificate_notes && (
 <div className="px-5 lg:px-6 pb-5">
 <p className={`text-[12px] font-medium text-emerald-400 mb-2`}><i className="fa-solid fa-certificate mr-1"></i> Certificate Notes</p>
 <p className="text-[11px] lg:text-xs text-themeTextSec dark:text-white/50 leading-relaxed bg-emerald-500/5 p-4 rounded-[2rem] border-themeBorder dark:border-white/5 border-emerald-500/20">
 {log.certificate_notes}
 </p>
 </div>
 )}

 <div className="px-5 lg:px-6 pb-5">
 <div className="flex items-center justify-between mb-3">
 <p className={`text-[12px] font-medium text-blue-400`}><i className="fa-solid fa-timeline mr-1"></i> Daily Logs ({dailyLogs.length})</p>
 <button type="button" onClick={(e) => { e.stopPropagation(); setDailyLogForm({ experience_id: log.id, date: '', entry: '' }); setShowDailyLogModal(true); }} className="text-[9px] font-black text-themeAccent tracking-normal flex items-center gap-1.5 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong px-3 py-1.5 rounded-md border border-black/10 dark:border-white/20 hover:border-themeBorder dark:border-white/5 hover:bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong transition">
 <i className="fa-solid fa-plus text-[8px]"></i> Add Entry
 </button>
 </div>

 {dailyLogs.length === 0 ? (
 <div className="py-6 text-center bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-[2rem]">
 <i className="fa-regular fa-note-sticky text-xl text-neutral-600/50 mb-2"></i>
 <p className={`text-[10px] ${theme.text.muted}`}>No daily log entries. Keep a journal of your tasks!</p>
 </div>
 ) : (
 <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
 {dailyLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
 <div key={i} className="flex items-start gap-3 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-3.5 rounded-[2rem] hover:border-themeBorder dark:border-white/5 transition-colors">
 <div className="w-7 h-7 rounded-full bg-blue-500/10 border-themeBorder dark:border-white/5 border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
 <i className="fa-solid fa-pen-nib text-blue-400 text-[10px]"></i>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[12px] font-medium text-themeTextSec dark:text-white/50 opacity-80 mb-1">
 {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
 </p>
 <p className="text-[11px] lg:text-xs text-themeText dark:text-white font-medium leading-relaxed">{entry.entry}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="px-5 lg:px-6 pb-6 pt-4 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 flex flex-col gap-3 bg-white dark:bg-[#121212]/30">
 <button type="button" onClick={(e) => shareToLinkedIn(e, log)} className="w-full py-3 bg-[#0a66c2] hover:bg-[#004182] text-themeText dark:text-white rounded-[2rem] text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 group/btn">
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
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 pb-4">
 <div>
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText dark:text-white flex items-center gap-2`}><i className="fa-solid fa-scale-balanced text-themeAccent"></i> Practical & Clinical Training</h2>
 <p className="text-[10px] lg:text-xs text-themeTextSec dark:text-white/50 font-medium mt-1">Mandatory clinical courses and court visits tracking.</p>
 </div>
 <button type="button" onClick={() => setShowPracModal(true)} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-themeBorder dark:border-white/5 border-emerald-500/20 rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Add Practical Log
 </button>
 </div>

 {/* Progress Panel */}
 <div className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem]`}>
 <div className="flex justify-between items-end mb-3">
 <p className={`text-[9px] lg:text-[10px] font-black text-themeTextSec dark:text-white/50 tracking-normal`}><span className="text-themeAccent text-lg lg:text-xl">{totalPracticalHours}</span> / {REQUIRED_HOURS} Hours Logged</p>
 <span className={`text-[12px] font-medium px-2 py-1 rounded border-themeBorder dark:border-white/5 ${hoursProgress >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 border-black/10 dark:border-white/20'}`}>
 {hoursProgress >= 100 ? 'Completed' : 'In Progress'}
 </span>
 </div>
 <div className="h-2.5 lg:h-3 w-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-full overflow-hidden border border-black/10 dark:border-white/20">
 <div className={`h-full rounded-full transition duration-1000 relative overflow-hidden ${hoursProgress >= 100 ? 'bg-emerald-500' : hoursProgress >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${hoursProgress}%` }}>
 <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
 {practicalLogs.length === 0 ? (
 <div className="w-full py-10 lg:py-12 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-gavel text-4xl lg:text-5xl text-neutral-600/50 mb-4"></i>
 <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No practical training hours logged.</p>
 </div>
 ) : (
 practicalLogs.map((log) => (
 <div key={log.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-[2rem] flex flex-col justify-between hover:border-themeBorder dark:border-white/5 transition group`}>
 <div>
 <div className="flex justify-between items-start mb-4">
 <span className={`px-2.5 py-1 rounded-md text-[8px] lg:text-[12px] font-medium border-themeBorder dark:border-white/5 ${getTypeTheme(log.type)}`}>
 {log.type}
 </span>
 <span className="text-[10px] lg:text-[14px] font-medium text-themeText dark:text-white bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong px-3 py-1 rounded-md border border-black/10 dark:border-white/20">{log.hours} Hours</span>
 </div>
 <h3 className="text-base lg:text-lg font-semibold tracking-tight text-themeText dark:text-white mb-1.5 group-hover:text-themeAccent transition-colors">{log.title}</h3>
 <p className={`text-[8px] lg:text-[9px] font-bold text-themeTextSec dark:text-white/50 opacity-70 tracking-normal mb-4`}><i className="fa-regular fa-calendar mr-1"></i> {new Date(log.date_logged).toLocaleDateString('en-GB')}</p>
 <p className="text-[10px] lg:text-xs font-medium text-themeTextSec dark:text-white/50 bg-gray-100 dark:bg-themeApp/50 p-3 lg:p-4 rounded-[2rem] border-l-2 border-themeBorder dark:border-white/5Accent italic leading-relaxed line-clamp-3">
 "{log.description}"
 </p>
 </div>
 <div className="mt-5 pt-4 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 flex items-center justify-between">
 <span className={`text-[8px] lg:text-[12px] font-medium px-2.5 py-1.5 rounded-lg border-themeBorder dark:border-white/5 ${log.is_verified ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
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
 <div className="bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-5 lg:p-6 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight mb-1">Log Legal Experience</h3>
 <p className="text-[10px] lg:text-xs text-emerald-400 font-bold tracking-normal"><i className="fa-solid fa-link mr-1"></i> Will sync to CV Builder</p>
 </div>
 <button type="button" onClick={() => setShowExpModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleExpSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div><label className={LABEL_CLS}>Company / Firm</label><input type="text" value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })} className={INPUT_CLS} required /></div>
 <div><label className={LABEL_CLS}>Role Title</label><input type="text" value={expForm.role_title} onChange={e => setExpForm({ ...expForm, role_title: e.target.value })} className={INPUT_CLS} placeholder="e.g. Legal Intern" required /></div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
 <div className="sm:col-span-1"><label className={LABEL_CLS}>Location</label><input type="text" value={expForm.location} onChange={e => setExpForm({ ...expForm, location: e.target.value })} className={INPUT_CLS} placeholder="e.g. New Delhi" required /></div>
 <div className="sm:col-span-1"><label className={LABEL_CLS}>Start Date</label><input type="date" value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:light] dark:[color-scheme:dark]`} required /></div>
 <div className="sm:col-span-1"><label className={LABEL_CLS}>End Date</label><input type="date" value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:light] dark:[color-scheme:dark]`} required /></div>
 </div>
 {(expForm.start_date && expForm.end_date) && (
 <p className="text-xs text-blue-500 font-medium -mt-2 tracking-normal text-right"><i className="fa-solid fa-calculator mr-1"></i>Duration: {calculateWeeks(expForm.start_date, expForm.end_date)} Weeks</p>
 )}
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
 
 <div className="flex items-center gap-3 bg-[#0a66c2]/10 p-4 rounded-[2rem] border-themeBorder dark:border-white/5 border-[#0a66c2]/20 cursor-pointer hover:bg-[#0a66c2]/20 transition-colors" onClick={() => setShareExpOnSubmit(!shareExpOnSubmit)}>
 <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${shareExpOnSubmit ? 'bg-[#0a66c2] text-themeText dark:text-white' : 'bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong'}`}>
 {shareExpOnSubmit && <i className="fa-solid fa-check text-xs"></i>}
 </div>
 <div>
 <p className="text-xs font-bold text-[#0a66c2] leading-none mb-1.5"><i className="fa-brands fa-linkedin mr-1"></i> Draft LinkedIn Post</p>
 <p className={`text-[10px] text-[#0a66c2]/70 leading-none font-bold`}>Automatically open LinkedIn to share your success</p>
 </div>
 </div>

 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-themeBorder dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Experience Logged</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Writing to Ledger..." : "Log Experience"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* B. PERMISSION MODAL */}
 {showPermModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowPermModal(false)}>
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-5 lg:p-6 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight mb-1">Apply for Internship Permission</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.secondary}`}>Will be routed directly to your assigned mentor.</p>
 </div>
 <button type="button" onClick={() => setShowPermModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handlePermSubmit} className="p-5 lg:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar">
 <div><label className={LABEL_CLS}>Company / Firm Name</label><input type="text" value={permForm.company_name} onChange={e => setPermForm({ ...permForm, company_name: e.target.value })} className={INPUT_CLS} required /></div>
 <div className="grid grid-cols-2 gap-5">
 <div><label className={LABEL_CLS}>Start Date</label><input min="2026-09-14" type="date" value={permForm.start_date} onChange={e => setPermForm({ ...permForm, start_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:light] dark:[color-scheme:dark]`} required /></div>
 <div><label className={LABEL_CLS}>End Date</label><input min="2026-09-14" type="date" value={permForm.end_date} onChange={e => setPermForm({ ...permForm, end_date: e.target.value })} className={`${INPUT_CLS} [color-scheme:light] dark:[color-scheme:dark]`} required /></div>
 </div>
 {(permForm.start_date && permForm.end_date) && (
 <p className="text-xs text-blue-500 font-medium -mt-2 tracking-normal text-right"><i className="fa-solid fa-calculator mr-1"></i>Duration: {calculateWeeks(permForm.start_date, permForm.end_date)} Weeks</p>
 )}
 <div>
 <label className={LABEL_CLS}>Google Drive Link to Offer Letter (Required)</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
 <i className="fa-brands fa-google-drive text-themeTextSec dark:text-white/50"></i>
 </div>
 <input 
 type="url" 
 placeholder="https://drive.google.com/file/d/.../view" 
 value={permUrl} 
 onChange={e => setPermUrl(e.target.value)} 
 className={`${INPUT_CLS} pl-11`} 
 required 
 />
 </div>
 <p className="text-[9px] text-themeTextSec dark:text-white/50 mt-2"><i className="fa-solid fa-circle-info mr-1"></i> Ensure the link is set to "Anyone with the link can view"</p>
 </div>
 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-themeBorder dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Application Routed to Mentor</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Routing to Mentor..." : "Submit Application"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* C. PRACTICAL LOG MODAL */}
 {showPracModal && (
 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowPracModal(false)}>
 <div className="bg-transparent w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-5 lg:p-6 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden shrink-0">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight mb-1">Add Practical Log</h3>
 <p className={`text-[10px] lg:text-xs ${theme.text.secondary}`}>Log hours for mandatory clinical courses.</p>
 </div>
 <button type="button" onClick={() => setShowPracModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
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
 <div className="w-full py-4 bg-emerald-500/10 border-themeBorder dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Practical Hours Logged</div>
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
 <div className="bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong p-5 lg:p-6 border-themeBorder dark:border-white/5 border-black/10 dark:border-white/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText dark:text-white tracking-tight mb-1">Add Daily Log Entry</h3>
 <p className={`text-[10px] lg:text-xs text-blue-400 font-bold tracking-normal`}><i className="fa-solid fa-timeline mr-1"></i> Internship Journal</p>
 </div>
 <button type="button" onClick={() => setShowDailyLogModal(false)} className="w-8 h-8 rounded-full bg-white dark:bg-[#121212] border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5BorderStrong text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <form onSubmit={handleDailyLogSubmit} className="p-5 lg:p-6 flex flex-col gap-5">
 <div><label className={LABEL_CLS}>Date</label><input min="2026-09-14" type="date" value={dailyLogForm.date} onChange={e => setDailyLogForm({ ...dailyLogForm, date: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required /></div>
 <div><label className={LABEL_CLS}>What did you do today?</label><textarea rows="4" value={dailyLogForm.entry} onChange={e => setDailyLogForm({ ...dailyLogForm, entry: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Describe the work, cases reviewed, tasks completed..." required></textarea></div>
 {submitSuccess ? (
 <div className="w-full py-4 bg-emerald-500/10 border-themeBorder dark:border-white/5 border-emerald-500/20 text-emerald-400 rounded-[2rem] text-[13px] font-medium flex items-center justify-center gap-2"><i className="fa-solid fa-check-circle text-lg"></i> Entry Added</div>
 ) : (
 <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-themeText dark:text-white rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] disabled:opacity-50">{isSubmitting ? "Saving..." : "Add Log Entry"}</button>
 )}
 </form>
 </div>
 </div>
 )}

 {/* E. LINKEDIN DRAFT MODAL */}
 {showLinkedInDraftModal && (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowLinkedInDraftModal(false)}>
 <div className="bg-transparent w-full max-w-lg rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/20" onClick={(e) => e.stopPropagation()}>
 <div className="bg-white dark:bg-[#121212] p-5 lg:p-6 border-b border-black/10 dark:border-white/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-2xl"></div>
 <div className="relative z-10 flex justify-between items-start">
 <div>
 <h3 className="text-lg lg:text-xl font-semibold tracking-tight text-themeText dark:text-white tracking-tight mb-1"><i className="fa-brands fa-linkedin text-blue-500 mr-2"></i>Draft LinkedIn Post</h3>
 <p className="text-[10px] lg:text-xs text-themeTextSec">Review and copy your post before heading to LinkedIn.</p>
 </div>
 <button type="button" onClick={() => setShowLinkedInDraftModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 text-themeTextSec hover:text-themeText dark:text-white flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 </div>
 <div className="p-5 lg:p-6 flex flex-col gap-5 bg-white dark:bg-[#1a1a1a]">
 <textarea 
 rows="8" 
 className="w-full bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl p-4 text-sm text-themeText dark:text-white/90 focus:border-blue-500 outline-none resize-none custom-scrollbar leading-relaxed"
 value={linkedInDraftText}
 onChange={(e) => setLinkedInDraftText(e.target.value)}
 ></textarea>
 <div className="flex gap-3">
 <button type="button" onClick={() => setShowLinkedInDraftModal(false)} className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeText dark:text-white rounded-[2rem] text-[13px] font-medium tracking-normal transition">Cancel</button>
 <button type="button" onClick={() => {
 navigator.clipboard.writeText(linkedInDraftText);
 window.open(`https://www.linkedin.com/feed/?shareActive=true`, '_blank', 'width=800,height=600');
 setShowLinkedInDraftModal(false);
 }} className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-[13px] font-medium tracking-normal transition shadow-lg shadow-blue-500/20"><i className="fa-regular fa-copy mr-2"></i>Copy & Post to LinkedIn</button>
 </div>
 </div>
 </div>
 </div>
 )}

 </div>
 </div>
 );
}
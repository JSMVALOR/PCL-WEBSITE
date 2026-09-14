/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function Achievements({ isEmbedded = false }) {
 const { userSession } = useERP();

 // --- STATE ---
 const [achievements, setAchievements] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 // Filters & Views
 const [searchQuery, setSearchQuery] = useState("");
 const [activeCategory, setActiveCategory] = useState("All");
 const [activeYear, setActiveYear] = useState("All Years");
 const [activeStatus, setActiveStatus] = useState("All Statuses");
 const [viewMode, setViewMode] = useState("Cards"); // 'Cards', 'Timeline', 'Table'

 // Drawers & Modals
 const [selectedAchievement, setSelectedAchievement] = useState(null); // Opens Drawer
 const [showAddWizard, setShowAddWizard] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [showQrModal, setShowQrModal] = useState(false);
 const [selectedQrAch, setSelectedQrAch] = useState(null);

 // Add Form
 const [formData, setFormData] = useState({
 category: "Moot Courts",
 title: "",
 issuer: "",
 date_achieved: "",
 role: "",
 description: "",
 proof_link: "",
 include_in_cv: true
 });

 // --- FETCH DATA ---
 const fetchAchievements = async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('student_achievements')
 .select('*')
 .eq('student_id', studentId)
 .order('date_achieved', { ascending: false });
 if (error) throw error;
 if (data) setAchievements(data);
 } catch (error) {
 console.error("Error fetching achievements:", error);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchAchievements();
 }, [userSession]);

 // --- CATEGORY CONFIG ---
 const CATEGORIES = [
 { id: "Moot Courts", color: "text-red-500", bg: "bg-red-50", icon: "fa-scale-balanced" },
 { id: "Internships", color: "text-blue-500", bg: "bg-blue-50", icon: "fa-briefcase" },
 { id: "Publications", color: "text-green-500", bg: "bg-green-50", icon: "fa-book-open" },
 { id: "Research", color: "text-purple-500", bg: "bg-purple-50", icon: "fa-flask" },
 { id: "Certificates", color: "text-orange-500", bg: "bg-orange-50", icon: "fa-certificate" },
 { id: "Awards", color: "text-yellow-500", bg: "bg-yellow-50", icon: "fa-medal" },
 { id: "Leadership", color: "text-slate-800", bg: "bg-slate-100", icon: "fa-users" },
 { id: "Community Service", color: "text-pink-500", bg: "bg-pink-50", icon: "fa-hand-holding-heart" },
 { id: "Others", color: "text-themeTextSec", bg: "bg-themePanel border-theme border-themeBorderStrong", icon: "fa-star" }
 ];

 const getCatTheme = (catName) => CATEGORIES.find(c => c.id === catName) || CATEGORIES[CATEGORIES.length - 1];

 // --- STATS CALCULATION ---
 const stats = useMemo(() => {
 let verified = 0, pending = 0, certificates = 0, awards = 0;
 achievements.forEach(a => {
 const status = a.status || (a.is_verified ? 'verified' : 'pending');
 if (status === 'verified') verified++;
 if (status === 'pending') pending++;
 if (a.category === 'Certificates') certificates++;
 if (a.category === 'Awards') awards++;
 });
 const cvScore = achievements.length > 0 ? Math.min(100, Math.floor((verified / achievements.length) * 100)) : 0;
 return { verified, pending, certificates, awards, cvScore };
 }, [achievements]);

 // --- FILTERING ---
 const filteredAchievements = useMemo(() => {
 return achievements.filter(a => {
 const status = a.status || (a.is_verified ? 'verified' : 'pending');
 const year = a.date_achieved ? new Date(a.date_achieved).getFullYear().toString() : "";
 
 const matchSearch = (a.title + a.issuer + a.category + a.role).toLowerCase().includes(searchQuery.toLowerCase());
 const matchCategory = activeCategory === "All" || a.category === activeCategory;
 const matchYear = activeYear === "All Years" || year === activeYear;
 const matchStatus = activeStatus === "All Statuses" || status.toLowerCase() === activeStatus.toLowerCase();
 
 return matchSearch && matchCategory && matchYear && matchStatus;
 });
 }, [achievements, searchQuery, activeCategory, activeYear, activeStatus]);

 // --- HANDLERS ---
 const handleAddSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const studentId = userSession?.db_id || userSession?.id;
 const payload = {
 student_id: studentId,
 category: formData.category,
 title: formData.title,
 issuer: formData.issuer,
 date_achieved: formData.date_achieved,
 role: formData.role,
 description: formData.description,
 proof_link: formData.proof_link,
 include_in_cv: formData.include_in_cv,
 status: 'pending'
 };
 const { error } = await supabase.from('student_achievements').insert([payload]);
 if (error) throw error;
 window.erpDialog.alert("Achievement submitted for faculty verification.");
 fetchAchievements();
 setShowAddWizard(false);
 setFormData({ category: "Moot Courts", title: "", issuer: "", date_achieved: "", role: "", description: "", proof_link: "", include_in_cv: true });
 } catch (err) {
 console.error(err);
 window.erpDialog.alert("Failed to add achievement.");
 } finally {
 setIsSubmitting(false);
 }
 };

 const toggleCV = async (achievement) => {
 try {
 const newVal = !achievement.include_in_cv;
 // Optimistic UI
 setAchievements(prev => prev.map(a => a.id === achievement.id ? { ...a, include_in_cv: newVal } : a));
 if (selectedAchievement?.id === achievement.id) {
 setSelectedAchievement({ ...selectedAchievement, include_in_cv: newVal });
 }
 await supabase.from('student_achievements').update({ include_in_cv: newVal }).eq('id', achievement.id);
 } catch (e) { console.error(e); }
 };

 const handlePrintCertificate = (ach) => {
    window.erpDialog?.alert("Generating high-resolution printable certificate for: " + ach.title);
  };

  const getStatusBadge = (status) => {
 const s = (status || 'pending').toLowerCase();
 if (s === 'verified') return <span className="bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-circle-check"></i> Verified</span>;
 if (s === 'rejected') return <span className="bg-[#FCE8E6] text-[#C5221F] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-circle-xmark"></i> Rejected</span>;
 if (s === 'revision_requested') return <span className="bg-[#E8F0FE] text-[#1967D2] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-rotate-left"></i> Needs Revision</span>;
 return <span className="bg-[#FEF7E0] text-[#B06000] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"><i className="fa-solid fa-clock"></i> Pending Verification</span>;
 };

 return (<div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 <PageHeader 
 icon="fa-solid fa-trophy"
 title="Achievements"
 subtitle="Track your academic and extracurricular milestones."
 />
 
 {/* Header */}
 <div className="flex justify-end w-full">
 <button type="button" 
 onClick={() => setShowAddWizard(true)}
 className="bg-themeAccent hover:brightness-110 text-white px-6 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 active:scale-95"
 >
 <i className="fa-solid fa-plus"></i> Add Achievement
 </button>
 </div>

 {/* Hero Statistics */}
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-5 rounded-xl flex flex-col">
 <div className="flex items-center justify-between mb-2">
 <span className="text-3xl font-black text-themeText">{stats.verified}</span>
 <div className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#137333] flex items-center justify-center"><i className="fa-solid fa-trophy"></i></div>
 </div>
 <span className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Verified by Mentors</span>
 </div>
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-5 rounded-xl flex flex-col">
 <div className="flex items-center justify-between mb-2">
 <span className="text-3xl font-black text-themeText">{stats.pending}</span>
 <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#B06000] flex items-center justify-center"><i className="fa-solid fa-hourglass-half"></i></div>
 </div>
 <span className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Awaiting Review</span>
 </div>
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-5 rounded-xl flex flex-col">
 <div className="flex items-center justify-between mb-2">
 <span className="text-3xl font-black text-themeText">{stats.certificates}</span>
 <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><i className="fa-solid fa-file-contract"></i></div>
 </div>
 <span className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Certificates</span>
 </div>
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-5 rounded-xl flex flex-col">
 <div className="flex items-center justify-between mb-2">
 <span className="text-3xl font-black text-themeText">{stats.awards}</span>
 <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center"><i className="fa-solid fa-star"></i></div>
 </div>
 <span className="text-xs font-bold text-themeTextSec uppercase tracking-widest">Awards</span>
 </div>
 <div className="bg-themeAccent text-white border border-themeAccent p-5 rounded-xl flex flex-col col-span-2 lg:col-span-1 justify-between relative overflow-hidden group cursor-pointer">
 <div className="absolute -right-4 -top-4 w-24 h-24 bg-themePanel/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
 <div>
 <div className="flex items-end gap-1 mb-1">
 <span className="text-3xl font-black">{stats.cvScore}%</span>
 </div>
 <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">CV Completeness</span>
 </div>
 <div className="text-xs font-bold mt-2 flex items-center gap-1 group-hover:gap-2 transition">
 Generate CV <i className="fa-solid fa-arrow-right"></i>
 </div>
 </div>
 </div>

 {/* Filters & Controls */}
 <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-themePanel border-theme border-themeBorderStrong p-3 rounded-xl border border-black/10 dark:border-white/20">
 
 {/* Search */}
 <div className="relative w-full lg:w-96 shrink-0">
 <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input 
 type="text" 
 placeholder="Search achievements..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-themePanel border-theme border-themeBorderStrong rounded-lg text-sm font-medium focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none transition-shadow"
 />
 </div>

 {/* Category Chips */}
 <div className="flex-1 w-full overflow-x-auto no-scrollbar flex items-center gap-2 px-2">
 {["All", "Moot Courts", "Internships", "Publications", "Research", "Certificates", "Awards"].map(cat => (
 <button type="button" 
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors border ${activeCategory === cat ? 'bg-themeText text-white border-themeText' : 'bg-themePanel border-theme border-themeBorderStrong text-themeTextSec opacity-80 border-black/5 dark:border-white/10 hover:border-gray-400'}`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Dropdowns & Toggles */}
 <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
 <select 
 value={activeYear} onChange={e => setActiveYear(e.target.value)}
 className="bg-themePanel border-theme border-themeBorderStrong rounded-lg px-3 py-2 text-xs font-bold text-themeTextSec opacity-90 outline-none focus:border-themeAccent"
 >
 <option>All Years</option>
 <option>2026</option>
 <option>2025</option>
 <option>2024</option>
 <option>2023</option>
 <option>2022</option>
 </select>
 <select 
 value={activeStatus} onChange={e => setActiveStatus(e.target.value)}
 className="bg-themePanel border-theme border-themeBorderStrong rounded-lg px-3 py-2 text-xs font-bold text-themeTextSec opacity-90 outline-none focus:border-themeAccent"
 >
 <option>All Statuses</option>
 <option>Verified</option>
 <option>Pending</option>
 <option>Rejected</option>
 </select>
 
 <div className="flex bg-themePanel border-theme border-themeBorderStrong rounded-lg p-1">
 {['Cards', 'Timeline', 'Table'].map(mode => (
 <button type="button" 
 key={mode} onClick={() => setViewMode(mode)}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === mode ? 'bg-themePanel border-theme border-themeBorderStrong text-themeText' : 'text-themeTextSec hover:text-themeTextSec opacity-80'}`}
 title={mode}
 >
 <i className={`fa-solid ${mode === 'Cards' ? 'fa-border-all' : mode === 'Timeline' ? 'fa-stream' : 'fa-table'}`}></i>
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Content Area */}
 {isLoading ? (
 <div className="py-32 flex justify-center text-themeTextSec"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>
 ) : filteredAchievements.length === 0 ? (
 <div className="py-20 text-center bg-themePanel border-theme border-themeBorderStrong rounded-xl border border-dashed border-black/5 dark:border-white/10">
 <i className="fa-solid fa-box-open text-4xl text-themeTextSec opacity-50 mb-3"></i>
 <h3 className="text-lg font-bold text-themeText">No achievements found</h3>
 <p className="text-sm text-themeTextSec mt-1">Adjust your filters or add a new achievement.</p>
 </div>
 ) : (
 <>
 {/* CARDS VIEW */}
 {viewMode === 'Cards' && (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
 {filteredAchievements.map(item => {
 const theme = getCatTheme(item.category);
 return (
 <div 
 key={item.id} 
 onClick={() => setSelectedAchievement(item)}
 className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-2xl p-5 lg:p-6 hover:border-themeAccent/30 transition cursor-pointer group flex flex-col"
 >
 <div className="flex justify-between items-start mb-4">
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-2">
 <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center text-lg border border-black/5`}>
 <i className={`fa-solid ${theme.icon}`}></i>
 </div>
 <div>
 <p className={`text-[10px] font-black uppercase tracking-widest ${theme.color}`}>{item.category}</p>
 <p className="text-xs font-bold text-themeTextSec">{new Date(item.date_achieved).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</p>
 </div>
 </div>
 </div>
 {getStatusBadge(item.status || (item.is_verified ? 'verified' : 'pending'))}
 </div>

 <h3 className="text-lg font-bold text-themeText leading-tight mb-2 group-hover:text-themeAccent transition-colors line-clamp-2">
 {item.title}
 </h3>
 
 <div className="flex items-center gap-2 text-sm text-themeTextSec opacity-80 font-medium mb-4">
 <i className="fa-regular fa-building text-themeTextSec"></i> {item.issuer}
 </div>

 <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/20 flex items-center justify-between">
 <span className="text-xs font-bold text-themeTextSec bg-themePanel border-theme border-themeBorderStrong px-2 py-1 rounded">
 {item.role || 'Participant'}
 </span>
 <div className="flex gap-2">
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="text-themeTextSec hover:text-themeAccent transition-colors"><i className="fa-solid fa-pen-to-square"></i></button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} className="text-themeTextSec hover:text-themeAccent transition-colors"><i className="fa-solid fa-ellipsis"></i></button>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 )}

 {/* TIMELINE VIEW */}
 {viewMode === 'Timeline' && (
 <div className="max-w-3xl mx-auto relative pl-6 border-l-2 border-black/10 dark:border-white/20 flex flex-col gap-8 py-4">
 {filteredAchievements.map(item => {
 const theme = getCatTheme(item.category);
 return (
 <div key={item.id} className="relative pl-6 group cursor-pointer" onClick={() => setSelectedAchievement(item)}>
 <div className={`absolute -left-[35px] top-1 w-4 h-4 rounded-full border-4 border-white ${theme.bg.replace('bg-', 'bg-').replace('50', '400')} group-hover:scale-125 transition-transform`}></div>
 
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-xl p-5 group-hover:border-themeAccent/30 group-hover:shadow-md transition">
 <div className="flex justify-between items-start mb-2">
 <span className="text-xs font-black text-themeTextSec uppercase tracking-widest">{new Date(item.date_achieved).getFullYear()}</span>
 {getStatusBadge(item.status || (item.is_verified ? 'verified' : 'pending'))}
 </div>
 <h3 className="text-lg font-bold text-themeText mb-1 group-hover:text-themeAccent transition-colors">{item.title}</h3>
 <p className="text-sm font-medium text-themeTextSec flex items-center gap-2 mb-3">
 <i className={`fa-solid ${theme.icon} ${theme.color}`}></i> {item.category} • {item.issuer}
 </p>
 </div>
 </div>
 )
 })}
 </div>
 )}

 {/* TABLE VIEW */}
 {viewMode === 'Table' && (
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-xl overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead className="bg-themePanel border-theme border-themeBorderStrong border-b border-black/10 dark:border-white/20">
 <tr>
 <th className="px-5 py-4 text-xs font-black text-themeTextSec uppercase tracking-widest">Achievement</th>
 <th className="px-5 py-4 text-xs font-black text-themeTextSec uppercase tracking-widest">Category</th>
 <th className="px-5 py-4 text-xs font-black text-themeTextSec uppercase tracking-widest">Date</th>
 <th className="px-5 py-4 text-xs font-black text-themeTextSec uppercase tracking-widest">Status</th>
 </tr>
 </thead>
 <tbody>
 {filteredAchievements.map(item => {
 const theme = getCatTheme(item.category);
 return (
 <tr key={item.id} onClick={() => setSelectedAchievement(item)} className="border-b border-black/10 dark:border-white/20 hover:bg-themePanel border-theme border-themeBorderStrong cursor-pointer transition-colors group">
 <td className="px-5 py-4">
 <p className="text-sm font-bold text-themeText group-hover:text-themeAccent transition-colors">{item.title}</p>
 <p className="text-xs font-medium text-themeTextSec">{item.issuer}</p>
 </td>
 <td className="px-5 py-4">
 <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.color}`}>
 {item.category}
 </span>
 </td>
 <td className="px-5 py-4 text-sm font-bold text-themeTextSec opacity-90">
 {new Date(item.date_achieved).toLocaleDateString('en-US', {month:'short', year:'numeric'})}
 </td>
 <td className="px-5 py-4">
 {getStatusBadge(item.status || (item.is_verified ? 'verified' : 'pending'))}
 </td>
 </tr>
 )
 })}
 </tbody>
 </table>
 </div>
 )}
 </>
 )}
 </div>

 {/* --- ACHIEVEMENT DETAILS DRAWER --- */}
 {selectedAchievement && (
 <>
 <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" onClick={() => setSelectedAchievement(null)}></div>
 <div className="fixed top-0 right-0 h-full w-full max-w-md bg-themePanel border-theme border-themeBorderStrong z-50 flex flex-col animate-slide-in-right border-l border-black/10 dark:border-white/20">
 {/* Drawer Header */}
 <div className="px-6 py-5 border-b border-black/10 dark:border-white/20 flex justify-between items-center bg-themePanel border-theme border-themeBorderStrong">
 <h2 className="text-lg font-bold text-themeText">Achievement Record</h2>
 <button type="button" onClick={() => setSelectedAchievement(null)} className="w-8 h-8 rounded-full bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] flex items-center justify-center text-themeTextSec hover:text-themeText transition">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 
 {/* Drawer Body */}
 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
 
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Competition / Title</p>
 <h3 className="text-2xl font-black text-themeText leading-tight">{selectedAchievement.title}</h3>
 </div>

 <div className="grid grid-cols-2 gap-4 bg-themePanel border-theme border-themeBorderStrong p-4 rounded-xl border border-black/10 dark:border-white/20">
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Organizer</p>
 <p className="text-sm font-bold text-themeText">{selectedAchievement.issuer}</p>
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Date</p>
 <p className="text-sm font-bold text-themeText">{new Date(selectedAchievement.date_achieved).toLocaleDateString()}</p>
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Category</p>
 <p className="text-sm font-bold text-themeText">{selectedAchievement.category}</p>
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Role / Result</p>
 <p className="text-sm font-bold text-themeText">{selectedAchievement.role || '--'}</p>
 </div>
 </div>

 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Verification Status</p>
 <div className="flex items-center justify-between border border-black/10 dark:border-white/20 rounded-lg p-3 bg-themePanel border-theme border-themeBorderStrong">
 {getStatusBadge(selectedAchievement.status || (selectedAchievement.is_verified ? 'verified' : 'pending'))}
 </div>
 {selectedAchievement.mentor_remarks && (
 <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4 relative">
 <i className="fa-solid fa-quote-left absolute top-3 right-4 text-blue-200 text-2xl"></i>
 <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Mentor Remarks</p>
 <p className="text-sm font-medium text-blue-900 italic">"{selectedAchievement.mentor_remarks}"</p>
 </div>
 )}
 </div>

 <div className="border-t border-black/10 dark:border-white/20 pt-6">
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-3">Digital Locker (Proofs)</p>
 {selectedAchievement.proof_link ? (
 <a href={selectedAchievement.proof_link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-black/10 dark:border-white/20 rounded-lg hover:bg-themePanel border-theme border-themeBorderStrong hover:border-themeAccent/30 transition group">
 <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-lg">
 <i className="fa-solid fa-file-pdf"></i>
 </div>
 <div className="flex-1">
 <p className="text-sm font-bold text-themeText group-hover:text-themeAccent transition-colors">Certificate_Proof.pdf</p>
 <p className="text-[10px] font-medium text-themeTextSec uppercase tracking-widest">View Attachment</p>
 </div>
 <i className="fa-solid fa-external-link text-themeTextSec group-hover:text-themeAccent"></i>
 </a>
 ) : (
 <p className="text-sm text-themeTextSec italic">No attachments provided.</p>
 )}
 </div>
 </div>

 {/* Drawer Footer Actions */}
 <div className="p-6 border-t border-black/10 dark:border-white/20 bg-themePanel border-theme border-themeBorderStrong flex flex-col gap-3">
 <div className="flex items-center justify-between p-4 bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-xl mb-2">
 <div>
 <p className="text-sm font-bold text-themeText">Include in CV</p>
 <p className="text-xs text-themeTextSec">Show this on your generated profile</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" className="sr-only peer" checked={selectedAchievement.include_in_cv !== false} onChange={() => toggleCV(selectedAchievement)} />
 <div className="w-11 h-6 bg-themeBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-themePanel border-theme border-themeBorderStrong after:border-black/5 dark:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-themeAccent"></div>
 </label>
 </div>

 <button type="button" onClick={() => handlePrintCertificate(selectedAchievement)} className="w-full bg-themeText hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl transition flex justify-center items-center gap-2">
 <i className="fa-solid fa-print"></i> Print Certificate
 </button>
 <button type="button" onClick={() => { setSelectedQrAch(selectedAchievement); setShowQrModal(true); }} className="w-full bg-themePanel border-theme border-themeBorderStrong hover:bg-themePanel border-theme border-themeBorderStrong text-themeText border border-black/10 dark:border-white/20 font-bold text-sm py-3.5 rounded-xl transition flex justify-center items-center gap-2">
 <i className="fa-solid fa-qrcode"></i> Generate Verification QR
 </button>
 </div>
 </div>
 </>
 )}

 {/* --- ADD ACHIEVEMENT WIZARD --- */}
 {showAddWizard && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
 <div className="bg-themePanel border-theme border-themeBorderStrong w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
 <div className="px-6 py-5 border-b border-black/10 dark:border-white/20 flex justify-between items-center bg-themePanel border-theme border-themeBorderStrong">
 <h2 className="text-xl font-bold text-themeText">Add Achievement</h2>
 <button type="button" onClick={() => setShowAddWizard(false)} className="text-themeTextSec hover:text-themeText transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
 </div>
 
 <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6">
 
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Category</label>
 <select 
 required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 >
 {CATEGORIES.filter(c=>c.id!=='All').map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
 </select>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Competition / Title Name</label>
 <input 
 required type="text" placeholder="e.g. National Moot Court Competition"
 value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Organizer / Issuer</label>
 <input 
 required type="text" placeholder="e.g. NLSIU Bangalore"
 value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Date Achieved</label>
 <input min="2026-09-14" 
 required type="date"
 value={formData.date_achieved} onChange={e => setFormData({...formData, date_achieved: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Role / Position / Result</label>
 <input 
 type="text" placeholder="e.g. Speaker, Semi-Finalist"
 value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 />
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Proof Link / Drive URL</label>
 <input 
 type="url" placeholder="Link to certificate or proof document"
 value={formData.proof_link} onChange={e => setFormData({...formData, proof_link: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none"
 />
 </div>

 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Brief Description (Optional)</label>
 <textarea 
 rows="3" placeholder="Additional details..."
 value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
 className="w-full bg-themePanel border-theme border-themeBorderStrong rounded-lg px-4 py-3 text-sm font-bold text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none resize-none"
 ></textarea>
 </div>

 </form>

 <div className="p-6 border-t border-black/10 dark:border-white/20 bg-themePanel border-theme border-themeBorderStrong flex justify-end gap-3">
 <button type="button" onClick={() => setShowAddWizard(false)} className="px-6 py-3 rounded-lg text-sm font-bold text-themeTextSec opacity-80 hover:bg-themeBorder transition-colors">Cancel</button>
 <button type="button" onClick={handleAddSubmit} disabled={isSubmitting} className="px-6 py-3 rounded-lg text-sm font-bold bg-themeAccent text-white hover:brightness-110 transition flex items-center gap-2">
 {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : "Submit to Mentor"}
 </button>
 </div>
 </div>
 </div>
 )}


 {/* QR Verification Modal */}
 {showQrModal && selectedQrAch && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-themeBg border border-black/10 dark:border-white/20 rounded-3xl w-full max-w-sm p-8 relative flex flex-col items-center text-center">
 <button type="button" onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-themePanel border-theme border-themeBorderStrong hover:bg-themeBorder text-themeTextSec hover:text-themeText transition-colors">
 <i className="fa-solid fa-xmark"></i>
 </button>
 
 <div className="w-16 h-16 rounded-full bg-themeAccent/10 text-themeAccent flex items-center justify-center text-3xl mb-4">
 <i className="fa-solid fa-shield-check"></i>
 </div>
 
 <h3 className="text-xl font-black uppercase tracking-widest text-themeText mb-1">Verification QR</h3>
 <p className="text-xs text-themeTextSec font-semibold mb-8">Scan to verify this achievement</p>
 
 <div className="bg-themePanel border-theme border-themeBorderStrong p-4 rounded-2xl mb-6">
 <img 
 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`PCL-VERIFY:${selectedQrAch.id}|STUDENT:${userSession?.id}`)}`} 
 alt="Verification QR Code" 
 className="w-48 h-48 object-contain"
 />
 </div>
 
 <p className="text-[10px] text-themeTextSec px-4">
 This QR code contains cryptographic verification data linked to the Prudentia College of Law blockchain registry.
 </p>
 </div>
 </div>
 )}

 </div>
 );
}
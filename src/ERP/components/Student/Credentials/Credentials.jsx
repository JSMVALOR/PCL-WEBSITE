/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generateComponentPDF } from "../../../DocumentTemplates/pdfEngine";
import IDCardTemplate from '../../../DocumentTemplates/IDCardTemplate';
import { useERP } from "../../../context/ErpContext";
import { calculateRelativeSemester } from "../../../utils/academicUtils";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";
import ProfileEditModal from "./ProfileEditModal";
import QuestionnaireModal from "../../shared/QuestionnaireModal";

export default function Credentials() {
 const { userSession, refreshProfile } = useERP();
 const [activeTab, setActiveTab] = useState("profile"); // profile, security, appearance
 const [isLoading, setIsLoading] = useState(true);
 
 // Core Data State
 const [profileData, setProfileData] = useState(null);
 const [mentorData, setMentorData] = useState(null);
 const [pendingRequest, setPendingRequest] = useState(null);
 const [showEditModal, setShowEditModal] = useState(false);

 // One-Time Questionnaire State
 const [showQuestionnaire, setShowQuestionnaire] = useState(false);
 const [qForm, setQForm] = useState({
 preferredLawArea: "Litigation",
 careerGoal: "Not Decided",
 languages: [],
 clubs: [],
 internshipPref: "Any",
 skills: []
 });

 const idCardRef = useRef(null);
 const [isGeneratingID, setIsGeneratingID] = useState(false);
 
 const handleDownloadID = async () => {
     if (!idCardRef.current) return;
     setIsGeneratingID(true);
     try {
         await generateComponentPDF(idCardRef.current, `${profileData.full_name.replace(/\s+/g, '_')}_ID_Card.pdf`, { format: [54, 86], orientation: 'portrait', fitToPage: true }); // CR80 standard ID size in mm
     } catch (e) {
         console.error("Failed to download ID:", e);
     } finally {
         setIsGeneratingID(false);
     }
 };
 
 useEffect(() => {
 const fetchMasterRecord = async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;

 try {
 // 1. Fetch Profile
 const { data: pData, error: pError } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', studentId)
 .single();
 
 if (pError) throw pError;
 setProfileData(pData);

 // Check if Questionnaire is needed (assuming empty questionnaire_data means not done)
 const qd = pData.questionnaire_data || {};
 if (!qd.preferredLawArea && userSession?.role === 'student') {
 setShowQuestionnaire(true);
 }

 // Check for pending profile update request
 const { data: requestData } = await supabase
 .from('profile_update_requests')
 .select('*')
 .eq('student_id', studentId)
 .eq('status', 'pending')
 .maybeSingle();
 
 if (requestData) {
 setPendingRequest(requestData);
 }

 // 2. Fetch Mentor (Only for students)
 if (userSession?.role === 'student') {
 const { data: mData } = await supabase
 .from('mentorship')
 .select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name)')
 .eq('student_id', studentId)
 .eq('status', 'active')
 .single();
 
 if (mData?.profiles) {
 setMentorData(mData.profiles.full_name);
 }
 }

 } catch (err) {
 console.error("Failed to load official record:", err);
 } finally {
 setIsLoading(false);
 }
 };

 fetchMasterRecord();
 }, [userSession]);

 // Derived helpers
 const getInitials = (nameStr) => {
 if (!nameStr) return "US";
 const parts = nameStr.trim().split(" ");
 if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
 return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
 };

 const handleQuestionnaireSubmit = async (e) => {
 e.preventDefault();
 const studentId = userSession?.db_id || userSession?.id;
 
 try {
 const updatedQData = {
 ...profileData.questionnaire_data,
 preferredLawArea: qForm.preferredLawArea,
 careerGoal: qForm.careerGoal,
 languages: qForm.languages,
 clubs: qForm.clubs,
 internshipPref: qForm.internshipPref,
 skills: qForm.skills,
 completedOn: new Date().toISOString()
 };

 const { error } = await supabase
 .from('profiles')
 .update({ questionnaire_data: updatedQData })
 .eq('id', studentId);

 if (error) throw error;
 
 setShowQuestionnaire(false);
 setProfileData(prev => ({ ...prev, questionnaire_data: updatedQData }));
 window.erpDialog?.alert("Onboarding questionnaire completed successfully.", "Record Updated");
 } catch (error) {
 console.error(error);
 window.erpDialog?.alert("Failed to save questionnaire. Please try again.");
 }
 };

 const handleCheckboxChange = (field, val) => {
 setQForm(prev => {
 const arr = prev[field];
 if (arr.includes(val)) {
 return { ...prev, [field]: arr.filter(i => i !== val) };
 } else {
 return { ...prev, [field]: [...arr, val] };
 }
 });
 };

 if (isLoading) {
 return (
 <div className="flex flex-col gap-6 w-full animate-pulse opacity-70 p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 <div className="h-32 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20"></div>
 </div>
 <div className="h-64 bg-white/10 backdrop-blur-md rounded-[2rem] border border-black/10 dark:border-white/20 mt-4"></div>
</div>
 );
 }

 if (!profileData) return null;

 const qd = profileData.questionnaire_data || {};
 const roleTitle = userSession?.role === 'admin' ? 'Admin' : userSession?.role === 'faculty' ? 'Faculty' : 'Student';

 return (
 <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated relative">
 
 {/* Top Action & Navigation Bar */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] px-6 py-4 rounded-[2rem] gap-4">
 <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.08] shadow-inner">
 <button type="button"
 onClick={() => setActiveTab("profile")}
 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 activeTab === "profile" ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeAccent' : 'text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 hover:text-themeText dark:hover:text-themeText'
 }`}
 >
 <i className="fa-regular fa-user mr-2"></i> HR & Profile
 </button>
 <button type="button"
 onClick={() => setActiveTab("security")}
 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 activeTab === "security" ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeAccent' : 'text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 hover:text-themeText dark:hover:text-themeText'
 }`}
 >
 <i className="fa-solid fa-shield-halved mr-2"></i> Security
 </button>
 <button type="button"
 onClick={() => setActiveTab("appearance")}
 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
 activeTab === "appearance" ? 'bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeAccent' : 'text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 hover:text-themeText dark:hover:text-themeText'
 }`}
 >
 <i className="fa-solid fa-palette mr-2"></i> Appearance
 </button>
 </div>
 
 {activeTab === "profile" && (
 <div className="flex gap-2">
 <button type="button" 
 onClick={() => setShowEditModal(true)}
 className="px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-themeBorder text-themeText text-[10px] font-black uppercase tracking-widest rounded transition-colors border border-black/5 dark:border-white/10 flex items-center gap-2"
 >
 <i className="fa-solid fa-pen-to-square"></i> Edit
 </button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="px-4 py-2 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-themeBorder text-themeText text-[10px] font-black uppercase tracking-widest rounded transition-colors border border-black/5 dark:border-white/10 flex items-center gap-2">
 <i className="fa-solid fa-print"></i> Print
 </button>
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="hidden sm:flex px-4 py-2 bg-themeAccent hover:opacity-90 text-themeApp text-[10px] font-black uppercase tracking-widest rounded transition-colors border border-themeAccent flex items-center gap-2">
 <i className="fa-solid fa-id-badge"></i> Download ID
 </button>
 </div>
 )}
 </div>

 {/* TAB: SECURITY */}
 {activeTab === "security" && (
 <div className="animate-fade-in">
 <SecuritySettings />
 </div>
 )}

 {/* TAB: APPEARANCE */}
 {activeTab === "appearance" && (
 <div className="animate-fade-in">
 <AppearanceSettings />
 </div>
 )}

 {/* TAB: PROFILE */}
 {activeTab === "profile" && (
 <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
 
 {pendingRequest && (
 <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
 <i className="fa-solid fa-hourglass-half text-amber-500"></i>
 </div>
 <div>
 <h4 className="text-amber-500 font-black text-sm uppercase tracking-widest mb-1">Profile Update Pending</h4>
 <p className="text-xs text-themeText font-bold">Your recent profile update request is pending admin approval. You cannot submit another request until this one is reviewed.</p>
 </div>
 </div>
 )}

 {/* 1. MASTER PROFILE BANNER */}
 <div className={`rounded-2xl p-6 lg:p-10 relative overflow-hidden bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 transition duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8`}>
 
 {/* Photo & Status */}
 <div className="relative group shrink-0 flex flex-col items-center">
 <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 text-themeAccent border-[4px] border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
 {profileData.profile_picture_url ? (
 <img src={profileData.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 <div className="text-3xl lg:text-4xl font-black">
 {getInitials(profileData.full_name)}
 </div>
 )}
 </div>
 <div className="mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1.5">
 <i className="fa-solid fa-circle text-[6px]"></i> Active {roleTitle}
 </div>
 </div>

 {/* Core Info Details */}
 <div className="flex-1 w-full text-center sm:text-left flex flex-col h-full justify-center">
 <h2 className="text-2xl lg:text-3xl font-black text-themeText tracking-tight mb-1">{profileData.full_name}</h2>
 <p className="text-sm font-bold text-themeTextSec uppercase tracking-widest mb-4">{profileData.department || (userSession?.role === 'student' ? "B.B.A. LL.B. (Hons.)" : "Department")}</p>
 
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-2 mt-2 pt-4 border-t border-black/5 dark:border-white/10 w-full">
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">{roleTitle} ID</p>
 <p className="text-xs font-bold text-themeText">{profileData.erp_id || "N/A"}</p>
 </div>
 {userSession?.role === 'student' && (
 <>
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Semester</p>
 <p className="text-xs font-bold text-themeText">{profileData.academic_batch ? `Semester ${calculateRelativeSemester(profileData.academic_batch)}` : "N/A"}</p>
 </div>
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Batch</p>
 <p className="text-xs font-bold text-themeText">{profileData.academic_batch || "N/A"}</p>
 </div>
 <div>
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Faculty Mentor</p>
 <p className="text-xs font-bold text-themeAccent">{mentorData || "Unassigned"}</p>
 </div>
 </>
 )}
 </div>
 </div>
 </div>

 {/* If Questionnaire needs to be filled, show it here */}
 {showQuestionnaire && userSession?.role === 'student' && (
 <div className="bg-themeAccent/10 border-2 border-themeAccent/30 rounded-2xl p-6 lg:p-8">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-full bg-themeAccent/20 flex items-center justify-center text-themeAccent shrink-0">
 <i className="fa-solid fa-clipboard-list"></i>
 </div>
 <div>
 <h3 className="text-lg font-black text-themeAccent tracking-tight mb-0.5">Student Onboarding Questionnaire</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Please complete this one-time survey to finalize your profile.</p>
 </div>
 </div>

 <form onSubmit={handleQuestionnaireSubmit} className="flex flex-col gap-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeText">Preferred Area of Law</label>
 <select className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-lg px-3 py-2.5 text-xs text-themeText outline-none focus:border-themeAccent" value={qForm.preferredLawArea} onChange={e => setQForm({...qForm, preferredLawArea: e.target.value})}>
 <option>Litigation</option>
 <option>Corporate Law</option>
 <option>Criminal Law</option>
 <option>Constitutional Law</option>
 <option>Intellectual Property</option>
 <option>Not Decided</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeText">Career Goal</label>
 <select className="bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] rounded-lg px-3 py-2.5 text-xs text-themeText outline-none focus:border-themeAccent" value={qForm.careerGoal} onChange={e => setQForm({...qForm, careerGoal: e.target.value})}>
 <option>Litigation</option>
 <option>Corporate</option>
 <option>Judiciary</option>
 <option>Higher Studies</option>
 <option>Government</option>
 <option>Not Decided</option>
 </select>
 </div>
 </div>

 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeText block mb-2">Clubs & Activities Interest</label>
 <div className="flex flex-wrap gap-2">
 {["Moot Court Society", "ADR Cell", "Legal Aid Clinic", "Debate Society", "NSS", "Sports", "Cultural Club"].map(club => (
 <label key={club} className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 py-2 rounded border border-black/10 dark:border-white/20 cursor-pointer hover:border-themeAccent/50">
 <input type="checkbox" checked={qForm.clubs.includes(club)} onChange={() => handleCheckboxChange('clubs', club)} className="accent-themeAccent" />
 <span className="text-xs font-bold text-themeTextSec">{club}</span>
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeText block mb-2">Technical Skills</label>
 <div className="flex flex-wrap gap-2">
 {["Legal Research", "Drafting", "Public Speaking", "MS Office", "AI Tools"].map(skill => (
 <label key={skill} className="flex items-center gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 py-2 rounded border border-black/10 dark:border-white/20 cursor-pointer hover:border-themeAccent/50">
 <input type="checkbox" checked={qForm.skills.includes(skill)} onChange={() => handleCheckboxChange('skills', skill)} className="accent-themeAccent" />
 <span className="text-xs font-bold text-themeTextSec">{skill}</span>
 </label>
 ))}
 </div>
 </div>

 <button type="submit" className="btn-erp">
 Submit Questionnaire
 </button>
 </form>
 </div>
 )}

 {/* Information Grid Layout */}
                        {userSession?.role === 'admin' ? (
                            <div className="grid grid-cols-1 gap-6 lg:gap-8">
                                <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl p-6 lg:p-8 flex flex-col gap-8 shadow-inner">
                                    <div>
                                        <h3 className="text-sm font-bold tracking-widest text-themeText dark:text-white uppercase mb-6 border-b border-black/10 dark:border-white/10 pb-3 flex items-center gap-3">
                                            <i className="fa-solid fa-shield-halved text-themeAccent text-lg"></i> System Clearance & Access
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Account Type</span>
                                                <span className="text-sm font-black text-themeText dark:text-white">Super Administrator</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Clearance Level</span>
                                                <span className="text-sm font-black text-emerald-500">Tier 1 (Global)</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Database Access</span>
                                                <span className="text-sm font-bold text-themeText dark:text-white">Read / Write / Delete</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Last Audit</span>
                                                <span className="text-sm font-bold text-themeText dark:text-white">{new Date().toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-bold tracking-widest text-themeText dark:text-white uppercase mb-6 border-b border-black/10 dark:border-white/10 pb-3 flex items-center gap-3">
                                            <i className="fa-solid fa-satellite-dish text-themeAccent text-lg"></i> Contact Protocols
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">System Email</span>
                                                <span className="text-sm font-bold text-themeText dark:text-white break-all">{profileData.email || "Not Updated"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Emergency Ping</span>
                                                <span className="text-sm font-bold text-themeText dark:text-white">{profileData.phone || "Not Updated"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
 
 {/* Personal Information */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl border border-black/10 dark:border-white/20 p-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-4 border-b border-black/5 dark:border-white/10 pb-2"><i className="fa-regular fa-user mr-2 text-themeTextSec"></i> Personal Information</h3>
 <div className="flex flex-col gap-4">
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Date of Birth</span>
 <span className="text-xs font-bold text-themeText">{profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-GB') : "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Gender</span>
 <span className="text-xs font-bold text-themeText">{profileData.gender || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Blood Group</span>
 <span className="text-xs font-bold text-themeText">{profileData.blood_group || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Nationality</span>
 <span className="text-xs font-bold text-themeText">{profileData.nationality || "Indian"}</span>
 </div>
 </div>
 </div>

 {/* Contact Information */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl border border-black/10 dark:border-white/20 p-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-4 border-b border-black/5 dark:border-white/10 pb-2"><i className="fa-regular fa-address-book mr-2 text-themeTextSec"></i> Contact Information</h3>
 <div className="flex flex-col gap-4">
 <div className="grid grid-cols-[1fr_2fr] gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">College Email</span>
 <span className="text-xs font-bold text-themeText break-all">{profileData.email || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-[1fr_2fr] gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Personal Email</span>
 <span className="text-xs font-bold text-themeText break-all">{qd.personalEmail || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-[1fr_2fr] gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Mobile Number</span>
 <span className="text-xs font-bold text-themeText">{profileData.phone || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-[1fr_2fr] gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Address</span>
 <span className="text-xs font-bold text-themeText">{qd.currentAddress || "Not Updated"}</span>
 </div>
 </div>
 </div>

 {/* Academic/Professional Information */}
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl border border-black/10 dark:border-white/20 p-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-4 border-b border-black/5 dark:border-white/10 pb-2"><i className="fa-solid fa-briefcase mr-2 text-themeTextSec"></i> {userSession?.role === 'student' ? 'Academic Information' : 'Professional Information'}</h3>
 <div className="flex flex-col gap-4">
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Department</span>
 <span className="text-xs font-bold text-themeText">{profileData.department || "N/A"}</span>
 </div>
 {userSession?.role === 'student' && (
 <>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Admission Year</span>
 <span className="text-xs font-bold text-themeText">{profileData.academic_batch?.split('-')[0] || "N/A"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Current CGPA</span>
 <span className="text-xs font-black text-themeAccent">{profileData.cgpa ? parseFloat(profileData.cgpa).toFixed(2) : "0.00"}</span>
 </div>
 </>
 )}
 </div>
 </div>

 {/* Emergency Contact & Documents */}
 <div className="flex flex-col gap-6 lg:gap-8">
 <div className="bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 rounded-xl border border-black/10 dark:border-white/20 p-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-4 border-b border-black/5 dark:border-white/10 pb-2"><i className="fa-solid fa-truck-medical mr-2 text-themeTextSec"></i> Emergency Contact</h3>
 <div className="flex flex-col gap-4">
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Name</span>
 <span className="text-xs font-bold text-themeText">{qd.emergencyName || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Relationship</span>
 <span className="text-xs font-bold text-themeText">{qd.emergencyRelation || "Not Updated"}</span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Phone Number</span>
 <span className="text-xs font-bold text-themeText">{qd.emergencyPhone || "Not Updated"}</span>
 </div>
 </div>
 </div>
 </div>

 </div>
                        )}

                        {/* 3. DIGITAL ID CARD PREVIEW */}
 <div className="w-full flex flex-col items-center mt-8 gap-6">
    <div className="flex items-center justify-between w-full max-w-sm">
        <h3 className="text-[14px] font-bold tracking-widest text-themeText uppercase"><i className="fa-solid fa-id-badge text-themeAccent mr-2"></i> Digital ID Card</h3>
        <button type="button" onClick={handleDownloadID} disabled={isGeneratingID} className="bg-themeAccent hover:bg-themeAccent/80 text-themeApp px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2">
            {isGeneratingID ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>}
            Download PDF
        </button>
    </div>
    <div className="w-full max-w-sm p-2 bg-black/5 dark:bg-white/5 backdrop-blur-2xl border border-black/10 dark:border-white/10 border-dashed rounded-3xl flex justify-center">
        <IDCardTemplate ref={idCardRef} profileData={profileData} roleTitle={roleTitle} userSession={userSession} />
 </div>
 </div>
 </div>
 )}

 {/* Modals */}
 {showEditModal && (
 <ProfileEditModal 
 profileData={profileData}
 userRole={userSession?.role || 'student'}
 onClose={() => setShowEditModal(false)}
 onSubmit={async (data, isDirectUpdate) => {
 if (isDirectUpdate) {
 // Update local profile data immediately
 setProfileData(prev => ({
 ...prev,
 phone: data.phone,
 blood_group: data.blood_group,
 dob: data.dob,
 profile_picture_url: data.profile_picture_url,
 questionnaire_data: data.questionnaire_data
 }));
 // Refresh global session so navbar/sidebar update
 if (refreshProfile) await refreshProfile();
 } else {
 setPendingRequest(data);
 }
 setShowEditModal(false);
 }}
 hasPendingRequest={!!pendingRequest}
 />
 )}
 </div>
 );
}

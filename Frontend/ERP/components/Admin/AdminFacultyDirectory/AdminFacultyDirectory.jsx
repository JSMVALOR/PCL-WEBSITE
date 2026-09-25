/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import { sendSystemEmail } from '../../../lib/EmailService';
import { createClient } from '@supabase/supabase-js';
import AdminFacultyEditorModal from './AdminFacultyEditorModal';
import PageHeader from "../../shared/PageHeader/PageHeader";

// Safe provisioning client so admin doesn't get logged out
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const provisionClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
 auth: { persistSession: false, autoRefreshToken: false }
});

export default function AdminFacultyDirectory({ isEmbedded = false,  isHubView = false }) {
 const { userSession } = useERP();
 const [faculties, setFaculties] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 const [isProvisioning, setIsProvisioning] = useState(false);
 const [provisionSuccess, setProvisionSuccess] = useState(false);
 const [provisionLogs, setProvisionLogs] = useState([]);
 const [editFacultyId, setEditFacultyId] = useState(null);

 const [formData, setFormData] = useState({ name: '',
 email: '',
 department: '',
 designation: '',
 specialisation: '',
 degrees: '',
 office: '',
 phone: '',
 linkedin: '',
 scholar: '',
 image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // default avatar
 is_public: true
 });

 useEffect(() => {
 fetchDirectory();
 }, []);

 const fetchDirectory = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('profiles')
 .select(`
 id, 
 full_name, 
 email, 
 department, 
 erp_id,
 faculty_profiles (
 designation,
 specialisation,
 is_public,
 image_url
 )
 `)
 .eq('role', 'faculty');

 if (error) throw error;
 setFaculties(data || []);
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsLoading(false);
 }
 };

 const handleInputChange = (e) => {
 const { name, value, type, checked } = e.target;
 setFormData(prev => ({ ...prev,
 [name]: type === 'checkbox' ? checked : value
 }));
 };

 const handleProvisionSubmit = async (e) => {
 e.preventDefault();
 setIsProvisioning(true);
 setProvisionLogs([]);
 setProvisionSuccess(false);

 const email = formData.email.trim();
 const prefix = "FAC-";

 try {
 // 1. Generate sequential ERP ID
 const { data: highestIdData, error: highestIdError } = await supabase
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
 if (!isNaN(parsedNum)) {
 nextNum = parsedNum + 1;
 }
 }
 const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
 setProvisionLogs(prev => [...prev, `[${generatedId}] Initializing provisioning...`]);

 // 2. Generate secure password
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 let generatedPassword = "Jsm#";
 for (let i = 0; i < 6; i++) {
 generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
 }

 // 3. Create Auth Account
 setProvisionLogs(prev => [...prev, `[${generatedId}] Creating authentication identity...`]);
 const { data: authData, error: authError } = await provisionClient.auth.signUp({ email: email,
 password: generatedPassword });

 if (authError) throw authError;
 if (!authData.user) throw new Error("User creation failed.");
 const userId = authData.user.id;

 // 4. Create base Profile
 setProvisionLogs(prev => [...prev, `[${generatedId}] Creating internal ERP profile...`]);
 const { error: profileError } = await supabase.from('profiles').upsert({ id: userId,
 erp_id: generatedId,
 full_name: formData.name,
 email: email,
 role: 'faculty',
 department: formData.department,
 status: 'Active'
 });
 if (profileError) throw profileError;

 // 5. Create Public Faculty Profile
 setProvisionLogs(prev => [...prev, `[${generatedId}] Registering public website schema...`]);
 const { error: facultyProfileError } = await supabase.from('faculty_profiles').upsert({ id: userId,
 designation: formData.designation,
 specialisation: formData.specialisation,
 degrees: formData.degrees,
 office_address: formData.office,
 phone: formData.phone,
 linkedin_url: formData.linkedin,
 scholar_url: formData.scholar,
 image_url: formData.image_url,
 education: [],
 research: [],
 projects: [],
 patents: [],
 awards: [],
 is_public: formData.is_public
 });

 if (facultyProfileError) throw facultyProfileError;

 // 6. Send Email
 setProvisionLogs(prev => [...prev, `[EMAIL] Dispatching secure setup link via Supabase...`]);
 try {
 const { error: resetError } = await provisionClient.auth.resetPasswordForEmail(formData.email, {
 redirectTo: window.location.origin
 });
 if (resetError) throw resetError;
 setProvisionLogs(prev => [...prev, `[SUCCESS] Setup link successfully dispatched to ${formData.email}!`]);
 } catch (emailErr) {
 setProvisionLogs(prev => [...prev, `[WARNING] Link dispatch failed: ${emailErr.message}. Credentials: ID=${generatedId}, PW=${generatedPassword}`]);
 }

 setProvisionLogs(prev => [...prev, `[SYSTEM] Pipeline complete! Faculty account provisioned.`]);
 setProvisionSuccess(true);
 fetchDirectory();
 } catch (error) {
 setProvisionLogs(prev => [...prev, `[FATAL ERROR] ${error.message}`]);
 } finally {
 setIsProvisioning(false);
 }
 };

 const toggleVisibility = async (id, currentStatus) => {
 try {
 const { error } = await supabase
 .from('faculty_profiles')
 .update({ is_public: !currentStatus })
 .eq('id', id);
 
 if (error) throw error;
 fetchDirectory();
 } catch (err) {
 window.erpDialog?.alert('Failed to update visibility');
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-transparent text-themeText dark:text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 {/* 1. HEADER BANNER */}
 {!isHubView && (
 <PageHeader icon="fa-solid fa-address-book" title="Public Faculty Directory" subtitle="Manage faculty profiles & provision accounts for the public website." rightContent={
<>
<button type="button"
 onClick={() => {
 setFormData({ name: '', email: '', department: '', designation: '', specialisation: '', degrees: '', office: '', phone: '', linkedin: '', scholar: '', image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', is_public: true
 });
 setProvisionSuccess(false);
 setShowModal(true);
 }}
 className="w-full lg:w-auto bg-white/10 hover:bg-white/20 text-themeText dark:text-white px-6 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex justify-center items-center gap-2 border border-black/10 dark:border-white/20 backdrop-blur-md active:scale-[0.98]"
 >
 <i className="fa-solid fa-user-plus text-base"></i> Add New Faculty
 </button>
</>
} />
 )}
 
 {/* FAB FOR HUB VIEW */}
 {isHubView && (
 <div className="flex justify-end mb-4 -mt-4 lg:-mt-6">
 <button type="button"
 onClick={() => {
 setFormData({ name: '', email: '', department: '', designation: '', specialisation: '', degrees: '', office: '', phone: '', linkedin: '', scholar: '', image_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', is_public: true
 });
 setProvisionSuccess(false);
 setShowModal(true);
 }}
 className="bg-themeAccent hover:bg-themeAccent/80 text-themeText dark:text-white px-6 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition flex justify-center items-center gap-2 border border-black/[0.04] dark:border-white/[0.08]Accent/50 active:scale-[0.98]"
 >
 <i className="fa-solid fa-user-plus text-base"></i> Add New Faculty
 </button>
 </div>
 )}

 {/* 2. DIRECTORY GRID */}
 {isLoading ? (
 <div className="flex flex-col items-center justify-center p-12 opacity-50">
 <div className="animate-spin w-8 h-8 border-4 border-themeBorder dark:border-white/5Accent border-t-transparent rounded-full mb-4"></div>
 <p className="font-black tracking-normal text-themeTextSec dark:text-white/50">Loading Directory...</p>
 </div>
 ) : faculties.length === 0 ? (
 <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
 <i className="fa-solid fa-chalkboard-user text-5xl text-themeTextSec dark:text-white/50/30 mb-4"></i>
 <h3 className="font-black uppercase text-xl mb-2 text-themeText dark:text-white">No Faculty Found</h3>
 <p className="text-themeTextSec dark:text-white/50 font-medium text-sm">Add a faculty member to populate the public website.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {faculties.map((fac) => (
 <div key={fac.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl flex flex-col group hover:-translate-y-1 transition overflow-hidden">
 <div className="p-5 border-b border-themeBorder dark:border-white/5 bg-black/5 dark:bg-themeApp/30 flex items-center justify-between">
 <div className="flex items-center gap-3">
 {fac.faculty_profiles?.image_url && fac.faculty_profiles.image_url !== 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' ? (
 <img src={fac.faculty_profiles.image_url} alt={fac.full_name} className="w-12 h-12 rounded-xl object-cover border border-black/[0.04] dark:border-white/[0.08] shrink-0" />
 ) : (
 <div className="w-12 h-12 bg-themeAccent/20 text-themeAccent border border-black/[0.04] dark:border-white/[0.08]Accent/30 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
 {fac.full_name?.charAt(0) || '?'}
 </div>
 )}
 <div className="min-w-0">
 <p className="font-black uppercase tracking-wide truncate text-themeText dark:text-white">{fac.full_name}</p>
 <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 tracking-normal truncate">{fac.erp_id}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button type="button" 
 onClick={() => setEditFacultyId(fac.id)}
 className="w-8 h-8 rounded-full bg-themeAccent/10 hover:bg-themeAccent text-themeAccent hover:text-themeText dark:text-white flex items-center justify-center transition-colors"
 title="Edit Faculty Profile"
 >
 <i className="fa-solid fa-pen text-xs"></i>
 </button>
 <button type="button" 
 onClick={() => toggleVisibility(fac.id, fac.faculty_profiles?.is_public)}
 className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center border border-black/[0.04] dark:border-white/[0.08] ${fac.faculty_profiles?.is_public ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-neutral-600/30'}`}
 title={fac.faculty_profiles?.is_public ? 'Publicly Visible' : 'Hidden from Public'}
 >
 <div className={`w-4 h-4 rounded-full transition-transform ${fac.faculty_profiles?.is_public ? 'bg-emerald-500 translate-x-4' : 'bg-neutral-500 translate-x-0'}`}></div>
 </button>
 </div>
 </div>
 <div className="p-5 flex flex-col gap-3 flex-1">
 <div>
 <p className="text-[10px] uppercase font-black tracking-widest text-themeTextSec dark:text-white/50 mb-1 ml-1">Department</p>
 <p className="text-sm font-bold bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-lg p-2.5 truncate text-themeText dark:text-white">{fac.department || 'N/A'}</p>
 </div>
 
 <div>
 <p className="text-[10px] uppercase font-black tracking-widest text-themeTextSec dark:text-white/50 mb-1 ml-1">Designation</p>
 <p className="text-sm font-bold bg-themeAccent/5 border border-black/[0.04] dark:border-white/[0.08]Accent/20 text-themeAccent rounded-lg p-2.5 truncate">{fac.faculty_profiles?.designation || 'N/A'}</p>
 </div>
 
 <div>
 <p className="text-[10px] uppercase font-black tracking-widest text-themeTextSec dark:text-white/50 mb-1 ml-1">Specialisation</p>
 <p className="text-sm font-bold bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-lg p-2.5 truncate text-white/80">{fac.faculty_profiles?.specialisation || 'N/A'}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* 3. PROVISIONING MODAL */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] w-full max-w-3xl border border-black/[0.04] dark:border-white/[0.08] rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
 <div className="bg-black/5 dark:bg-themeApp p-5 lg:p-6 text-themeText dark:text-white relative shrink-0 border-b border-themeBorder dark:border-white/5 flex justify-between items-center">
 <div>
 <h3 className="text-xl font-semibold tracking-tight uppercase tracking-tight">Add New Faculty</h3>
 <p className="text-xs font-bold tracking-normal text-themeTextSec dark:text-white/50">Provisions account & updates website.</p>
 </div>
 <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 bg-black hover:bg-neutral-800 rounded-full border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white transition-colors">
 <i className="fa-solid fa-xmark text-lg"></i>
 </button>
 </div>

 <div className="overflow-y-auto p-5 lg:p-6 flex-1 bg-black no-scrollbar">
 {provisionSuccess ? (
 <div className="text-center py-8">
 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-6">
 <i className="fa-solid fa-check"></i>
 </div>
 <h2 className="text-2xl font-semibold tracking-tight tracking-normal mb-2 text-themeText dark:text-white">Faculty Added!</h2>
 <p className="font-bold text-themeTextSec dark:text-white/50 uppercase text-xs mb-8">Website synchronized successfully.</p>
 <div className="bg-black text-emerald-400 p-5 rounded-xl text-left font-mono text-xs border border-black/[0.04] dark:border-white/[0.08] max-h-48 overflow-y-auto mx-auto max-w-lg mb-8">
 {provisionLogs.map((log, i) => <div key={i} className="mb-1">&gt; {log}</div>)}
 </div>
 <button type="button" onClick={() => setShowModal(false)} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-black/5 dark:bg-themeApp text-themeText dark:text-white px-8 py-3 rounded-xl font-black uppercase text-sm transition-colors">
 Close Window
 </button>
 </div>
 ) : (
 <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-6">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Full Name</label>
 <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Email Address</label>
 <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Department</label>
 <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white appearance-none transition cursor-pointer">
 <option value="">Select Department...</option>
 <option value="Department of Legal Studies">Department of Legal Studies</option>
 <option value="Department of Management">Department of Management</option>
 <option value="Department of Public Policy">Department of Public Policy</option>
 </select>
 </div>
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Designation</label>
 <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} required placeholder="e.g. Professor of Law" className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 </div>

 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Specialisation Area</label>
 <input type="text" name="specialisation" value={formData.specialisation} onChange={handleInputChange} placeholder="e.g. Constitutional Law, Human Rights" className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>

 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Degrees (Comma Separated)</label>
 <input type="text" name="degrees" value={formData.degrees} onChange={handleInputChange} placeholder="e.g. B.A., LL.B., LL.M." className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Office Location</label>
 <input type="text" name="office" value={formData.office} onChange={handleInputChange} placeholder="e.g. Block A, Room 101" className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Contact Phone</label>
 <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +91 98765 43210" className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">LinkedIn URL</label>
 <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 <div>
 <label className="block text-[13px] font-medium mb-1.5 ml-1 text-themeTextSec dark:text-white/50">Google Scholar URL</label>
 <input type="url" name="scholar" value={formData.scholar} onChange={handleInputChange} placeholder="https://scholar.google.com/..." className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-3.5 font-bold focus:border-themeBorder dark:border-white/5Accent focus:ring-1 focus:ring-themeAccent outline-none text-themeText dark:text-white placeholder:text-themeTextSec dark:text-white/50/50 transition" />
 </div>
 </div>

 <div className="flex items-center gap-4 p-5 bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl mt-2">
 <div className="relative flex items-center">
 <input 
 type="checkbox" 
 name="is_public" 
 id="is_public"
 checked={formData.is_public} 
 onChange={handleInputChange} 
 className="peer sr-only" 
 />
 <div className="w-11 h-6 bg-neutral-600 rounded-full peer peer-checked:bg-themeAccent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] after:border-themeBorder after:border after:rounded-full after:h-5 after:w-5 after:transition cursor-pointer"></div>
 </div>
 <label htmlFor="is_public" className="text-[14px] font-medium tracking-normal cursor-pointer text-themeText dark:text-white select-none">
 Visible on Public Website
 </label>
 </div>

 <button 
 type="submit" 
 disabled={isProvisioning}
 className="mt-6 w-full bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white rounded-xl p-4 font-black tracking-normal text-sm active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
 >
 {isProvisioning ? (
 <><i className="fa-solid fa-circle-notch fa-spin"></i> Provisioning...</>
 ) : (
 <><i className="fa-solid fa-cloud-arrow-up"></i> Provision Account & Publish</>
 )}
 </button>
 </form>
 )}
 </div>
 </div>
 </div>
 )}
 {/* 4. EDIT FACULTY MODAL */}
 {editFacultyId && (
 <AdminFacultyEditorModal 
 facultyId={editFacultyId}
 onClose={() => setEditFacultyId(null)}
 onSave={() => {
 setEditFacultyId(null);
 fetchDirectory();
 }}
 />
 )}
 </div>
 </div>
 );
}
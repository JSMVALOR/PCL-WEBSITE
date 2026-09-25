/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminPlacements({ isEmbedded = false,  isHubView = false }) {
 const [activeTab, setActiveTab] = useState("drives");
 const [drives, setDrives] = useState([]);
 const [applications, setApplications] = useState([]);
 const [inquiries, setInquiries] = useState([]);
 
 // Create Drive State
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [driveForm, setDriveForm] = useState({ company_name: "",
 role_title: "",
 drive_date: "",
 eligibility_criteria: "",
 package_details: ""
 });

 useEffect(() => {
 fetchDrives();
 fetchApplications();
 fetchInquiries();
 }, []);

 const fetchDrives = async () => {
 try {
 const { data, error } = await supabase.from('placement_drives').select('*').order('created_at', { ascending: false });
 if (!error && data) setDrives(data);
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const fetchApplications = async () => {
 try {
 const { data, error } = await supabase
 .from('placement_applications')
 .select(`
 id, drive_id, student_id, resume_url, status, created_at,
 profiles!placement_applications_student_id_fkey(full_name, erp_id),
 placement_drives!placement_applications_drive_id_fkey(company_name, role_title)
 `)
 .order('created_at', { ascending: false });
 if (!error && data) setApplications(data);
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const fetchInquiries = async () => {
 try {
 const { data, error } = await supabase
 .from('placement_inquiries')
 .select('*')
 .order('created_at', { ascending: false });
 if (!error && data) setInquiries(data);
 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const handleCreateDrive = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const { error } = await supabase.from('placement_drives').insert({ ...driveForm,
 status: "Open"
 });
 if (error) throw error;
 window.erpDialog?.alert("Placement Drive created successfully!");
 setShowCreateModal(false);
 setDriveForm({ company_name: "", role_title: "", drive_date: "", eligibility_criteria: "", package_details: "" });
 fetchDrives();
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsSubmitting(false);
 }
 };

 const handleUpdateApplicationStatus = async (appId, newStatus) => {
 try {
 const { error } = await supabase.from('placement_applications').update({ status: newStatus }).eq('id', appId);
 if (error) throw error;
 fetchApplications();
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 const handleUpdateInquiryStatus = async (inqId, newStatus) => {
 try {
 const { error } = await supabase.from('placement_inquiries').update({ status: newStatus }).eq('id', inqId);
 if (error) throw error;
 fetchInquiries();
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-transparent text-themeText dark:text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 {!isHubView && (
 <PageHeader icon="fa-solid fa-briefcase" title="Placements & Internships" subtitle="Manage firm recruitment, tracks, and student placements." rightContent={
<>
<button type="button"
 onClick={() => setShowCreateModal(true)}
 className="w-full lg:w-auto px-6 py-3 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] hover:bg-white/90 text-themeAccent rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center justify-center gap-2 border border-white/50"
 >
 <i className="fa-solid fa-plus"></i> Create Drive
 </button>
 </>
} />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-2xl border border-black/[0.04] dark:border-white/[0.08]BorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`}>
 <button type="button" onClick={() => setActiveTab('drives')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'drives' ? 'bg-themeAccent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.25)] border border-themeAccent scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-building"></i> Placement Drives
 </button>
 <button type="button" onClick={() => setActiveTab('applications')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'applications' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)] border border-indigo-500 scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-file-contract"></i> Applications
 </button>
 <button type="button" onClick={() => setActiveTab('inquiries')} className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${activeTab === 'inquiries' ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] border border-emerald-500 scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-transparent scale-95 hover:scale-100'}`}>
 <i className="fa-solid fa-handshake"></i> Company Inquiries
 {inquiries.filter(i => i.status === 'pending').length > 0 && (
 <span className="ml-1 w-2 h-2 rounded-full bg-red-500"></span>
 )}
 </button>
 </div>

 {activeTab === 'drives' && (
 <div className="flex flex-col gap-4">
 {drives.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl">
 <i className="fa-solid fa-building text-4xl mb-4 opacity-50"></i>
 <p>No active placement drives.</p>
 </div>
 ) : (
 drives.map(drive => (
 <div key={drive.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] flex flex-col gap-4 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-themeAccent/10 transition-colors pointer-events-none"></div>
 
 <div className="flex justify-between items-start relative z-10">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className={`text-[13px] font-medium px-2.5 py-1 rounded-md border-themeBorder dark:border-white/5 ${drive.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
 {drive.status}
 </span>
 <span className="text-[10px] font-bold text-themeTextSec tracking-normal">
 Drive Date: {new Date(drive.drive_date).toLocaleDateString()}
 </span>
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText mb-1">{drive.company_name}</h3>
 <p className="text-sm font-bold text-themeAccent">{drive.role_title}</p>
 </div>
 <button type="button" 
 onClick={async () => {
 const newStatus = drive.status === 'Open' ? 'Closed' : 'Open';
 const { error } = await supabase.from('placement_drives').update({ status: newStatus }).eq('id', drive.id);
 if (!error) fetchDrives();
 }} 
 className="px-4 py-2 bg-black/5 dark:bg-themeElevated hover:bg-neutral-800 border border-black/[0.04] dark:border-white/[0.08] rounded-lg text-[10px] font-black text-themeTextSec tracking-normal transition-colors"
 >
 Toggle Status
 </button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 relative z-10">
 <div className="bg-black/5 dark:bg-themeElevated/90 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
 <p className="text-[10px] font-black text-themeTextSec tracking-normal mb-2"><i className="fa-solid fa-clipboard-list mr-1"></i> Eligibility</p>
 <p className="text-xs text-themeText font-medium whitespace-pre-wrap">{drive.eligibility_criteria || "No specific criteria."}</p>
 </div>
 <div className="bg-black/5 dark:bg-themeElevated/90 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
 <p className="text-[10px] font-black text-themeTextSec tracking-normal mb-2"><i className="fa-solid fa-sack-dollar mr-1"></i> Package Details</p>
 <p className="text-xs text-themeText font-medium whitespace-pre-wrap">{drive.package_details || "Not disclosed."}</p>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 )}

 {activeTab === 'applications' && (
 <div className="flex flex-col gap-4">
 {applications.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl">
 <i className="fa-solid fa-file-invoice text-4xl mb-4 opacity-50"></i>
 <p>No student applications received yet.</p>
 </div>
 ) : (
 applications.map(app => {
 const studentName = app.profiles?.full_name || "Unknown Student";
 const studentId = app.profiles?.erp_id || "Unknown ID";
 const company = app.placement_drives?.company_name || "Unknown Company";
 const role = app.placement_drives?.role_title || "Unknown Role";
 
 return (
 <div key={app.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-[13px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border-themeBorder dark:border-white/5 border-indigo-500/20">
 {company}
 </span>
 <span className="text-[10px] font-bold text-themeTextSec tracking-normal px-2 py-1 bg-black/5 dark:bg-themeElevated rounded border border-black/[0.04] dark:border-white/[0.08]">
 {role}
 </span>
 </div>
 <h3 className="text-base font-black text-themeText mb-1">{studentName}</h3>
 <p className="text-xs font-bold text-themeTextSec tracking-normal">ID: {studentId}</p>
 {app.resume_url && (
 <a href={app.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-themeAccent hover:underline">
 <i className="fa-solid fa-file-pdf"></i> View Resume
 </a>
 )}
 </div>
 <div className="flex flex-col gap-3 min-w-[200px]">
 <span className={`text-[13px] font-medium px-3 py-1.5 rounded-lg border-themeBorder dark:border-white/5 text-center ${
 app.status === 'Applied' ? 'bg-black/5 dark:bg-themeElevated text-themeText border-themeBorder dark:border-white/5' :
 app.status === 'Shortlisted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
 app.status === 'Interviewed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
 app.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
 'bg-rose-500/10 text-rose-400 border-rose-500/30'
 }`}>
 Status: {app.status}
 </span>
 <select 
 value={app.status}
 onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
 className="bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-3 py-2 text-[10px] font-black text-themeText tracking-normal outline-none focus:border-themeAccent appearance-none cursor-pointer"
 >
 <option value="Applied">Mark Applied</option>
 <option value="Shortlisted">Mark Shortlisted</option>
 <option value="Interviewed">Mark Interviewed</option>
 <option value="Selected">Mark Selected</option>
 <option value="Rejected">Mark Rejected</option>
 </select>
 </div>
 </div>
 );
 })
 )}
 </div>
 )}

 {activeTab === 'inquiries' && (
 <div className="flex flex-col gap-4">
 {inquiries.length === 0 ? (
 <div className="p-12 text-center text-themeTextSec bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl">
 <i className="fa-solid fa-handshake text-4xl mb-4 opacity-50"></i>
 <p>No company recruitment inquiries received yet.</p>
 </div>
 ) : (
 inquiries.map(inq => (
 <div key={inq.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] flex flex-col md:flex-row md:items-start justify-between gap-6">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <span className={`text-[13px] font-medium px-2 py-1 rounded border-themeBorder dark:border-white/5 ${
 inq.status === 'pending' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
 }`}>
 {inq.status}
 </span>
 <span className="text-[10px] font-bold text-themeTextSec tracking-normal">
 {new Date(inq.created_at).toLocaleString()}
 </span>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText mb-1">{inq.company_name}</h3>
 <div className="flex flex-col gap-1 mb-4">
 <p className="text-xs font-bold text-themeTextSec"><i className="fa-solid fa-user mr-2 w-4"></i>{inq.contact_person}</p>
 <p className="text-xs font-bold text-themeTextSec"><i className="fa-solid fa-envelope mr-2 w-4"></i>{inq.email}</p>
 {inq.phone && <p className="text-xs font-bold text-themeTextSec"><i className="fa-solid fa-phone mr-2 w-4"></i>{inq.phone}</p>}
 </div>
 <div className="bg-black/5 dark:bg-themeElevated/90 p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
 <p className="text-xs text-themeText font-medium whitespace-pre-wrap">{inq.message}</p>
 </div>
 </div>
 <div className="flex flex-col gap-3 min-w-[200px]">
 <a href={`mailto:${inq.email}?subject=Prudentia College of Law - Placement Inquiry`} className="w-full text-center px-4 py-2 bg-themeAccent/10 text-themeAccent hover:bg-themeAccent hover:text-themeText border-themeBorder dark:border-white/5 border-themeAccent/30 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2">
 <i className="fa-solid fa-reply"></i> Reply via Email
 </a>
 <select 
 value={inq.status}
 onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
 className="bg-black/5 dark:bg-themeElevated/90 border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-3 py-2 text-[10px] font-black text-themeText tracking-normal outline-none focus:border-themeAccent appearance-none cursor-pointer"
 >
 <option value="pending">Mark as Pending</option>
 <option value="reviewed">Mark as Reviewed</option>
 <option value="contacted">Mark as Contacted</option>
 </select>
 </div>
 </div>
 ))
 )}
 </div>
 )}

 {/* CREATE DRIVE MODAL */}
 {showCreateModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 dark:bg-themeElevated/90/80 backdrop-blur-sm animate-fade-in">
 <div className="bg-black/5 dark:bg-themeElevated/90 w-full max-w-lg rounded-2xl overflow-hidden border border-black/[0.04] dark:border-white/[0.08] flex flex-col max-h-[90vh]">
 <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-6 border-themeBorder dark:border-white/5 border-themeBorder dark:border-white/5 flex justify-between items-center">
 <h3 className="text-xl font-semibold tracking-tight text-themeText">Create Placement Drive</h3>
 <button type="button" onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-themeElevated border border-black/[0.04] dark:border-white/[0.08] text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
 </div>
 <form onSubmit={handleCreateDrive} className="p-6 flex flex-col gap-4 overflow-y-auto no-scrollbar">
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Company Name</label>
 <input type="text" value={driveForm.company_name} onChange={e => setDriveForm({ ...driveForm, company_name: e.target.value})} className="w-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" required />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Role Title</label>
 <input type="text" value={driveForm.role_title} onChange={e => setDriveForm({ ...driveForm, role_title: e.target.value})} className="w-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" required />
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Drive Date</label>
 <input min="2026-09-14" type="date" value={driveForm.drive_date} onChange={e => setDriveForm({ ...driveForm, drive_date: e.target.value})} className="w-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none focus:border-themeAccent transition-colors" required />
 </div>
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Eligibility Criteria</label>
 <textarea rows="2" value={driveForm.eligibility_criteria} onChange={e => setDriveForm({ ...driveForm, eligibility_criteria: e.target.value})} className="w-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none resize-none focus:border-themeAccent transition-colors" placeholder="e.g. Min 7.0 CGPA, No active backlogs" required></textarea>
 </div>
 <div>
 <label className="block text-[13px] font-medium text-themeTextSec mb-2 ml-1">Package Details</label>
 <textarea rows="2" value={driveForm.package_details} onChange={e => setDriveForm({ ...driveForm, package_details: e.target.value})} className="w-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none resize-none focus:border-themeAccent transition-colors" placeholder="e.g. 12 LPA CTC, 6-month internship + PPO" required></textarea>
 </div>
 <button type="submit" disabled={isSubmitting} className="btn-erp disabled:cursor-not-allowed">
 {isSubmitting ? "Saving..." : "Publish Drive"}
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
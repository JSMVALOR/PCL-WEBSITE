/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminCareers({ isHubView = false }) {
 const [jobs, setJobs] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [currentJob, setCurrentJob] = useState(null);
 const [formData, setFormData] = useState({
 title: "",
 department: "Faculty",
 type: "Full-time",
 location: "On-Campus",
 description: "",
 is_active: true
 });

 useEffect(() => {
 fetchJobs();
 }, []);

 const fetchJobs = async () => {
 setIsLoading(true);
 try {
 const { data, error } = await supabase
 .from('admin_careers')
 .select('*')
 .order('created_at', { ascending: false });
 if (error) throw error;
 setJobs(data || []);
 } catch (error) {
 console.error("Failed to fetch jobs:", error);
 window.erpDialog?.alert("Failed to load jobs.");
 } finally {
 setIsLoading(false);
 }
 };

 const handleCreateNew = () => {
 setCurrentJob(null);
 setFormData({ title: "", department: "Faculty", type: "Full-time", location: "On-Campus", description: "", is_active: true });
 setIsEditing(true);
 };

 const handleEdit = (job) => {
 setCurrentJob(job);
 setFormData({
 title: job.title,
 department: job.department,
 type: job.type,
 location: job.location,
 description: job.description || "",
 is_active: job.is_active
 });
 setIsEditing(true);
 };

 const handleSave = async (e) => {
 e.preventDefault();
 try {
 if (currentJob?.id) {
 const { error } = await supabase.from('admin_careers').update(formData).eq('id', currentJob.id);
 if (error) throw error;
 window.erpDialog?.alert("Job updated successfully!");
 } else {
 const { error } = await supabase.from('admin_careers').insert([formData]);
 if (error) throw error;
 window.erpDialog?.alert("Job created successfully!");
 }
 setIsEditing(false);
 fetchJobs();
 } catch (error) {
 console.error("Save failed:", error);
 window.erpDialog?.alert("Could not save to database.");
 setIsEditing(false);
 }
 };

 const handleDelete = async () => {
 if (!window.confirm("Are you sure you want to permanently delete this job posting?")) return;
 try {
 const { error } = await supabase.from('admin_careers').delete().eq('id', currentJob.id);
 if (error) throw error;
 window.erpDialog?.alert("Job deleted.");
 setIsEditing(false);
 fetchJobs();
 } catch (error) {
 console.error("Delete failed.", error);
 window.erpDialog?.alert("Could not delete job.");
 setIsEditing(false);
 }
 };

 if (isEditing) {
 return (
 <div className={`w-full ${!isHubView ? 'w-full mx-auto p-6 lg:p-8' : ''} animate-fade-in`}>
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-semibold tracking-tight text-themeText tracking-tight">{currentJob ? 'Edit Job Posting' : 'New Job Posting'}</h2>
 <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder text-themeText text-[14px] font-medium tracking-normal rounded-lg transition-colors border border-black/5 dark:border-white/10">
 <i className="fa-solid fa-arrow-left mr-2"></i> Back
 </button>
 </div>
 
 <form onSubmit={handleSave} className="flex flex-col gap-6 bg-themePanel/85 backdrop-blur-2xl p-6 rounded-2xl border border-gray-200 dark:border-white/5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Job Title</label>
 <input required type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Assistant Professor of Law" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Department</label>
 <input required type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Faculty, Administration" />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Job Type</label>
 <select className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
 <option value="Full-time">Full-time</option>
 <option value="Part-time">Part-time</option>
 <option value="Contract">Contract</option>
 <option value="Internship">Internship</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Location</label>
 <select className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
 <option value="On-Campus">On-Campus</option>
 <option value="Hybrid">Hybrid</option>
 <option value="Remote">Remote</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Status</label>
 <select className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.is_active ? "active" : "inactive"} onChange={e => setFormData({...formData, is_active: e.target.value === "active"})}>
 <option value="active">Active (Visible)</option>
 <option value="inactive">Inactive (Hidden)</option>
 </select>
 </div>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Description / Requirements</label>
 <textarea className="bg-themeElevated/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent min-h-[200px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Job description..."></textarea>
 </div>

 <div className="flex justify-between mt-4">
 {currentJob ? (
 <button type="button" onClick={handleDelete} className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 text-[14px] font-medium tracking-normal rounded-lg transition-colors">
 Delete Job
 </button>
 ) : <div></div>}
 <button type="submit" className="btn-erp">
 {currentJob ? 'Update Job' : 'Post Job'}
 </button>
 </div>
 </form>
 </div>
 );
 }

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 {!isHubView && (
 <div className="flex items-center gap-4 mb-8">
 <div className="w-12 h-12 rounded-xl bg-themeAccent/20 flex items-center justify-center shrink-0">
 <i className="fa-solid fa-briefcase text-themeAccent text-xl"></i>
 </div>
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-themeText tracking-tight mb-1">Careers Manager</h1>
 <p className="text-xs font-bold text-themeTextSec tracking-normal">Manage job openings for the Prudentia website.</p>
 </div>
 </div>
 )}

 <div className="flex justify-between items-center mb-6">
 <div className="relative w-full max-w-xs">
 <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input type="text" placeholder="Search jobs..." className="w-full bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-themeText outline-none focus:border-themeAccent" />
 </div>
 <button type="button" onClick={handleCreateNew} className="px-5 py-2.5 bg-themeAccent text-themeApp hover:opacity-90 text-[14px] font-medium tracking-normal rounded-xl transition flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> New Job
 </button>
 </div>

 <div className="bg-themePanel/85 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-themeElevated/90 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5">
 <th className="p-4 text-[13px] font-medium text-themeTextSec">Title</th>
 <th className="p-4 text-[13px] font-medium text-themeTextSec">Department</th>
 <th className="p-4 text-[13px] font-medium text-themeTextSec">Type</th>
 <th className="p-4 text-[13px] font-medium text-themeTextSec">Status</th>
 <th className="p-4 text-[13px] font-medium text-themeTextSec text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {isLoading ? (
 <tr>
 <td colSpan="5" className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Jobs...
 </td>
 </tr>
 ) : jobs.length === 0 ? (
 <tr>
 <td colSpan="5" className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
 No jobs posted yet.
 </td>
 </tr>
 ) : (
 jobs.map((job) => (
 <tr key={job.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-themeElevated/50 transition-colors">
 <td className="p-4 text-sm font-bold text-themeText">{job.title}</td>
 <td className="p-4 text-xs font-bold text-themeTextSec">{job.department}</td>
 <td className="p-4 text-xs font-bold text-themeTextSec">{job.type} / {job.location}</td>
 <td className="p-4">
 {job.is_active ? (
 <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[12px] font-medium rounded whitespace-nowrap">Active</span>
 ) : (
 <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px] font-medium rounded whitespace-nowrap">Inactive</span>
 )}
 </td>
 <td className="p-4 text-right">
 <button type="button" onClick={() => handleEdit(job)} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-gray-900 dark:text-white text-blue-500 border border-blue-500/20 flex items-center justify-center transition-colors">
 <i className="fa-solid fa-pen"></i>
 </button>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 );
}
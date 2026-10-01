/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminCareers({ isEmbedded = false, isHubView = false }) {
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
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
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
 type: job.job_type,
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
 if(window.erpToast) window.erpToast.show("Job updated successfully!", "success");
 } else {
 const { error } = await supabase.from('admin_careers').insert([formData]);
 if (error) throw error;
 if(window.erpToast) window.erpToast.show("Job created successfully!", "success");
 }
 setIsEditing(false);
 fetchJobs();
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 const handleDelete = async () => {
 // window.confirm removed, using HoldButton
 try {
 const { error } = await supabase.from('admin_careers').delete().eq('id', currentJob.id);
 if (error) throw error;
 window.erpDialog?.alert("Job deleted.");
 setIsEditing(false);
 fetchJobs();
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 if (isEditing) {
 return (
 <div className={`w-full ${!isHubView ? 'w-full mx-auto p-6 lg:p-8' : ''} animate-fade-in`}>
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-semibold tracking-tight text-themeText tracking-tight">{currentJob ? 'Edit Job Posting' : 'New Job Posting'}</h2>
 <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md hover:bg-themeBorder text-themeText text-[14px] font-medium tracking-normal rounded-lg transition-colors border border-themeBorder ">
 <i className="fa-solid fa-arrow-left mr-2"></i> Back
 </button>
 </div>
 
 <form onSubmit={handleSave} className="flex flex-col gap-6 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Job Title</label>
 <input required type="text" className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Assistant Professor of Law" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Department</label>
 <input required type="text" className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Faculty, Administration" />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Job Type</label>
 <select className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})}>
 <option value="Full-time">Full-time</option>
 <option value="Part-time">Part-time</option>
 <option value="Contract">Contract</option>
 <option value="Internship">Internship</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Location</label>
 <select className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
 <option value="On-Campus">On-Campus</option>
 <option value="Hybrid">Hybrid</option>
 <option value="Remote">Remote</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Status</label>
 <select className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
 <option value="Active">Active (Visible)</option>
 <option value="Inactive">Inactive (Hidden)</option>
 </select>
 </div>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Description / Requirements</label>
 <textarea className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent min-h-[200px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Job description..."></textarea>
 </div>

 
 <div className="flex flex-col gap-2 mt-4">
 <label className="text-[13px] font-medium text-themeTextSec">Job Description PDF (Drive Link)</label>
 <input type="url" className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border border-themeBorder dark:border-white/[0.08] rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.pdf_link || ''} onChange={e => setFormData({...formData, pdf_link: e.target.value})} placeholder="https://drive.google.com/..." />
 <span className="text-[11px] text-themeTextSec mt-1">To save server space, paste a public Google Drive link to the PDF instead of uploading files.</span>
 </div>

 <div className="flex justify-between mt-4">
 {currentJob ? (
 <HoldButton
 onHold={handleDelete}
 backgroundColor="rgba(244, 63, 94, 0.1)"
 fillColor="#f43f5e"
 textColor="#f43f5e"
 doneLabel="Deleted"
 icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
 radius={8}
 size="md"
>
 Hold to Delete
</HoldButton>
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
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"}`}>
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
 <input type="text" placeholder="Search jobs..." className="w-full bg-themePanel/85 backdrop-blur-2xl border border-themeBorder dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-themeText outline-none focus:border-themeAccent" />
 </div>
 <button type="button" onClick={handleCreateNew} className="px-5 py-2.5 bg-themeAccent text-themeApp hover:opacity-90 text-[14px] font-medium tracking-normal rounded-xl transition flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> New Job
 </button>
 </div>

 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden">
 
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border-b border-themeBorder">
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
          <tr key={job.id} className="border-b border-themeBorder hover:bg-themeElevated/50 transition-colors">
            <td className="p-4 text-sm font-bold text-themeText">{job.title}</td>
            <td className="p-4 text-xs font-bold text-themeTextSec">{job.department}</td>
            <td className="p-4 text-xs font-bold text-themeTextSec">{job.job_type} / {job.location}</td>
            <td className="p-4">
              {job.status === 'Active' ? (
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[12px] font-medium rounded whitespace-nowrap">Active</span>
              ) : (
                <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px] font-medium rounded whitespace-nowrap">Inactive</span>
              )}
            </td>
            <td className="p-4 text-right">
              <button type="button" onClick={() => handleEdit(job)} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-themeApp text-blue-500 border border-blue-500/20 flex flex-col items-center justify-center transition-colors float-right">
                <i className="fa-solid fa-pen"></i>
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

<div className="lg:hidden flex flex-col divide-y divide-themeBorder">
  {isLoading ? (
    <div className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Jobs...
    </div>
  ) : jobs.length === 0 ? (
    <div className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
      No jobs posted yet.
    </div>
  ) : (
    jobs.map((job) => (
      <div key={job.id} className="p-4 flex flex-col gap-3 hover:bg-themeElevated/50 transition-colors">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h4 className="font-bold text-themeText text-lg leading-tight">{job.title}</h4>
            <p className="text-xs font-bold text-themeTextSec mt-1">{job.department}</p>
          </div>
          <span className={`px-2 py-1 text-[11px] font-bold rounded shrink-0 ${
            job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {job.status}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold text-themeTextSec bg-themeElevated/50 p-2.5 rounded-lg border border-themeBorder/50">
          <div className="flex items-center gap-1.5"><i className="fa-solid fa-briefcase"></i> {job.job_type}</div>
          <div className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {job.location}</div>
        </div>
        
        <div className="flex justify-end mt-1">
          <button type="button" onClick={() => handleEdit(job)} className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-themeApp text-blue-500 font-black text-[13px] tracking-wide transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-pen-to-square"></i> Edit Job
          </button>
        </div>
      </div>
    ))
  )}
</div>

 </div>
 </div>
 </div>
 );
}
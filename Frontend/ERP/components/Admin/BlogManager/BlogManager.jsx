/* © 2026 JSM VALOR. All Rights Reserved. */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import React, { useState, useEffect } from "react";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import PageHeader from '../../shared/PageHeader/PageHeader';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function BlogManager({ isEmbedded = false,  isHubView = false }) {
 const [blogs, setBlogs] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [currentBlog, setCurrentBlog] = useState(null);
 const [formData, setFormData] = useState({
 title: "",
 slug: "",
 author_name: "",
 author_erp_id: "",
  content: "",
 is_public: false
 });
 const [authorContact, setAuthorContact] = useState(null);
 const [verifiedProfile, setVerifiedProfile] = useState(null);

 useEffect(() => {
 fetchBlogs();
 }, []);

 const fetchBlogs = async () => {
 setIsLoading(true);
 try {
 // Fetch from admin_notices with category 'Blog' and join profiles
 const { data, error } = await supabase
 .from('admin_notices')
 .select('*')
 .eq('category', 'Blog')
 .order('created_at', { ascending: false });

 if (error) throw error;
 setBlogs(data || []);
 } catch (error) {
 console.error("Failed to fetch blogs:", error);
 window.erpDialog?.alert("Failed to load blogs. Please check your connection.");
 } finally {
 setIsLoading(false);
 }
 };

 const handleCreateNew = () => {
 setCurrentBlog(null);
 setAuthorContact(null);
 setFormData({ title: "", slug: "", author_name: "", author_erp_id: "",  content: "", is_public: false });
 setIsEditing(true);
 };

 const handleEdit = (blog) => {
 setCurrentBlog(blog);
 setAuthorContact({ email: blog.author_email, phone: blog.author_phone });
 setFormData({
 title: blog.title || "",
 slug: blog.slug || "",
 author_name: blog.author_name || "",
 author_erp_id: blog.author_erp_id || "",
 image_url: blog.image_url || "",
 content: blog.content || "",
 is_public: blog.is_public || false
 });
 setVerifiedProfile(null);
 setIsEditing(true);
 };

 const verifyErpId = async () => {
 if (!formData.author_erp_id) {
 setVerifiedProfile({ error: "Please enter an ERP ID first." });
 return;
 }
 try {
 const { data, error } = await supabase
 .from('profiles')
 .select('full_name, role')
 .eq('erp_id', formData.author_erp_id)
 .single();
 
 if (error || !data) {
 setVerifiedProfile({ error: "No user found with this ERP ID." });
 } else {
 setVerifiedProfile({ success: `${data.full_name} (${data.role})` });
 }
 } catch (err) {
 setVerifiedProfile({ error: "Error verifying ID." });
 }
 };

 const handleSave = async (e) => {
 e.preventDefault();
 try {
 const savePayload = {
 title: formData.title,
 slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
 author_name: formData.author_name,
 author_erp_id: formData.author_erp_id || null,
  content: formData.content,
 is_public: formData.is_public,
 category: 'Blog'
 };

 if (currentBlog?.id) {
 // Update
 const { error } = await supabase.from('admin_notices').update(savePayload).eq('id', currentBlog.id);
 if (error) throw error;
 window.erpDialog?.alert("Blog updated successfully!");
 } else {
 // Insert
 const { error } = await supabase.from('admin_notices').insert([savePayload]);
 if (error) throw error;
 window.erpDialog?.alert("Blog created successfully!");
 }

 setIsEditing(false);
 fetchBlogs();
 } catch (error) {
 console.error("Save failed:", error);
 window.erpDialog?.alert("Could not save to database.");
 setIsEditing(false);
 }
 };

 const handleReject = async () => {
 const actionText = currentBlog?.is_public ? "delete" : "reject and permanently delete";
 

 try {
 if (currentBlog?.id) {
 const { error } = await supabase.from('admin_notices').delete().eq('id', currentBlog.id);
 if (error) throw error;
 window.erpDialog?.alert(`Blog ${currentBlog?.is_public ? 'deleted' : 'rejected'} and removed from database.`);
 }
 setIsEditing(false);
 fetchBlogs();
 } catch (error) {
 console.error("Reject failed.", error);
 window.erpDialog?.alert(`Could not ${actionText} the post.`);
 setIsEditing(false);
 }
 };

 const handleApproveERP = async () => {
 try {
 if (!currentBlog?.id) return;
 const { error } = await supabase.from('admin_notices').update({ is_public: true }).eq('id', currentBlog.id);
 if (error) throw error;

 if (currentBlog.author_erp_id || formData.author_erp_id) {
 const authorId = formData.author_erp_id || currentBlog.author_erp_id;
 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: 'Blog Published!',
 category: 'System Alert',
 target_audience: ['person'],
 target_id: authorId,
 priority: 'high',
 content: `Congratulations! Your blog post titled "${formData.title}" has been approved and published on the Prudentia website.`,
 author_name: 'Admin',
 author_id: null
 }]);
 }
 window.erpDialog?.alert("Blog approved and author notified via ERP.");
 setCurrentBlog(prev => ({ ...prev, is_public: true }));
 setFormData(prev => ({ ...prev, is_public: true }));
 setIsEditing(false);
 fetchBlogs();
 } catch (error) {
 console.error("Approve failed", error);
 window.erpDialog?.alert("Failed to approve the blog.");
 }
 };

 const handleRejectERP = async () => {
 const actionVerb = currentBlog?.is_public ? "delete" : "reject";
 
 try {
 if (!currentBlog?.id) return;
 const { error } = await supabase.from('admin_notices').delete().eq('id', currentBlog.id);
 if (error) throw error;

 if (currentBlog.author_erp_id || formData.author_erp_id) {
 const authorId = formData.author_erp_id || currentBlog.author_erp_id;
 const content = currentBlog?.is_public
 ? `Your published blog post titled "${formData.title}" has been removed from the Prudentia website by an administrator.`
 : `Thank you for your submission titled "${formData.title}". Unfortunately, it was not accepted for publication at this time.`;

 const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
 await supabase.from('notices').insert([{
 notice_id: noticeId,
 title: currentBlog?.is_public ? 'Blog Removed' : 'Blog Submission Update',
 category: 'System Alert',
 target_audience: ['person'],
 target_id: authorId,
 priority: 'normal',
 content: content,
 author_name: 'Admin',
 author_id: null
 }]);
 }
 window.erpDialog?.alert(`Blog ${actionVerb}ed and author notified via ERP.`);
 setIsEditing(false);
 fetchBlogs();
 } catch (error) {
 console.error("Reject failed", error);
 window.erpDialog?.alert(`Failed to ${actionVerb} the blog.`);
 }
 };

 

 const sendAutomatedEmail = async (type) => {
    if (!authorContact?.email) {
        window.erpDialog?.alert("No email address found for this author.");
        return;
    }
    const subject = type === 'approve' ? 'Your PCL Blog Post is Published!' : 'Update regarding your PCL Blog Post submission';
    const textBody = type === 'approve'
        ? `Hello ${formData.author_name},<br><br>Great news! Your blog post "<b>${formData.title}</b>" has been approved and published on the Prudentia College of Law website.<br><br>Thank you for contributing to the community.<br><br>Best regards,<br>PCL Editorial Team`
        : `Hello ${formData.author_name},<br><br>Thank you for your submission titled "<b>${formData.title}</b>". After review, our editorial team has decided not to move forward with publishing it at this time.<br><br>We appreciate your effort and encourage you to submit future works.<br><br>Best regards,<br>PCL Editorial Team`;
    
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: authorContact.email,
                subject: subject,
                message_body: textBody
            })
        });
        if (!response.ok) throw new Error("API Route failed");
        window.erpDialog?.alert(`Automated ${type} email sent successfully to ${authorContact.email}!`);
    } catch (err) {
        console.error("Email send failed:", err);
        window.erpDialog?.alert("Failed to send automated email. Check Vercel server logs.");
    }
};

 

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>

    {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-themePanel/95 backdrop-blur-2xl w-full max-w-4xl rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                     <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-black text-themeText tracking-tight">{currentBlog ? 'Edit Blog Post' : 'New Blog Post'}</h2>
 <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder text-themeText text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-black/5 dark:border-white/10">
 <i className="fa-solid fa-arrow-left mr-2"></i> Back
 </button>
 </div>
 
 <form onSubmit={handleSave} className="flex flex-col gap-6 bg-themePanel/85 backdrop-blur-2xl p-6 rounded-2xl border border-black/5 dark:border-white/5">
 {/* Intimation Banner */}
 {currentBlog && (authorContact || currentBlog.author_erp_id) && (
 <div className="bg-themeAccent/10 border border-themeAccent/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
 <div>
 <h4 className="text-themeAccent font-bold text-sm mb-1">Author Contact Found</h4>
 <p className="text-[10px] text-themeTextSec uppercase tracking-widest">You can send an acceptance or rejection intimation directly.</p>
 </div>
 <div className="flex gap-2 flex-wrap justify-end">
 {currentBlog.author_erp_id && (
 <>
 <SlideCommit
                label="Slide to Approve"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={handleApproveERP}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 <HoldButton size="sm" onHold={handleRejectERP} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                {currentBlog?.is_public ? 'ERP Notify Delete' : 'ERP Reject'}
            </HoldButton>
 <div className="w-[1px] h-6 bg-themeBorderStrong mx-2"></div>
 </>
 )}
 
 <button type="button" onClick={() => sendAutomatedEmail('approve')} className="px-3 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2">
 <i className="fa-solid fa-envelope text-sm"></i> Approve
 </button>
 <button type="button" onClick={() => sendAutomatedEmail('reject')} className="px-3 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-themeText dark:text-white border border-blue-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2">
 <i className="fa-solid fa-envelope text-sm"></i> Reject
 </button>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Title</label>
 <input required type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. The Future of AI in Law" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">URL Slug (Auto-generated if empty)</label>
 <input type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. ai-in-law" />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Author Name</label>
 <input type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} placeholder="e.g. John Doe" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Author ERP ID</label>
 <div className="flex items-center gap-2">
 <input type="text" className="flex-1 bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.author_erp_id || ''} onChange={e => { setFormData({...formData, author_erp_id: e.target.value}); setVerifiedProfile(null); }} placeholder="e.g. 26BAL0001" />
 <button type="button" onClick={verifyErpId} className="px-4 py-3 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder border border-black/5 dark:border-white/5 rounded-lg text-themeText text-[10px] font-black uppercase tracking-widest transition-colors shrink-0">
 Verify
 </button>
 </div>
 {verifiedProfile?.success && <span className="text-[10px] font-bold text-emerald-500"><i className="fa-solid fa-check-circle mr-1"></i> Verified: {verifiedProfile.success}</span>}
 {verifiedProfile?.error && <span className="text-[10px] font-bold text-rose-500"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {verifiedProfile.error}</span>}
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</label>
 <select className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.is_public ? "published" : "pending"} onChange={e => setFormData({...formData, is_public: e.target.value === "published"})}>
 <option value="pending">Pending Review (Hidden)</option>
 <option value="published">Published (Public)</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Cover Image URL</label>
 <input type="text" className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
 </div>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Content (Markdown/HTML)</label>
 <textarea required className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-lg px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent min-h-[400px] font-mono" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write your blog post content here..."></textarea>
 </div>

 <div className="flex justify-between mt-4">
 {currentBlog ? (
 <HoldButton size="sm" onHold={handleReject} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                {currentBlog?.is_public ? 'Delete Post' : 'Reject & Delete'}
            </HoldButton>
 ) : <div></div>}
 <button type="submit" className="btn-erp">
 {currentBlog ? 'Update Post' : 'Submit Post'}
 </button>
 </div>
 </form>
 
                </div>
            </div>
        </div>
    )}
    
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 <PageHeader icon="fa-solid fa-newspaper" title="Blog Manager" subtitle="Review submissions, publish, and notify authors." />

 <div className="flex justify-between items-center mb-6">
 <div className="relative w-full max-w-xs">
 <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input type="text" placeholder="Search posts..." className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-themeText outline-none focus:border-themeAccent" />
 </div>
 <button type="button" onClick={handleCreateNew} className="px-5 py-2.5 bg-themeAccent text-themeApp hover:opacity-90 text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> New Post
 </button>
 </div>

 <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-themeElevated backdrop-blur-md border-b border-black/5 dark:border-white/5">
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Title</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Author</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Date</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {isLoading ? (
 <tr>
 <td colSpan="5" className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Posts...
 </td>
 </tr>
 ) : blogs.length === 0 ? (
 <tr>
 <td colSpan="5" className="p-8 text-center text-sm font-black text-themeTextSec uppercase tracking-widest">
 No blog posts found.
 </td>
 </tr>
 ) : (
 blogs.map((blog) => (
 <tr key={blog.id} className="border-b border-black/5 dark:border-white/5 hover:bg-themeElevated/50 transition-colors">
 <td className="p-4 max-w-xs">
 <p className="text-sm font-bold text-themeText truncate">{blog.title}</p>
 <p className="text-[10px] font-medium text-themeTextSec mt-0.5 truncate">/{blog.slug}</p>
 </td>
 <td className="p-4 text-xs font-bold text-themeText truncate max-w-[150px]">
 {blog.author_name || "Unknown"}
 {blog.author_email && (
 <span className="block text-[9px] text-themeTextSec font-mono mt-1" title={blog.author_email}>
 <i className="fa-solid fa-envelope mr-1"></i>Contact Available
 </span>
 )}
 </td>
 <td className="p-4 text-xs font-bold text-themeTextSec whitespace-nowrap">{new Date(blog.created_at).toLocaleDateString()}</td>
 <td className="p-4">
 {blog.is_public ? (
 <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap">Published</span>
 ) : (
 <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded whitespace-nowrap">Pending</span>
 )}
 </td>
 <td className="p-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button type="button" onClick={() => handleEdit(blog)} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-themeText dark:text-white text-blue-500 border border-blue-500/20 flex items-center justify-center transition-colors" title="Review & Edit">
 <i className="fa-solid fa-pen-to-square"></i>
 </button>
 </div>
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
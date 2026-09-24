/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import styles from '../PROGRAMS/Programs.module.css';

export default function SubmitBlog() {
    const navigate = useNavigate();
    const [authorType, setAuthorType] = useState('student');
    const [formData, setFormData] = useState({
        erpId: '',
        fullName: '',
        email: '',
        phone: '',
        affiliation: '',
        title: '',
        content: '',
        imageUrl: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            let authorId = null;
            let authorName = formData.fullName;

            if (authorType === 'student') {
                // Lookup UUID from profiles
                const { data: profile, error: pErr } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('erp_id', formData.erpId)
                    .single();
                
                if (pErr || !profile) {
                    throw new Error("Could not find a valid ERP profile with that ID. Please check your ERP ID.");
                }
                authorId = profile.id;
                authorName = profile.full_name; // Use official name
            } else {
                authorName = `${formData.fullName} (${formData.affiliation})`;
            }

            const blogData = {
                notice_id: `BG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
                title: formData.title,
                content: formData.content,
                category: 'Blog',
                is_public: false, // Wait for admin approval
                image_url: formData.imageUrl || null,
                author_name: authorName,
                author_id: authorId,
                author_email: formData.email,
                author_phone: formData.phone,
                author_erp_id: formData.erpId || null
            };

            const { error } = await supabase.from('admin_notices').insert([blogData]);

            if (error) throw error;

            // Notify Admin
            const adminNoticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
            await supabase.from('notices').insert([{
                notice_id: adminNoticeId,
                title: 'New Blog Submission',
                category: 'System Alert',
                target_audience: 'admin',
                priority: 'normal',
                content: `A new blog post titled "${formData.title}" has been submitted by ${authorName}. Please review it in the Blog Manager.`,
                author_name: 'System',
                author_id: null
            }]);

            setIsSuccess(true);
            setTimeout(() => {
                navigate('/blogs');
            }, 3000);

        } catch (err) {
            console.error('Submission error:', err);
            setErrorMsg(err.message || 'Failed to submit blog. Please check your network and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={`${styles.pageWrapper} flex flex-col justify-center items-center px-6`}>
                <div className={styles.ambientBackground} />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--primary-color)] mb-6 relative z-10">
                    <CheckCircle size={80} />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-[var(--text-color)] relative z-10">
                    Submission Received
                </h2>
                <p className="text-[var(--text-muted)] text-lg mb-8 text-center max-w-md relative z-10">
                    Thank you for submitting your blog! It is currently under review by our editorial team and will be synced to the system shortly.
                </p>
                <Link to="/blogs" className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-sm hover:underline transition-all relative z-10">
                    Return to Blogs
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientBackground} />
            <div className={styles.auroraGlow} />

            <div className={`${styles.contentContainer} max-w-4xl`}>
                <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-xs font-bold relative z-10"
                >
                    <ArrowLeft size={16} /> BACK TO BLOGS
                </Link>

                <div className="text-center mb-16 relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-[var(--text-color)] mb-6 uppercase leading-tight"
                       
                    >
                        Submit a <span className="text-[var(--primary-color)] italic">Blog</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto"
                       
                    >
                        Share your insights, legal analysis, and experiences with the Prudentia community.
                    </motion.p>
                </div>

                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onSubmit={handleSubmit}
                    className={`${styles.glassCard} p-8 md:p-12 relative z-10`}
                >
                    {/* Role Selection */}
                    <div className="mb-12">
                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">I am a...</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => setAuthorType('student')}
                                className={`flex-1 py-4 px-6 rounded-2xl border transition-all duration-300 font-bold uppercase tracking-widest text-xs ${
                                    authorType === 'student' 
                                    ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)] shadow-[0_0_15px_var(--primary-glow)]' 
                                    : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary-color)]/50'
                                }`}
                            >
                                Member of PCL (ERP)
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthorType('guest')}
                                className={`flex-1 py-4 px-6 rounded-2xl border transition-all duration-300 font-bold uppercase tracking-widest text-xs ${
                                    authorType === 'guest' 
                                    ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)] shadow-[0_0_15px_var(--primary-glow)]' 
                                    : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary-color)]/50'
                                }`}
                            >
                                Guest / Other
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Full Name *</label>
                            <input 
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                placeholder="E.g. John Doe"
                               
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Email Address *</label>
                                <input 
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">WhatsApp Number *</label>
                                <input 
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        {authorType === 'student' ? (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">ERP ID (For syncing profile) *</label>
                                <input 
                                    type="text"
                                    name="erpId"
                                    required
                                    value={formData.erpId}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all font-mono"
                                    placeholder="E.g. 26BBL7020"
                                />
                                <p className="text-[10px] text-[var(--text-muted)] mt-2 uppercase tracking-widest">Your avatar and details will be automatically fetched from the ERP.</p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Affiliation / Designation *</label>
                                <input 
                                    type="text"
                                    name="affiliation"
                                    required
                                    value={formData.affiliation}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                    placeholder="E.g. Legal Scholar, Independent Researcher"
                                   
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Blog Title *</label>
                            <input 
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                                placeholder="Enter a catchy title..."
                               
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Blog Content *</label>
                            <div className="bg-[var(--card-bg)] border border-[var(--primary-color)]/20 p-4 rounded-xl mb-4 text-xs font-light text-white/70 leading-relaxed shadow-[0_0_15px_rgba(30,254,161,0.05)]">
                                <strong className="text-[var(--primary-color)]">Note:</strong> There are no file or image uploads. Please paste your entire article here. Ensure you format your headings, paragraphs, and footnotes clearly using standard text/markdown conventions before submitting.
                            </div>
                            <textarea 
                                name="content"
                                required
                                rows="18"
                                value={formData.content}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-6 py-4 text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] transition-all resize-y leading-relaxed"
                                placeholder="Paste your fully formatted blog post here, including all footnotes..."
                               
                            />
                        </div>

                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest">
                                {errorMsg}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="tlh-btn w-full mt-8 flex justify-center !py-4"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="text-xs font-bold uppercase tracking-widest flex items-center">
                                    <Upload size={18} className="mr-2" />
                                    Submit for Review
                                </span>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}

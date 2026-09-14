/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Briefcase, MapPin, X, Send, AlertCircle, Link2, Ticket } from 'lucide-react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../../ERP/lib/EmailService';
import styles from '../PROGRAMS/Programs.module.css';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Application Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', cvLink: '', portfolioLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dpdpaConsent, setDpdpaConsent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');

  useEffect(() => {
    fetchJobs();
    window.scrollTo(0,0);
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from('admin_careers').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsSuccess(false);
    setErrorMsg('');
    setFormData({ name: '', email: '', phone: '', cvLink: '', portfolioLink: '' });
  };

  const closeModal = () => {
    if (!isSubmitting) setSelectedJob(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const ticketId = `TCK-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
      
      // 1. Insert into career_applications
      const { error: appError } = await supabase.from('career_applications').insert([{
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cv_link: formData.cvLink,
        portfolio_link: formData.portfolioLink,
        status: 'pending'
      }]);
      // Silently ignore if table missing, because we will log in helpdesk

      // 2. Insert into helpdesk_tickets
      await supabase.from('helpdesk_tickets').insert([{
        ticket_id: ticketId,
        category: 'Careers',
        subject: `Job Application: ${selectedJob.title}`,
        description: `Applicant: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCV: ${formData.cvLink}\nPortfolio: ${formData.portfolioLink}`,
        status: 'open',
        admin_reply: 'Application Received and Under Review',
        user_id: null // Public user
      }]);

      // 3. Send Email
      try {
        await sendSystemEmail('APPLICATION_RECEIVED', {
          to_email: formData.email,
          name: formData.name,
          type: `Careers - ${selectedJob.title}`,
          ticket_id: ticketId
        });
      } catch (emailErr) {
        console.warn("Email service not reachable", emailErr);
      }

      setGeneratedTicket(ticketId);
      setIsSuccess(true);
    } catch (err) {
      console.error("Application error:", err);
      setErrorMsg("Failed to submit application. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />
      
      <div className={`${styles.contentContainer} mt-10 md:mt-16`}>
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full text-center mb-24 relative z-10">
          <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold block">Join Our Legacy</span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight font-['Outfit']">
            Careers at <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Prudentia</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-center">
            We are constantly searching for passionate educators, brilliant researchers, and visionary administrators to help shape the next generation of legal vanguards.
          </p>
        </motion.div>

        {/* Open Positions Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full relative z-10 mb-32">
          <div className="flex flex-col items-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] tracking-tight font-['Outfit']">
                Current <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Openings</span>
              </h2>
              <div className="h-[3px] w-20 mb-5 bg-gradient-to-r from-[var(--primary-color)] to-transparent rounded-full mt-6" />
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                  <motion.div key={job.id} variants={itemVariants} className={`${styles.glassCard} group p-8 transition-all duration-500 hover:-translate-y-2 border border-[var(--card-border)] bg-[var(--card-bg)]/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-[var(--primary-color)]/50 flex flex-col min-h-[300px] relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 shadow-sm">{job.department}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--card-bg)]/80 px-3 py-1.5 rounded-full border border-[var(--card-border)]">{job.type}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-[var(--text-color)] leading-tight group-hover:text-[var(--primary-color)] transition-colors duration-500 font-['Playfair_Display'] italic relative z-10">{job.title}</h3>
                    <div className="flex flex-col gap-2 mb-10 mt-auto relative z-10">
                        <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase"><MapPin size={16} className="text-[var(--primary-color)]" /> {job.location || 'Prudentia Campus'}</div>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <button onClick={() => handleApplyClick(job)} className="tlh-btn justify-center w-full">
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Apply Now</span>
                          <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/></svg>
                      </button>
                    </div>
                  </motion.div>
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants} className="w-full flex flex-col items-center justify-center p-16 border border-dashed border-[var(--card-border)] rounded-3xl bg-[var(--card-bg)]/20 backdrop-blur-sm text-center">
                <Briefcase size={48} className="text-[var(--primary-color)]/50 mb-6" />
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 font-['Playfair_Display'] italic">No Open Positions</h3>
                <p className="text-[var(--text-muted)] text-lg max-w-md">There are currently no active openings. We encourage you to check back later or submit a general inquiry.</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#000]/80 backdrop-blur-md" onClick={closeModal} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className={`${styles.glassCard} w-full max-w-2xl bg-[var(--bg-color)] border border-[var(--primary-color)]/30 rounded-3xl overflow-hidden relative z-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>
              <button onClick={closeModal} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors z-20"><X size={24} /></button>
              {isSuccess ? (
                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--primary-color)] mb-6"><CheckCircle2 size={80} /></motion.div>
                  <h2 className="text-3xl font-bold mb-4 text-[var(--text-color)] font-['Playfair_Display'] italic">Application Received</h2>
                  <p className="text-[var(--text-muted)] text-lg max-w-sm mb-6">Thank you for applying for the <strong>{selectedJob.title}</strong> position.</p>
                  
                  <div className="bg-[var(--card-bg)] border border-[var(--primary-color)]/30 rounded-xl px-6 py-4 mb-10 flex flex-col items-center">
                      <Ticket size={24} className="text-[var(--primary-color)] mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Ticket ID</span>
                      <span className="text-lg font-bold text-[var(--primary-color)] tracking-widest">{generatedTicket}</span>
                      <span className="text-[10px] font-medium text-[var(--text-muted)] mt-2">A confirmation email has been sent to {formData.email}</span>
                  </div>

                  <button onClick={closeModal} className="tlh-btn justify-center"><span className="text-xs font-bold uppercase tracking-widest">Close Window</span></button>
                </div>
              ) : (
                <div className="p-8 md:p-12">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] mb-3 block">Application For</span>
                  <h2 className="text-3xl font-bold text-[var(--text-color)] mb-8 font-['Playfair_Display'] italic leading-tight pr-8">{selectedJob.title}</h2>
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl mb-6 bg-red-500/10 border border-red-500/30 text-red-400">
                        <div className="px-5 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3"><AlertCircle size={16} />{errorMsg}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Full Name *</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50" placeholder="Jane Doe" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Email Address *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50" placeholder="jane@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Phone Number *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50" placeholder="+91..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1 flex items-center gap-2">Resume / CV (Drive Link) * <Link2 size={12} /></label>
                      <input type="url" name="cvLink" required value={formData.cvLink} onChange={handleChange} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50" placeholder="https://drive.google.com/..." />
                      <p className="text-[10px] text-[var(--text-muted)] mt-2 ml-1">Please ensure the link visibility is set to "Anyone with the link".</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1 flex items-center gap-2">Portfolio / Research (Optional) <Link2 size={12} /></label>
                      <input type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50" placeholder="https://..." />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="tlh-btn justify-center w-full !py-5 mt-6">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-[var(--text-color)] border-t-transparent rounded-full animate-spin"></div> : <><span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Submit Application</span><Send size={16} className="ml-2" /></>}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Careers;

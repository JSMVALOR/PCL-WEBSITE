/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../../ERP/lib/EmailService';
import GlobeMap from '../../UI/GlobeMap.jsx';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import styles from '../PROGRAMS/Programs.module.css';

const SUBJECT_OPTIONS = [
  { value: 'General Inquiry', label: 'General Inquiry' },
  { value: 'BA LLB Admissions', label: '5-Year BA. LL.B Admissions' },
  { value: 'BBA LLB Admissions', label: '5-Year BBA. LL.B Admissions' },
  { value: 'LLB Admissions', label: '3-Year LL.B Admissions' },
  { value: 'Campus Tour', label: 'Campus Tour' }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dpdpaConsent, setDpdpaConsent] = useState(false);
  const [status, setStatus] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    const ticketId = `TCK-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    e.preventDefault();
    if (!dpdpaConsent) {
      setStatus({ type: 'error', message: 'You must consent to the DPDPA privacy policy to submit.' });
      return;
    }
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus(null);

    try {
            const { error } = await supabase.from('contact_inquiries').insert([{
        name: formData.name, email: formData.email, phone: formData.phone,
        subject: formData.subject || 'General Inquiry', message: formData.message, status: 'pending'
      }]);

      await supabase.from('helpdesk_tickets').insert([{
        ticket_id: ticketId, category: 'Public Inquiry', subject: formData.subject || 'General Inquiry',
        description: `From: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Message: ${formData.message}`,
        status: 'open', admin_reply: 'Query Received', user_id: null
      }]);

      try {
        await sendSystemEmail('SUPPORT_ENQUIRY', {
          to_email: formData.email, name: formData.name, ticket_id: ticketId,
          message_preview: formData.message.substring(0, 100) + '...'
        });
      } catch (e) { console.warn(e); }

      setStatus({ type: 'success', message: `Message sent! Your Ticket ID is ${ticketId}` });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={`${styles.contentContainer} mt-10 md:mt-16`}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full text-center mb-24 relative z-10"
        >
          <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold block">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight font-['Outfit']">
            Contact <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Us</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-center">
            Whether you are a prospective student, an esteemed recruiter, or a legal professional, our admissions and administrative offices are here to assist you.
          </p>
        </motion.div>

        {/* Map and Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 relative z-10">
          
          {/* Left: Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 flex flex-col justify-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-6 font-['Outfit']">
              Our <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Campus</span>
            </h2>
            <div className="h-[3px] w-20 mb-10 bg-gradient-to-r from-[var(--primary-color)] to-transparent rounded-full" />
            
            <div className="space-y-8">
              <div className="flex gap-5 group">
                <a href="https://maps.app.goo.gl/B9U1Gv7nJ21c97Nf8" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[var(--primary-color)] transition-colors duration-300">
                  <MapPin className="text-[var(--primary-color)] group-hover:text-[#000]" size={20} />
                </a>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Address</h3>
                  <p className="text-[var(--text-color)] leading-relaxed text-base">
                    3-23, Gurramguda,<br />
                    Opp Badangpet Municipal Office,<br />
                    Balapur Mandal, R.R. Dist,<br />
                    Hyderabad - Telangana 501510
                  </p>
                </div>
              </div>

              <div className="flex gap-5 group">
                <a href="tel:+918599000777" className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[var(--primary-color)] transition-colors duration-300">
                  <Phone className="text-[var(--primary-color)] group-hover:text-[#000]" size={20} />
                </a>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Phone</h3>
                  <p className="text-[var(--text-color)] leading-relaxed text-base">
                    +91 85990 00777
                  </p>
                </div>
              </div>

              <div className="flex gap-5 group">
                <a href="mailto:info@prudentiacollegeoflaw.com" className="w-12 h-12 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[var(--primary-color)] transition-colors duration-300">
                  <Mail className="text-[var(--primary-color)] group-hover:text-[#000]" size={20} />
                </a>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Email</h3>
                  <p className="text-[var(--text-color)] leading-relaxed text-base">
                    info@prudentiacollegeoflaw.com
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Map */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-8 h-[400px] md:h-[600px] relative w-full"
          >
             <GlobeMap />
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-20 relative z-10"
        >
          <div className={`${styles.glassCard} p-8 md:p-12 border border-[var(--card-border)] relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="mb-10 text-center md:text-left relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4 font-['Playfair_Display'] italic">Send a Message</h2>
              <p className="text-[var(--text-muted)] text-lg">We would love to hear from you. Please fill out the form below.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`overflow-hidden rounded-xl mb-6 ${status.type === 'success' ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)]' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}
                  >
                    <div className="px-5 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                      {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {status.message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Full Name *</label>
                  <input
                    type="text" name="name" required
                    value={formData.name} onChange={handleChange}
                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Email Address *</label>
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Phone Number</label>
                  <input
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                    placeholder="+91..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Inquiry Type</label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <span className={formData.subject ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]/50'}>
                        {formData.subject ? SUBJECT_OPTIONS.find(o => o.value === formData.subject)?.label : 'Select a topic...'}
                      </span>
                      <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl overflow-hidden z-50 shadow-2xl"
                        >
                          {SUBJECT_OPTIONS.map((opt) => (
                            <div 
                              key={opt.value}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, subject: opt.value }));
                                setIsDropdownOpen(false);
                              }}
                              className={`px-5 py-4 cursor-pointer text-base transition-colors duration-200 hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] ${formData.subject === opt.value ? 'bg-[var(--primary-color)]/5 text-[var(--primary-color)]' : 'text-[var(--text-color)]'}`}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Your Message *</label>
                <textarea
                  name="message" required rows="5"
                  value={formData.message} onChange={handleChange}
                  className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all resize-none placeholder:text-[var(--text-muted)]/50"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <div className="flex flex-col gap-6 pt-4">
                {/* DPDPA Consent Checkbox */}
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id="dpdpa-consent" 
                      checked={dpdpaConsent}
                      onChange={(e) => setDpdpaConsent(e.target.checked)}
                      className="w-4 h-4 accent-[var(--accent)] bg-[var(--input-bg)] border-[var(--card-border)] rounded cursor-pointer shrink-0"
                    />
                  </div>
                  <label htmlFor="dpdpa-consent" className="text-xs text-[var(--text-muted)] cursor-pointer select-none leading-relaxed">
                    I consent to the collection and processing of my personal data as per the <Link to="/privacy" target="_blank" className="text-[var(--accent)] hover:underline">Privacy Policy</Link> and DPDPA (2023) guidelines.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !dpdpaConsent}
                  className="tlh-btn justify-center w-full md:w-auto md:min-w-[200px] !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[var(--text-color)] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Send Message</span>
                      <Send size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

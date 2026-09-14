/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building, CheckCircle, Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../../ERP/lib/EmailService';
import styles from '../PROGRAMS/Programs.module.css';

const PlacementCell = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [generatedTicket, setGeneratedTicket] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const ticketId = `TCK-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
            const { error } = await supabase.from('placement_inquiries').insert([
                {
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    status: 'pending'
                }
            ]);

            await supabase.from('helpdesk_tickets').insert([{
                ticket_id: ticketId, category: 'Placement', subject: `Placement Inquiry: ${formData.company_name}`,
                description: `Company: ${formData.company_name}
Contact: ${formData.contact_person}
Email: ${formData.email}
Phone: ${formData.phone}
Requirements: ${formData.message}`,
                status: 'open', admin_reply: 'Inquiry Received', user_id: null
            }]);

            try {
                await sendSystemEmail('SUPPORT_ENQUIRY', {
                    to_email: formData.email, name: formData.contact_person, ticket_id: ticketId,
                    message_preview: formData.message.substring(0, 100) + '...'
                });
            } catch(e) { console.warn(e); }

            if (error) throw error;
            setGeneratedTicket(ticketId);
            setIsSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            setErrorMsg('Failed to submit your inquiry. Please check your network and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
       <div className={styles.pageWrapper}>
            <div className={styles.ambientBackground} />
            <div className={styles.auroraGlow} />

            <div className={`${styles.contentContainer} mt-10 md:mt-16`}>
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full text-center mb-24 relative z-10"
                >
                    <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold block">
                        Corporate Relations
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight font-['Outfit']">
                        Placement <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Cell</span>
                    </h1>
                    <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed text-center">
                        Connecting exceptional legal minds with industry-leading law firms, corporate houses, and esteemed chambers across the globe.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 relative z-10">
                    {/* Information Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col justify-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-6 font-['Outfit']">
                            Partner With <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Us</span>
                        </h2>
                        <div className="h-[3px] w-20 mb-6 bg-gradient-to-r from-[var(--primary-color)] to-transparent rounded-full" />
                        <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed text-justify mb-10">
                            The Prudentia Placement Cell is committed to bridging the gap between academia and the professional legal landscape. We invite prestigious organizations to participate in our recruitment drives and discover the next generation of legal talent.
                        </p>

                        <div className="space-y-10 mb-12">
                            <div className="flex gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                    <Briefcase className="text-[var(--primary-color)]" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2 font-['Playfair_Display'] italic">Campus Recruitment</h3>
                                    <p className="text-[var(--text-muted)] text-base leading-relaxed text-justify">Host on-campus or virtual recruitment drives tailored to your specific hiring needs and organizational culture.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                                    <Building className="text-[var(--primary-color)]" size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2 font-['Playfair_Display'] italic">Internship Programs</h3>
                                    <p className="text-[var(--text-muted)] text-base leading-relaxed text-justify">Engage our top-tier students early through structured summer and winter internship placements.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.glassCard} p-8 border border-[var(--card-border)] hover:border-[var(--primary-color)]/50 transition-colors duration-500`}>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-color)] mb-6 font-mono">Contact Placement Office</h4>
                            <div className="space-y-5">
                                <a href="mailto:info@prudentiacollegeoflaw.com" className="flex items-center gap-4 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <span className="font-medium text-sm md:text-base">info@prudentiacollegeoflaw.com</span>
                                </a>
                                <div className="flex items-center gap-4 text-[var(--text-muted)] group">
                                    <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center">
                                        <Phone size={16} />
                                    </div>
                                    <span className="font-medium text-sm md:text-base">+91 85990 00777</span>
                                </div>
                                <div className="flex items-center gap-4 text-[var(--text-muted)] group">
                                    <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="font-medium text-sm md:text-base">3-23, Gurramguda, Opp Badangpet Municipal Office, Balapur Mandal, R.R. Dist, Hyderabad - Telangana 501510</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {isSuccess ? (
                            <div className={`${styles.glassCard} h-full min-h-[600px] flex flex-col justify-center items-center p-10 border border-[var(--primary-color)]/30 bg-[var(--primary-color)]/5 text-center`}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-color)_0%,transparent_60%)] opacity-10 blur-xl rounded-3xl" />
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-[var(--primary-color)] mb-8 relative z-10">
                                    <CheckCircle size={90} />
                                </motion.div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-color)] font-['Playfair_Display'] italic relative z-10">
                                    Inquiry Received
                                </h2>
                                <p className="text-[var(--text-muted)] text-lg mb-12 max-w-sm relative z-10">
                                    Thank you for your interest in recruiting at Prudentia. Our Placement Coordinator will contact you shortly to formalize the next steps.
                                </p>
                                <button 
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setFormData({ company_name: '', contact_person: '', email: '', phone: '', message: '' });
                                    }}
                                    className="tlh-btn justify-center relative z-10"
                                >
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Submit Another Inquiry</span>
                                    <ArrowRight size={16} className="ml-2" />
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={`${styles.glassCard} p-8 md:p-10 border border-[var(--card-border)] relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>
                                
                                <h3 className="text-3xl font-bold mb-10 text-[var(--text-color)] relative z-10 font-['Playfair_Display'] italic">Recruiter Interest Form</h3>
                                
                                <div className="space-y-8 relative z-10">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Company / Firm Name *</label>
                                        <input 
                                            type="text" required name="company_name" value={formData.company_name} onChange={handleChange}
                                            className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                                            placeholder="e.g. Legal Associates & Co."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Contact Person *</label>
                                        <input 
                                            type="text" required name="contact_person" value={formData.contact_person} onChange={handleChange}
                                            className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                                            placeholder="e.g. Jane Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Email Address *</label>
                                            <input 
                                                type="email" required name="email" value={formData.email} onChange={handleChange}
                                                className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                                                placeholder="jane@company.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Phone Number</label>
                                            <input 
                                                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all placeholder:text-[var(--text-muted)]/50"
                                                placeholder="+91..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Message / Requirements *</label>
                                        <textarea 
                                            required name="message" value={formData.message} onChange={handleChange} rows="4"
                                            className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all resize-none placeholder:text-[var(--text-muted)]/50"
                                            placeholder="Tell us about the roles you are hiring for..."
                                        />
                                    </div>

                                    {errorMsg && (
                                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="tlh-btn justify-center w-full mt-4 !py-5"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-[var(--text-color)] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Submit Inquiry</span>
                                                <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                                                    <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PlacementCell;

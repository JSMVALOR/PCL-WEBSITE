/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { useSite } from '../../../context/SiteContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../../ERP/lib/EmailService';
import { Ticket, ChevronDown } from 'lucide-react';
import campusImg from '../../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import styles from '../PROGRAMS/Programs.module.css';

export default function ApplyNow() {
  const navigate = useNavigate();
  const { isAdmissionsOpen } = useSite();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', program: 'B.A., LL.B. (Hons.)',
    familyInLegal: 'No', familyInLegalWho: '', marks10th: '', marksInter: '',
    examTGLAWCET: '', examCLAT: '', examOther: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dpdpaConsent, setDpdpaConsent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dpdpaConsent) {
      setErrorMsg('You must consent to the DPDPA privacy policy to submit.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const ticketId = `TCK-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
      const { error } = await supabase.from('admissions_applications').insert([{
        name: formData.name, email: formData.email, phone: formData.phone,
        program: formData.program, family_in_legal: formData.familyInLegal,
        family_in_legal_who: formData.familyInLegalWho, marks_10th: formData.marks10th,
        marks_inter: formData.marksInter, exam_tglawcet: formData.examTGLAWCET,
        exam_clat: formData.examCLAT, exam_other: formData.examOther,
        status: 'pending', source: 'website'
      }]);

      await supabase.from('helpdesk_tickets').insert([{
        ticket_id: ticketId, category: 'Admissions', subject: `Admission App: ${formData.name}`,
        description: `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Program: ${formData.program}
10th: ${formData.marks10th}, 12th: ${formData.marksInter}`,
        status: 'open', admin_reply: 'Application Received', user_id: null
      }]);

      try {
        await sendSystemEmail('APPLICATION_RECEIVED', {
          to_email: formData.email, name: formData.name, ticket_id: ticketId, type: `Admissions - ${formData.program}`
        });
      } catch(e) { console.warn(e); }

      if (error) throw error;
      setGeneratedTicket(ticketId);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={`${styles.contentContainer} pt-24 md:pt-32 mb-20`}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="w-full text-center mb-16 relative z-10"
        >
          <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold block">
            Admissions
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-6 leading-tight font-['Outfit']">
            Application <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Form</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed text-center">
            Begin your journey in legal excellence. Please complete the admission questionnaire below accurately.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start max-w-7xl mx-auto w-full relative z-10">
          {/* Left Column: Campus Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-[45%] lg:sticky lg:top-32 h-[400px] lg:h-[75vh] relative rounded-[2rem] overflow-hidden border border-[var(--card-border)] shadow-2xl group"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000]/80 via-[#000]/20 to-transparent z-10" />
            
            <img loading="lazy" 
              src={campusImg} 
              alt="Prudentia College of Law Campus" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute bottom-10 left-10 right-10 z-20">
               <h3 className="text-3xl font-bold text-white font-['Playfair_Display'] italic mb-3 shadow-black drop-shadow-lg">Begin Your Journey</h3>
               <p className="text-white/80 text-sm leading-relaxed max-w-sm drop-shadow-md">
                 Join a community of legal visionaries. Our admissions process is designed to identify passionate students ready to make an impact.
               </p>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full lg:w-[55%] relative z-10"
          >
          {!isAdmissionsOpen ? (
            <div className={`${styles.glassCard} h-[500px] flex flex-col justify-center items-center p-10 border border-[var(--primary-color)]/30 bg-[var(--primary-color)]/5 text-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-color)_0%,transparent_60%)] opacity-10 blur-xl rounded-3xl" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--primary-color)] mb-8 relative z-10">
                    <AlertCircle size={80} />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4 text-[var(--text-color)] font-['Playfair_Display'] italic relative z-10">
                    Admissions Closed
                </h2>
                <p className="text-[var(--text-muted)] text-lg mb-10 max-w-md relative z-10">
                    Thank you for your interest in Prudentia College of Law. Admissions for the current academic year are closed. Please contact us for inquiries regarding upcoming intake cycles.
                </p>
                <button onClick={() => navigate('/contact')} className="tlh-btn justify-center relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest">Contact Admissions</span>
                </button>
            </div>
          ) : isSuccess ? (
            <div className={`${styles.glassCard} h-[500px] flex flex-col justify-center items-center p-10 border border-[var(--primary-color)]/30 bg-[var(--primary-color)]/5 text-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-color)_0%,transparent_60%)] opacity-10 blur-xl rounded-3xl" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--primary-color)] mb-8 relative z-10">
                    <CheckCircle2 size={80} />
                </motion.div>
                                <h2 className="text-3xl font-bold mb-4 text-[var(--text-color)] font-['Playfair_Display'] italic relative z-10">
                    Application Received
                </h2>
                <div className="bg-[var(--card-bg)] border border-[var(--primary-color)]/30 rounded-xl px-6 py-4 mb-6 mt-4 flex flex-col items-center relative z-10">
                    <Ticket size={24} className="text-[var(--primary-color)] mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Ticket ID</span>
                    <span className="text-lg font-bold text-[var(--primary-color)] tracking-widest">{generatedTicket}</span>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] mt-2">A confirmation email has been sent to {formData.email}</span>
                </div>
                <p className="text-[var(--text-muted)] text-lg mb-10 max-w-md relative z-10">
                    Thank you for applying to Prudentia College of Law. Our admissions team will review your credentials and contact you shortly.
                </p>
                <button onClick={() => navigate('/')} className="tlh-btn justify-center relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest">Return Home</span>
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`${styles.glassCard} p-8 md:p-12 border border-[var(--card-border)] relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl mb-8 bg-red-500/10 border border-red-500/30 text-red-400">
                      <div className="px-5 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-3"><AlertCircle size={16} />{errorMsg}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-10 relative z-10">
                    {/* Section 1: Personal Details */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--primary-color)] mb-6 font-['Playfair_Display'] italic border-b border-[var(--card-border)] pb-3">1. Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Full Legal Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 outline-none transition-all placeholder:text-[var(--text-muted)]/50" placeholder="As per official documents" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Email Address *</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 outline-none transition-all placeholder:text-[var(--text-muted)]/50" placeholder="student@example.com" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Phone Number *</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 outline-none transition-all placeholder:text-[var(--text-muted)]/50" placeholder="+91..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Select Program *</label>
                                <div className="relative">
                                    <div 
                                      onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                                      className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50 transition-all cursor-pointer flex justify-between items-center"
                                    >
                                      <span className={formData.program ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]/50'}>
                                        {formData.program || 'Select Program...'}
                                      </span>
                                      <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform duration-300 ${isProgramDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    <AnimatePresence>
                                      {isProgramDropdownOpen && (
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: 10 }}
                                          transition={{ duration: 0.2 }}
                                          className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl overflow-hidden z-50 shadow-2xl"
                                        >
                                          {['B.A., LL.B. (Hons.)', 'B.B.A., LL.B. (Hons.)', 'LL.B. (3-Year)'].map((opt) => (
                                            <div 
                                              key={opt}
                                              onClick={() => {
                                                setFormData(prev => ({ ...prev, program: opt }));
                                                setIsProgramDropdownOpen(false);
                                              }}
                                              className={`px-5 py-4 cursor-pointer text-base transition-colors duration-200 hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] ${formData.program === opt ? 'bg-[var(--primary-color)]/5 text-[var(--primary-color)]' : 'text-[var(--text-color)]'}`}
                                            >
                                              {opt}
                                            </div>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Academic Record */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--primary-color)] mb-6 font-['Playfair_Display'] italic border-b border-[var(--card-border)] pb-3">2. Academic Record</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Class X Marks (%) *</label>
                                <input type="number" name="marks10th" required value={formData.marks10th} onChange={handleChange} min="0" max="100" step="0.01"
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="e.g. 92.5" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Class XII Marks (%) *</label>
                                <input type="number" name="marksInter" required value={formData.marksInter} onChange={handleChange} min="0" max="100" step="0.01"
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="e.g. 88.0" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">TG LAWCET Rank (Optional)</label>
                                <input type="text" name="examTGLAWCET" value={formData.examTGLAWCET} onChange={handleChange}
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="Enter rank if applicable" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">CLAT Score (Optional)</label>
                                <input type="text" name="examCLAT" value={formData.examCLAT} onChange={handleChange}
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="Enter score if applicable" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Background */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--primary-color)] mb-6 font-['Playfair_Display'] italic border-b border-[var(--card-border)] pb-3">3. Background Questionnaire</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 ml-1">Is anyone in your immediate family in the legal profession?</label>
                                <div className="flex gap-8 ml-1">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.familyInLegal === 'Yes' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20' : 'border-[var(--card-border)] group-hover:border-[var(--primary-color)]/50'}`}>
                                            {formData.familyInLegal === 'Yes' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)]"></div>}
                                        </div>
                                        <input type="radio" name="familyInLegal" value="Yes" checked={formData.familyInLegal === 'Yes'} onChange={handleChange} className="hidden" />
                                        <span className="text-[var(--text-color)] text-sm font-bold tracking-wide">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.familyInLegal === 'No' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20' : 'border-[var(--card-border)] group-hover:border-[var(--primary-color)]/50'}`}>
                                            {formData.familyInLegal === 'No' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)]"></div>}
                                        </div>
                                        <input type="radio" name="familyInLegal" value="No" checked={formData.familyInLegal === 'No'} onChange={handleChange} className="hidden" />
                                        <span className="text-[var(--text-color)] text-sm font-bold tracking-wide">No</span>
                                    </label>
                                </div>
                            </div>

                            <AnimatePresence>
                                {formData.familyInLegal === 'Yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1 mt-4">Please specify relationship and profession</label>
                                        <input type="text" name="familyInLegalWho" value={formData.familyInLegalWho} onChange={handleChange}
                                            className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="e.g. Mother - Senior Advocate at High Court" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* DPDPA Consent */}
                    <div className="flex items-start gap-3 mt-4 mb-2">
                      <div className="pt-1">
                        <input type="checkbox" id="dpdpa-apply" checked={dpdpaConsent} onChange={(e) => setDpdpaConsent(e.target.checked)}
                          className="w-4 h-4 accent-[var(--primary-color)] cursor-pointer" />
                      </div>
                      <label htmlFor="dpdpa-apply" className="text-xs text-[var(--text-muted)] cursor-pointer select-none leading-relaxed">
                        I consent to the collection and processing of my personal data as per the <Link to="/privacy" target="_blank" className="text-[var(--primary-color)] hover:underline">Privacy Policy</Link> and DPDPA (2023) guidelines.
                      </label>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="tlh-btn w-full justify-center !py-5 mt-4">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-[var(--text-color)] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="text-xs font-bold uppercase tracking-widest">Submit Application</span>
                                <Send size={16} className="ml-2" />
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
}

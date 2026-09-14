/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { forwardRef } from 'react';
import { MapPin, Phone, Mail, ArrowRight, ArrowUp } from 'lucide-react';
import CountUp from './CountUp';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

const HomeContact = forwardRef((props, ref) => {
  const { content } = useSiteContent('/', 'contact_snippet');

  // Fallback defaults if CMS is not yet configured
  const cms = {
    heading_line1: content?.heading_line1 || "Uncompromising",
    heading_highlight: content?.heading_highlight || "Excellence.",
    heading_line2: content?.heading_line2 || "Accessible to All.",
    description: content?.description || "Experience world-class legal education at just ₹20,000/annum. Strictly merit-based admissions governed by OU Counseling.",
    btn_text: content?.btn_text || "Apply Now",
    btn_link: content?.btn_link || "/apply",
    metric1_value: parseInt(content?.metric1_value) || 240,
    metric1_label: content?.metric1_label || "Elite Phase I Scholars",
    metric2_value: parseInt(content?.metric2_value) || 100,
    metric2_suffix: content?.metric2_suffix || "%",
    metric2_label: content?.metric2_label || "Distinguished Faculty",
    metric3_value: parseInt(content?.metric3_value) || 1200,
    metric3_suffix: content?.metric3_suffix || "+",
    metric3_label: content?.metric3_label || "Future Capacity"
  };
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="slide w-full relative flex flex-col overflow-hidden bg-[var(--bg-color)]" ref={ref} {...props}>
      {/* Refined Ambient Backgrounds */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="container relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col h-[100svh] md:h-full justify-between pt-[100px] md:pt-[120px] pb-4 md:pb-8">
        
        {/* --- TOP SECTION: ADMISSIONS & METRICS --- */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col lg:flex-row gap-2 lg:gap-10 items-center flex-1 justify-center pt-0 md:pt-8"
        >
          {/* Left Text */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            <motion.div variants={itemVars} className="hidden lg:block w-16 h-[2px] bg-[var(--primary-color)] mb-4 md:mb-6"></motion.div>
            
            <motion.h2 variants={itemVars} className="text-2xl md:text-5xl lg:text-[58px] font-bold leading-[1.05] mb-2 md:mb-6 text-[var(--text-color)] tracking-tight">
              {cms.heading_line1} <span className="text-[var(--primary-color)] font-medium italic">{cms.heading_highlight}</span><br className="hidden md:block"/>
              <span className="ml-1 md:ml-0">{cms.heading_line2}</span>
            </motion.h2>
            
            <motion.p variants={itemVars} className="text-[11px] md:text-base text-[var(--text-muted)] font-light leading-relaxed text-justify max-w-lg mb-3 md:mb-8">
              {cms.description}
            </motion.p>
            
            <motion.div variants={itemVars}>
              <Link 
                to={cms.btn_link} 
                className="tlh-btn !py-4 px-10 w-fit"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center">
                  {cms.btn_text} <ArrowRight size={16} className="ml-2" />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Right Metrics Grid (Luxurious Glassmorphic Design) */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2 md:gap-5 z-20">
            
            {/* Massive Hero Metric */}
            <motion.div variants={itemVars} className="col-span-2 bg-[var(--card-bg)] border border-[var(--card-border)]/50 rounded-[16px] md:rounded-[28px] p-4 md:p-10 backdrop-blur-3xl group hover:border-[var(--primary-color)]/60 hover:bg-[var(--card-bg)]/80 transition-all duration-700 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center text-center transform hover:-translate-y-2">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--primary-color)] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
              
              <h3 className="text-4xl md:text-[88px] font-black text-[var(--text-color)] mb-0 md:mb-2 tracking-tighter leading-none">
                <CountUp to={cms.metric1_value} duration={2.5} />
              </h3>
              <p className="text-[var(--primary-color)] uppercase tracking-[0.2em] md:tracking-[0.25em] text-[8px] md:text-xs font-bold mt-1 md:mt-2">{cms.metric1_label}</p>
            </motion.div>
            
            {/* Secondary Metric 1 */}
            <motion.div variants={itemVars} className="bg-[var(--card-bg)] border border-[var(--card-border)]/50 rounded-[12px] md:rounded-[24px] p-3 md:p-8 backdrop-blur-3xl group hover:border-[var(--primary-color)]/50 hover:bg-[var(--card-bg)]/80 transition-all duration-700 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center transform hover:-translate-y-1">
              <h3 className="text-2xl md:text-5xl font-black text-[var(--text-color)] mb-0 tracking-tighter leading-none">
                <CountUp to={cms.metric2_value} duration={2.5} /><span className="text-[var(--primary-color)] text-lg md:text-3xl absolute mt-0 md:-mt-1 ml-0.5 md:ml-1">{cms.metric2_suffix}</span>
              </h3>
              <p className="text-[var(--text-muted)] uppercase tracking-[0.05em] md:tracking-[0.2em] text-[7px] md:text-[10px] font-extrabold mt-1 md:mt-2">{cms.metric2_label}</p>
            </motion.div>
            
            {/* Secondary Metric 2 */}
            <motion.div variants={itemVars} className="bg-[var(--card-bg)] border border-[var(--card-border)]/50 rounded-[12px] md:rounded-[24px] p-3 md:p-8 backdrop-blur-3xl group hover:border-[var(--primary-color)]/50 hover:bg-[var(--card-bg)]/80 transition-all duration-700 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center transform hover:-translate-y-1">
              <h3 className="text-2xl md:text-5xl font-black text-[var(--text-color)] mb-0 tracking-tighter leading-none">
                <CountUp to={cms.metric3_value} duration={2.5} separator="," /><span className="text-[var(--primary-color)] text-lg md:text-3xl absolute mt-0 md:-mt-1 ml-0.5 md:ml-1">{cms.metric3_suffix}</span>
              </h3>
              <p className="text-[var(--text-muted)] uppercase tracking-[0.05em] md:tracking-[0.2em] text-[7px] md:text-[10px] font-extrabold mt-1 md:mt-2">{cms.metric3_label}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* --- BOTTOM SECTION: CLEAN MINI-FOOTER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 md:mt-12 flex flex-col w-full z-20 pb-4"
        >
          {/* Architectural Divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent mb-4 md:mb-6"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-6 mb-2 md:mb-6">
            
            {/* Logo Area */}
            <div className="hidden md:flex items-center gap-5 opacity-90 hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 bg-center bg-contain bg-no-repeat brand-crest"></div>
              <div className="flex flex-col">
                <span className="font-black tracking-[0.15em] text-xl text-[var(--text-color)] leading-none mb-1">PRUDENTIA</span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--primary-color)] font-bold">College of Law</span>
              </div>
            </div>

            {/* Premium Contact Badges */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 w-full md:w-auto">
              <a href="tel:+918599000777" className="flex items-center gap-2 md:gap-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all group">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)] group-hover:shadow-[0_0_15px_rgba(255, 191, 0, 0.3)] transition-all">
                  <Phone size={10} className="md:w-[14px] md:h-[14px] group-hover:text-[var(--primary-color)] transition-colors" />
                </div>
                <span className="text-[9px] md:text-[11px] font-bold tracking-widest uppercase">+91 8599000777</span>
              </a>
              <a href="mailto:info@prudentiacollegeoflaw.com" className="flex items-center gap-2 md:gap-3 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all group">
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)] group-hover:shadow-[0_0_15px_rgba(255, 191, 0, 0.3)] transition-all">
                  <Mail size={10} className="md:w-[14px] md:h-[14px] group-hover:text-[var(--primary-color)] transition-colors" />
                </div>
                <span className="text-[8px] md:text-[11px] font-bold tracking-widest uppercase">info@prudentiacollegeoflaw.com</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between text-[7px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] w-full pt-4 border-t border-[var(--card-border)] pb-2">
            <p className="mb-4 md:mb-0 opacity-70">© {new Date().getFullYear()} Prudentia College of Law.</p>
            <div className="hidden md:flex flex-wrap justify-center gap-4 md:gap-6 opacity-70">
              <Link to="/" className="hover:text-[var(--primary-color)] transition-colors">Home</Link>
              <Link to="/about" className="hover:text-[var(--primary-color)] transition-colors">About Us</Link>
              <Link to="/programs" className="hover:text-[var(--primary-color)] transition-colors">Programs</Link>
              <Link to="/events" className="hover:text-[var(--primary-color)] transition-colors">Events</Link>
              <Link to="/campus/facilities" className="hover:text-[var(--primary-color)] transition-colors">Campus</Link>
              <Link to="/contact" className="hover:text-[var(--primary-color)] transition-colors">Contact</Link>
              <Link to="/erp" className="hover:text-[var(--primary-color)] transition-colors">ERP Login</Link>
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-[var(--primary-color)] hover:text-white transition-colors group opacity-100">
              Return To Top <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
});

HomeContact.displayName = 'HomeContact';
export default HomeContact;

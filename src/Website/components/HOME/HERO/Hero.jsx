/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, FileText, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import campusImg from '../../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import outdoorImg from '../../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';
import { useSite } from '../../../context/SiteContext';
import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

const paragraphVariants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 20 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const metricsVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.6 }
  }
};

// --- COMPONENTS ---

const AnimatedHeadline = ({ text, className, style }) => {
  const words = text.split(" ");
  return (
    <h1 className={`flex flex-wrap justify-center overflow-visible ${className}`} style={style}>
      {words.map((word, idx) => (
        <motion.span 
          key={idx} 
          variants={wordVariants}
          className="inline-block mr-[0.25em] mb-[-0.15em] pb-[0.15em]"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

const Hero = forwardRef(({ windowWidth, ...props }, ref) => {
  const { isAdmissionsOpen } = useSite();
  const { content } = useSiteContent('/', 'hero');
  const isMobile = windowWidth <= 768;

  const title1 = content?.title1 || "Advancing";
  const title2 = content?.title2 || "Integrated Legal Education";
  const desc = content?.description || "Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence at Prudentia College of Law.";
  const btn1Text = content?.btn1_text || "Apply Now";
  const btn1Link = content?.btn1_link || "/apply";
  const btn2Text = content?.btn2_text || "Explore Programs";
  const btn2Link = content?.btn2_link || "/programs";
  const btn3Text = content?.btn3_text || "Campus";
  const btn3Link = content?.btn3_link || "/campus/facilities";

  return (
    <section 
      ref={ref} 
      {...props} 
      className="slide relative w-full h-[100dvh] min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--bg-color)]"
    >
      {/* BACKGROUND SCENE */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 1.18 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="w-full h-full bg-cover bg-center origin-center"
          style={{ backgroundImage: `url(${windowWidth <= 900 ? campusImg : outdoorImg})` }}
        />
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--hero-overlay-1)' }}></div>
        <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(to bottom, var(--hero-overlay-2-start), var(--hero-overlay-2-mid), var(--hero-overlay-2-end))' }}></div>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, var(--hero-overlay-3) 100%)' }}></div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Spacer for top navbar offset (since we are flex-col justify-between) */}
      <div className="flex-shrink-0 h-[60px] md:h-[120px] w-full relative z-10"></div>

      {/* CONTENT FOREGROUND (Centered perfectly) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8"
      >
        
        {/* Badge */}
        <motion.div 
          variants={badgeVariants}
          className={`mb-3 md:mb-[32px] inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-sm border text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg ${isAdmissionsOpen ? 'border-[var(--primary-color)]/50 text-[var(--primary-color)]' : 'border-rose-500/50 text-rose-500'}`}
          style={{ backgroundColor: 'var(--hero-badge-bg)' }}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAdmissionsOpen ? 'bg-[var(--primary-color)] animate-pulse shadow-[0_0_10px_var(--primary-color)]' : 'bg-rose-500'}`}></span>
          {isAdmissionsOpen ? "Admissions Open 2026 - 2027" : "Admissions Closed 2026 - 2027"}
        </motion.div>

        {/* Headline */}
        <div className="mb-4 md:mb-[36px] w-full max-w-[1100px]">
          <AnimatedHeadline 
            text={title1} 
            className="text-[2.75rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[76px] font-bold leading-[1.1] tracking-[-0.01em] drop-shadow-2xl" 
          />
          <AnimatedHeadline 
            text={title2} 
            className="text-[2.25rem] sm:text-[3rem] md:text-[4rem] lg:text-[64px] font-bold italic leading-[1.1] tracking-[-0.01em] text-[var(--primary-color)] drop-shadow-[0_0_30px_rgba(255,191,0,0.2)]" 
          />
        </div>

        {/* Paragraph Capsule */}
        <motion.div 
          variants={paragraphVariants}
          className="mb-6 md:mb-[48px] backdrop-blur-xl rounded-full px-6 md:px-12 py-4 md:py-5 max-w-[700px] mx-auto shadow-2xl"
          style={{ backgroundColor: 'var(--hero-pill-bg)', border: '1px solid var(--hero-border)' }}
        >
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-light drop-shadow-md text-center">
            {desc}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          variants={containerVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full px-6 relative bottom-4 md:bottom-8"
        >
          <motion.div variants={buttonVariants} className="w-full sm:w-auto flex justify-center">
            {isAdmissionsOpen ? (
              <Link 
                to={btn1Link} 
                className="tlh-btn w-full sm:w-auto flex justify-center items-center !py-4 px-10 min-w-[220px]"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center justify-center">
                  {btn1Text} <ArrowRight size={16} className="ml-2" />
                </span>
              </Link>
            ) : (
              <Link 
                to="/contact" 
                className="tlh-btn w-full sm:w-auto flex justify-center items-center !py-4 px-10 min-w-[220px]"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center justify-center">
                  Inquire Admissions <ArrowRight size={16} className="ml-2" />
                </span>
              </Link>
            )}
          </motion.div>

          <motion.div variants={buttonVariants} className="w-full sm:w-auto flex justify-center">
            <Link 
              to={btn2Link} 
              className="tlh-btn w-full sm:w-auto flex justify-center items-center !py-4 px-10 min-w-[220px]"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center justify-center">
                {btn2Text}
              </span>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants} className="w-full sm:w-auto flex justify-center hidden md:flex">
            <Link 
              to={btn3Link} 
              className="tlh-btn w-full sm:w-auto flex justify-center items-center !py-4 px-10 min-w-[220px]"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center justify-center">
                {btn3Text} <ArrowRight size={16} className="ml-2" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

      </motion.div>

      {/* METRICS (Natural Flex Block at Bottom) */}
      <motion.div 
        variants={metricsVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full z-20 mb-6 md:mb-10 px-4"
      >
        {isMobile ? (
          /* Mobile Metrics - Grid Layout (No Scroll) */
          <div className="w-full grid grid-cols-3 gap-2 pb-2">
            <div className="w-full h-[70px] backdrop-blur-xl rounded-[12px] flex flex-col items-center justify-center p-2 text-center shadow-lg" style={{ backgroundColor: 'var(--hero-metrics-bg)', border: '1px solid var(--hero-metrics-border)' }}>
              <h4 className="font-bold text-[11px] mb-0.5" style={{ color: 'var(--text-color)' }}>BCI</h4>
              <p className="font-medium text-[9px]" style={{ color: 'var(--text-muted)' }}>Approved</p>
            </div>
            <div className="w-full h-[70px] backdrop-blur-xl rounded-[12px] flex flex-col items-center justify-center p-2 text-center shadow-lg" style={{ backgroundColor: 'var(--hero-metrics-bg)', border: '1px solid var(--hero-metrics-border)' }}>
              <h4 className="font-bold text-[11px] mb-0.5" style={{ color: 'var(--text-color)' }}>OU</h4>
              <p className="font-medium text-[9px]" style={{ color: 'var(--text-muted)' }}>Affiliated</p>
            </div>
            <div className="w-full h-[70px] backdrop-blur-xl rounded-[12px] flex flex-col items-center justify-center p-2 text-center shadow-lg" style={{ backgroundColor: 'var(--hero-metrics-bg)', border: '1px solid var(--hero-metrics-border)' }}>
              <h4 className="font-bold text-[11px] mb-0.5" style={{ color: 'var(--text-color)' }}>240</h4>
              <p className="font-medium text-[9px]" style={{ color: 'var(--text-muted)' }}>Seats</p>
            </div>
          </div>
        ) : (
          /* Desktop Metrics - Floating Strip */
          <div className="max-w-[1200px] mx-auto">
            <div className="w-full h-[100px] rounded-[24px] backdrop-blur-xl shadow-2xl flex items-center justify-around px-12 relative overflow-hidden" style={{ backgroundColor: 'var(--hero-metrics-bg)', border: '1px solid var(--hero-metrics-border)' }}>
              
              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <h4 className="font-extrabold text-[17px]" style={{ color: 'var(--text-color)' }}>BCI Approved</h4>
                  <p className="font-medium text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Order No: 286/2026</p>
                </div>
              </div>

              <div className="w-px h-[40px] relative z-10" style={{ backgroundColor: 'var(--hero-metrics-border)' }}></div>

              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <h4 className="font-extrabold text-[17px]" style={{ color: 'var(--text-color)' }}>Osmania University</h4>
                  <p className="font-medium text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>College Code: 1720</p>
                </div>
              </div>

              <div className="w-px h-[40px] relative z-10" style={{ backgroundColor: 'var(--hero-metrics-border)' }}></div>

              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <h4 className="font-extrabold text-[17px]" style={{ color: 'var(--text-color)' }}>Phase I Intake</h4>
                  <p className="font-medium text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Regulated 240 Seats</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </motion.div>

      {/* Hide scrollbar styles for mobile swipeable cards */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
});

Hero.displayName = 'Hero';
export default Hero;

/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import founderImg from '../../../../Shared/Assets/PEOPLE/Dr_Sneha_Mulla.png';
import coFounderImg from "../../../../Shared/Assets/PEOPLE/pcl_cofounder.png";
import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

function LeadershipCard({ leader, index }) {
  const navigate = useNavigate();
  const go = () => navigate(leader.path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
      className="w-full max-w-[360px]"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={go}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}
        aria-label={`View profile of ${leader.name}`}
        className="w-full h-full cursor-pointer relative group aspect-[3/4] rounded-[32px] overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)] border border-[var(--card-border)] hover:border-[var(--primary-color)]/50 hover:shadow-[0_0_40px_rgba(255,191,0,0.15)] transition-all duration-500"
      >
        <img loading="lazy"
          src={leader.image}
          alt={leader.name}
          className={`absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${leader.id === 'co-founder' ? 'object-top' : 'object-center'}`}
        />
        {/* Dark portrait gradient regardless of theme for editorial aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col z-10 overflow-hidden">
          <h3 className="text-2xl md:text-3xl text-white font-bold mb-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {leader.name}
          </h3>
          <p className="text-[var(--primary-color)] uppercase tracking-widest text-xs md:text-sm font-semibold mb-6 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 delay-[50ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
            {leader.title}
          </p>

          <div className="flex items-center gap-2 text-white/0 group-hover:text-white transition-all duration-700 transform translate-y-8 group-hover:translate-y-0 delay-[100ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className="text-sm font-bold uppercase tracking-wider">Read Profile</span>
            <span className="text-lg">➔</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const shouldReduceMotion = useReducedMotion();
  const { content } = useSiteContent('/about/leadership', 'leadership_main');

  const cms = {
    hero_line1: content?.hero_line1 || "Shaping the",
    hero_highlight: content?.hero_highlight || "Future of Law.",
    hero_desc_1: content?.hero_desc_1 || "Prudentia College of Law, Gurramguda, Hyderabad is established with a vision to nurture a new generation of legal professionals equipped with knowledge, integrity, and leadership. The institution is dedicated to creating an academic environment where law is not merely studied as a subject but understood as a powerful instrument of justice, social transformation, and nation-building.",
    hero_desc_2: content?.hero_desc_2 || "At Prudentia College of Law, we believe that legal education must go beyond classrooms and textbooks. Our approach combines strong academic foundations with practical exposure through moot courts, legal aid initiatives, internships, ADR training, court visits, and skill-oriented learning.",
    mission: content?.mission || "To provide an elite, integrated legal environment that merges academic brilliance with uncompromising practical training, fostering critical thinkers who will redefine jurisprudence.",
    vision: content?.vision || "To stand as the definitive institution of legal education in India—nurturing advocates, judges, and policy architects who uphold the Constitution with courage and social conscience.",
    motto: content?.motto || "Excellence in Theory. Command in Practice.",
    founder_name: "Dr. Sneha Mula Goud",
    founder_title: content?.founder_title || "Founder & Chairman",
    founder_image: content?.founder_image || founderImg,
    cofounder_name: content?.cofounder_name || "Mr. Bharat Krishna Buddala",
    cofounder_title: content?.cofounder_title || "Co-Founder & Secretary",
    cofounder_image: content?.cofounder_image || coFounderImg };

  const dynamicTabs = [
    { id: 'mission', label: 'Mission', number: '01', content: cms.mission },
    { id: 'vision', label: 'Vision', number: '02', content: cms.vision },
    { id: 'motto', label: 'Motto', number: '03', content: cms.motto }
  ];

  const dynamicLeaders = [
    { id: 'founder', name: cms.founder_name, title: cms.founder_title, image: cms.founder_image, path: '/about/leadership/founder' },
    { id: 'co-founder', name: cms.cofounder_name, title: cms.cofounder_title, image: cms.cofounder_image, path: '/about/leadership/co-founder' }
  ];

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden pb-32">
      
      {/* Content Container */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center pt-[120px] md:pt-[160px] pb-12">

        {/* Editorial Intro Section */}
        <div className="w-full mb-32 flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          <div className="lg:w-1/2">
            <motion.h1
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-6 tracking-tight"
             
            >
              {cms.hero_line1} <br/>
              <span className="text-[var(--primary-color)] italic pr-2">{cms.hero_highlight}</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }} 
              animate={{ opacity: 1, scaleX: 1 }} 
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[2px] w-16 bg-[var(--primary-color)] opacity-80 mb-8 origin-left"
            />
          </div>

          <div className="lg:w-1/2 text-[var(--text-muted)] text-lg md:text-xl leading-relaxed text-justify space-y-8">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <span className="font-semibold italic drop-cap block float-left mr-3 mt-1 mb-[-12px] text-[var(--primary-color)] drop-shadow-md" style={{ fontSize: '4.5rem', lineHeight: '0.8' }}>
                {cms.hero_desc_1.charAt(0)}
              </span>
              {cms.hero_desc_1.slice(1)}
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              {cms.hero_desc_2}
            </motion.p>
          </div>
        </div>

        {/* Core Philosophy Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-32">
          {dynamicTabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
              className="relative p-10 md:p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[32px] overflow-hidden group hover:border-[var(--primary-color)]/30 hover:shadow-[0_0_30px_rgba(255,191,0,0.15)] backdrop-blur-xl transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="absolute -top-6 -right-6 text-[120px] font-black text-[var(--text-color)] opacity-5 group-hover:scale-110 group-hover:-translate-x-4 group-hover:translate-y-4 group-hover:text-[var(--primary-color)] group-hover:opacity-10 transition-all duration-700 pointer-events-none">
                {tab.number}
              </div>
              
              <h3 className="relative z-10 text-2xl lg:text-3xl font-bold mb-6 text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors duration-500">
                {tab.label}
              </h3>
              <p className="relative z-10 text-[var(--text-muted)] leading-relaxed text-lg group-hover:text-[var(--text-color)] transition-colors duration-500">
                {tab.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Leadership Section */}
        <div className="w-full mt-16 flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-[var(--text-color)] mb-16 text-center tracking-tight"
           
          >
            OUR <span className="text-[var(--primary-color)] italic font-medium pr-2">LEADERSHIP</span>
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center justify-center w-full">
            {dynamicLeaders.map((leader, index) => (
              <LeadershipCard key={leader.id} leader={leader} index={index} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

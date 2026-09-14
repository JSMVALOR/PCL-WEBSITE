/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import * as Icons from 'lucide-react';

import mootCourtImg from '../../../../../Shared/Assets/CAMPUS/moot1.png';
import styles from '../../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

const MOOT_CONTENT = {
  heroTitle: "Moot Court Society",
  heroSubtitle: "The Moot Court Society is the crowning jewel of Prudentia's academic infrastructure. Our state-of-the-art halls provide students with immersive, real-world litigation experience under the guidance of seasoned legal professionals.",
  cards: [
    {
      title: "Simulated Courtrooms",
      text: "Architecturally modeled after Indian High Courts, complete with Judge's bench, witness stands, and counsel tables to ensure a hyper-authentic procedural experience.",
      icon: "Scale"
    },
    {
      title: "Elite Competitions",
      text: "A dedicated training and strategy ground for students representing the college at prestigious national and international moot court competitions.",
      icon: "Trophy"
    },
    {
      title: "Expert Adjudicators",
      text: "Regular mock trials presided over by sitting judges, senior advocates, and legal luminaries to provide critical, real-time feedback on oral arguments.",
      icon: "Gavel"
    }
  ]
};

export default function MootCourt() {
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-fade-up',
        { opacity: 0, y: 40 },
        {
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, contentRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer} ref={contentRef}>
        
        {/* Navigation */}
        <Link to="/campus/facilities" className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold relative z-10 gsap-fade-up">
          <span className="mr-2">←</span> Back to Campus Facilities
        </Link>

        {/* Header */}
        <div className="mb-16 relative z-10 gsap-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1 border border-[var(--accent)]/30 rounded-full text-[var(--accent)] text-xs md:text-sm tracking-widest uppercase bg-[var(--accent)]/10 backdrop-blur-sm font-bold whitespace-nowrap">Practical Learning</span>
            <span className="px-4 py-1 border border-[var(--card-border)] rounded-full text-[var(--text-muted)] text-xs md:text-sm tracking-widest uppercase bg-[var(--card-bg)]/30 backdrop-blur-sm font-bold whitespace-nowrap">Experiential</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-6 leading-tight font-['Outfit']"
          >
            Where rigorous <br className="hidden md:block" />
            <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">advocacy</span> meets practice
          </motion.h1>
          <p className="text-xl text-[var(--text-muted)] max-w-3xl leading-relaxed">
            {MOOT_CONTENT.heroSubtitle}
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-20 relative flex items-center justify-center group shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-[var(--card-border)] gsap-fade-up z-10">
          <img decoding="async" loading="lazy" src={mootCourtImg} alt="Moot Court Hall" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-80 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-[var(--primary-color)]/20 rounded-3xl pointer-events-none"></div>
        </div>

        {/* Grid Section */}
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {MOOT_CONTENT.cards.map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Gavel;
            
            return (
              <div key={index} className={`${styles.glassCard} gsap-fade-up p-8 border border-[var(--card-border)] hover:border-[var(--primary-color)]/50 transition-colors duration-500 overflow-hidden relative group`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                <div className="w-16 h-16 rounded-2xl border border-[var(--primary-color)]/40 flex items-center justify-center bg-[var(--bg-color)]/80 mb-8 shadow-[0_0_30px_var(--primary-glow)] group-hover:scale-110 transition-transform duration-500">
                  <IconComponent className="w-8 h-8 text-[var(--primary-color)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 leading-tight group-hover:text-[var(--primary-color)] transition-colors font-['Playfair_Display'] italic">
                  {card.title}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed text-base font-medium">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center gsap-fade-up relative z-10 flex flex-col items-center">
          <Link to="/campus/gallery" className="tlh-btn justify-center" style={{ maxWidth: '300px' }}>
            <span className="text-xs font-bold uppercase tracking-widest">View Campus Gallery</span>
            <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

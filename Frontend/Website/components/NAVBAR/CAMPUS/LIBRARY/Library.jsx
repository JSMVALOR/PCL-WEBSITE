/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Library as LibraryIcon, Monitor, Wifi, Video, ArrowUpRight } from 'lucide-react';

import libraryImg from '../../../../../Shared/Assets/CAMPUS/pcl_library.webp';
import styles from '../../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Library() {
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
        <Link to="/campus/facilities" className="inline-flex items-center text-gray-400 hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold relative z-10 gsap-fade-up">
          <span className="mr-2">←</span> Back to Facilities
        </Link>

        {/* Header */}
        <div className="mb-16 relative z-10 gsap-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1 border border-[var(--accent)]/30 rounded-full text-[var(--accent)] text-xs md:text-sm tracking-widest uppercase bg-[var(--accent)]/5 backdrop-blur-sm whitespace-nowrap">Academic Infrastructure</span>
            <span className="px-4 py-1 border border-[var(--card-border)] rounded-full text-[var(--text-muted)] text-xs md:text-sm tracking-widest uppercase bg-[var(--card-bg)]/30 backdrop-blur-sm whitespace-nowrap">Digital Ecosystem</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
           
          >
            Library & <span className="text-[#FFBF00] italic">Infrastructure</span>
          </motion.h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            State-of-the-art facilities designed to foster rigorous scholarship and dynamic education. Discover the intellectual core of Prudentia College of Law.
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-20 relative flex items-center justify-center group shadow-2xl gsap-fade-up z-10">
          <img decoding="async" loading="lazy" src={libraryImg} alt="Library & Infrastructure" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 ring-1 ring-inset ring-[#FFBF00]/30 rounded-3xl pointer-events-none"></div>
        </div>

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          
          <div className={`${styles.glassCard} gsap-fade-up`}>
            <div className="w-14 h-14 rounded-xl border border-[#FFBF00]/30 flex items-center justify-center bg-black/40 mb-6 shadow-[0_0_20px_rgba(255,191,0,0.1)]">
              <LibraryIcon className="w-7 h-7 text-[#FFBF00]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              The Prudentia Law Library
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              An extensive repository housing over 10,000 volumes and thousands of journals, managed by expert librarians to serve as the intellectual core for legal research.
            </p>
          </div>

          <div className={`${styles.glassCard} gsap-fade-up`}>
            <div className="w-14 h-14 rounded-xl border border-[#FFBF00]/30 flex items-center justify-center bg-black/40 mb-6 shadow-[0_0_20px_rgba(255,191,0,0.1)]">
              <Monitor className="w-7 h-7 text-[#FFBF00]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Interactive Smart Classrooms
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Forward-thinking learning spaces equipped with advanced digital teaching tools for dynamic, multimedia-driven education.
            </p>
          </div>

          <div className={`${styles.glassCard} gsap-fade-up`}>
            <div className="w-14 h-14 rounded-xl border border-[#FFBF00]/30 flex items-center justify-center bg-black/40 mb-6 shadow-[0_0_20px_rgba(255,191,0,0.1)]">
              <Wifi className="w-7 h-7 text-[#FFBF00]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              High-Speed Campus Wi-Fi
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Seamless connectivity ensuring uninterrupted access to elite online research platforms and global legal databases.
            </p>
          </div>

          <div className={`${styles.glassCard} gsap-fade-up`}>
            <div className="w-14 h-14 rounded-xl border border-[#FFBF00]/30 flex items-center justify-center bg-black/40 mb-6 shadow-[0_0_20px_rgba(255,191,0,0.1)]">
              <Video className="w-7 h-7 text-[#FFBF00]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Executive Auditorium & Conference Hall
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              A sprawling venue with premium audio-visual systems designed to host national seminars and high-profile institutional events.
            </p>
          </div>

        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center gsap-fade-up relative z-10">
          <Link to="/campus/gallery" className={styles.magneticBtn} style={{ maxWidth: '300px' }}>
            Explore Campus Gallery
            <ArrowUpRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

      </div>
    </div>
  );
}

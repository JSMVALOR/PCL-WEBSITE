/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function Maintenance() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.maintenance-bg', 
        { scale: 1.1, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 2, ease: 'power3.out' }
      );
      
      gsap.to('.ambient-light', {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        scale: 'random(0.8, 1.2)',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#050505] text-white flex items-center justify-center font-sans selection:bg-[#cda75b]/30">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/ASSETS/CAMPUS/PCL_CAMPUS.webp" 
          alt="Campus Background" 
          className="maintenance-bg w-full h-full object-cover opacity-20 filter grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505] z-10" />
      </div>

      {/* Ambient Lights */}
      <div className="ambient-light absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-[#cda75b]/5 rounded-full blur-[100px] z-10 pointer-events-none" />
      <div className="ambient-light absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-[#cda75b]/5 rounded-full blur-[120px] z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 max-w-4xl w-full px-6 flex flex-col items-center text-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-12"
        >
          <img 
            src="/ASSETS/LOGOS/pcl_campus_logo.webp" 
            alt="Prudentia College of Law Logo" 
            className="h-24 md:h-32 object-contain drop-shadow-2xl opacity-90"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <h1 className="text-sm md:text-base font-bold tracking-[0.3em] uppercase text-[#cda75b] mb-6 font-mono">
            System Maintenance
          </h1>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 font-['Outfit'] leading-tight">
            Refining the <span className="font-['Playfair_Display'] italic font-normal text-[#cda75b]">Experience</span>
          </h2>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            The Prudentia College of Law digital infrastructure is currently undergoing scheduled upgrades to enhance performance and security. We will be back online shortly.
          </p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-16 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#cda75b]"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-xs text-white/40 tracking-widest uppercase font-mono">
            Please check back soon
          </p>
        </motion.div>
      </div>

      {/* Footer info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 w-full text-center z-20"
      >
        <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">
          &copy; {new Date().getFullYear()} JSM VALOR. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
}

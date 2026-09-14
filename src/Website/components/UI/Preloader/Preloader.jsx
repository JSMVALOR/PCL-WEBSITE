/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';
import pclLogo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';

const DISPLAY_DURATION = 2500; // ms the preloader stays up once shown

export default function Preloader() {
  // Computed once, synchronously, on first render — avoids the brief
  // flash where the preloader was absent before the old effect-based
  // check could run.
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preloader-container">
            {/* Sits behind the logo and drives the pulsing glow via
                opacity/transform only, so the svg's own filter never
                has to be recalculated every frame. */}
            
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-[var(--accent)] mb-6" style={{
                 WebkitMaskImage: `url(${pclLogo})`,
                 WebkitMaskSize: "contain",
                 WebkitMaskRepeat: "no-repeat",
                 WebkitMaskPosition: "center",
                 maskImage: `url(${pclLogo})`,
                 maskSize: "contain",
                 maskRepeat: "no-repeat",
                 maskPosition: "center",
              }}></div>
              <div className="flex flex-col items-center leading-[1.1] text-[var(--accent)]">
                <span className="font-bold tracking-[4px] md:tracking-[6px] text-3xl md:text-5xl font-['Outfit']">PRUDENTIA</span>
                <span className="text-[10px] md:text-sm tracking-[5px] md:tracking-[8px] mt-2 font-['Outfit']">COLLEGE OF LAW</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

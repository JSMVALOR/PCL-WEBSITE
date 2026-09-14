/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PremiumFooter.module.css';

import CTASection from './CTASection';
import LinksSection from './LinksSection';
import BottomStrip from './BottomStrip';

gsap.registerPlugin(ScrollTrigger);

export default function PremiumFooter() {
  const footerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  // Handle Mouse Spotlight tracking
  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: `${x}px`, y: `${y}px` });
  };

  useEffect(() => {
    const el = footerRef.current;

    // Stagger Entrance Animation
    gsap.fromTo(
      el.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom', // Triggers when top of footer enters viewport
          toggleActions: 'play none none none'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <footer 
      className={styles.footerWrapper} 
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y
      }}
    >
      <div className={styles.container} ref={footerRef}>
        <CTASection />
        <LinksSection />
        <BottomStrip />
      </div>
    </footer>
  );
}

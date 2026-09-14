/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import Hero from './HERO/Hero';
import Philosophy from './PHILOSOPHY/Philosophy';
import Academics from './ACADEMICS/Academics';
import Advantages from './ADVANTAGES/Advantages';
import EventsPreview from './EVENTS/EventsPreview';
import HomeContact from './CONTACT/HomeContact';

const TOTAL_SLIDES = 6;

export default function Home({ isPreview = false }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isAnimating = useRef(false);
  const activeSlideRef = useRef(0);

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Prevent default scroll on body to stop trackpad momentum
    // (Only if not in CMS preview mode)
    if (!isPreview) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    let lastWheelTime = Date.now();

    const handleWheel = (e) => {
      // Allow horizontal wheel scrolling for carousels
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      if (!isPreview) e.preventDefault();
      
      const now = Date.now();
      
      if (isAnimating.current) {
        // CRITICAL: Update lastWheelTime even while animating so momentum doesn't trigger immediately after animation ends
        lastWheelTime = now;
        return;
      }
      
      // We must reset the timer if they are still scrolling to avoid momentum triggering a second jump
      if (now - lastWheelTime < 60) {
        lastWheelTime = now;
        return;
      }

      // Threshold for trackpad sensitivity
      if (Math.abs(e.deltaY) < 15) {
        lastWheelTime = now;
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSlide = Math.max(0, Math.min(activeSlideRef.current + direction, TOTAL_SLIDES - 1));

      if (nextSlide !== activeSlideRef.current) {
        isAnimating.current = true;
        lastWheelTime = now;
        setActiveSlide(nextSlide);
        
        // 1000ms lockout prevents rapid scrolling through multiple slides
        setTimeout(() => {
          isAnimating.current = false;
        }, 1000);
      } else {
        lastWheelTime = now;
      }
    };

    let touchStartY = 0;
    let touchStartX = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      const touchEndX = e.touches[0].clientX;

      if (isAnimating.current) {
        if (!isPreview) e.preventDefault();
        // Update touch start continuously so it resets the drag distance for when animation ends
        touchStartY = touchEndY;
        touchStartX = touchEndX;
        return;
      }
      
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;
      
      // If horizontal swipe is stronger than vertical, let browser handle it (e.g. carousels)
      if (Math.abs(diffX) > Math.abs(diffY)) {
        return;
      }

      // It's a vertical swipe, block native scroll
      if (!isPreview) e.preventDefault();
      
      if (Math.abs(diffY) > 40) {
        const direction = diffY > 0 ? 1 : -1;
        const nextSlide = Math.max(0, Math.min(activeSlideRef.current + direction, TOTAL_SLIDES - 1));
        
        if (nextSlide !== activeSlideRef.current) {
          isAnimating.current = true;
          touchStartY = touchEndY; // Reset for next interaction
          touchStartX = touchEndX;
          setActiveSlide(nextSlide);
          
          setTimeout(() => {
            isAnimating.current = false;
          }, 1000);
        } else {
          // Reset so they don't accumulate diffY while stuck at start/end
          touchStartY = touchEndY;
          touchStartX = touchEndX;
        }
      }
    };

    if (!isPreview) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (!isPreview) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPreview]);

  const scrollToSlide = (index) => {
    setActiveSlide(index);
    isAnimating.current = true;
    setTimeout(() => {
      isAnimating.current = false;
    }, 1000);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[var(--bg-color)] overflow-hidden">
       {/* Pagination */}
       <div className="hidden md:flex fixed right-2 lg:right-4 top-1/2 -translate-y-1/2 z-[99999] flex-col gap-3">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => scrollToSlide(i)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 shadow-sm ${activeSlide === i ? 'bg-[var(--primary-color)] scale-125' : 'bg-gray-400/40 hover:bg-[var(--primary-color)]/60'}`}
          />
        ))}
      </div>

      {/* Transform Track */}
      <div 
        className="w-full h-full transition-transform duration-[1000ms]"
        style={{ 
          transform: `translateY(-${activeSlide * 100}dvh)`,
          transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)' 
        }}
      >
        <Hero windowWidth={windowWidth} data-index="0" />
        <Philosophy data-index="1" />
        <Academics windowWidth={windowWidth} data-index="2" />
        <Advantages windowWidth={windowWidth} data-index="3" />
        <EventsPreview data-index="4" />
        <HomeContact data-index="5" />
      </div>
    </div>
  );
}

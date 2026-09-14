/* © 2026 JSM VALOR. All Rights Reserved. */
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
  const containerRef = useRef(null);
  const slidesRef = useRef([]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use IntersectionObserver to update activeSlide when scrolling naturally
  useEffect(() => {
    if (isPreview) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveSlide(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5, // Trigger when at least 50% of the slide is visible
      }
    );

    slidesRef.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [isPreview]);

  const scrollToSlide = (index) => {
    setActiveSlide(index);
    if (slidesRef.current[index]) {
      slidesRef.current[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 w-full h-full bg-[var(--bg-color)] ${!isPreview ? 'overflow-y-auto snap-y snap-mandatory scroll-smooth' : 'overflow-hidden'}`}
    >
       {/* Pagination */}
       <div className="hidden md:flex fixed right-2 lg:right-4 top-1/2 -translate-y-1/2 z-[99999] flex-col gap-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => scrollToSlide(i)}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-sm ${activeSlide === i ? 'bg-[var(--primary-color)] scale-125' : 'bg-gray-400/40 hover:bg-[var(--primary-color)]/60'}`}
          />
        ))}
      </div>

      {/* Track */}
      <div className="w-full flex flex-col">
        <div ref={el => slidesRef.current[0] = el} data-index="0" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <Hero windowWidth={windowWidth} />
        </div>
        <div ref={el => slidesRef.current[1] = el} data-index="1" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <Philosophy />
        </div>
        <div ref={el => slidesRef.current[2] = el} data-index="2" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <Academics windowWidth={windowWidth} />
        </div>
        <div ref={el => slidesRef.current[3] = el} data-index="3" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <Advantages windowWidth={windowWidth} />
        </div>
        <div ref={el => slidesRef.current[4] = el} data-index="4" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <EventsPreview />
        </div>
        <div ref={el => slidesRef.current[5] = el} data-index="5" className="w-full h-[100dvh] snap-start shrink-0 relative">
          <HomeContact />
        </div>
      </div>
    </div>
  );
}

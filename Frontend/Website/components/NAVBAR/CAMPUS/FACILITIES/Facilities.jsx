/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';

import styles from '../../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

// Eager load all images in ASSETS/CAMPUS
const imageImports = import.meta.glob('../../../../../Shared/Assets/CAMPUS/*.{webp,png,jpg,jpeg}', { eager: true, import: 'default' });

const getImage = (filename) => {
  if (!filename) return null;
  const match = Object.keys(imageImports).find(path => path.includes(filename));
  return match ? imageImports[match] : null;
};

function ModuleFigure({ iconName, tag, image }) {
  const IconComponent = Icons[iconName] || Icons.Building;
  
  return (
    <div className="relative w-full h-56 md:h-64 overflow-hidden rounded-t-2xl group border-b border-[var(--card-border)] bg-[#111]">
      <img loading="lazy" 
        src={image || 'https://via.placeholder.com/600x400'} 
        alt={tag}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/20 to-transparent opacity-80" />
      <span className="absolute top-4 right-5 font-mono text-[10px] tracking-widest text-[var(--primary-color)] uppercase z-10 bg-[var(--bg-color)]/70 px-3 py-1.5 rounded-full backdrop-blur-md border border-[var(--primary-color)]/30 font-bold shadow-lg">
        {tag}
      </span>
      <div className="absolute bottom-5 left-5 z-10">
        <div className="w-12 h-12 rounded-2xl border border-[var(--primary-color)]/40 flex items-center justify-center bg-[var(--bg-color)]/80 backdrop-blur-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-[0_0_20px_var(--primary-glow)]">
          <IconComponent className="w-5 h-5 text-[var(--primary-color)]" />
        </div>
      </div>
    </div>
  );
}

const STATIC_FACILITIES = [
  {
    categoryKey: "academic",
    title: "Academic Infrastructure",
    description: "Purpose-built environments designed to bridge the gap between theoretical jurisprudence and practical advocacy.",
    facilities: [
      {
        id: "moot-court",
        title: "Moot Court Halls",
        summary: "Experience real courtroom dynamics in our state-of-the-art moot courts designed to replicate High Court architecture.",
        icon: "Gavel",
        tag: "Advocacy",
        image: "moot1.png"
      },
      {
        id: "smart-classrooms",
        title: "Smart Classrooms",
        summary: "Digitally-enabled interactive lecture halls fostering collaborative legal education and dynamic discussions.",
        icon: "MonitorPlay",
        tag: "Learning",
        image: "pcl_classroom_1.webp"
      },
      {
        id: "seminar-hall",
        title: "Seminar Hall",
        summary: "A premium auditorium hosting national seminars, guest lectures by sitting judges, and grand collegiate events.",
        icon: "Mic2",
        tag: "Events",
        image: "PCL_CLASSROOM3.webp"
      }
    ]
  },
  {
    categoryKey: "research",
    title: "Research & Development",
    description: "Extensive resources empowering students to conduct in-depth legal research and community service.",
    facilities: [
      {
        id: "law-library",
        title: "Central Law Library",
        summary: "An expansive repository of legal journals, Supreme Court reports, and digital databases like Manupatra & SCC Online.",
        icon: "Library",
        tag: "Research",
        image: "pcl_library.webp"
      },
      {
        id: "legal-aid",
        title: "Legal Aid Clinic",
        summary: "A dedicated clinic where students engage in pro-bono community legal aid under expert faculty guidance.",
        icon: "Scale",
        tag: "Social Justice",
        image: "pcl_legal_clinic.webp"
      }
    ]
  },
  {
    categoryKey: "campus",
    title: "Campus & Lifestyle",
    description: "A serene and secure environment providing the perfect backdrop for rigorous academic pursuit.",
    facilities: [
      {
        id: "green-campus",
        title: "Lush Green Campus",
        summary: "A serene 4-acre green campus providing the perfect tranquil environment for rigorous study and contemplation.",
        icon: "TreePine",
        tag: "Environment",
        image: "pcl_outdoor.webp"
      },
      {
        id: "cafeteria",
        title: "Cafeteria & Lounge",
        summary: "Hygienic multi-cuisine cafeteria and dedicated wellness spaces for student relaxation and networking.",
        icon: "Coffee",
        tag: "Wellness",
        image: "PCL_LOBBY.webp"
      }
    ]
  }
];

function FacilityCarousel({ facilities }) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: clientWidth >= 768 ? 400 : 300, behavior: 'smooth' });
          }
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      const scrollAmount = clientWidth >= 768 ? 400 : 300;
      if (direction === 'start') {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: direction === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div 
      className="relative w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <div 
        ref={scrollRef}
        className="carousel-container flex overflow-x-auto gap-6 md:gap-8 pb-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.carousel-container::-webkit-scrollbar { display: none; }`}</style>
        {facilities.map((facility) => (
          <div key={facility.id} className="min-w-[85vw] sm:min-w-[350px] md:min-w-[400px] snap-start opacity-0 carousel-item shrink-0 h-full flex flex-col">
            <div className={`${styles.glassCard} flex-1 p-0 flex flex-col transition-all duration-500 hover:border-[var(--primary-color)]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 overflow-hidden`}>
              <ModuleFigure 
                iconName={facility.icon} 
                tag={facility.tag} 
                image={getImage(facility.image)} 
              />
              <div className="p-6 flex-1 flex flex-col bg-[var(--card-bg)]/40 relative z-20">
                <h3 className="text-xl md:text-2xl text-[var(--text-color)] font-bold mb-3 group-hover:text-[var(--primary-color)] transition-colors font-['Playfair_Display'] italic leading-snug">
                  {facility.title}
                </h3>
                <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed flex-1 mb-6">
                  {facility.summary}
                </p>
                <div className="mt-auto pt-4">
                  <Link to={`/campus/gallery`} className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-[var(--primary-color)]/30 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-black transition-all duration-300">
                    <span className="text-xs font-bold uppercase tracking-[0.15em]">
                      View Gallery
                    </span>
                    <Icons.ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
        <button onClick={() => scroll('start')} className="text-[var(--text-muted)] hover:text-[var(--primary-color)] text-xs md:text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 px-3 py-2 rounded-md active:bg-[var(--primary-color)]/10">
          <Icons.RotateCcw size={16} /> <span className="hidden sm:inline">Return to start</span>
        </button>
        <div className="flex gap-2 md:gap-3">
          <button onClick={() => scroll('prev')} aria-label="Previous" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors bg-[var(--card-bg)] active:bg-[var(--primary-color)]/20">
            <Icons.ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('next')} aria-label="Next" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--text-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors bg-[var(--card-bg)] active:bg-[var(--primary-color)]/20">
            <Icons.ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Facilities() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger animate category headers
      gsap.utils.toArray('.category-header').forEach((header) => {
        gsap.fromTo(header,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Stagger animate cards
      gsap.utils.toArray('.carousel-container').forEach((container) => {
        gsap.fromTo(container.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer} ref={containerRef}>
        <div className="text-center mb-24 relative z-10 mt-10 md:mt-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold"
          >
            World-Class Infrastructure
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight font-['Outfit']"
          >
            Where rigorous <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">legal theory</span><br className="hidden md:block" /> meets practice
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            From fully-equipped Moot Courts replicating High Court environments to an expansive digital Law Library. Discover the facilities shaping the next generation of legal luminaries.
          </motion.p>
        </div>

        {STATIC_FACILITIES.map((category) => (
          <div key={category.categoryKey} className="mb-24 last:mb-0 relative z-10">
            <div className="category-header mb-12 flex flex-col items-center md:items-start opacity-0">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4 font-['Outfit']">
                {category.title}
              </h2>
              <div className="h-[3px] w-20 mb-5 bg-gradient-to-r from-[var(--primary-color)] to-transparent rounded-full" />
              <p className="text-[var(--text-muted)] text-center md:text-left max-w-2xl text-base md:text-lg">{category.description}</p>
            </div>

            <FacilityCarousel facilities={category.facilities} />
          </div>
        ))}
      </div>
    </div>
  );
}

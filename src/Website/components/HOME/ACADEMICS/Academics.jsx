/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Carousel from './Carousel';
import classroomImg from '../../../../Shared/Assets/CAMPUS/pcl_classroom_1.webp';
import classroom2Img from '../../../../Shared/Assets/CAMPUS/pcl_classroom_2.webp';
import classroom3Img from '../../../../Shared/Assets/CAMPUS/pcl_classroom_3.webp';
import entranceImg from '../../../../Shared/Assets/CAMPUS/pcl_entrance.webp';
import outdoorImg from '../../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';
import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

const IMAGE_MAP = {
  'classroom1': classroomImg,
  'classroom2': classroom2Img,
  'classroom3': classroom3Img,
  'entrance': entranceImg,
  'outdoor': outdoorImg
};

const Academics = forwardRef(({ windowWidth, academicGridRef, ...props }, ref) => {
  const { content } = useSiteContent('/', 'academics_snippet');

  const heading = content?.heading || "Academic";
  
  const dynamicPrograms = [
    {
      id: 1,
      img: IMAGE_MAP[content?.prog1_img] || classroomImg,
      duration: content?.prog1_duration || '5-Year Integrated',
      title: content?.prog1_title || 'BA LL.B',
      focus: content?.prog1_focus || 'Honors',
      desc: content?.prog1_desc || 'A comprehensive program combining arts and law for a holistic understanding of the legal system and societal dynamics.',
      link: content?.prog1_link || '/programs/ba-llb'
    },
    {
      id: 2,
      img: IMAGE_MAP[content?.prog2_img] || classroom2Img,
      duration: content?.prog2_duration || '5-Year Corporate',
      title: content?.prog2_title || 'BBA LL.B',
      focus: content?.prog2_focus || 'Honors',
      desc: content?.prog2_desc || 'Designed for future corporate leaders, integrating advanced business administration principles with corporate law.',
      link: content?.prog2_link || '/programs/bba-llb'
    },
    {
      id: 3,
      img: IMAGE_MAP[content?.prog3_img] || classroom3Img,
      duration: content?.prog3_duration || '3-Year Graduate',
      title: content?.prog3_title || 'LL.B',
      focus: content?.prog3_focus || 'Standard',
      desc: content?.prog3_desc || 'Intensive, rigorous legal training tailored specifically for graduates seeking to enter the legal profession swiftly.',
      link: content?.prog3_link || '/programs/llb'
    }
  ];

  const headingVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="slide h-[100dvh] w-full relative flex flex-col items-center justify-center pt-[100px] md:pt-[120px] pb-[30px] md:pb-[40px] bg-[var(--bg-color)] overflow-hidden" ref={ref} {...props}>
      {/* Cinematic Ambient Backgrounds */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="container relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-between h-full">
        
        {/* TOP: Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headingVars}
          className="text-center mb-2 md:mb-4 z-20 shrink-0"
        >
          <span className="block text-[9px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-bold mb-2">Our Programs</span>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[var(--text-color)] leading-tight">
            {heading} <span className="italic font-medium text-[var(--primary-color)]">Excellence.</span>
          </h2>
          <div className="h-[2px] w-12 bg-[var(--primary-color)] mx-auto mt-6"></div>
        </motion.div>

        {/* MIDDLE: 3-Column Luxury Grid (or Carousel on mobile) */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full z-20">
          {windowWidth <= 900 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center w-full"
            >
              <Carousel
                ariaLabel="Academic programs"
                items={dynamicPrograms.map((p) => ({
                  id: p.id,
                  image: p.img,
                  degree: p.duration,
                  title: `${p.title} ${p.focus}`,
                  description: p.desc,
                  link: p.link,
                  customRender: () => (
                    <Link
                      to={p.link}
                      className="group relative w-full h-[280px] rounded-[20px] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)]/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] block flex flex-col"
                    >
                      {/* Top Image Half */}
                      <div className="relative h-[45%] w-full overflow-hidden shrink-0">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                          style={{ backgroundImage: `url(${p.img})` }}
                        ></div>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        
                        {/* Floating Badge */}
                        <div className="absolute top-3 left-3 bg-[var(--primary-color)] text-black text-[8px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow-md">
                          {p.duration}
                        </div>
                      </div>
                      
                      {/* Bottom Content Half */}
                      <div className="relative flex flex-col p-4 h-[55%] grow text-left">
                        <h3 className="text-xl font-bold leading-tight mb-2 text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors">
                          {p.title} <span className="italic font-medium">{p.focus}</span>
                        </h3>
                        
                        <p className="text-[var(--text-muted)] text-[11px] leading-relaxed text-justify mb-3 line-clamp-3">
                          {p.desc}
                        </p>
                        
                        <div className="mt-auto">
                        <div className="tlh-btn !py-2.5 px-6 w-fit">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-inherit flex items-center">
                            Explore Course
                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform duration-500" />
                          </span>
                        </div>
                      </div>
                      </div>
                    </Link>
                  )
                }))}
                baseWidth={windowWidth - 100}
                autoplay={false}
                loop={false}
                round={false}
              />
            </motion.div>
          ) : (
            <motion.div 
              ref={academicGridRef} 
              variants={containerVars}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "100px" }}
              className="grid grid-cols-3 gap-4 lg:gap-5 w-full h-[45vh] min-h-[350px] max-h-[450px]"
            >
              {dynamicPrograms.map((prog) => (
                <motion.div variants={itemVars} key={prog.id} className="h-full">
                  <Link
                    to={prog.link}
                    className="group relative w-full h-full rounded-[20px] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)]/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] block transform transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(255,191,0,0.1)] hover:border-[var(--primary-color)]/30 flex flex-col"
                  >
                    {/* Top Image Half */}
                    <div className="relative h-[45%] w-full overflow-hidden shrink-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
                        style={{ backgroundImage: `url(${prog.img})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                      
                      {/* Floating Badge */}
                      <div className="absolute top-3 left-3 bg-[var(--primary-color)] text-black text-[8px] font-extrabold uppercase tracking-[0.2em] px-2.5 py-1 rounded shadow-md">
                        {prog.duration}
                      </div>
                    </div>
                    
                    {/* Bottom Content Half */}
                    <div className="relative flex flex-col p-4 lg:p-5 h-[55%] grow">
                      <h3 className="text-xl lg:text-[24px] font-bold leading-tight mb-2 text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors">
                        {prog.title} <span className="italic font-medium">{prog.focus}</span>
                      </h3>
                      
                      <p className="text-[var(--text-muted)] text-[10px] lg:text-[11px] leading-relaxed text-justify mb-3 line-clamp-3">
                        {prog.desc}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="tlh-btn !py-2.5 px-6 w-fit">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-inherit flex items-center">
                            Explore Course
                            <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform duration-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* BOTTOM: Fixed CSS CTA Button */}
        <motion.div variants={itemVars} className="mt-1 md:mt-6 flex justify-center w-full relative z-10">
          <Link 
            to="/programs" 
            className="tlh-btn !py-3 md:!py-4 px-8 md:px-10 w-fit"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center">
              Explore Full Curriculum <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
});

Academics.displayName = 'Academics';
export default Academics;

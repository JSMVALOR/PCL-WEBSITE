/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { forwardRef } from 'react';
import { Briefcase, Gavel, Shield, Landmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../ACADEMICS/Carousel';
import BorderGlow from './BorderGlow';
import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

import ladyJusticeImg from '../../../../Shared/Assets/CAMPUS/pcl_justice.webp';
import classroom1 from '../../../../Shared/Assets/CAMPUS/pcl_classroom_1.webp';
import classroom2 from '../../../../Shared/Assets/CAMPUS/pcl_classroom_2.webp';
import classroom3 from '../../../../Shared/Assets/CAMPUS/pcl_classroom_3.webp';
import entrance from '../../../../Shared/Assets/CAMPUS/pcl_entrance.webp';
import outdoor from '../../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';

const IMAGE_MAP = {
  justice: ladyJusticeImg,
  classroom1: classroom1,
  classroom2: classroom2,
  classroom3: classroom3,
  entrance: entrance,
  outdoor: outdoor
};

const Advantages = forwardRef(({ windowWidth, ...props }, ref) => {
  const { content } = useSiteContent('/', 'advantages_snippet');
  const advContent = content || {};

  const {
    hero_img = 'justice',
    tagline = 'Why Prudentia',
    heading1 = 'The Prudentia',
    heading2 = 'Advantage.',
    btn_text = 'Explore All Facilities',
    btn_link = '/campus/facilities',
    
    card1_title = 'Industry Integration',
    card1_desc = 'Direct pipelines into elite law firms and judicial chambers for sustained courtroom exposure.',
    card1_link = '/campus/facilities/corporate-placements',
    
    card2_title = 'Practical Training',
    card2_desc = 'Rigorous moot court and ADR simulations built to mirror real courtroom stakes.',
    card2_link = '/campus/facilities/moot-court',
    
    card3_title = 'Legal Aid Clinic',
    card3_desc = 'An in-house clinic where students deliver real defense to underserved communities.',
    card3_link = '/campus/facilities/legal-aid-clinic',
    
    card4_title = 'Integrated Civil Services',
    card4_desc = 'A dedicated partnership with Sharat Chandra Academy, shaping future judicial officers.',
    card4_link = '/campus/facilities/integrated-coaching'
  } = advContent;

  const bgImage = IMAGE_MAP[hero_img] || ladyJusticeImg;

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.25 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const advantages = [
    {
      id: 'adv-1',
      icon: <Briefcase size={20} />,
      title: card1_title,
      desc: card1_desc,
      link: card1_link
    },
    {
      id: 'adv-2',
      icon: <Gavel size={20} />,
      title: card2_title,
      desc: card2_desc,
      link: card2_link
    },
    {
      id: 'adv-3',
      icon: <Shield size={20} />,
      title: card3_title,
      desc: card3_desc,
      link: card3_link
    },
    {
      id: 'adv-4',
      icon: <Landmark size={20} />,
      title: card4_title,
      desc: card4_desc,
      link: card4_link
    }
  ];

  const clampStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden' };

  const AdvantageCard = ({ item }) => (
    <Link to={item.link} className="block group h-full">
      <BorderGlow
        className="h-full"
        backgroundColor="transparent"
        borderRadius={18}
        glowColor="42 55% 58%"
        glowIntensity={0.85}
        edgeSensitivity={35}
        coneSpread={22}
        fillOpacity={0}
        colors={['#D4AF37', '#B8925A', '#8B6914']}
      >
        <div className="p-5 md:p-6 h-full min-h-[220px] md:min-h-full flex flex-col bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[18px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[var(--card-bg)] text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/30 group-hover:bg-[var(--primary-color)] group-hover:text-black dark:group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-[0_0_15px_var(--primary-glow)]">
              {item.icon}
            </div>
            <h4
              className="text-[17px] md:text-lg font-bold text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors leading-snug"
             
            >
              {item.title}
            </h4>
          </div>
          <p className="text-[13px] md:text-[14px] text-[var(--text-muted)] leading-relaxed text-justify" style={clampStyle}>
            {item.desc}
          </p>
        </div>
      </BorderGlow>
    </Link>
  );

  return (
    <section className="slide w-full relative flex flex-col items-center justify-center pt-[100px] md:pt-[120px] pb-4 md:pb-6" ref={ref} {...props}>
      <div className="container w-full max-w-[1300px] mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12 px-4 md:px-0">

        {/* Left Side: Visual */}
        <div className="w-full md:w-1/2 h-[35vh] md:h-[65vh] max-h-[650px] relative overflow-hidden rounded-3xl shadow-2xl shrink-0">
          <motion.div
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-[center_top] origin-[center_top]"
            style={{ backgroundImage: `url(${bgImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 to-black/10"></div>

            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 z-10">
              <span className="uppercase tracking-[0.25em] text-[10px] md:text-xs text-[var(--primary-color)]/80 font-semibold mb-3">
                {tagline}
              </span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-3xl md:text-[2.75rem] font-bold mb-2 text-white"
               
              >
                {heading1}
                <br />
                <span className="text-[var(--primary-color)] drop-shadow-[0_0_18px_var(--primary-glow)]">{heading2}</span>
              </motion.h2>
              <div className="h-px w-14 bg-[var(--primary-color)]/60 my-4"></div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                <Link
                  to={btn_link}
                  className="tlh-btn !py-4 px-10 w-fit"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-inherit flex items-center">
                    {btn_text} <ArrowRight size={16} className="ml-2" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Grid of Advantages */}
        <div className="w-full md:w-1/2 flex items-center justify-center z-10">
          {windowWidth <= 768 ? (
            <div className="w-full flex justify-center">
              <Carousel
                items={advantages.map(adv => ({
                  id: adv.id,
                  customRender: () => <AdvantageCard item={adv} />
                }))}
                baseWidth={windowWidth - 80}
                autoplay={false}
                loop={false}
              />
            </div>
          ) : (
            <motion.div
              variants={containerVars}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 gap-4 md:gap-6 w-full"
            >
              {advantages.map((adv) => (
                <motion.div key={adv.id} variants={itemVars} className="h-full">
                  <AdvantageCard item={adv} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
});

Advantages.displayName = 'Advantages';
export default Advantages;

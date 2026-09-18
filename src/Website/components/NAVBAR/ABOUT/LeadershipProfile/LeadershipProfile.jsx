/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../Navbar.jsx';
import PixelCard from './PixelCard.jsx';
import founderImg from "../../../../../Shared/Assets/PEOPLE/pcl_founder.png";
import coFounderImg from "../../../../../Shared/Assets/PEOPLE/pcl_cofounder.png";
import { useSiteContent } from '../../../../../Shared/lib/hooks/useSiteContent';

const fallbackProfiles = {
  founder: {
    id: 'founder',
    name: 'Dr. Sneha Mula',
    title: 'Founder & Chairman – Prudentia College of Law',
    eyebrow: "Founder's Vision",
    image: founderImg,
    bio: [
      "Education is not merely the transfer of knowledge; it is the power to transform lives, communities, and society. Guided by this belief, Dr. Sneha Mula, Founder and Chairman of Prudentia College of Law, envisioned an institution that nurtures not only legal professionals but socially conscious leaders committed to justice.",
      "A distinguished legal academic, researcher, and advocate, Dr. Mula brings together the rare blend of courtroom experience, academic excellence, and visionary leadership. She completed her B.B.A., LL.B. (Hons.) as a Batch Topper, secured Rank I in LL.M., and qualified UGC-NET and KSET. Her doctoral research focuses on the transformative impact of Artificial Intelligence and Law, reflecting her commitment to preparing legal education for the future. Her academic journey and scholarship span areas including cyber law, privacy, competition law, constitutional values, and emerging technologies. Over the years, Dr. Mula has served in prestigious institutions across India, including leadership roles as Dean, Head of Department, academic coordinator, mentor, and legal educator. She has trained aspiring lawyers, guided research, introduced academic reforms, organized national competitions, and championed legal awareness and student welfare.",
      "The inspiration behind Prudentia College of Law is deeply personal and purpose-driven. Rooted in values of education, opportunity, and social responsibility, Dr. Mula envisioned a law college that bridges theory with practice and builds lawyers who combine professional competence with ethics and compassion. Inspired by a lifelong passion for teaching and a commitment to making quality legal education accessible, she sought to create an institution where talent is encouraged, voices are heard, and justice becomes a lived value rather than merely a subject of study. Under her leadership, Prudentia College of Law aspires to become a centre of academic excellence, innovation, advocacy, and public service empowering students to uphold the rule of law and contribute meaningfully to society."
    ],
    quote: "Law is not merely a profession, it is a responsibility to protect rights, pursue truth, and shape a more just future. Prudentia College of Law was founded not only to teach law but to inspire fearless minds who will question, lead, and leave a mark on society.",
    quoteAuthor: "Dr. Sneha Mula"
  },
  'co-founder': {
    id: 'co-founder',
    name: 'Mr. Bharat Krishna Buddala',
    title: 'Co-Founder & Managing Director',
    eyebrow: "Co-Founder's Vision",
    image: coFounderImg,
    bio: [
      "Mr. Bharat Krishna Buddala is a dynamic education visionary and entrepreneur whose journey reflects determination, global learning, and a deep commitment to empowering young minds. Having completed his MBA from Melbourne, Australia, he gained valuable international exposure, leadership skills, and a broader understanding of how education can transform lives and societies.",
      "While studying and observing educational systems abroad, Mr. Bharat Krishna developed a strong belief that quality education should not be a privilege reserved for a few, but an opportunity accessible to all deserving students. His experiences inspired him to think beyond professional success and focus on creating a meaningful social impact through education. The inspiration to establish Prudentia College of Law emerged from his conviction that law is not merely a profession but a powerful instrument for justice, leadership, and social change. He envisioned a law college that would nurture students into ethical professionals, confident advocates, and responsible citizens capable of making a difference in society.",
      "Mr. Bharat Krishna believes that every student carries untapped potential waiting to be discovered. His vision for Prudentia College of Law is rooted in creating an environment where students are encouraged to dream fearlessly, think critically, and pursue excellence with integrity and compassion. Through Prudentia College of Law, he aspires to build not merely graduates, but future leaders who will uphold justice and contribute meaningfully to society."
    ],
    quote: "Education creates opportunity, and law gives that opportunity a voice. Our mission is to empower students to become both successful professionals and responsible changemakers.",
    quoteAuthor: "Mr. Bharat Krishna Buddala"
  }
};

export default function LeadershipProfile({ overrideId }) {
  const { id: paramId } = useParams();
  const id = overrideId || paramId;
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { content } = useSiteContent(`/about/leadership/${id}`, 'profile');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Merge CMS data with fallback data
  let profile = fallbackProfiles[id];
  
  if (content) {
    const cmsProfile = content;
    
    // Parse bio properly whether it's an array or a newline-separated string
    if (!profile) return <NotFound404 />;
    let parsedBio = profile.bio;
    if (Array.isArray(cmsProfile.bio)) {
      parsedBio = cmsProfile.bio;
    } else if (typeof cmsProfile.bio === 'string') {
      parsedBio = cmsProfile.bio.split('\n\n').filter(p => p.trim() !== '');
    }

    profile = {
      ...profile,
      name: cmsProfile.name || profile.name,
      title: cmsProfile.title || profile.title,
      eyebrow: cmsProfile.eyebrow || profile.eyebrow,
      image: cmsProfile.image || profile.image,
      bio: parsedBio,
      quote: cmsProfile.quote || profile.quote,
      quoteAuthor: cmsProfile.quoteAuthor || profile.quoteAuthor
    };
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg text-brand-text">
        <h2>Profile not found.</h2>
      </div>
    );
  }

  const fadeUp = (delay = 0) =>
    shouldReduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: 'easeOut' }
        };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-[var(--primary-color)] selection:text-black">
      <Navbar />

      {/* Dynamic Background Pattern */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[var(--primary-glow)] blur-[150px] rounded-full pointer-events-none z-0 transition-colors duration-300 opacity-50" />
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(var(--card-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="relative z-10 pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-brand-muted hover:text-[var(--primary-color)] transition-colors mb-14 uppercase tracking-widest text-xs font-semibold"
        >
          <div className="p-2 rounded-full border border-brand-border group-hover:border-[var(--primary-color)] transition-colors">
            <ArrowLeft size={15} />
          </div>
          Back to Leadership
        </button>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* Left: Sticky Portrait */}
          <div className="w-full lg:w-5/12 shrink-0 lg:sticky lg:top-32 relative">
            <motion.div
              {...fadeUp(0)}
              className="relative rounded-[28px] overflow-hidden aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 shadow-2xl group border border-[var(--card-border)]"
            >
              <PixelCard
                className="absolute inset-0"
                colors="#F5E6B8,#D4AF37,#8B6914"
                gap={10}
                speed={16}
              >
                <img loading="lazy"
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
              </PixelCard>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90 transition-opacity duration-700 group-hover:opacity-100" />

              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col justify-end h-full pointer-events-none">
                <div className="w-12 h-[2px] bg-[var(--primary-color)] mb-6"></div>
                <h1
                  className="text-4xl md:text-5xl text-white font-bold mb-3 leading-tight"
                 
                >
                  {profile.name}
                </h1>
                <p className="text-[var(--primary-color)] uppercase tracking-widest text-xs md:text-sm font-bold">
                  {profile.title}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-7/12">
            <motion.div {...fadeUp(0.15)} className="flex flex-col gap-10">

              <div>
                <span className="block uppercase tracking-[0.25em] text-xs text-[var(--primary-color)] font-semibold mb-4">
                  {profile.eyebrow}
                </span>
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Leadership &amp; <span className="text-[var(--primary-color)] italic font-medium pr-2">Vision.</span>
                </h2>
              </div>

              <div className="space-y-8 text-brand-muted text-lg leading-[1.8] font-light">
                {profile.bio.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    {...fadeUp(0.3 + index * 0.1)}
                    className={
                      index === 0
                        ? "text-justify first-letter:text-6xl first-letter:font-bold first-letter:text-[var(--primary-color)] first-letter:mr-3 first-letter:float-left first-letter:font-serif first-letter:drop-shadow-md first-letter:leading-[0.8] first-letter:mt-2"
                        : "text-justify"
                    }
                  >
                    {paragraph}
                  </motion.p>
                ))}

                {profile.quote && (
                  <motion.div
                    {...fadeUp(0.7)}
                    className="mt-16 p-10 md:p-12 rounded-[32px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(255,191,0,0.15)] transition-all duration-500 hover:-translate-y-1 backdrop-blur-xl"
                  >
                    <div className="h-[2px] w-12 bg-[var(--primary-color)] mb-8 transition-all duration-500 group-hover:w-16"></div>
                    <div
                      className="absolute -top-4 -left-2 text-[var(--text-color)] opacity-[0.03] text-8xl md:text-[140px] font-serif leading-none select-none pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-[var(--primary-color)] group-hover:opacity-[0.05]"
                      aria-hidden="true"
                    >
                      &ldquo;
                    </div>
                    <div className="relative z-10">
                      <p
                        className="text-brand-text text-2xl md:text-3xl font-medium italic leading-relaxed"
                       
                      >
                        &ldquo;{profile.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-4 mt-8 justify-end">
                        <div className="w-8 h-[1px] bg-[var(--primary-color)]"></div>
                        <p className="text-[var(--primary-color)] font-bold text-sm tracking-widest uppercase">
                          {profile.quoteAuthor}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

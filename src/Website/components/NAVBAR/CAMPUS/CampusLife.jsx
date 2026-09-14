import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../../SEO/SEO';

const modules = [
  { title: "Facilities", desc: "Explore our state-of-the-art infrastructure.", link: "/campus/facilities", icon: "fa-building" },
  { title: "Moot Court", desc: "Experience our advanced simulation courts.", link: "/campus/moot-court", icon: "fa-gavel" },
  { title: "Legal Aid", desc: "Serving the community through law.", link: "/campus/legal-aid", icon: "fa-handshake" },
  { title: "Library", desc: "Access thousands of legal resources.", link: "/campus/library", icon: "fa-book" },
  { title: "Gallery", desc: "View campus life through our lens.", link: "/campus/gallery", icon: "fa-images" }
];

export default function CampusLife() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-bg text-brand-text">
      <SEO title="Campus Life" description="Experience the vibrant campus life at Prudentia College of Law." />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Campus Life</h1>
          <p className="text-brand-muted text-lg max-w-3xl mb-16 leading-relaxed">
            Life at Prudentia extends beyond classrooms. Our vibrant campus fosters a community of thinkers, advocates, and leaders. Discover world-class amenities designed to enrich your academic and social journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Link to={mod.link} className="block group">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#FFBF00]/50 hover:bg-white/10 transition-all h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className={`fa-solid ${mod.icon} text-6xl text-[#FFBF00]`}></i>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#FFBF00]/10 text-[#FFBF00] flex items-center justify-center mb-6">
                      <i className={`fa-solid ${mod.icon} text-lg`}></i>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                    <p className="text-brand-muted">{mod.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

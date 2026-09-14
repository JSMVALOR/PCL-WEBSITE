import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../../SEO/SEO';

const features = [
  { icon: "fa-scale-balanced", title: "Expert Faculty", desc: "Learn directly from retired judges and senior advocates." },
  { icon: "fa-book-open", title: "Comprehensive Material", desc: "Updated study materials aligning with latest syllabi." },
  { icon: "fa-pen-to-square", title: "Mock Tests", desc: "Regular mock tests simulating real examination environments." }
];

export default function JudiciaryPrep() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-bg text-brand-text">
      <SEO title="Judiciary Preparation" description="Specialized coaching for judicial services examinations at Prudentia College of Law." />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Judiciary Preparation</h1>
          <p className="text-brand-muted text-lg max-w-3xl mb-16 leading-relaxed">
            Prudentia College of Law offers an integrated, intensive coaching module for Judicial Services Examinations. Our specialized program prepares aspirants for both Preliminary and Mains examinations, including interview guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <i className={`fa-solid ${feat.icon} text-xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-brand-muted">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

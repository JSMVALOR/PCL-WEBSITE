import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../../SEO/SEO';

const members = [
  { name: "Hon'ble Justice A. K. Sikri", role: "Chief Patron", desc: "Former Judge, Supreme Court of India." },
  { name: "Prof. Dr. V. Vijayakumar", role: "Chairman", desc: "Vice Chancellor, NLIU Bhopal." },
  { name: "Mr. R. Venkataramani", role: "Member", desc: "Attorney General for India." }
];

export default function GoverningBody() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-brand-bg text-brand-text">
      <SEO title="Governing Body" description="Meet the esteemed Governing Body of Prudentia College of Law." />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Governing Body</h1>
          <p className="text-brand-muted text-lg max-w-3xl mb-16 leading-relaxed">
            Our Governing Body comprises eminent jurists, legal luminaries, and academicians who provide strategic direction and vision to Prudentia College of Law, ensuring the highest standards of legal education.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#FFBF00]/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFBF00]/10 border border-[#FFBF00]/30 flex items-center justify-center text-[#FFBF00] mb-6">
                <i className="fa-solid fa-gavel text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
              <p className="text-[#FFBF00] font-semibold text-sm uppercase tracking-wider mb-4">{member.role}</p>
              <p className="text-brand-muted leading-relaxed">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

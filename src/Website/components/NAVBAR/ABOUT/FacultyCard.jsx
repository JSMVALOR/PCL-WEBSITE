import React from 'react';
import { motion } from 'framer-motion';

export default function FacultyCard({ faculty, onClick }) {
  const fProfile = faculty.faculty_profiles || {};
  const image = fProfile.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  const designation = fProfile.designation || faculty.department || 'Faculty Member';
  
  return (
    <motion.div 
      whileHover="hover"
      onClick={onClick}
      className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm cursor-pointer group bg-black flex flex-col justify-end"
    >
      {/* Background Image */}
      <img 
        decoding="async" 
        loading="lazy" 
        src={image} 
        alt={faculty.full_name} 
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale opacity-80 group-hover:grayscale-0"
      />
      
      {/* Text Container */}
      <div className="relative z-10 w-full bg-[#1e1e1e]/95 border-t-[3px] border-[var(--primary-color)] p-5 md:p-6 overflow-hidden mt-auto">
        
        {/* The Green Fill (expands on hover only inside the text container) */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-[var(--primary-color)] z-0 origin-bottom"
          initial={{ height: "0%" }}
          variants={{
            hover: { height: "100%" }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        ></motion.div>

        {/* Content */}
        <div className="relative z-10 flex justify-between items-end">
          <div className="flex-1 pr-4">
            <h3 className="text-xl md:text-2xl font-bold text-white font-serif mb-1 group-hover:text-black transition-colors duration-300">
              {faculty.full_name}
            </h3>
            <p className="text-xs md:text-sm font-medium text-[var(--text-muted)] group-hover:text-black/80 transition-colors duration-300 uppercase tracking-widest">
              {designation}
            </p>
          </div>
          
          {/* Arrow */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-black/40 group-hover:bg-black group-hover:border-transparent transition-all rounded-sm border border-white/10">
            <i className="fa-solid fa-arrow-right text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

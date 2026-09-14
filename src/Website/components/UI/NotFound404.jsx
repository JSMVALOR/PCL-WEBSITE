import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import img1 from '../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import img2 from '../../../Shared/Assets/CAMPUS/pcl_library.webp';
import img3 from '../../../Shared/Assets/CAMPUS/pcl_justice.webp';
import img4 from '../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';

const images = [img1, img2, img3, img4];

export default function NotFound404() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-center items-center"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* Floating Images (Parallax effect tracking mouse) */}
      <motion.div 
        animate={{ x: mousePosition.x * -40, y: mousePosition.y * -40 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
      >
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          src={images[0]} 
          alt="Campus" 
          className="absolute top-[10%] left-[10%] w-[300px] h-[400px] object-cover grayscale opacity-60 rounded-sm"
        />
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          src={images[1]} 
          alt="Library" 
          className="absolute bottom-[10%] right-[10%] w-[350px] h-[250px] object-cover grayscale opacity-60 rounded-sm"
        />
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          src={images[2]} 
          alt="Justice" 
          className="absolute top-[20%] right-[20%] w-[200px] h-[250px] object-cover grayscale opacity-40 rounded-sm"
        />
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          src={images[3]} 
          alt="Outdoor" 
          className="absolute bottom-[20%] left-[20%] w-[250px] h-[300px] object-cover grayscale opacity-40 rounded-sm"
        />
      </motion.div>

      {/* Main 404 Text */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          className="flex items-center justify-center overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[25vw] leading-none font-bold text-[#E5E5E5] tracking-tighter m-0 p-0 mix-blend-difference selection:bg-transparent">
            404
          </h1>
        </motion.div>

        <motion.p 
          className="text-[#A3A3A3] text-lg md:text-xl uppercase tracking-[0.3em] mt-4 font-light mix-blend-difference"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Page Not Found
        </motion.p>
      </div>

      {/* Back to Home Button */}
      <motion.div 
        className="absolute bottom-12 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <Link 
          to="/" 
          className="text-[#E5E5E5] uppercase text-xs tracking-[0.2em] font-medium pb-2 border-b border-[#E5E5E5]/30 hover:border-[#E5E5E5] transition-colors duration-300 pointer-events-auto"
        >
          Return to Reality
        </Link>
      </motion.div>
    </div>
  );
}

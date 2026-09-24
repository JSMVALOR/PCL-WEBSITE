/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../Navbar.jsx';
import styles from '../../PROGRAMS/Programs.module.css';

import Masonry from '../../../UI/Masonry/Masonry.jsx';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

// Import all campus images
import imgClassroom1 from '../../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM.webp';
import imgClassroom2 from '../../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM2.webp';
import imgClassroom3 from '../../../../../Shared/Assets/CAMPUS/PCL_CLASSROOM3.webp';
import imgLegalAid from '../../../../../Shared/Assets/CAMPUS/PCL_LEGAL_AID_CELL.webp';
import imgLibrary from '../../../../../Shared/Assets/CAMPUS/pcl_library.webp';
import imgLobby from '../../../../../Shared/Assets/CAMPUS/PCL_LOBBY.webp';
import imgOutside from '../../../../../Shared/Assets/CAMPUS/PCL_OUTSIDE.webp';
import imgCampus from '../../../../../Shared/Assets/CAMPUS/PCL_CAMPUS.webp';
import imgMoot1 from '../../../../../Shared/Assets/CAMPUS/moot1.png';
import imgMoot2 from '../../../../../Shared/Assets/CAMPUS/moot2.png';
import imgJustice from '../../../../../Shared/Assets/CAMPUS/pcl_justice.webp';

const masonryItems = [
  { id: "1", img: imgCampus, url: "", height: 500 },
  { id: "2", img: imgLibrary, url: "", height: 700 },
  { id: "3", img: imgMoot1, url: "", height: 600 },
  { id: "4", img: imgLobby, url: "", height: 550 },
  { id: "5", img: imgClassroom1, url: "", height: 400 },
  { id: "6", img: imgLegalAid, url: "", height: 450 },
  { id: "7", img: imgJustice, url: "", height: 600 },
  { id: "8", img: imgMoot2, url: "", height: 500 },
  { id: "9", img: imgOutside, url: "", height: 650 },
  { id: "10", img: imgClassroom2, url: "", height: 450 },
  { id: "11", img: imgClassroom3, url: "", height: 550 }
];

export default function Gallery() {
    const [viewMode, setViewMode] = useState('masonry'); // 'masonry', 'virtual-tour'
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [dbImages, setDbImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          const formatted = data.map((item, index) => ({
            id: item.id,
            img: item.image_url,
            url: "",
            height: index % 2 === 0 ? 550 : 400 // Consistent alternating heights
          }));
          setDbImages(formatted);
        }
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <>
      {!selectedImage && <Navbar />}
      <div className={styles.pageWrapper} style={{ paddingTop: '80px' }}>
        <div className={styles.ambientBackground} />
        <div className={styles.auroraGlow} />

        <div className={`${styles.contentContainer} pt-12 md:pt-20`}>
          {/* Header */}
          <div className="text-center mb-16 relative z-10">
            <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold block">
              Campus Experience
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight font-['Outfit']">
              The Prudentia <span className="font-['Playfair_Display'] italic text-[var(--primary-color)] pr-2">Gallery</span>
            </h1>
            
            {/* View Mode Toggle */}
            <div className="inline-flex mt-6 bg-[var(--card-bg)] rounded-full p-1.5 backdrop-blur-xl border border-[var(--card-border)] shadow-lg">
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${viewMode === 'masonry' ? 'bg-[var(--text-color)] text-[var(--bg-color)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}
              >
                Photo Grid
              </button>
              <button
                onClick={() => setViewMode('virtual-tour')}
                className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${viewMode === 'virtual-tour' ? 'bg-[var(--text-color)] text-[var(--bg-color)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}
              >
                3D Virtual Tour
              </button>
            </div>
          </div>

          {/* MASONRY VIEW */}
          {viewMode === 'masonry' && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -40 }}
              className="relative z-10 w-full min-h-[800px]"
            >
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Masonry 
                  items={(dbImages.length > 0 ? dbImages : masonryItems).map(item => ({ ...item, onImageClick: (i) => setSelectedImage(i.img) }))} 
                  colorShiftOnHover={true}
                />
              )}
            </motion.div>
          )}

          {/* VIRTUAL TOUR VIEW */}
          {viewMode === 'virtual-tour' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative z-10 w-full h-[700px] md:h-[800px] mb-20"
            >
              <div className={`${styles.glassCard} w-full h-full p-2 relative overflow-hidden transition-all duration-500 border border-[var(--primary-color)]/30 shadow-[0_30px_60px_rgba(0,0,0,0.4)]`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary-color)]/5 to-transparent pointer-events-none" />
                <div className="w-full h-full rounded-[24px] overflow-hidden bg-[#000]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!4v1784449983374!6m8!1m7!1sCAoSHENJQUJJaEFlUWZ6RE13aUpvZzJkOElOMG10UWE.!2m2!1d17.29366017366905!2d78.56555981388078!3f20!4f0!5f0.7820865974627469" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          )}

          {/* LIGHTBOX */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000]/95 p-4 md:p-10 cursor-zoom-out backdrop-blur-md"
              >
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={selectedImage}
                  alt="Enlarged Campus View"
                  className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] object-contain border border-[var(--card-border)]"
                  onClick={(e) => e.stopPropagation()} 
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 text-[var(--text-color)] bg-[var(--card-bg)] hover:bg-[var(--primary-color)] hover:text-[#000] p-4 rounded-full transition-colors border border-[var(--card-border)] shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}

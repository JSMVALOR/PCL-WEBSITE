/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';

import styles from '../../PROGRAMS/Programs.module.css';

// Eager load all images in ASSETS/CAMPUS
const imageImports = import.meta.glob('../../../../../Shared/Assets/CAMPUS/*.{webp,png,jpg,jpeg}', { eager: true, import: 'default' });

const getImage = (filename) => {
  if (!filename) return null;
  const match = Object.keys(imageImports).find(path => path.includes(filename));
  return match ? imageImports[match] : null;
};

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFacility() {
      try {
        const { data, error } = await supabase
          .from('campus_facilities')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setFacility(data);
      } catch (err) {
        console.error("Error fetching facility details:", err);
        setError("Facility not found or network error.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchFacility();
  }, [id]);

  if (loading) {
    return (
      <div className={`${styles.pageWrapper} min-h-screen flex flex-col items-center justify-center`}>
        <div className={styles.ambientBackground} />
        <Loader2 className="w-12 h-12 text-[var(--primary-color)] animate-spin mb-4" />
        <p className="text-[var(--text-muted)] tracking-widest uppercase text-sm font-bold relative z-10">Loading Details...</p>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className={`${styles.pageWrapper} min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)]`}>
        <div className={styles.ambientBackground} />
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 relative z-10" />
        <h2 className="text-4xl mb-4 font-bold relative z-10">Facility not found</h2>
        <button
          onClick={() => navigate('/campus/facilities')}
          className="relative z-10 hover:underline uppercase tracking-widest text-sm text-[var(--primary-color)] font-bold mt-4"
        >
          Return to Campus Facilities
        </button>
      </div>
    );
  }

  const IconComponent = Icons[facility.icon] || Icons.Building;
  const imageSrc = getImage(facility.image);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={`${styles.contentContainer} max-w-5xl`}>
        <Link
          to="/campus/facilities"
          className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-sm font-bold relative z-10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Facilities
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`${styles.glassCard} p-0 overflow-hidden relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[var(--card-border)] rounded-3xl`}
        >
          {/* Hero */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] border-b border-[var(--card-border)] overflow-hidden">
            {imageSrc ? (
              <>
                <img decoding="async" loading="lazy" src={imageSrc} alt={facility.title} className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/60 to-transparent opacity-90" />
              </>
            ) : (
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--primary-color) 1px, transparent 1px), linear-gradient(90deg, var(--primary-color) 1px, transparent 1px)',
                  backgroundSize: '32px 32px' }}
                aria-hidden="true"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(400px 300px at 50% 50%, var(--primary-glow), transparent 70%)' }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-16 z-10">
              <div
                className="w-20 h-20 rounded-3xl border border-[var(--primary-color)]/40 flex items-center justify-center bg-[var(--bg-color)]/80 backdrop-blur-xl mb-8 shadow-[0_0_40px_var(--primary-glow)]"
              >
                <IconComponent className="w-10 h-10 text-[var(--primary-color)]" />
              </div>
              <span
                className="uppercase tracking-widest text-xs font-bold mb-5 font-mono text-[var(--primary-color)] bg-[var(--bg-color)]/50 px-4 py-2 rounded-full backdrop-blur-md border border-[var(--primary-color)]/30"
              >
                {facility.category_title}
              </span>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] drop-shadow-2xl max-w-4xl leading-tight"
               
              >
                {facility.title}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-14 lg:p-20 bg-[var(--card-bg)]/30">
            <div className="prose prose-invert prose-lg md:prose-xl max-w-4xl mx-auto">
              <p className="text-[var(--text-color)] leading-loose font-light font-['Outfit'] opacity-90 text-center">
                {facility.content}
              </p>
            </div>

            <div className="mt-20 pt-10 border-t border-[var(--card-border)] flex flex-col md:flex-row gap-6 justify-between items-center max-w-4xl mx-auto">
              <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest uppercase">Experience the campus infrastructure in person.</p>
              <Link
                to="/campus/gallery"
                className={styles.magneticBtn}
                style={{ maxWidth: '280px', margin: '0' }}
              >
                Campus Gallery
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

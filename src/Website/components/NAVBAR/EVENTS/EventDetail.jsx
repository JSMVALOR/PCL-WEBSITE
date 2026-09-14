/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import fallbackImg from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';
import styles from '../PROGRAMS/Programs.module.css';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let query = supabase.from('admin_events').select('*').eq('is_public', true);
      
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', id);
      }

      const { data, error } = await query.single();
      
      if (data) {
        setEvent(data);
      } else {
        const { data: fallbackData } = await supabase.from('admin_events').select('*').eq('id', id).eq('is_public', true).single();
        if (fallbackData) setEvent(fallbackData);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className={`${styles.pageWrapper} flex justify-center items-center`}>
        <div className={styles.ambientBackground} />
        <div className="w-12 h-12 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin relative z-10"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`${styles.pageWrapper} flex flex-col items-center justify-center text-center px-6`}>
        <div className={styles.ambientBackground} />
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--text-color)] relative z-10">Event Not Found</h2>
        <Link to="/events" className="relative z-10 text-[var(--primary-color)] font-bold uppercase tracking-widest text-sm hover:underline transition-all">
          Return to All Events
        </Link>
      </div>
    );
  }

  const evtDate = new Date(event.event_date);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={`${styles.contentContainer} max-w-5xl`}>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-8 md:mb-12 uppercase tracking-widest text-xs font-bold relative z-10"
        >
          <ArrowLeft size={16} /> BACK TO EVENTS
        </Link>

        {/* Cinematic Header Image */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full aspect-[16/9] md:aspect-[3/1] rounded-[32px] overflow-hidden relative border border-[var(--card-border)] mb-12 md:mb-16 shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-10 flex items-center justify-center bg-[var(--card-bg)]"
        >
          {event.image_url ? (
            <img decoding="async" loading="lazy" 
              src={event.image_url} 
              alt={event.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-1/3 h-1/3 md:w-1/4 md:h-1/4 opacity-[0.15]"
              style={{
                backgroundColor: 'var(--primary-color)',
                WebkitMaskImage: `url(${fallbackImg})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url(${fallbackImg})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center'
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/40 to-transparent opacity-90" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="flex gap-4 mb-4">
              {event.category && (
                <span className="bg-[var(--primary-color)] text-black px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                  {event.category}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[var(--text-color)] leading-tight">
              {event.title}
            </h1>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-2/3"
          >
            <h3 className="text-[var(--primary-color)] text-lg font-bold uppercase tracking-widest mb-6 border-b border-[var(--card-border)] pb-4">
              About the Event
            </h3>
            <div className="prose prose-invert prose-lg max-w-none text-[var(--text-muted)] leading-relaxed">
              {(event.description || '').split('\n').map((para, i) => (
                <p key={i} className="mb-6">{para}</p>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-1/3"
          >
            <div className={`${styles.glassCard} p-6 md:p-8 border border-[var(--card-border)] sticky top-32`}>
              <h3 className="text-[var(--text-color)] text-xl font-bold mb-8">Event Details</h3>
              
              <div className="flex flex-col gap-6 md:gap-8 text-[var(--text-muted)] font-medium">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0 border border-[var(--primary-color)]/20 shadow-[0_0_15px_var(--primary-glow)]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] opacity-70 font-bold mb-1">Date</span>
                    <span className="text-[var(--text-color)] text-base md:text-lg">{evtDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0 border border-[var(--primary-color)]/20 shadow-[0_0_15px_var(--primary-glow)]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] opacity-70 font-bold mb-1">Time</span>
                    <span className="text-[var(--text-color)] text-base md:text-lg">{evtDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center shrink-0 border border-[var(--primary-color)]/20 shadow-[0_0_15px_var(--primary-glow)]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-muted)] opacity-70 font-bold mb-1">Location</span>
                    <span className="text-[var(--text-color)] text-base md:text-lg leading-snug">{event.location || 'Prudentia College of Law Campus'}</span>
                  </div>
                </div>
              </div>

              <a 
                href={event.registration_link || "#"} 
                target={event.registration_link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`${styles.magneticBtn} mt-10 w-full flex items-center justify-center`}
              >
                Register Now
              </a>
            </div>
          </motion.div>
        </div>

        {event.image_urls && event.image_urls.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 md:mt-24 relative z-10"
          >
            <h3 className="text-[var(--primary-color)] text-2xl md:text-3xl font-bold uppercase tracking-widest mb-8 md:mb-12 border-b border-[var(--card-border)] pb-4 text-center md:text-left">
              Event Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {event.image_urls.map((url, idx) => (
                <div key={idx} className="group aspect-[4/3] rounded-[24px] overflow-hidden border border-[var(--card-border)] relative shadow-lg">
                  <img decoding="async" loading="lazy" 
                    src={url} 
                    alt={`${event.title} gallery ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

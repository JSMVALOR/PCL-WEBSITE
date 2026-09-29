/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Calendar } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [eventMsg, setEventMsg] = useState(null);
  const siteContext = useSite();
  const isAdmissionsOpen = siteContext?.isAdmissionsOpen;
  
  useEffect(() => {
    const dismissed = sessionStorage.getItem('pcl_banner_dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
    
    // Fetch nearest upcoming event
    async function fetchEvent() {
      try {
        const today = new Date().toISOString();
        const { data } = await supabase
          .from('admin_events')
          .select('title, event_date')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(1)
          .single();
          
        if (data) {
          const formattedDate = new Date(data.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          setEventMsg(`UPCOMING EVENT: ${data.title} on ${formattedDate}`);
        }
      } catch (err) {
        // Ignore, fallback to default message
      }
    }
    fetchEvent();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pcl_banner_dismissed', 'true');
  };

  const message = eventMsg 
    ? eventMsg
    : isAdmissionsOpen 
      ? "Admissions for Academic Year 2026-27 are now OPEN. Apply today to secure your seat."
      : "Stay tuned for the latest events and updates from Prudentia College of Law.";

  const link = eventMsg ? "/events" : isAdmissionsOpen ? "/apply" : "/events";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full z-[60] bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-500/30 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.5) 10px, rgba(0,0,0,0.5) 20px)'
          }}></div>
          
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-2 flex items-center relative z-10">
            {/* Tag */}
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 px-3 py-1 rounded-full shrink-0 mr-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Latest Update</span>
            </div>

            {/* Marquee Container */}
            <div className="flex-1 overflow-hidden relative flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <div 
                className="flex whitespace-nowrap"
                style={{
                  animation: `marquee 25s linear infinite`,
                  animationPlayState: isHovered ? 'paused' : 'running'
                }}
              >
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-33.33%); }
                  }
                `}</style>
                <Link to={link} className="text-xs md:text-sm font-semibold tracking-wide text-white hover:text-red-200 transition-colors flex items-center gap-2">
                  <Calendar size={14} className="text-red-400" />
                  {message}
                  <span className="mx-8 text-red-500/50">•</span>
                  <Calendar size={14} className="text-red-400" />
                  {message}
                  <span className="mx-8 text-red-500/50">•</span>
                  <Calendar size={14} className="text-red-400" />
                  {message}
                  <span className="mx-8 text-red-500/50">•</span>
                  <Calendar size={14} className="text-red-400" />
                  {message}
                </Link>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={handleDismiss}
              className="ml-4 p-1.5 rounded-full hover:bg-black/20 text-white/70 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss announcement"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

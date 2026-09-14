/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { ArrowRight, AlertCircle } from 'lucide-react';

const formatCardDate = (dateStr) => {
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options).toUpperCase();
};

const EventsPreview = React.forwardRef((props, ref) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const carouselRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('admin_events')
        .select('*')
        .eq('is_public', true)
        .gte('event_date', now)
        .order('event_date', { ascending: true })
        .limit(6);

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message || 'Error loading events.');
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
    return () => { isMounted = false; };
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={ref}
      className="slide w-full pt-[140px] md:pt-[160px] pb-16 md:pb-24 bg-[var(--bg-color)] overflow-hidden border-t border-[var(--card-border)]"
      {...props}
    >
      <div className="container mx-auto px-6 max-w-[1400px]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h2 className="text-4xl md:text-6xl font-bold text-[var(--text-color)] tracking-tight">
            Campus <span className="italic font-medium text-[var(--primary-color)]">Events</span> & Happenings
          </h2>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={scrollLeft}
              className="w-12 h-12 flex items-center justify-center border border-[var(--card-border)] rounded-sm hover:bg-[var(--card-border)] transition-colors text-[var(--text-color)]"
              aria-label="Previous events"
            >
              <span className="text-2xl font-light">&lsaquo;</span>
            </button>
            <button 
              onClick={scrollRight}
              className="w-12 h-12 flex items-center justify-center border border-[var(--card-border)] rounded-sm hover:bg-[var(--card-border)] transition-colors text-[var(--text-color)]"
              aria-label="Next events"
            >
              <span className="text-2xl font-light">&rsaquo;</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 h-[400px]">
             <div className="w-10 h-10 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
           <div className="py-20 text-center flex flex-col items-center gap-3 h-[400px] justify-center">
             <AlertCircle size={32} className="text-[var(--primary-color)]" />
             <p className="text-[var(--text-muted)]">{error}</p>
           </div>
        ) : events.length === 0 ? (
           <div className="py-20 text-center h-[400px] flex items-center justify-center">
             <p className="text-[var(--text-muted)] text-lg">No upcoming events scheduled at the moment.</p>
           </div>
        ) : (
          <div 
            ref={carouselRef}
            className="flex gap-1 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event) => (
              <Link 
                key={event.id}
                to={`/events/${event.slug || event.id}`}
                className="group flex-shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] h-[380px] snap-start relative flex flex-col justify-between p-8 bg-transparent overflow-hidden border border-[var(--card-border)] hover:border-[var(--primary-color)] transition-all duration-700"
              >
                {/* Expanding Background Sweep */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary-color)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-full z-0"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-2xl md:text-[26px]  font-medium leading-snug text-[var(--text-color)] group-hover:text-black mb-4 transition-colors duration-500">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-[var(--text-muted)] group-hover:text-black/80 line-clamp-3 text-sm transition-colors duration-500">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-xs font-semibold tracking-widest text-[var(--text-muted)] group-hover:text-black transition-colors duration-500 uppercase">
                      {formatCardDate(event.event_date)}
                    </span>
                    
                    <div className="w-12 h-12 flex items-center justify-center bg-transparent group-hover:bg-black transition-colors duration-500 rounded-full border border-[var(--card-border)] group-hover:border-black overflow-hidden relative">
                      <ArrowRight size={20} className="text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-all duration-500 -rotate-45 group-hover:rotate-0" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

             <Link 
                to="/events"
                className="group flex-shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] h-[380px] snap-start relative flex flex-col justify-between p-8 bg-[var(--bg-color)] overflow-hidden border border-[var(--card-border)] hover:border-transparent transition-all duration-700"
              >
                {/* Expanding Background Sweep */}
                <div className="absolute bottom-0 left-0 w-full h-0 bg-[#222] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-full z-0"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-2xl md:text-[26px]  font-medium leading-snug text-[var(--text-color)] group-hover:text-white mb-4 transition-colors duration-500">
                      View All Events
                    </h3>
                    <p className="text-[var(--text-muted)] group-hover:text-gray-300 text-sm transition-colors duration-500">
                      Browse our full calendar of upcoming academic, cultural, and professional events.
                    </p>
                  </div>
                  <div className="flex items-end justify-end mt-auto">
                    <div className="w-12 h-12 flex items-center justify-center bg-transparent group-hover:bg-[var(--primary-color)] transition-colors duration-500 rounded-full border border-[var(--card-border)] group-hover:border-transparent overflow-hidden relative">
                      <ArrowRight size={20} className="text-[var(--text-color)] group-hover:text-black transition-all duration-500 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
});

EventsPreview.displayName = 'EventsPreview';
export default EventsPreview;

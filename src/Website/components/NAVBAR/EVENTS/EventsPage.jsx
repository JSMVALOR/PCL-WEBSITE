/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import fallbackLogo from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';
import styles from '../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

const PAST_EVENTS_PAGE_SIZE = 8;
const FALLBACK_IMG = fallbackLogo;

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pastVisibleCount, setPastVisibleCount] = useState(PAST_EVENTS_PAGE_SIZE);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from('admin_events')
                    .select('*')
                    .eq('is_public', true)
                    .order('event_date', { ascending: true });
                setEvents(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (loading) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.gsap-fade-up',
                { opacity: 0, y: 40 },
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 0.8, 
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [loading, events]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentEvents = [];
    const upcomingEvents = [];
    const pastEvents = [];

    events.forEach(e => {
        const d = new Date(e.event_date);
        d.setHours(0, 0, 0, 0);
        
        if (d.getTime() === today.getTime()) {
            presentEvents.push(e);
        } else if (d.getTime() > today.getTime()) {
            upcomingEvents.push(e);
        } else {
            pastEvents.push(e);
        }
    });

    pastEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    const visiblePastEvents = pastEvents.slice(0, pastVisibleCount);

    const groupByMonth = (evtList) => {
        const map = {};
        evtList.forEach(e => {
            const d = new Date(e.event_date);
            const key = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            if (!map[key]) map[key] = [];
            map[key].push(e);
        });
        return map;
    };

    const upcomingGrouped = groupByMonth(upcomingEvents);
    const pastGrouped = groupByMonth(visiblePastEvents);

    const renderEventCard = (evt) => {
        const evtDate = new Date(evt.event_date);
        return (
            <Link
                key={evt.id}
                to={`/events/${evt.slug || evt.id}`}
                className={`gsap-fade-up group block relative overflow-hidden rounded-[24px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-md hover:border-[var(--primary-color)]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500`}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-[var(--card-bg)] flex items-center justify-center">
                    {evt.image_url ? (
                        <img decoding="async" loading="lazy" 
                            src={evt.image_url} 
                            alt={evt.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" 
                        />
                    ) : (
                        <div 
                            className="w-1/2 h-1/2 opacity-20 group-hover:scale-110 transition-transform duration-700 ease-out"
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                WebkitMaskImage: `url(${FALLBACK_IMG})`,
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                maskImage: `url(${FALLBACK_IMG})`,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center'
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card-bg)] via-transparent to-transparent opacity-80" />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-[var(--primary-color)] text-black px-3 py-2 rounded-xl text-center font-bold z-20 shadow-lg border border-[var(--primary-color)]/20">
                        <span className="block text-xl md:text-2xl leading-none">{evtDate.toLocaleDateString('en-US', { day: '2-digit' })}</span>
                        <span className="block text-[9px] md:text-[10px] uppercase tracking-widest">{evtDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 md:p-8 flex flex-col relative z-10 bg-[var(--card-bg)]">
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--text-color)] mb-3 leading-tight group-hover:text-[var(--primary-color)] transition-colors">
                        {evt.title}
                    </h3>
                    
                    <div className="flex flex-col gap-2 text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[var(--primary-color)]"/> {evtDate.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="mt-2 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-[var(--text-muted)] group-hover:text-[var(--primary-color)] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
                        <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
            </Link>
        );
    };

    const renderMonthSection = (monthYear, evtList) => (
        <div key={monthYear} className="mb-16">
            <h3 className="text-xl md:text-2xl font-bold text-[var(--primary-color)] mb-8 border-b border-[var(--card-border)] pb-4 inline-block pr-12">
                {monthYear}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {evtList.map((evt) => renderEventCard(evt))}
            </div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientBackground} />
            <div className={styles.auroraGlow} />

            <div className={styles.contentContainer} ref={containerRef}>
                
                {/* Header */}
                <div className="text-center mb-20 md:mb-24 relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-[var(--text-color)] mb-6 uppercase leading-tight"
                       
                    >
                        Campus <span className="text-[var(--primary-color)] italic">Events</span>
                    </motion.h1>
                    <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }} 
                        animate={{ opacity: 1, scaleX: 1 }} 
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-[1px] w-32 bg-[var(--primary-color)]/50 mx-auto mb-8 origin-center"
                    />
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed"
                       
                    >
                        Stay updated with all the upcoming seminars, workshops, moot courts, and cultural activities happening at Prudentia College of Law.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 relative z-10">
                        <div className="w-12 h-12 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin mb-4"></div>
                        <p className="text-[var(--text-muted)] tracking-widest uppercase text-sm font-bold">Loading Events...</p>
                    </div>
                ) : (
                    <div className="relative z-10">
                        {/* 1. PRESENT EVENTS */}
                        {presentEvents.length > 0 && (
                            <div className="mb-32">
                                <div className="flex flex-col items-center md:items-start mb-12">
                                    <span className="text-[var(--primary-color)] font-bold tracking-[0.2em] uppercase text-sm mb-2 animate-pulse flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]"></div>Happening Today
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-color)] uppercase tracking-widest">
                                        Present <span className="text-[var(--primary-color)] italic">Events</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                    {presentEvents.map((evt) => renderEventCard(evt))}
                                </div>
                            </div>
                        )}

                        {/* 2. UPCOMING EVENTS */}
                        <div className="mb-32">
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-12 uppercase tracking-widest flex items-center justify-center md:justify-start gap-4">
                                Upcoming <span className="text-[var(--primary-color)] italic">Events</span>
                            </h2>
                            {upcomingEvents.length === 0 ? (
                                <div className={`${styles.glassCard} py-20 text-center border border-[var(--card-border)]`}>
                                    <p className="text-[var(--text-muted)] text-xl">No future events scheduled at the moment.</p>
                                </div>
                            ) : (
                                <div>
                                    {Object.entries(upcomingGrouped).map(([monthYear, evts]) => 
                                        renderMonthSection(monthYear, evts)
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. PAST EVENTS */}
                        {pastEvents.length > 0 && (
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-muted)] mb-12 uppercase tracking-widest flex items-center justify-center md:justify-start gap-4">
                                    Past <span className="opacity-70 italic">Events</span>
                                </h2>
                                <div className="opacity-90 hover:opacity-100 transition-opacity duration-700">
                                    {Object.entries(pastGrouped).map(([monthYear, evts]) => 
                                        renderMonthSection(monthYear, evts)
                                    )}
                                </div>
                                {pastVisibleCount < pastEvents.length && (
                                    <div className="flex justify-center mt-16">
                                        <button
                                            onClick={() => setPastVisibleCount((c) => c + PAST_EVENTS_PAGE_SIZE)}
                                            className="text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full border border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors focus:outline-none"
                                        >
                                            Load More Past Events
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

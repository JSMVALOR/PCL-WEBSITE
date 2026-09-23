import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import SEO from '../../../components/SEO/SEO';
import Navbar from '../Navbar';
import PremiumFooter from '../../UI/PremiumFooter/PremiumFooter';

export default function AcademicCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            // Fetch events
            const { data: eventData, error: eventError } = await supabase
                .from('academic_calendar')
                .select('*')
                .order('start_date', { ascending: true });
            
            if (!eventError) {
                // Filter only upcoming or current year events
                const currentYear = new Date().getFullYear();
                const filtered = (eventData || []).filter(e => {
                    const eventYear = new Date(e.start_date).getFullYear();
                    return eventYear >= currentYear - 1; // Show last year and future
                });
                setEvents(filtered);
            }

            // Fetch PDF URL
            const { data: settingData, error: settingError } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'academic_calendar_pdf')
                .single();
            
            if (!settingError && settingData?.value?.url) {
                setPdfUrl(settingData.value.url);
            }
        } catch (error) {
            console.error("Failed to load academic calendar:", error);
        } finally {
            setLoading(false);
        }
    };

    const getEventTypeColor = (type) => {
        switch(type?.toLowerCase()) {
            case 'holiday': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'exam': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'academic': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans selection:bg-[var(--accent)] selection:text-white flex flex-col">
            <SEO title="Academic Calendar | Prudentia College of Law" description="View the academic calendar, important dates, exams, and holidays." />
            <Navbar />
            
            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="flex flex-col">
                            <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-xs sm:text-sm mb-3 block">Timeline</span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight">Academic Calendar</h1>
                            <p className="text-[var(--text-muted)] mt-4 max-w-2xl text-lg">Stay updated with important semester dates, examination schedules, and college holidays.</p>
                        </div>
                        
                        {pdfUrl && (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-black tracking-normal text-sm rounded-xl transition-all shadow-lg shadow-[var(--accent)]/20 hover:-translate-y-1 w-full md:w-auto shrink-0">
                                <i className="fa-solid fa-file-pdf"></i> Download PDF Schedule
                            </a>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <i className="fa-solid fa-circle-notch fa-spin text-[var(--accent)] text-4xl"></i>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-32 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl">
                            <i className="fa-regular fa-calendar-xmark text-5xl text-[var(--text-muted)] mb-4"></i>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">No Events Scheduled</h3>
                            <p className="text-[var(--text-muted)] mt-2">The academic calendar is currently being updated for the upcoming session.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-black/10 dark:border-white/10 pl-6 md:pl-10 py-4 ml-4 md:ml-6 flex flex-col gap-10">
                            {events.map((event, index) => (
                                <div key={event.id} className="relative group">
                                    <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--accent)] group-hover:scale-125 transition-transform z-10"></div>
                                    
                                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm group-hover:border-[var(--accent)]/50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border ${getEventTypeColor(event.event_type)}`}>
                                                        {event.event_type}
                                                    </span>
                                                    <span className="text-sm font-bold text-[var(--accent)]">
                                                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        {event.end_date && event.end_date !== event.start_date && ` - ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{event.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <PremiumFooter />
        </div>
    );
}

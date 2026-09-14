import Preloader from '../../UI/Preloader/Preloader';
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import outdoorImg from '../../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';
import saratChandraLogo from '../../../../Shared/Assets/LOGOS/pcl_sarat_chandra_logo.png';
import classroom1 from '../../../../Shared/Assets/CAMPUS/pcl_classroom_1.webp';
import styles from './Programs.module.css';

import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

gsap.registerPlugin(ScrollTrigger);

const TABS = [
  { id: 'courses', label: 'Academic Courses' },
  { id: 'admissions', label: 'Admissions & Fees' },
  { id: 'documents', label: 'Documents Required' },
  { id: 'calendar', label: 'Academic Calendar' },
  { id: 'collaborations', label: 'Educational Collaborations' }
];

export default function Programs() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('courses');
  const contentRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['courses', 'admissions', 'documents', 'calendar', 'collaborations'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [window.location.hash]);

  // Fetch CMS Data
  const { content: introContent } = useSiteContent('/programs', 'intro');
  const { content: admissionsData } = useSiteContent('/programs', 'admissions');
  const { content: documentsData } = useSiteContent('/programs', 'documents');
  const { content: collabData } = useSiteContent('/programs', 'collaborations');

  // Fetch Supabase Data for Calendar
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('academic_events')
          .select('*')
          .eq('is_active', true)
          .order('date', { ascending: true });
        
        if (error) throw error;
        setCalendarEvents(data || []);
      } catch (err) {
        console.error("Error fetching academic calendar:", err);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (TABS.find(t => t.id === hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // GSAP animation for content entrance when tab changes
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [activeTab]);

  return (
    <div className={styles.pageWrapper}>
      {/* Background Elements */}
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer}>
        <div className="text-center mb-16 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-color)] mb-6"
           
          >
            Academic <span className="text-[var(--primary-color)] italic font-medium pr-2">Excellence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed text-justify"
          >
            {introContent?.content || "Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence."}
          </motion.p>
        </div>

        {/* Tab Navigation (Framer Motion Sliding Pill) */}
        <div className={styles.tabNav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={styles.activeTabIndicator}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[500px] z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              ref={contentRef}
            >
              
              {activeTab === 'courses' && (
                <>
                  <div className="mb-12 text-center md:text-left">
                    <h2 className="text-3xl text-[var(--text-color)] mb-4 font-bold font-['Playfair_Display']">Approved Academic <span className="italic font-medium text-[var(--primary-color)] pr-2">Courses</span></h2>
                    <p className="text-[var(--text-muted)] leading-relaxed text-lg mb-8 max-w-3xl text-justify">
                      Prudentia College of Law offers integrated and professional law programs approved by the Bar Council of India. Our curriculum is designed to bridge the rural-urban gap, integrating academic rigor with practical legal training starting from year one.
                    </p>
                    
                    <div className="w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 relative flex items-center justify-center group shadow-2xl">
                      <img decoding="async" loading="lazy" src={outdoorImg} alt="Prudentia Campus" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 ring-1 ring-inset ring-[var(--primary-color)]/30 rounded-3xl pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    <Link to="/programs/ba-llb" className={styles.glassCard}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex items-center justify-between font-['Playfair_Display']">
                        <span>BA. LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">5 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm">
                        An integrated undergraduate program combining Humanities with Law. Focuses on socio-legal awareness, preparing students for leadership in Governance.
                      </p>
                    </Link>
                    <Link to="/programs/bba-llb" className={styles.glassCard}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex items-center justify-between font-['Playfair_Display']">
                        <span>BBA. LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">5 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm">
                        Merges Business Administration with Legal Education. Tailored for students aiming for careers in Corporate Law, Legal Consultancy, and Management.
                      </p>
                    </Link>
                    <Link to="/programs/llb" className={styles.glassCard}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex items-center justify-between font-['Playfair_Display']">
                        <span>LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">3 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm">
                        A purely professional course for graduates. Emphasizes core legal subjects, procedural laws, and extensive court exposure.
                      </p>
                    </Link>
                  </div>
                </>
              )}

              {activeTab === 'admissions' && (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl text-[var(--text-color)] mb-4 font-bold font-['Playfair_Display']">
                      Admissions & <span className="italic font-medium text-[var(--primary-color)] pr-2">Fees</span>
                    </h2>
                    <p className="text-[var(--primary-color)] text-lg max-w-3xl mx-auto italic font-['Playfair_Display']">
                      "{admissionsData?.subtitle || 'We are committed to offering quality legal education at affordable fees to underserved communities.'}"
                    </p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    <div className={styles.glassCard}>
                      <h3 className="text-xl text-[var(--text-color)] font-bold mb-6 font-['Playfair_Display']">Admission Process</h3>
                      <div className={styles.dataGrid}>
                        <div className={`hidden md:grid grid-cols-3 ${styles.gridHeader}`}>
                          <div>Quota Type</div>
                          <div>Allocation</div>
                          <div>Route</div>
                        </div>
                        <div className={styles.gridRow} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                          <div className={styles.gridCellPrimary}>State Counselling</div>
                          <div className={styles.gridCellAccent}>{admissionsData?.state_counselling_desc || '80% Seats'}</div>
                          <div className={styles.gridCellMuted}>TS LAWCET</div>
                        </div>
                        <div className={styles.gridRow} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                          <div className={styles.gridCellPrimary}>Management</div>
                          <div className={styles.gridCellAccent}>{admissionsData?.management_desc || '20% Seats'}</div>
                          <div className={styles.gridCellMuted}>Direct</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.glassCard}>
                      <h3 className="text-xl text-[var(--text-color)] font-bold mb-6 font-['Playfair_Display']">Fee Structure</h3>
                      <div className={styles.dataGrid}>
                        <div className={styles.gridRow} style={{ gridTemplateColumns: '1fr 1fr' }}>
                          <div className={styles.gridCellPrimary}>Counselling Students</div>
                          <div className={styles.gridCellAccent} style={{ textAlign: 'right' }}>
                            {admissionsData?.fee_counselling || 'Rs. 20,000 / yr'}
                          </div>
                        </div>
                        <div className={styles.gridRow} style={{ gridTemplateColumns: '1fr' }}>
                          <div className={styles.gridCellPrimary} style={{ paddingBottom: '0' }}>Management Quota</div>
                          <div className={styles.gridCellMuted} style={{ paddingTop: '8px' }}>
                            {admissionsData?.fee_management || 'Fees are subject to incurring expenditure and demand. Contact administration for details.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.glassCard}>
                    <h3 className="text-xl text-[var(--primary-color)] font-bold mb-8 font-['Playfair_Display']">Eligibility & Entrance</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[var(--text-color)] font-semibold mb-3 tracking-wide">5-Year Courses</h4>
                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                          {admissionsData?.eligibility_5yr || 'Pass in Intermediate (10+2) with min 45% marks (40% for SC/ST).'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[var(--text-color)] font-semibold mb-3 tracking-wide">3-Year Course</h4>
                        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                          {admissionsData?.eligibility_3yr || 'Graduate in any discipline (10+2+3 pattern) with min 45% marks.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'documents' && (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl text-[var(--text-color)] mb-4 font-bold font-['Playfair_Display']">
                      Required <span className="italic font-medium text-[var(--primary-color)] pr-2">Documents</span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
                      {documentsData?.subtitle || 'Originals and photocopies required at admission.'}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl mx-auto mb-16">
                    {(documentsData?.doc_list ? documentsData.doc_list.split(',').map(d => d.trim()) : [
                      "SSC / 10th Class Certificate",
                      "Intermediate / 12th Class Certificate",
                      "Degree Certificate & Marks Memos (for LL.B 3 Yrs)",
                      "TS LAWCET Hall Ticket and Rank Card",
                      "Transfer Certificate (TC)",
                      "Conduct / Character Certificate",
                      "Aadhaar Card Copy",
                      "Recent Passport Size Photographs",
                      "Caste & Income Certificate (if applicable)"
                    ]).map((doc, idx) => (
                      <div key={idx} className={styles.glassCard} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-glow)]"></div>
                        <span className="text-[var(--text-color)] font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'calendar' && (
                <div className="text-center py-20 max-w-3xl mx-auto">
                  <div className="relative w-full max-w-lg mx-auto mb-16">
                    {/* Animated Timeline Placeholder */}
                    <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-[var(--card-border)]"></div>
                    <div className="space-y-8 relative">
                      {calendarLoading ? (
                        <div className="flex justify-center py-12">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                        </div>
                      ) : calendarEvents.length > 0 ? (
                        calendarEvents.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-8 group">
                            <div className="w-4 h-4 rounded-full bg-[var(--primary-color)] ml-[26px] ring-4 ring-[var(--bg-color)] z-10 transition-transform group-hover:scale-150 shadow-[0_0_15px_var(--primary-glow)]"></div>
                            <div className={`${styles.glassCard} p-6 flex-1 text-left flex flex-col md:flex-row gap-6 items-start md:items-center`}>
                              <div className="flex-1">
                                <h4 className="text-[var(--primary-color)] font-bold text-lg">{item.title}</h4>
                                <p className="text-[var(--text-color)] font-medium mt-1 mb-2">
                                  {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                {item.description && (
                                  <p className="text-[var(--text-muted)] text-sm">{item.description}</p>
                                )}
                                <span className="inline-block mt-3 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border border-[var(--primary-color)]/30 text-[var(--primary-color)]">
                                  {item.event_type}
                                </span>
                              </div>
                              {item.image_url && (
                                <div className="w-full md:w-48 h-32 shrink-0 rounded-xl overflow-hidden border border-[var(--card-border)] shadow-lg group-hover:shadow-[0_0_20px_var(--primary-glow)] transition-all duration-500 relative">
                                  <img decoding="async" loading="lazy" src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                            <p className="text-[var(--text-muted)] italic">No upcoming events scheduled at this time.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={() => alert("Syllabus PDF is currently being updated for the 2026 academic year.")} className="tlh-btn justify-center" style={{ maxWidth: '300px' }}>
                    <span className="text-xs font-bold uppercase tracking-widest">Download PDF Calendar</span>
                    <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              )}

              {activeTab === 'collaborations' && (
                <>
                  <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                    <div className="md:w-2/3 text-center md:text-left">
                      <h2 className="text-3xl text-[var(--text-color)] mb-4 font-bold font-['Playfair_Display']">
                        Educational <span className="italic font-medium text-[var(--primary-color)] pr-2">Collaborations</span>
                      </h2>
                      <h3 className="text-xl text-[var(--primary-color)] font-semibold mb-6 font-['Playfair_Display']">
                        {collabData?.subtitle || 'Career Focus & Coaching'}
                      </h3>
                      <p className="text-[var(--text-muted)] leading-relaxed text-base md:text-lg mb-6">
                        {collabData?.description || 'We provide specialized coaching integrated with the curriculum to ensure career readiness. Prudentia College of Law, in collaboration with '} 
                        <span className="text-[var(--primary-color)] font-semibold">
                          {collabData?.partner_name || 'Sarat Chandra IAS Academy'}
                        </span>
                        {collabData?.description ? '' : ', seeks to create a dynamic learning ecosystem.'}
                      </p>
                    </div>
                    <div className="md:w-1/3 flex justify-center">
                       <div className="w-56 h-56 bg-white rounded-3xl border border-[var(--card-border)] flex items-center justify-center p-6 shadow-xl transition-transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,191,0,0.15)] duration-500 overflow-hidden">
                          <img decoding="async" loading="lazy" src={saratChandraLogo} alt={collabData?.partner_name || "Sarat Chandra IAS Academy"} className="w-full h-full object-contain scale-110" />
                       </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className={styles.glassCard} style={{ borderTop: '2px solid var(--primary-color)' }}>
                      <h4 className="text-[var(--text-color)] font-bold text-lg mb-2">{collabData?.feature1_title || 'Judicial Orientation'}</h4>
                      <p className="text-[var(--text-muted)] text-sm">{collabData?.feature1_desc || 'Coaching for Junior Civil Judge examinations.'}</p>
                    </div>
                    <div className={styles.glassCard} style={{ borderTop: '2px solid var(--primary-color)' }}>
                      <h4 className="text-[var(--text-color)] font-bold text-lg mb-2">{collabData?.feature2_title || 'Civil Services'}</h4>
                      <p className="text-[var(--text-muted)] text-sm">{collabData?.feature2_desc || 'Preparation for UPSC and Group Services.'}</p>
                    </div>
                    <div className={styles.glassCard} style={{ borderTop: '2px solid var(--primary-color)' }}>
                      <h4 className="text-[var(--text-color)] font-bold text-lg mb-2">{collabData?.feature3_title || 'Industry Integration'}</h4>
                      <p className="text-[var(--text-muted)] text-sm">{collabData?.feature3_desc || 'Orientation with Law Firms and Court Exposure.'}</p>
                    </div>
                  </div>

                  <div className="w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden relative flex items-center justify-center group shadow-2xl">
                    <img decoding="async" loading="lazy" src={classroom1} alt="Collaborative Learning" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-[var(--primary-color)]/30 rounded-3xl pointer-events-none"></div>
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

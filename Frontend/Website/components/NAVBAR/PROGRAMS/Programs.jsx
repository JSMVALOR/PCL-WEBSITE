import Preloader from '../../UI/Preloader/Preloader';
/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import outdoorImg from '../../../../Shared/Assets/CAMPUS/pcl_outdoor.webp';
import saratChandraLogo from '../../../../Shared/Assets/LOGOS/pcl_sarat_chandra_logo.png';
import classroom1 from '../../../../Shared/Assets/CAMPUS/pcl_classroom_1.webp';
import styles from './Programs.module.css';

import { useSiteContent } from '../../../../Shared/lib/hooks/useSiteContent';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const loadLogoAsBase64 = async () => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "/favicon.svg"; 
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 500;
            canvas.height = 500;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 500, 500);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(null);
    });
  };

  const generateLuxuryPDF = async () => {
    if (!calendarEvents || !calendarEvents.columns || !calendarEvents.rows) return;
    setIsGenerating(true);

    try {
        const doc = new window.jspdf.jsPDF('p', 'pt', 'a4');
        
        // --- BRAND COLORS (Brown & Gold Theme) ---
        const brandBrown = [93, 64, 55]; // #5D4037
        const brandGold = [212, 175, 55]; // #d4af37
        const dark = [26, 26, 46]; // #1a1a2e
        
        // Center variables
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        // --- HEADER SECTION ---
        const logoData = await loadLogoAsBase64();
        if (logoData) {
            doc.addImage(logoData, "PNG", centerX - 40, 30, 80, 80);
        }

        doc.setFont("times", "bold");
        doc.setTextColor(...brandBrown);
        doc.setFontSize(24);
        doc.text("PRUDENTIA COLLEGE OF LAW", centerX, 140, { align: 'center' });
        
        // Decorative Line under title
        doc.setDrawColor(...brandBrown);
        doc.setLineWidth(1);
        doc.line(centerX - 150, 150, centerX + 150, 150);
        doc.setDrawColor(...brandGold);
        doc.setLineWidth(0.5);
        doc.line(centerX - 150, 153, centerX + 150, 153);

        doc.setFontSize(14);
        doc.setTextColor(...dark);
        doc.text("ANNUAL ACADEMIC CALENDAR 2026 – 2027", centerX, 180, { align: 'center' });
        
        doc.setFont("times", "italic");
        doc.setFontSize(11);
        doc.text("Academic Schedule as per the Osmania University Communication", centerX, 200, { align: 'center' });
        
        doc.setFont("times", "bold");
        doc.setFontSize(11);
        doc.text("LL. B. (3-YDC); B.A. LL. B. and B.B.A. LL. B (5-YDC)", centerX, 220, { align: 'center' });
        
        doc.text("CIRCULAR – 01/PCL/26", centerX, 240, { align: 'center' });

        // Table Body
        const headers = [calendarEvents.columns];
        const data = calendarEvents.rows.map(row => 
            calendarEvents.columns.map(col => row.data[col] || '')
        );

        doc.autoTable({
            startY: 270,
            head: headers,
            body: data,
            theme: 'grid',
            headStyles: {
                fillColor: [250, 250, 250], // Whiteish
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 11,
                cellPadding: 12,
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 1
            },
            bodyStyles: {
                textColor: [0, 0, 0],
                fontSize: 11,
                cellPadding: 12,
                lineColor: [0, 0, 0],
                lineWidth: 1
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 40 },
                2: { halign: 'center', cellWidth: 120 },
                3: { halign: 'center', cellWidth: 140 }
            },
            styles: {
                font: 'times',
                lineWidth: 1,
                lineColor: [0, 0, 0]
            },
            margin: { top: 270, left: 50, right: 50 }
        });
        
        const finalY = doc.lastAutoTable.finalY + 40;
        
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...dark);
        doc.text("Important Note: ", 50, finalY);
        
        doc.setFont("times", "normal");
        doc.text("This calendar has been prepared based on the academic schedule as per the Osmania University", 130, finalY);
        doc.text("communication. Any subsequent changes, additions or revised dates notified by the University shall prevail and will be", 50, finalY + 15);
        doc.text("incorporated by the College accordingly.", 50, finalY + 30);
        
        doc.setFontSize(11);

        doc.save('Prudentia_Academic_Calendar.pdf');
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        if(window.erpToast) window.erpToast.show("Failed to generate PDF. Please try again.", "error");
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'academic_calendar_grid')
          .single();
        
        if (error) throw error;
        setCalendarEvents(data?.value || null);
      } catch (err) {
        console.error("Error fetching academic calendar grid:", err);
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
        <div className="text-center mb-12 relative z-10 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl  tracking-tight text-[var(--text-color)] mb-6 font-serif tracking-tight font-bold"
           
          >
            Academic <span className="text-[var(--primary-color)] italic font-medium pr-2">Excellence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed text-center px-4"
          >
            {introContent?.content || "Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex justify-center mt-10 md:mt-12"
          >
            <div 
              onClick={() => window.scrollBy({ top: 400, behavior: 'smooth' })}
              className="flex flex-col items-center gap-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">Scroll to Explore</span>
              <div className="w-[24px] h-[40px] rounded-full border border-[var(--card-border)] flex justify-center p-1 bg-[var(--bg-color)] shadow-sm">
                <motion.div 
                  animate={{ y: [0, 16, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1.5 h-2.5 bg-[var(--primary-color)] rounded-full"
                />
              </div>
            </div>
          </motion.div>
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
                    {/* BA LL.B */}
                    <Link to="/programs/ba-llb" className={`${styles.glassCard} group flex flex-col hover:border-[var(--primary-color)]/50 transition-colors duration-300`}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex flex-wrap items-center justify-between font-['Playfair_Display']">
                        <span>BA. LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">5 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm mb-6 flex-grow">
                        An integrated undergraduate program combining Humanities with Law. Focuses on socio-legal awareness, preparing students for leadership in Governance.
                      </p>
                      <div className="flex flex-col gap-3 pt-5 border-t border-[var(--card-border)]">
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Eligibility</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">10+2 (45%)</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Intake Route</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">TS LAWCET / Mgmt</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Annual Fee</span>
                          <span className="text-[var(--primary-color)] font-bold font-mono">₹ 20,000*</span>
                        </div>
                      </div>
                    </Link>

                    {/* BBA LL.B */}
                    <Link to="/programs/bba-llb" className={`${styles.glassCard} group flex flex-col hover:border-[var(--primary-color)]/50 transition-colors duration-300`}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex flex-wrap items-center justify-between font-['Playfair_Display']">
                        <span>BBA. LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">5 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm mb-6 flex-grow">
                        Merges Business Administration with Legal Education. Tailored for students aiming for careers in Corporate Law, Legal Consultancy, and Management.
                      </p>
                      <div className="flex flex-col gap-3 pt-5 border-t border-[var(--card-border)]">
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Eligibility</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">10+2 (45%)</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Intake Route</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">TS LAWCET / Mgmt</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Annual Fee</span>
                          <span className="text-[var(--primary-color)] font-bold font-mono">₹ 20,000*</span>
                        </div>
                      </div>
                    </Link>

                    {/* LL.B */}
                    <Link to="/programs/llb" className={`${styles.glassCard} group flex flex-col hover:border-[var(--primary-color)]/50 transition-colors duration-300`}>
                      <h3 className="text-[var(--primary-color)] text-xl font-bold mb-4 flex flex-wrap items-center justify-between font-['Playfair_Display']">
                        <span>LL.B <span className="block text-xs text-[var(--text-muted)] font-sans mt-1 tracking-widest uppercase">3 Years</span></span>
                        <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">➔</span>
                      </h3>
                      <p className="text-[var(--text-color)] leading-relaxed text-sm mb-6 flex-grow">
                        A purely professional course for graduates. Emphasizes core legal subjects, procedural laws, and extensive court exposure.
                      </p>
                      <div className="flex flex-col gap-3 pt-5 border-t border-[var(--card-border)]">
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Eligibility</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">Degree (45%)</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Intake Route</span>
                          <span className="text-[var(--text-color)] font-medium bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)]">TS LAWCET / Mgmt</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                          <span className="text-[var(--text-muted)] uppercase tracking-widest font-bold">Annual Fee</span>
                          <span className="text-[var(--primary-color)] font-bold font-mono">₹ 20,000*</span>
                        </div>
                      </div>
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
                      <div className="flex flex-col border border-[var(--card-border)] rounded-2xl overflow-hidden">
                        <div className="hidden md:grid grid-cols-3 bg-black/20 p-4 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--card-border)]">
                          <div>Quota Type</div>
                          <div>Allocation</div>
                          <div>Route</div>
                        </div>
                        <div className="grid grid-cols-3 border-b border-[var(--card-border)] hover:bg-white/5 transition-colors items-center">
                          <div className="p-3 md:p-6 font-serif font-bold text-sm md:text-xl text-[var(--text-color)] leading-tight">State Counselling</div>
                          <div className="p-3 md:p-6 text-[var(--primary-color)] font-medium text-sm md:text-base text-center">{admissionsData?.state_counselling_desc || '80% Seats'}</div>
                          <div className="p-3 md:p-6 text-xs md:text-sm text-[var(--text-muted)] text-right md:text-left">TS LAWCET</div>
                        </div>
                        <div className="grid grid-cols-3 hover:bg-white/5 transition-colors items-center">
                          <div className="p-3 md:p-6 font-serif font-bold text-sm md:text-xl text-[var(--text-color)] leading-tight">Management</div>
                          <div className="p-3 md:p-6 text-[var(--primary-color)] font-medium text-sm md:text-base text-center">{admissionsData?.management_desc || '20% Seats'}</div>
                          <div className="p-3 md:p-6 text-xs md:text-sm text-[var(--text-muted)] text-right md:text-left">Direct</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.glassCard}>
                      <h3 className="text-xl text-[var(--text-color)] font-bold mb-6 font-['Playfair_Display']">Fee Structure</h3>
                      <div className="flex flex-col border border-[var(--card-border)] rounded-2xl overflow-hidden">
                        <div className="flex justify-between items-center border-b border-[var(--card-border)] hover:bg-white/5 transition-colors p-4 md:p-6 gap-4">
                          <div className="font-serif font-bold text-sm md:text-xl text-[var(--text-color)] leading-tight">Counselling Students</div>
                          <div className="text-[var(--primary-color)] font-medium text-sm md:text-base text-right shrink-0">
                            {admissionsData?.fee_counselling || 'Rs. 20,000 / yr'}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center hover:bg-white/5 transition-colors p-4 md:p-6 gap-2 md:gap-4">
                          <div className="font-serif font-bold text-sm md:text-xl text-[var(--text-color)] leading-tight">Management Quota</div>
                          <div className="text-xs md:text-sm text-[var(--text-muted)] md:text-right max-w-sm">
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
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl text-[var(--text-color)] mb-4 font-bold font-['Playfair_Display']">
                      Academic <span className="italic font-medium text-[var(--primary-color)] pr-2">Calendar</span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto mb-6">
                      Key dates, schedules, and academic milestones for the current session.
                    </p>
                    <button 
                        onClick={generateLuxuryPDF} 
                        disabled={isGenerating || !calendarEvents}
                        className="tlh-btn justify-center mx-auto w-fit disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        ) : null}
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {isGenerating ? "Generating..." : "Download Official PDF"}
                        </span>
                        {!isGenerating && (
                            <svg width="9" height="13" viewBox="0 0 9 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
                                <path d="M1.64453 0.972656L6.97897 6.3071L1.67567 11.6104" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        )}
                    </button>
                  </div>

                  <div className="w-full max-w-6xl mx-auto mb-16 relative z-10">
                    {calendarLoading ? (
                      <div className="flex justify-center py-20">
                         <div className="w-12 h-12 border-4 border-[var(--card-border)] border-t-[var(--primary-color)] rounded-full animate-spin"></div>
                      </div>
                    ) : calendarEvents && calendarEvents.rows && calendarEvents.rows.length > 0 ? (
                      <div className="rounded-[32px] overflow-hidden border border-[var(--primary-color)]/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-[var(--card-bg)] backdrop-blur-xl relative">
                        {/* Decorative glowing gradient */}
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary-color)] rounded-full blur-[120px] opacity-[0.15] pointer-events-none"></div>
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-[0.05] pointer-events-none"></div>
                         
                        <div className="overflow-hidden relative z-10">
                          <table className="w-full text-left border-collapse block md:table">
                            <thead className="hidden md:table-header-group">
                                <tr className="border-b border-[var(--card-border)] bg-black/20 md:table-row">
                                {calendarEvents.columns.map(col => (
                                  <th key={col} className="py-6 px-8 text-xs font-bold text-[var(--text-color)] uppercase tracking-widest">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]/40 block md:table-row-group">
                              {calendarEvents.rows.map((row, idx) => (
                                <tr key={row.id} className="block md:table-row hover:bg-white/5 transition-all duration-300 group p-4 md:p-0 border-b border-[var(--card-border)] md:border-none relative">
                                  
                                  {/* Mobile S.NO and Compact Grid */}
                                  <td className="block md:hidden py-1">
                                    <div className="flex items-center mb-3 border-b border-[var(--card-border)]/50 pb-2">
                                      <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2 py-0.5 rounded text-[10px] tracking-widest font-bold border border-[var(--primary-color)]/20 shadow-sm mr-2">
                                        EVENT {String(idx + 1).padStart(2, '0')}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                      {calendarEvents.columns.map((col, colIdx) => (
                                        <div key={col} className={colIdx === 0 ? "col-span-2" : "col-span-1"}>
                                          <span className="text-[8px] font-bold text-[var(--primary-color)] opacity-80 uppercase tracking-widest block mb-0.5">
                                            {col}
                                          </span>
                                          <span className="text-sm font-medium text-[var(--text-color)] opacity-90 leading-tight block">
                                            {row.data[col] || '-'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>

                                  {/* Desktop Data Cells */}
                                  {calendarEvents.columns.map(col => (
                                    <td key={col} className="hidden md:table-cell py-6 px-8 text-sm md:text-base font-medium text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors">
                                      {row.data[col] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className={`${styles.glassCard} p-12 max-w-2xl mx-auto text-center border border-[var(--card-border)]`}>
                          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] shadow-[0_0_20px_var(--primary-glow)]">
                             <span className="text-2xl font-serif italic">!</span>
                          </div>
                          <h3 className="text-2xl font-bold text-[var(--text-color)] mb-3 font-['Playfair_Display']">No Calendar Published</h3>
                          <p className="text-[var(--text-muted)]">The academic calendar grid for the upcoming session has not been officially released yet. Please check back later.</p>
                      </div>
                    )}
                  </div>
                </>
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

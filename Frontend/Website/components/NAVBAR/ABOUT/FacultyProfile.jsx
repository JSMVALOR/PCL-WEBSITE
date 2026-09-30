/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

const ALL_TABS = [
  { id: 'experience', label: 'Past Experience' },
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Areas of Expertise' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'awards', label: 'Awards' }
];

const SkeletonLoader = () => (
  
<div className="min-h-screen w-full bg-[var(--bg-color)] flex flex-col lg:flex-row px-6 md:px-12 py-32 gap-16 max-w-7xl mx-auto relative items-start">
    {/* Left Skeleton */}
    <div className="w-full lg:w-5/12 shrink-0 space-y-6">
      <div className="w-full aspect-[3/4] bg-white/[0.03] animate-pulse rounded-[2rem]"></div>
      <div className="flex gap-4">
        <div className="h-12 flex-1 bg-white/[0.03] animate-pulse rounded-xl"></div>
        <div className="h-12 flex-1 bg-white/[0.03] animate-pulse rounded-xl"></div>
      </div>
    </div>
    {/* Right Skeleton */}
    <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-6 lg:pt-12">
      <div className="h-20 w-3/4 bg-white/[0.03] animate-pulse rounded-xl"></div>
      <div className="h-8 w-1/3 bg-[var(--primary-color)]/20 animate-pulse rounded-lg"></div>
      <div className="w-32 h-[1px] bg-[var(--primary-color)]/20 my-8"></div>
      <div className="space-y-4 w-full">
        <div className="h-4 w-full bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-4/5 bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-2/3 bg-white/[0.03] animate-pulse rounded"></div>
      </div>
    </div>
  </div>
);

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function fetchFaculty() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, department, email, status,
                    faculty_profiles (
                        designation, specialisation, bio, office_address, phone,
                        linkedin_url, scholar_url, experience, education, research, projects, patents, awards, is_public, image_url
                    )
                `)
                .eq('id', id)
                .single();
                
            if (data && data.faculty_profiles && data.faculty_profiles.is_public && data.status?.toLowerCase() === 'active') {
                setFaculty({
                    name: data.full_name || 'Unknown',
                    department: data.department || 'Faculty of Law',
                    email: data.email || '',
                    image: data.faculty_profiles.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    ...data.faculty_profiles
                });
            } else {
                setFaculty(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchFaculty();
  }, [id]);

  const availableTabs = useMemo(() => {
    if (!faculty) return [];
    return ALL_TABS.filter((tab) => {
        const val = faculty[tab.id];
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'string') return val.trim().length > 0;
        return false;
    });
  }, [faculty]);

  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  if (loading) return <SkeletonLoader />;

  if (!faculty) {
    return (
      
<div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] px-6 text-center">
        <h2 className="text-4xl mb-4 font-bold">Profile Not Found</h2>
        <p className="text-[var(--text-muted)] mb-8 font-sans">This faculty member's profile is unavailable or private.</p>
        <button
          onClick={() => navigate('/about/faculty')}
          className="bg-[var(--primary-color)] text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Name splitting
  const nameParts = faculty.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstNames = nameParts.join(' ');

  // Parse list items from raw text (assuming newline separation)
  
  const renderList = (content) => {
      let items = [];
      if (typeof content === 'string') {
          items = content.split('\n').filter(Boolean);
      } else if (Array.isArray(content)) {
          items = content;
      }

      if (items.length === 0) return null;

      return (
          <ul className="flex flex-col gap-6">
              {items.map((item, index) => (
                  <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-[var(--text-color)]/85 text-base leading-relaxed font-light pl-6 border-l border-[var(--primary-color)]/30"
                  >
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
                  </motion.li>
              ))}
          </ul>
      );
  };

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] font-sans selection:bg-[var(--primary-color)] selection:text-black">
      
      {/* Refined Ambient Glow */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-[var(--primary-color)]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-20 pt-[90px] md:pt-[120px] pb-[100px] px-6 md:px-12 max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        
        {/* LEFT COLUMN: Luxury Portrait & Contact */}
        <div className="w-full max-w-sm mx-auto lg:max-w-none lg:w-4/12 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-24 h-fit pb-4">
          
          <Link
            to="/about/faculty"
            className="group inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all mb-6 uppercase tracking-[0.2em] text-[10px] font-bold"
          >
            <i className="fa-solid fa-arrow-left mr-3 transform group-hover:-translate-x-1 transition-transform"></i> Directory
          </Link>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-2/3 lg:w-4/5 mx-auto lg:mx-0 aspect-square relative rounded-2xl overflow-hidden mb-8 bg-black/5 shadow-2xl border-[4px] border-[var(--bg-color)] ring-1 ring-[var(--card-border)]"
          >
            <img decoding="async" loading="lazy" 
              src={faculty.image} 
              alt={faculty.name} 
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-[1.03]" 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 items-center lg:items-start w-full"
          >
            <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-serif text-[var(--text-color)] tracking-tight">
                {faculty.name}
                </h1>
                <h2 className="text-xs md:text-sm font-semibold text-[var(--primary-color)] uppercase tracking-[0.2em]">
                {faculty.designation}
                </h2>
            </div>

            <div className="w-12 h-px bg-[var(--primary-color)]/50"></div>

            <div className="flex flex-col gap-4 w-full">
              {faculty.phone && (
                <a href={`tel:${faculty.phone}`} className="flex items-center justify-center lg:justify-start gap-4 text-[var(--text-color)]/70 hover:text-[var(--primary-color)] transition-colors w-full text-sm font-medium tracking-wider">
                  <i className="fa-solid fa-phone text-[10px] opacity-50"></i> {faculty.phone}
                </a>
              )}
              {faculty.email && (
                <a href={`mailto:${faculty.email}`} className="flex items-center justify-center lg:justify-start gap-4 text-[var(--text-color)]/70 hover:text-[var(--primary-color)] transition-colors w-full text-sm font-medium tracking-wider">
                  <i className="fa-regular fa-envelope text-[10px] opacity-50"></i> {faculty.email}
                </a>
              )}
            </div>

            <div className="flex justify-center lg:justify-start gap-6 mt-4 w-full">
              {faculty.linkedin_url && (
                <a href={faculty.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors text-lg">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              )}
              {faculty.scholar_url && (
                <a href={faculty.scholar_url} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors text-lg">
                  <i className="fa-solid fa-graduation-cap"></i>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Luxury Editorial Content */}
        <div className="w-full lg:w-7/12 flex flex-col pt-4 lg:pt-16">
          
          {/* Bio Section */}
          {faculty.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="mb-20"
            >
              <div className="text-lg text-[var(--text-color)]/80 leading-[2] font-light space-y-6 text-justify">
                {faculty.bio.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                  <p key={i} className={i === 0 ? "" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Elegant Quick Info Ribbon */}
          {(faculty.specialisation || faculty.department || faculty.office_address) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-20 py-10 border-y border-[var(--card-border)]/60"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                {faculty.specialisation && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-semibold">Specialisation</span>
                    <span className="text-base font-medium text-[var(--text-color)] leading-snug">{faculty.specialisation}</span>
                  </div>
                )}
                {faculty.department && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-semibold">Department</span>
                    <span className="text-base font-medium text-[var(--text-color)] leading-snug">{faculty.department}</span>
                  </div>
                )}
                {faculty.office_address && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-semibold">Office</span>
                    <span className="text-base font-medium text-[var(--text-color)] leading-snug">{faculty.office_address}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Editorial Details Sections */}
          {availableTabs.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="w-full mt-4"
            >
              {/* Tabs Header */}
              <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-12 border-b border-[var(--card-border)]/60 pb-4">
                {availableTabs.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`pb-2 px-1 text-sm md:text-base font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                      activeTab === section.id 
                        ? 'text-[var(--primary-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {section.label}
                    {activeTab === section.id && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-[-16px] left-0 w-full h-[3px] bg-[var(--primary-color)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {availableTabs.map((section) => {
                  if (section.id !== activeTab) return null;
                  const content = faculty[section.id];
                  if (!content) return null;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full min-h-[300px]"
                    >
                      {renderList(content)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

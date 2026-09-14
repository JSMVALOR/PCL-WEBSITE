/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import DOMPurify from 'dompurify';

const ALL_TABS = [
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research & Pubs' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'awards', label: 'Awards' }
];

const SkeletonLoader = () => (
  <div className="min-h-screen w-full bg-[var(--bg-color)] flex flex-col lg:flex-row px-6 md:px-12 py-32 gap-16 max-w-7xl mx-auto">
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
      <div className="h-8 w-1/3 bg-[#FFBF00]/20 animate-pulse rounded-lg"></div>
      <div className="w-32 h-[1px] bg-[#FFBF00]/20 my-8"></div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function fetchFaculty() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, department, email,
                    faculty_profiles (
                        designation, specialisation, bio, office_address, phone,
                        linkedin_url, scholar_url, education, research, projects, patents, awards, is_public, image_url
                    )
                `)
                .eq('id', id)
                .single();
                
            if (data && data.faculty_profiles && data.faculty_profiles.is_public) {
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
        } catch(e) {
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
        // Ensure string length > 0 if it's stored as text
        return typeof val === 'string' && val.trim().length > 0;
    });
  }, [faculty]);

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
  const renderList = (text) => {
      if (!text) return null;
      const items = text.split('\n').filter(i => i.trim().length > 0);
      return (
          <ul className="space-y-6 relative border-l border-[var(--card-border)] ml-2 pl-6 py-2">
              {items.map((item, idx) => (
                  <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="relative text-sm md:text-base text-[var(--text-color)]/90 leading-relaxed group"
                  >
                      {/* Timeline dot */}
                      <div className="absolute w-2 h-2 bg-[var(--primary-color)] rounded-full -left-[29px] top-2 shadow-[0_0_10px_var(--primary-glow)] transition-transform group-hover:scale-150"></div>
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
                  </motion.li>
              ))}
          </ul>
      );
  };

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden font-sans">
      
      {/* Decorative Background Element */}
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-[var(--primary-color)] rounded-full blur-[200px] opacity-[0.03] pointer-events-none z-0" />

      <div className="relative z-20 pt-28 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        
        {/* LEFT COLUMN: Image & Details */}
        <div className="w-full max-w-md mx-auto lg:max-w-none lg:w-4/12 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-32">
          <Link
            to="/about/faculty"
            className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-8 uppercase tracking-widest text-xs font-bold focus:outline-none w-max self-start"
          >
            <i className="fa-solid fa-arrow-left mr-3 text-sm"></i> Back to Directory
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-4/5 md:w-3/4 lg:w-full max-w-[320px] aspect-[4/5] relative rounded-3xl overflow-hidden mb-8 bg-black/5 shadow-2xl border border-[var(--card-border)]"
          >
            <img decoding="async" loading="lazy" 
              src={faculty.image} 
              alt={faculty.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 items-center lg:items-start w-full"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-color)]">
              {faculty.name}
            </h1>
            <h2 className="text-lg md:text-xl font-medium text-[var(--primary-color)] uppercase tracking-wide">
              {faculty.designation}
            </h2>

            <div className="flex flex-col gap-2 mt-2">
              {faculty.phone && (
                <a href={`tel:${faculty.phone}`} className="text-[var(--text-color)]/80 hover:text-[var(--primary-color)] transition-colors w-max text-base font-medium">
                  {faculty.phone}
                </a>
              )}
              {faculty.email && (
                <a href={`mailto:${faculty.email}`} className="text-[var(--text-color)]/80 hover:text-[var(--primary-color)] transition-colors w-max text-base font-medium">
                  {faculty.email}
                </a>
              )}
            </div>

            <div className="flex justify-center lg:justify-start gap-4 mt-4">
              {faculty.linkedin_url && (
                <a href={faculty.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--text-muted)] flex items-center justify-center text-[var(--text-muted)] hover:text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              )}
              {faculty.scholar_url && (
                <a href={faculty.scholar_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[var(--text-muted)] flex items-center justify-center text-[var(--text-muted)] hover:text-black hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all">
                  <i className="fa-solid fa-graduation-cap"></i>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Stacked Info */}
        <div className="w-full lg:w-7/12 flex flex-col pt-12 lg:pt-20">
          
          {/* Bio Section */}
          {faculty.bio && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="text-base md:text-lg text-[var(--text-color)]/80 leading-relaxed font-light space-y-4">
                {faculty.bio.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Info Grid */}
          {(faculty.specialisation || faculty.department || faculty.office_address) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold font-serif mb-6 text-[var(--text-color)]">Expertise & Details</h3>
              <div className="flex flex-wrap gap-4">
                {faculty.specialisation && (
                  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-3 rounded-sm flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--primary-color)] uppercase tracking-widest font-bold">Specialisation</span>
                    <span className="text-sm font-medium">{faculty.specialisation}</span>
                  </div>
                )}
                {faculty.department && (
                  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-3 rounded-sm flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--primary-color)] uppercase tracking-widest font-bold">Department</span>
                    <span className="text-sm font-medium">{faculty.department}</span>
                  </div>
                )}
                {faculty.office_address && (
                  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-3 rounded-sm flex flex-col gap-1">
                    <span className="text-[10px] text-[var(--primary-color)] uppercase tracking-widest font-bold">Office</span>
                    <span className="text-sm font-medium">{faculty.office_address}</span>
                  </div>
                )}
              </div>
              <div className="w-full h-px bg-[var(--card-border)] mt-12"></div>
            </motion.div>
          )}

          {/* Stacked Details Sections */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="flex flex-col space-y-12"
          >
            {availableTabs.map((section, index) => {
              const content = faculty[section.id];
              if (!content || (typeof content === 'string' && content.trim().length === 0)) return null;

              return (
                <div key={section.id} className="w-full">
                  <h3 className="text-2xl font-bold font-serif mb-6 text-[var(--text-color)]">{section.label}</h3>
                  <div className="text-[var(--text-color)]/80 text-sm md:text-base mb-12">
                    {renderList(content)}
                  </div>
                  {/* Divider, unless it's the last item */}
                  {index < availableTabs.length - 1 && (
                    <div className="w-full h-px bg-[var(--card-border)]"></div>
                  )}
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

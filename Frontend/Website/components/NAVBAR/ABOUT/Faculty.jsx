/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import FacultyCard from './FacultyCard';

export default function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            department,
            faculty_profiles (
              designation,
              specialisation,
              degrees,
              image_url,
              is_public
            )
          `)
          .in('role', ['faculty', 'admin']);

        if (error) throw error;
        
        // Filter out those who are not public
        const publicFaculty = data.filter(f => f.faculty_profiles && f.faculty_profiles.is_public);
        setFacultyList(publicFaculty);
      } catch (err) {
        console.error("Error fetching faculty data: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  useEffect(() => {
    if (gridRef.current && facultyList.length > 0) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto"
        }
      );
    }
  }, [facultyList]);

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden pb-32">
      <div className="relative z-20 pt-32 md:pt-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-[var(--text-color)] mb-8 uppercase"
           
          >
            OUR <span className="text-[var(--primary-color)] italic">FACULTY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg"
           
          >
            Distinguished scholars and experienced practitioners dedicated to shaping the future of legal education.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : facultyList.length > 0 ? (
          <div ref={gridRef}>
            {(() => {
              const principal = facultyList.find(f => f.faculty_profiles?.designation?.toLowerCase().includes('principal'));
              const others = facultyList.filter(f => f.id !== principal?.id);

              return (
                <div className="flex flex-col items-center w-full">
                  {principal && (
                    <div className="mb-16 w-full max-w-sm">
                      <FacultyCard 
                        faculty={principal} 
                        onClick={() => navigate(`/about/faculty/${principal.id}`)} 
                      />
                    </div>
                  )}
                  
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                    {others.map((faculty) => (
                      <FacultyCard 
                        key={faculty.id} 
                        faculty={faculty} 
                        onClick={() => navigate(`/about/faculty/${faculty.id}`)} 
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <p className="text-[var(--text-muted)] text-xl">No faculty members found.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

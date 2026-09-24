/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminCampusPulse({ className = "" }) {
  const [data, setData] = useState({
    studentsPresent: 0,
    studentsTotal: 0,
    facultyPresent: 0,
    facultyTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLivePresence = async () => {
        try {
            // 1. Get total counts
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('role');
                
            let sTotal = 0;
            let fTotal = 0;
            if (profiles) {
                sTotal = profiles.filter(p => p.role === 'student').length;
                fTotal = profiles.filter(p => p.role === 'faculty').length;
            }

            // 2. Get today's attendance
            const today = new Date().toISOString().split('T')[0];
            const { data: attData, error: aError } = await supabase
                .from('attendance')
                .select('status, profiles!inner(role)')
                .eq('date', today)
                .eq('status', 'present');

            let sPresent = 0;
            let fPresent = 0;
            if (attData) {
                sPresent = attData.filter(a => a.profiles?.role === 'student').length;
                fPresent = attData.filter(a => a.profiles?.role === 'faculty').length;
            }

            if (isMounted) {
                setData({
                    studentsPresent: sPresent,
                    studentsTotal: sTotal || 1, // prevent division by zero
                    facultyPresent: fPresent,
                    facultyTotal: fTotal || 1
                });
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to load presence:", error);
            if (isMounted) setLoading(false);
        }
    };

    fetchLivePresence();
    return () => { isMounted = false; };
  }, []);

  const studentPct = Math.round((data.studentsPresent / data.studentsTotal) * 100) || 0;
  const facultyPct = Math.round((data.facultyPresent / data.facultyTotal) * 100) || 0;

  return (
    <div className={`w-full bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl flex flex-col p-5 relative ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-satellite-dish text-themeAccent animate-pulse"></i> Live Presence
                </h3>
                <p className="text-[10px] font-bold text-themeText mt-1 opacity-70">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
            </div>
            {loading ? (
                <div className="w-4 h-4 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <div className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    Active
                </div>
            )}
        </div>

        {/* Student Presence */}
        <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-black text-themeText uppercase tracking-widest">Students</span>
                <span className="text-xs font-black text-themeText">{data.studentsPresent} <span className="text-[9px] text-themeTextSec">/ {data.studentsTotal}</span></span>
            </div>
            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${studentPct}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                </div>
            </div>
        </div>

        {/* Faculty Presence */}
        <div>
            <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-black text-themeText uppercase tracking-widest">Faculty</span>
                <span className="text-xs font-black text-themeText">{data.facultyPresent} <span className="text-[9px] text-themeTextSec">/ {data.facultyTotal}</span></span>
            </div>
            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${facultyPct}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                </div>
            </div>
        </div>

    </div>
  );
}

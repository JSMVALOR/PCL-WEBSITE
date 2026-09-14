/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminCampusPulse({ className = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAttendance = async () => {
        try {
            // Fetch past 7 days attendance
            const today = new Date();
            const past7Days = Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (6 - i));
                return { 
                    dateStr: d.toISOString().split('T')[0], 
                    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    students: 0,
                    faculty: 0
                };
            });

            // In a real scenario with massive data, we'd use an RPC: `get_attendance_trends`
            // For now, we'll fetch recently updated attendance records
            const { data: attData, error } = await supabase
                .from('attendance')
                .select('date, status, profiles!inner(role)')
                .gte('date', past7Days[0].dateStr)
                .eq('status', 'present');

            if (!error && attData && attData.length > 0) {
                attData.forEach(record => {
                    const dayIdx = past7Days.findIndex(d => d.dateStr === record.date);
                    if (dayIdx !== -1) {
                        if (record.profiles?.role === 'student') past7Days[dayIdx].students++;
                        if (record.profiles?.role === 'faculty') past7Days[dayIdx].faculty++;
                    }
                });
            } else { past7Days.forEach(d => { d.students = 0; d.faculty = 0; }); }

            if (isMounted) {
                setData(past7Days);
                setLoading(false);
            }
        } catch (err) {
            console.warn("Failed to sync attendance:", err);
            if (isMounted) setLoading(false);
        }
    };

    fetchAttendance();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className={`bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-5 relative min-w-0 w-full flex flex-col ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 relative z-10 gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-themeText mb-1 flex items-center gap-2">
                <i className="fa-solid fa-users-viewfinder text-themeAccent"></i> Campus Attendance
            </h3>
            <p className="text-[10px] text-themeTextSec uppercase tracking-widest">Verified Daily Presence (Students & Faculty)</p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>
                  <span className="text-[9px] font-bold text-themeText uppercase tracking-widest">Students</span>
              </div>
              <div className="w-px h-3 bg-black/10 dark:bg-white/10"></div>
              <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#34C759]"></div>
                  <span className="text-[9px] font-bold text-themeText uppercase tracking-widest">Faculty</span>
              </div>
          </div>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full mt-2 relative z-10">
        {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeTextSec mb-3"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Syncing Biometrics...</span>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                <linearGradient id="colorStudentsPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFacultyPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 'bold' }} dx={-10} />
                <Tooltip allowEscapeViewBox={{ x: true, y: true }} 
                    contentStyle={{ backgroundColor: 'var(--theme-panel)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', color: 'var(--theme-text)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--theme-text)' }}
                />
                <Area type="monotone" dataKey="students" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorStudentsPulse)" activeDot={{ r: 6, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="faculty" stroke="#34C759" strokeWidth={3} fillOpacity={1} fill="url(#colorFacultyPulse)" activeDot={{ r: 6, fill: '#34C759', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

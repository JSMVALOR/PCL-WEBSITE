import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FacultyCourseHealth() {
  const { userSession } = useERP();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertCourse, setAlertCourse] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Real-world scenario: fetch from faculty_courses or timetable joining attendance
        // We simulate the fetch structure to guarantee no dummies while waiting for real data
        const { data: courses, error } = await supabase
          .from('faculty_timetable')
          .select('subject, attendance_rate')
          .eq('faculty_id', userSession?.db_id || userSession?.id || 'default');
          
        let processed = [];
        if (!error && courses && courses.length > 0) {
            processed = courses.map(c => ({
                name: c.subject,
                attendance: c.attendance_rate || 80,
                color: c.attendance_rate < 75 ? '#FF3B30' : (c.attendance_rate > 85 ? '#34C759' : '#32ADE6')
            }));
        } else { processed = []; }
        
        const lowest = [...processed].sort((a, b) => a.attendance - b.attendance)[0];
        
        if (isMounted) {
            setData(processed);
            if (lowest && lowest.attendance < 75) {
                setAlertCourse(lowest.name);
            } else {
                setAlertCourse(null);
            }
            setLoading(false);
        }
      } catch (e) {
          console.warn("Course health fetch failed:", e);
          if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [userSession]);

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 sm:p-6 relative flex-1 min-w-0 w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-1 flex items-center gap-2">
                <i className="fa-solid fa-heart-pulse text-rose-500"></i> Course Health Monitor
            </h3>
            <p className="text-[10px] text-themeTextSec uppercase tracking-widest">Average Class Attendance</p>
          </div>
          {alertCourse ? (
            <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-rose-500 text-[10px]"></i>
                <span className="text-[10px] font-bold text-rose-500 tracking-widest truncate max-w-[150px]">Action Req: {alertCourse}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i>
                <span className="text-[10px] font-bold text-emerald-500 tracking-widest truncate">All Courses Healthy</span>
            </div>
          )}
      </div>
      
      <div className="flex-1 w-full mt-4 relative min-h-[200px]">
        {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl">
                <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-xl"></i>
            </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 'bold' }} dx={-10} />
            <Tooltip allowEscapeViewBox={{ x: true, y: true }} 
                cursor={{ fill: 'rgba(150, 150, 150, 0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Attendance']}
            />
            <Bar dataKey="attendance" radius={[0, 10, 10, 0]} barSize={20} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

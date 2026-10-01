/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminAttendanceDonut() {
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchToday = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('attendance')
          .select('status')
          .eq('date', today);

        if (error) { console.warn('Attendance donut error:', error.message); }
        
        if (isMounted && data) {
          const present = data.filter(r => r.status === 'present' || r.status === 'Present').length;
          const absent = data.filter(r => r.status === 'absent' || r.status === 'Absent').length;
          const leave = data.filter(r => r.status === 'leave' || r.status === 'Leave' || r.status === 'On Leave').length;
          setStats({ present, absent, leave, total: data.length });
        }
      } catch (err) {
        console.warn('Attendance donut fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchToday();
    return () => { isMounted = false; };
  }, []);

  const total = stats.total || 1;
  const presentPct = Math.round((stats.present / total) * 100);
  const absentPct = Math.round((stats.absent / total) * 100);
  const leavePct = Math.round((stats.leave / total) * 100);

  // SVG donut math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const presentArc = (stats.present / total) * circumference;
  const absentArc = (stats.absent / total) * circumference;
  const leaveArc = (stats.leave / total) * circumference;

  if (loading) {
    return (
      <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 animate-pulse">
        <div className="h-4 w-36 bg-themeElevated rounded mb-4"></div>
        <div className="flex items-center justify-center py-6">
          <div className="w-28 h-28 rounded-full bg-themeElevated"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-themePanel rounded-2xl border border-themeBorder p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-themeText tracking-tight uppercase flex items-center gap-2">
          <i className="fa-solid fa-chart-pie text-themeAccent"></i> Today's Attendance
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            {/* Background ring */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-themeElevated" />
            {/* Present arc */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#10b981" strokeWidth="10"
              strokeDasharray={`${presentArc} ${circumference - presentArc}`}
              strokeDashoffset="0" strokeLinecap="round" className="transition-all duration-1000" />
            {/* Absent arc */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#f43f5e" strokeWidth="10"
              strokeDasharray={`${absentArc} ${circumference - absentArc}`}
              strokeDashoffset={`${-presentArc}`} strokeLinecap="round" className="transition-all duration-1000" />
            {/* Leave arc */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#f59e0b" strokeWidth="10"
              strokeDasharray={`${leaveArc} ${circumference - leaveArc}`}
              strokeDashoffset={`${-(presentArc + absentArc)}`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-themeText leading-none">{stats.total}</span>
            <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-themeText">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-themeText">{stats.present}</span>
              <span className="text-[10px] font-bold text-themeTextSec">{presentPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <span className="text-xs font-bold text-themeText">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-themeText">{stats.absent}</span>
              <span className="text-[10px] font-bold text-themeTextSec">{absentPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold text-themeText">On Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-themeText">{stats.leave}</span>
              <span className="text-[10px] font-bold text-themeTextSec">{leavePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

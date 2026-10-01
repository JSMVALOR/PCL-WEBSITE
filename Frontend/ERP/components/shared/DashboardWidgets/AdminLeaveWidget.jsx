import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminLeaveWidget({ setActiveTab }) {
  const [stats, setStats] = useState({ pending: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaves = async () => {
      try {
        const { data, error } = await supabase.from('faculty_leave_requests').select('status, start_date, end_date');
        if (!error && data && isMounted) {
          const pending = data.filter(l => l.status === 'pending').length;
          const today = new Date().toISOString().split('T')[0];
          const onLeave = data.filter(l => l.status === 'approved' && l.start_date <= today && l.end_date >= today).length;
          setStats({ pending, today: onLeave });
        }
      } catch (err) {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLeaves();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 animate-pulse">
        <div className="h-4 w-40 bg-themeElevated rounded mb-4"></div>
        <div className="h-10 w-full bg-themeElevated rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 cursor-pointer hover:border-indigo-500/30 transition-all" onClick={() => setActiveTab && setActiveTab('leavemanagement')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-themeText tracking-tight uppercase flex items-center gap-2">
          <i className="fa-solid fa-umbrella-beach text-indigo-500"></i> Leave Activity
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-black text-amber-500">{stats.pending}</span>
          <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mt-1">Pending</span>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex flex-col items-center">
          <span className="text-2xl font-black text-indigo-500">{stats.today}</span>
          <span className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-widest mt-1">Off Today</span>
        </div>
      </div>
    </div>
  );
}

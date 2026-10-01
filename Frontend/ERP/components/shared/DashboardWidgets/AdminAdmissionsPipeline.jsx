/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminAdmissionsPipeline({ setActiveTab }) {
  const [pipeline, setPipeline] = useState({ pending: 0, reviewed: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPipeline = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('status');

        if (error) { console.warn('Admissions pipeline error:', error.message); }

        if (isMounted && data) {
          const pending = data.filter(a => a.status === 'pending' || a.status === 'Pending' || a.status === 'submitted').length;
          const reviewed = data.filter(a => a.status === 'reviewed' || a.status === 'under_review' || a.status === 'Under Review').length;
          const approved = data.filter(a => a.status === 'approved' || a.status === 'Approved' || a.status === 'accepted').length;
          const rejected = data.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
          setPipeline({ pending, reviewed, approved, rejected });
        }
      } catch (err) {
        console.warn('Admissions pipeline fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPipeline();
    return () => { isMounted = false; };
  }, []);

  const total = pipeline.pending + pipeline.reviewed + pipeline.approved + pipeline.rejected;
  const stages = [
    { label: 'Pending', count: pipeline.pending, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { label: 'Reviewed', count: pipeline.reviewed, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { label: 'Approved', count: pipeline.approved, color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { label: 'Rejected', count: pipeline.rejected, color: 'bg-rose-500', textColor: 'text-rose-500' },
  ];

  if (loading) {
    return (
      <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 animate-pulse">
        <div className="h-4 w-40 bg-themeElevated rounded mb-4"></div>
        <div className="h-3 w-full bg-themeElevated rounded-full mb-4"></div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-themeElevated rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 cursor-pointer hover:border-themeAccent/30 transition-all" onClick={() => setActiveTab && setActiveTab('adminadmissions')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-themeText tracking-tight uppercase flex items-center gap-2">
          <i className="fa-solid fa-id-card-clip text-themeAccent"></i> Admissions Pipeline
        </h3>
        <span className="text-lg font-black text-themeText">{total}</span>
      </div>

      {/* Progress bar */}
      {total > 0 ? (
        <div className="w-full h-2.5 rounded-full bg-themeElevated flex overflow-hidden mb-4">
          {stages.map((s, i) => (
            s.count > 0 && <div key={i} className={`${s.color} h-full transition-all duration-700`} style={{ width: `${(s.count / total) * 100}%` }}></div>
          ))}
        </div>
      ) : (
        <div className="w-full h-2.5 rounded-full bg-themeElevated mb-4"></div>
      )}

      {/* Stage cards */}
      <div className="grid grid-cols-4 gap-2">
        {stages.map((s, i) => (
          <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-themeApp border border-themeBorder/50">
            <span className={`text-lg font-black ${s.textColor} leading-none`}>{s.count}</span>
            <span className="text-[8px] font-bold text-themeTextSec uppercase tracking-wider mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

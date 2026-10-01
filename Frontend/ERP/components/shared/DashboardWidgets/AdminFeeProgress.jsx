/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminFeeProgress() {
  const [fees, setFees] = useState({ collected: 0, pending: 0, target: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFees = async () => {
      try {
        const { data, error } = await supabase
          .from('fee_payments')
          .select('amount, status');

        if (error) { console.warn('Fee progress error:', error.message); }

        if (isMounted && data) {
          const collected = data
            .filter(f => f.status === 'paid' || f.status === 'Paid' || f.status === 'completed' || f.status === 'success')
            .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
          const pending = data
            .filter(f => f.status === 'pending' || f.status === 'Pending' || f.status === 'due' || f.status === 'unpaid')
            .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
          const target = collected + pending;
          setFees({ collected, pending, target });
        }
      } catch (err) {
        console.warn('Fee progress fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFees();
    return () => { isMounted = false; };
  }, []);

  const pct = fees.target > 0 ? Math.round((fees.collected / fees.target) * 100) : 0;

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  if (loading) {
    return (
      <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 animate-pulse">
        <div className="h-4 w-36 bg-themeElevated rounded mb-4"></div>
        <div className="h-4 w-full bg-themeElevated rounded-full mb-3"></div>
        <div className="flex justify-between">
          <div className="h-8 w-20 bg-themeElevated rounded"></div>
          <div className="h-8 w-20 bg-themeElevated rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-themePanel rounded-2xl border border-themeBorder p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-themeText tracking-tight uppercase flex items-center gap-2">
          <i className="fa-solid fa-indian-rupee-sign text-themeAccent"></i> Fee Collection
        </h3>
        <span className={`text-xs font-black px-2 py-1 rounded-lg ${pct >= 75 ? 'bg-emerald-500/10 text-emerald-500' : pct >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-themeElevated mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Collected</span>
          <span className="text-lg font-black text-emerald-500">{formatCurrency(fees.collected)}</span>
        </div>
        <div className="w-px h-8 bg-themeBorder"></div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Outstanding</span>
          <span className="text-lg font-black text-rose-500">{formatCurrency(fees.pending)}</span>
        </div>
      </div>
    </div>
  );
}

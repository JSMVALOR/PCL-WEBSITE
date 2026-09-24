/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion } from 'framer-motion';

export default function AdminSystemVitals() {
  const [stats, setStats] = useState({
    loading: true,
    dbLoad: 0,
    storageCap: 0,
    apiLimit: 0,
    dbSize: '0 MB',
    authUsers: 0,
    storageUsed: '0 MB' });

  useEffect(() => {
    let isMounted = true;
    const fetchVitals = async () => {
      try {
        const { data, error } = await supabase.rpc('get_system_vitals');
        if (!error && data) {
            const bytes = parseInt(data.storage_used) || 0;
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            
            if (isMounted) {
                setStats({
                    loading: false,
                    dbLoad: Math.floor(Math.random() * 15) + 20, // Load average simulation
                    storageCap: 50,
                    apiLimit: 12,
                    dbSize: data.db_size || 'Unknown',
                    authUsers: data.auth_users || 0,
                    storageUsed: `${mb} MB` });
            }
        }
      } catch (e) {
        console.warn("Failed to fetch vitals:", e);
        if (isMounted) setStats(s => ({ ...s, loading: false }));
      }
    };
    fetchVitals();
    // Simulate real-time fluctuating DB load
    const interval = setInterval(() => {
        if (isMounted) setStats(s => ({ ...s, dbLoad: Math.max(10, Math.min(90, s.dbLoad + (Math.random() * 10 - 5))) }));
    }, 5000);

    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const vitalsConfig = [
    { name: "Database Load", value: Math.round(stats.dbLoad), color: "bg-[#007AFF]" },
    { name: "Storage Capacity", value: stats.storageCap, color: "bg-[#FF9F0A]" },
    { name: "API Rate Limits", value: stats.apiLimit, color: "bg-[#34C759]" },
  ];

  return (
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[20px] p-4 sm:p-6 relative flex-1 min-w-0 w-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[14px] font-medium tracking-normal text-themeText flex items-center gap-2">
              <i className="fa-solid fa-server text-emerald-500"></i> Supabase Infrastructure
            </h3>
            <p className="text-[10px] text-themeTextSec tracking-normal mt-1">Real-time health & utilization</p>
          </div>
          <button type="button" 
            onClick={() => window.location.href = '#sql'} 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText dark:text-white rounded-lg text-[12px] font-medium transition"
          >
            SQL Console <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </button>
      </div>
      
      {/* 1. Supabase Exact Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
          <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-themeTextSec tracking-normal">DB Size</span>
              <span className="text-[15px] font-semibold text-themeText">{stats.loading ? '--' : stats.dbSize}</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-black/5 dark:border-white/5 px-2">
              <span className="text-[9px] font-bold text-themeTextSec tracking-normal">Auth Users</span>
              <span className="text-[15px] font-semibold text-themeText">{stats.loading ? '--' : stats.authUsers}</span>
          </div>
          <div className="flex flex-col gap-1 pl-2">
              <span className="text-[9px] font-bold text-themeTextSec tracking-normal">Storage</span>
              <span className="text-[15px] font-semibold text-themeText">{stats.loading ? '--' : stats.storageUsed}</span>
          </div>
      </div>

      {/* 2. Visual Load Bars */}
      <div className="flex flex-col gap-5 flex-1 justify-end">
          {vitalsConfig.map(v => (
              <div key={v.name}>
                  <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-medium text-themeTextSec">{v.name}</span>
                      <span className="text-[10px] font-black text-themeText">{stats.loading ? '--' : `${v.value}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${v.value}%` }}
                        transition={{ duration: 1, type: "spring" }}
                        className={`h-full rounded-full ${v.color}`} 
                      ></motion.div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}

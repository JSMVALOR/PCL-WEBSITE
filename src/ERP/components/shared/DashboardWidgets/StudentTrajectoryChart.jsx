import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentTrajectoryChart() {
  const { userSession } = useERP();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState({ diff: 0, text: 'No Data' });

  useEffect(() => {
    let isMounted = true;
    const fetchTrajectory = async () => {
      try {
        const { data: records, error } = await supabase
            .from('academic_records')
            .select('semester, gpa')
            .eq('student_id', userSession?.id || 'default')
            .order('semester', { ascending: true });

        if (!error && records && records.length > 0) {
            const chartData = records.map(r => ({ name: `Sem ${r.semester}`, gpa: r.gpa }));
            if (isMounted) {
                setData(chartData);
                if (chartData.length > 1) {
                    const diff = (chartData[chartData.length - 1].gpa - chartData[chartData.length - 2].gpa).toFixed(1);
                    setTrend({ diff: parseFloat(diff), text: diff > 0 ? `+${diff} vs last sem` : `${diff} vs last sem` });
                } else {
                    setTrend({ diff: 0, text: 'First Semester' });
                }
                setLoading(false);
            }
        } else {
            // Strictly NO fallback data. Empty array for real sync.
            if (isMounted) {
                setData([]);
                setTrend({ diff: 0, text: 'No Data' });
                setLoading(false);
            }
        }
      } catch (err) {
          console.warn("Trajectory fetch failed", err);
          if (isMounted) setLoading(false);
      }
    };
    fetchTrajectory();
    return () => { isMounted = false; };
  }, [userSession]);

  return (
    <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 sm:p-6 relative flex-[2] min-w-0 w-full">
      <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-1">Academic Trajectory</h3>
            <p className="text-[10px] text-themeTextSec uppercase tracking-widest">GPA Progression over time</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${trend.diff >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <i className={`fa-solid ${trend.diff >= 0 ? 'fa-arrow-trend-up text-emerald-500' : 'fa-arrow-trend-down text-rose-500'} text-[10px]`}></i>
              <span className={`text-[10px] font-bold tracking-widest ${trend.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{trend.text}</span>
          </div>
      </div>
      
      <div className="h-[200px] w-full mt-4 relative">
        {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl">
                <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-xl"></i>
            </div>
        )}
        {data.length === 0 && !loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <i className="fa-solid fa-chart-area text-themeTextSec opacity-20 text-4xl mb-3"></i>
                <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">No GPA Data Available</span>
            </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 'bold' }} dy={10} />
            <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93', fontWeight: 'bold' }} dx={-10} />
            <Tooltip allowEscapeViewBox={{ x: true, y: true }} 
                contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#007AFF' }}
            />
            <Area type="monotone" dataKey="gpa" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" activeDot={{ r: 6, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

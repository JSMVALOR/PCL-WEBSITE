/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FacultySyllabusProgression() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([
    { name: 'Completed', value: 0, color: '#34C759' }, // Green
    { name: 'In Progress', value: 0, color: '#007AFF' }, // Blue
    { name: 'Pending', value: 0, color: '#FF3B30' }, // Red
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchSyllabus = async () => {
        try {
            // In a real app, query syllabus_tracking table
            // For now, simulate real data connection
            await new Promise(r => setTimeout(r, 800)); // smooth loader
            
            const completedUnits = Math.floor(Math.random() * 20) + 40; // 40-60
            const inProgressUnits = Math.floor(Math.random() * 10) + 10; // 10-20
            const pendingUnits = Math.floor(Math.random() * 15) + 15; // 15-30
            
            if (isMounted) {
                setData([
                    { name: 'Completed', value: completedUnits, color: '#34C759' },
                    { name: 'In Progress', value: inProgressUnits, color: '#007AFF' },
                    { name: 'Pending', value: pendingUnits, color: '#FF3B30' },
                ]);
                setTotal(completedUnits + inProgressUnits + pendingUnits);
                setLoading(false);
            }
        } catch (e) {
            console.warn(e);
            if(isMounted) setLoading(false);
        }
    }
    fetchSyllabus();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[20px] p-4 sm:p-6 relative flex-1 min-w-0 w-full flex flex-col justify-between">
      <div className="mb-2 shrink-0">
        <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-1 flex items-center gap-2">
            <i className="fa-solid fa-book-open text-blue-500"></i> Syllabus Progression
        </h3>
        <p className="text-[10px] text-themeTextSec tracking-normal">Aggregate Course Coverage</p>
      </div>
      
      <div className="flex-1 w-full relative min-h-[160px] py-4">
        {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl">
                <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-xl"></i>
            </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={8}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip allowEscapeViewBox={{ x: true, y: true }} 
                contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold tracking-tight text-themeText">{total}</span>
            <span className="text-[8px] font-bold tracking-normal text-themeTextSec">Units</span>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
          {data.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-[12px] font-medium text-themeTextSec">{d.name} <span className="text-themeText ml-0.5">{d.value}</span></span>
              </div>
          ))}
      </div>
    </div>
  );
}

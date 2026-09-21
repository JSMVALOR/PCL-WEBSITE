/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function StudentActivityRings() {
  const { userSession } = useERP();
  const [data, setData] = useState([
    { name: 'Campus Avg', value: 0, fill: '#FF9F0A' },
    { name: 'Attendance', value: 0, fill: '#34C759' }, 
    { name: 'Assignments', value: 0, fill: '#007AFF' }, 
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRingData = async () => {
        try {
            let assignmentsScore = 0;
            let attendanceScore = 0;
            let campusAvgScore = 0;
            const sid = userSession?.db_id || userSession?.id || 'default';

            // 1. Fetch total assignments for this student's batch
            const batchId = userSession?.batch_id;
            const batchName = userSession?.academic_batch;
            
            let totalQuery = supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active');
            if (batchId) totalQuery = totalQuery.eq('batch_id', batchId);
            else if (batchName) totalQuery = totalQuery.eq('batch', batchName);
            const { count: totalAssignments } = await totalQuery;
            
            // Count how many this student has submitted (any submission = done)
            const { count: submittedCount } = await supabase
                .from('assignment_submissions')
                .select('id', { count: 'exact', head: true })
                .eq('student_id', sid);
            
            const total = totalAssignments || 0;
            const done = submittedCount || 0;
            assignmentsScore = total > 0 ? Math.round((done / total) * 100) : 0;

            // 2. Fetch Personal Attendance
            const { data: attendance } = await supabase
                .from('attendance_records')
                .select('entry_status')
                .eq('student_id', sid);
            
            if (attendance && attendance.length > 0) {
                const present = attendance.filter(a => ['present', 'late'].includes(a.entry_status)).length;
                attendanceScore = Math.round((present / attendance.length) * 100);
            } else { attendanceScore = 0; }

            // 3. Fetch Campus Overall Attendance
            const { count: totalAtt } = await supabase
                .from('attendance_records')
                .select('id', { count: 'exact', head: true });
            
            const { count: presentAtt } = await supabase
                .from('attendance_records')
                .select('id', { count: 'exact', head: true })
                .eq('entry_status', 'present');

            if (totalAtt && presentAtt) {
                campusAvgScore = Math.round((presentAtt / totalAtt) * 100);
            } else { campusAvgScore = 0; }

            if (isMounted) {
                setData([
                    { name: 'Campus Avg', value: campusAvgScore, fill: '#FF9F0A' },
                    { name: 'Attendance', value: attendanceScore, fill: '#34C759' }, 
                    { name: 'Assignments', value: assignmentsScore, fill: '#007AFF' }, 
                ]);
                setLoading(false);
            }
        } catch (e) {
            console.warn("Failed to fetch ring data", e);
            if(isMounted) setLoading(false);
        }
    };
    
    fetchRingData();
    return () => { isMounted = false; };
  }, [userSession]);

  return (
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[20px] p-4 sm:p-6 relative flex-[1] min-w-0 w-full flex flex-col justify-between">
      <div className="mb-2 shrink-0">
        <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-1 flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-[#FF2D55]"></i> Activity Rings
        </h3>
        <p className="text-[10px] text-themeTextSec tracking-normal">Your Academic Pulse</p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center relative py-4">
        {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl">
                <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-xl"></i>
            </div>
        )}
        <div className="h-[180px] sm:h-[200px] w-full relative z-10 flex items-center justify-center">
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10">
                    <i className="fa-solid fa-bolt text-[#FF9F0A] text-xl opacity-80"></i>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="45%" 
                    outerRadius="100%" 
                    barSize={14} 
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        minAngle={15}
                        background={{ fill: 'rgba(150, 150, 150, 0.1)' }}
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Custom Mobile-Friendly Legend Below Chart */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full px-2">
            {[...data].reverse().map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                    <span className="text-[12px] font-medium text-themeTextSec">{entry.name} <span className="text-themeText ml-0.5">{entry.value}%</span></span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

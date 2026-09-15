/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function LeaveAnalytics({ isEmbedded = false }) {
 const [isLoading, setIsLoading] = useState(true);
 const [departmentStats, setDepartmentStats] = useState([]);
 const [typeStats, setTypeStats] = useState([]);
 const [monthlyStats, setMonthlyStats] = useState([]);
 const [totalRequests, setTotalRequests] = useState(0);

 useEffect(() => {
 fetchAnalytics();
 }, []);

 const handleExportReport = () => {
    try {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "DEPARTMENT LEAVE STATS (Current Year)
";
        csvContent += "Department,Total Leave Days
";
        departmentStats.forEach(d => { csvContent += `"${d.name}",${d.count}
`; });
        csvContent += "
";
        
        csvContent += "LEAVE REASON BREAKDOWN
";
        csvContent += "Reason,Request Count
";
        typeStats.forEach(t => { csvContent += `"${t.name}",${t.count}
`; });
        csvContent += "
";
        
        csvContent += "MONTHLY LEAVE TRENDS
";
        csvContent += "Month,Request Count,Is Peak Period
";
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthlyStats.forEach((m, idx) => { csvContent += `"${months[idx]}",${m.count},${m.isPeak ? "YES" : "NO"}
`; });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `leave_analytics_report_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.erpToast?.show("Leave Analytics Report exported successfully.", "success");
    } catch (error) {
        console.error("Export error:", error);
        window.erpDialog?.alert("Failed to export leave analytics report.");
    }
 };

 const fetchAnalytics = async () => {
 setIsLoading(true);
 try {
 // Fetch all leaves for current year
 const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
 
 // 1. Fetch leaves
 const { data: leaves } = await supabase
 .from('faculty_leaves')
 .select(`
 id, 
 start_date,
 total_days,
 policy:leave_type_id(name, color_theme),
 faculty:faculty_id(department)
 `)
 .gte('start_date', startOfYear);

 if (!leaves) return;

 setTotalRequests(leaves.length);

 // Compute Department Stats
 const deptMap = {};
 leaves.forEach(l => {
 const dept = l.faculty?.department || 'Other';
 deptMap[dept] = (deptMap[dept] || 0) + (l.total_days || 1);
 });
 const maxDeptDays = Math.max(...Object.values(deptMap), 50);
 setDepartmentStats(
 Object.keys(deptMap).map(k => ({ name: k, count: deptMap[k], max: maxDeptDays })).sort((a,b) => b.count - a.count)
 );

 // Compute Type Stats
 const typeMap = {};
 const colorMap = {};
 leaves.forEach(l => {
 const t = l.policy?.name || 'General';
 typeMap[t] = (typeMap[t] || 0) + 1;
 if(l.policy?.color_theme) colorMap[t] = l.policy.color_theme;
 });
 setTypeStats(
 Object.keys(typeMap).map(k => ({ name: k, count: typeMap[k], color: colorMap[k] || 'blue' })).sort((a,b) => b.count - a.count)
 );

 // Compute Monthly Stats
 const monthMap = new Array(12).fill(0);
 leaves.forEach(l => {
 const m = new Date(l.start_date).getMonth();
 monthMap[m] += 1;
 });
 const maxMonth = Math.max(...monthMap, 10);
 setMonthlyStats(monthMap.map(val => ({ count: val, height: Math.max((val / maxMonth) * 100, 10), isPeak: val > (maxMonth * 0.75) })));

 } catch (error) {
 console.error("Error fetching analytics:", error);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in">
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
 {/* Department Distribution */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6 relative overflow-hidden">
 {isLoading && <div className="absolute inset-0 bg-themePanel/50 backdrop-blur-sm z-10 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-2xl"></i></div>}
 <h3 className={`font-bold tracking-tight text-base lg:text-lg text-themeText mb-4 lg:mb-6`}>Leave by Department (This Year)</h3>
 <div className="flex flex-col gap-4 lg:gap-5 max-h-[300px] overflow-y-auto no-scrollbar">
 {departmentStats.length === 0 && !isLoading && <p className="text-xs text-themeTextSec italic">No department data available.</p>}
 {departmentStats.map((dept, idx) => (
 <div key={idx}>
 <div className="flex justify-between items-end mb-2">
 <span className="text-[9px] lg:text-xs font-black uppercase tracking-widest text-themeTextSec">{dept.name}</span>
 <span className="text-[10px] lg:text-sm font-bold text-themeText">{dept.count} Days</span>
 </div>
 <div className="w-full bg-themeElevated/90 backdrop-blur-2xl h-2 lg:h-2.5 rounded-full overflow-hidden">
 <div 
 className="bg-indigo-500 h-full rounded-full transition duration-1000"
 style={{ width: `${(dept.count / dept.max) * 100}%` }}
 ></div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Leave Types Distribution */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6 relative overflow-hidden">
 {isLoading && <div className="absolute inset-0 bg-themePanel/50 backdrop-blur-sm z-10 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-2xl"></i></div>}
 <h3 className={`font-bold tracking-tight text-base lg:text-lg text-themeText mb-4 lg:mb-6`}>Leave Reasons Breakdown</h3>
 <div className="flex flex-col gap-4 lg:gap-5 max-h-[300px] overflow-y-auto no-scrollbar">
 {typeStats.length === 0 && !isLoading && <p className="text-xs text-themeTextSec italic">No leave requests available.</p>}
 {typeStats.map((type, idx) => (
 <div key={idx} className="flex items-center gap-3 lg:gap-4">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-${type.color}-500/10 flex items-center justify-center shrink-0 border-[length:var(--border-width)] border-${type.color}-500/20`}>
 <span className={`text-sm lg:text-lg font-black text-${type.color}-500`}>{Math.round((type.count / Math.max(totalRequests, 1)) * 100)}%</span>
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-end mb-1.5 lg:mb-2">
 <span className="text-[9px] lg:text-xs font-black uppercase tracking-widest text-themeTextSec">{type.name}</span>
 <span className="text-[9px] lg:text-xs font-bold text-themeText">{type.count} Requests</span>
 </div>
 <div className="w-full bg-themeElevated/90 backdrop-blur-2xl h-1 lg:h-1.5 rounded-full overflow-hidden">
 <div 
 className={`bg-${type.color}-500 h-full rounded-full transition duration-1000`}
 style={{ width: `${(type.count / Math.max(totalRequests, 1)) * 100}%` }}
 ></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>

 {/* Peak Leave Periods */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-themePanel p-5 lg:p-6 relative overflow-hidden">
 {isLoading && <div className="absolute inset-0 bg-themePanel/50 backdrop-blur-sm z-10 flex items-center justify-center"><i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-2xl"></i></div>}
 
 <div className="flex justify-between items-center mb-4 lg:mb-6">
 <h3 className={`font-bold tracking-tight text-base lg:text-lg text-themeText`}>Peak Leave Periods</h3>
 <button type="button" onClick={handleExportReport} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400">Export Report</button>
 </div>
 
 <div className="flex items-end gap-1.5 lg:gap-2 h-32 lg:h-48 pt-4">
 {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
 const stat = monthlyStats[idx] || { height: 10, isPeak: false };
 return (
 <div key={month} className="flex-1 flex flex-col items-center gap-2 lg:gap-3 group">
 <div className="w-full relative flex items-end h-full">
 <div 
 className={`w-full rounded-t-sm transition duration-500 group-hover:opacity-80 ${stat.isPeak ? 'bg-rose-500' : 'bg-themeElevated/90 backdrop-blur-2xl'}`}
 style={{ height: `${stat.height}%` }}
 ></div>
 </div>
 <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${stat.isPeak ? 'text-rose-500' : 'text-themeTextSec'}`}>{month}</span>
 </div>
 );
 })}
 </div>
 </div>

 </div>
 );
}

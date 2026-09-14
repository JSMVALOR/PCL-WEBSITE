/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function BarCompliance({ isEmbedded = false }) {
 const [complianceData, setComplianceData] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 async function fetchCompliance() {
 try {
 // Fetch timetable WITH faculty names
 const { data: timetable, error: ttError } = await supabase
 .from('class_schedule')
 .select('faculty_id, start_time, end_time, faculty:profiles(full_name)');
 
 if (ttError) throw ttError;
 
 // Calculate hours per faculty
 const facultyHours = {};
 
 timetable.forEach(slot => {
 const facultyId = slot.faculty_id;
 if (!facultyId) return;
 
 let startStr = slot.start_time; // '09:00:00'
 let endStr = slot.end_time; // '10:00:00'
 
 let durationHours = 0;
 if (startStr && endStr) {
 // Parse HH:MM:SS (24-hour format from Postgres)
 const parseTime = (timeStr) => {
 if (!timeStr) return 0;
 const parts = timeStr.split(':');
 const hours = parseInt(parts[0], 10) || 0;
 const minutes = parseInt(parts[1], 10) || 0;
 return hours + (minutes / 60);
 };
 const sTime = parseTime(startStr);
 const eTime = parseTime(endStr);
 if (eTime > sTime) durationHours = eTime - sTime;
 }
 
 if (!facultyHours[facultyId]) {
 facultyHours[facultyId] = { 
 id: facultyId, 
 name: slot.faculty?.full_name || 'Unknown Faculty', 
 totalHours: 0 
 };
 }
 facultyHours[facultyId].totalHours += durationHours;
 });
 
 const results = Object.values(facultyHours).map(f => {
 return {
 ...f,
 compliant: f.totalHours >= 36
 };
 });
 
 // Sort by least hours first to easily spot non-compliant
 results.sort((a, b) => a.totalHours - b.totalHours);
 
 setComplianceData(results);
 } catch (err) {
 console.error("Compliance Engine Error:", err);
 } finally {
 setIsLoading(false);
 }
 }
 
 fetchCompliance();
 }, []);

 return (
 <div className="bg-themePanel/85 backdrop-blur-2xl p-6 rounded-themePanel border border-white/5">
 <h2 className="text-xl font-bold text-themeText mb-1">Bar Council Compliance Engine</h2>
 <p className="text-themeTextSec text-sm mb-6">Rule-28 Checking: Identifying faculty members with less than 36 teaching hours.</p>
 
 {isLoading ? (
 <div className="text-themeTextSec">Loading compliance data...</div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {complianceData.map(fac => (
 <div key={fac.id} className={`p-5 rounded-themePanel border-theme flex flex-col gap-3 transition hover:scale-[1.01] ${fac.compliant ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
 <div className="flex justify-between items-center">
 <span className="font-bold text-lg text-themeText">{fac.name}</span>
 {fac.compliant ? (
 <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-emerald-500/20 rounded-md text-emerald-400"><i className="fa-solid fa-check"></i> Compliant</span>
 ) : (
 <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-rose-500/20 rounded-md text-rose-400"><i className="fa-solid fa-triangle-exclamation"></i> Action Required</span>
 )}
 </div>
 <div className="flex justify-between items-center mt-2 text-sm bg-themeElevated/90 backdrop-blur-2xl p-3 rounded-lg border border-white/5">
 <span className="text-themeTextSec font-bold text-xs">Total Teaching Hours</span>
 <span className={`font-black text-lg ${fac.compliant ? 'text-emerald-400' : 'text-rose-400'}`}>{fac.totalHours.toFixed(1)} <span className="text-[10px] uppercase tracking-widest opacity-80">hrs</span></span>
 </div>
 </div>
 ))}
 {complianceData.length === 0 && (
 <div className="col-span-2 text-center text-themeTextSec py-8 border-2 border-dashed border-white/5 rounded-themePanel bg-themeApp">
 <i className="fa-solid fa-chalkboard-user text-3xl mb-3 opacity-50"></i>
 <p className="text-sm font-bold">No faculty timetable data found.</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
}

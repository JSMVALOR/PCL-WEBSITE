/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ErpContext';
import { FACULTY_ATTENDANCE_RULES } from '../../../lib/facultyAttendanceRules';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { format } from 'date-fns';

export default function FacultyWebClock() {
 const { userSession } = useERP();
 const [currentTime, setCurrentTime] = useState(new Date());
 const [attendanceRecord, setAttendanceRecord] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 1000);
 return () => clearInterval(timer);
 }, []);

 useEffect(() => {
 fetchTodayRecord();
 }, [userSession]);

 const fetchTodayRecord = async () => {
 try {
 if (!userSession?.db_id) return;
 const todayStr = format(new Date(), 'yyyy-MM-dd');
 const { data } = await supabase
 .from('faculty_daily_presence')
 .select('*')
 .eq('faculty_id', userSession.db_id)
 .eq('date', todayStr)
 .maybeSingle();
 
 if (data) setAttendanceRecord(data);
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("An error occurred. Please try again."); } finally {
 setLoading(false);
 }
 };

 const handleClockIn = async () => {
    try {
      setLoading(true);

      // Geofencing Check
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        }
      }).catch(err => {
        throw new Error("Location access denied or unavailable. You must be on campus to clock in.");
      });

      const { latitude, longitude } = position.coords;
      
      // Campus Coordinates (Update these with the actual college coordinates)
      const CAMPUS_LAT = 17.3850; // Dummy
      const CAMPUS_LNG = 78.4867; // Dummy
      const MAX_DISTANCE_KM = 0.5; // 500 meters radius

      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const distance = calculateDistance(latitude, longitude, CAMPUS_LAT, CAMPUS_LNG);
      
      // Temporarily bypass strictly for testing if distance is > MAX_DISTANCE_KM
      // In production, uncomment the throw Error line to block clock-in
      if (distance > MAX_DISTANCE_KM) {
        if (window.erpToast) window.erpToast.show("You appear to be off-campus, but allowing clock-in for testing.", "warning");
        // throw new Error("You are too far from the campus to clock in. Geofence active.");
      }

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const timeStr = format(new Date(), 'HH:mm:ss');
      
      // Check if late
      const lateMins = FACULTY_ATTENDANCE_RULES.calculateLateMinutes(new Date(), timeStr);
      const status = lateMins > 0 ? 'Late' : 'On Time';

      const payload = {
        faculty_id: userSession.db_id,
        date: todayStr,
        clock_in: timeStr,
        status: status,
        late_minutes: lateMins
      };

      const { data, error } = await supabase.from('faculty_daily_presence').upsert(payload, { onConflict: 'faculty_id,date' }).select().single();
      
      let finalData = data;
      if (error) {
        console.warn("Upsert failed, falling back to manual update", error);
        const { data: existing } = await supabase.from('faculty_daily_presence').select('id').eq('faculty_id', payload.faculty_id).eq('date', payload.date).maybeSingle();
        if (existing) {
          const { data: updated } = await supabase.from('faculty_daily_presence').update(payload).eq('id', existing.id).select().single();
          finalData = updated;
        } else {
          const { data: inserted, error: insertError } = await supabase.from('faculty_daily_presence').insert([payload]).select().single();
          if (insertError) {
             console.error("Insert failed:", insertError);
             throw new Error("Could not save attendance to database. Contact administrator.");
          } else {
             finalData = inserted;
          }
        }
      }
      setAttendanceRecord(finalData);
      if (window.erpToast) window.erpToast.show("Clocked in successfully!", "success");

    } catch (error) {
      console.error(error);
      if (window.erpToast) window.erpToast.show(error.message || "Clock in failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
 try {
 setLoading(true);
 const timeStr = format(new Date(), 'HH:mm:ss');
 
 const earlyMins = FACULTY_ATTENDANCE_RULES.calculateEarlyLeaveMinutes(new Date(), timeStr);

 const payload = {
 clock_out: timeStr,
 early_leave_minutes: earlyMins,
 total_missed_minutes: (attendanceRecord.late_minutes || 0) + earlyMins
 };

 // Use the record id if available, otherwise fallback to faculty_id + date filter
 let query = supabase.from('faculty_daily_presence').update(payload);
 if (attendanceRecord?.id) {
 query = query.eq('id', attendanceRecord.id);
 } else {
 query = query.eq('faculty_id', userSession.db_id).eq('date', format(new Date(), 'yyyy-MM-dd'));
 }

 const { data, error } = await query.select().single();
 
 if (error) {
 console.error('Clock out DB error:', error);
 throw new Error("Could not save clock out to database. Contact administrator.");
 } else {
 setAttendanceRecord(data);
 if (window.erpToast) window.erpToast.show("Clocked out successfully!", "success");
 }
 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show("Clock out failed. Try again.", "error"); } finally {
 setLoading(false);
 }
 };

 const isWorkingDay = FACULTY_ATTENDANCE_RULES.isWorkingDay(new Date());
 const rules = FACULTY_ATTENDANCE_RULES.getWorkingHours(new Date());

  return (
  <div className="w-full bg-themeElevated border border-themeBorder shadow-premium rounded-themePanel p-5 relative overflow-hidden flex flex-col justify-center gap-4 min-h-[150px]">
  {/* Background elements */}
  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-themeAccent/5 rounded-full blur-3xl pointer-events-none"></div>
  
  {/* Top Section: Info & Time */}
  <div className="flex justify-between items-center relative z-10 w-full">
  <div className="flex flex-col">
  <div className="flex items-center gap-2 mb-1 text-themeTextSec">
  <i className="fa-solid fa-clock text-themeAccent/80 text-xs"></i>
  <h3 className="text-[10px] font-bold uppercase tracking-widest leading-none">Web Clock</h3>
  </div>
  <div className="flex items-baseline gap-1.5 flex-nowrap whitespace-nowrap">
  <span className="text-2xl font-black font-mono tracking-tighter text-themeText leading-none">{format(currentTime, 'hh:mm:ss')}</span>
  <span className="text-sm font-bold text-themeTextSec leading-none">{format(currentTime, 'a')}</span>
  </div>
  <p className="text-[10px] font-medium text-themeTextSec mt-1">{format(currentTime, 'EEEE, MMM do')}</p>
  </div>
  
  <div className="flex flex-col items-end shrink-0 pl-2">
  {isWorkingDay && rules ? (
  <>
  <span className="text-[9px] font-bold text-themeText uppercase tracking-widest bg-themePanel px-2 py-1 rounded border border-themeBorder mb-1 whitespace-nowrap">{rules.start} - {rules.end}</span>
  <span className="text-[8px] text-themeTextSec uppercase tracking-widest whitespace-nowrap">Grace: {FACULTY_ATTENDANCE_RULES.GRACE_PERIOD_MINUTES}m</span>
  </>
  ) : (
  <span className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
  Non-Working
  </span>
  )}
  </div>
  </div>
  
  {/* Bottom Section: Buttons */}
  <div className="grid grid-cols-2 gap-3 relative z-10 w-full mt-auto">
  <button
  onClick={handleClockIn}
  disabled={!isWorkingDay || loading || attendanceRecord?.clock_in}
  className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
  attendanceRecord?.clock_in 
  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 opacity-80' 
  : isWorkingDay ? 'bg-emerald-500 hover:bg-emerald-400 text-themeText active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-themePanel/5 text-themeTextSec cursor-not-allowed'
  }`}
  >
  <i className="fa-solid fa-right-to-bracket text-sm"></i>
  <span className="font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
  {attendanceRecord?.clock_in ? `In: ${attendanceRecord.clock_in}` : 'Clock In'}
  </span>
  </button>
  
  <button
  onClick={handleClockOut}
  disabled={!isWorkingDay || loading || !attendanceRecord?.clock_in || attendanceRecord?.clock_out}
  className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
  attendanceRecord?.clock_out 
  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 opacity-80' 
  : (attendanceRecord?.clock_in && isWorkingDay) ? 'bg-amber-500 hover:bg-amber-400 text-themeText active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-themePanel/5 text-themeTextSec cursor-not-allowed'
  }`}
  >
  <i className="fa-solid fa-right-from-bracket text-sm"></i>
  <span className="font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
  {attendanceRecord?.clock_out ? `Out: ${attendanceRecord.clock_out}` : 'Clock Out'}
  </span>
  </button>
  </div>
  
  {attendanceRecord?.late_minutes > 0 && (
  <div className="mt-2 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2 relative z-10">
  <i className="fa-solid fa-circle-exclamation text-rose-500 text-xs shrink-0"></i>
  <p className="text-[9px] font-medium text-rose-400 leading-tight">
  Late Check-in by <span className="font-black">{attendanceRecord.late_minutes}m</span>.
  </p>
  </div>
  )}
  </div>
  );
}

/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function ZohoMainContent({ session, role }) {
 const [activeTab, setActiveTab] = useState('Overview');
 const tabs = ['Overview', 'Analytics', 'Recent Activity'];
 const [upcomingHolidays, setUpcomingHolidays] = useState([]);

 useEffect(() => {
  fetchUpcomingHolidays();
 }, []);

 const fetchUpcomingHolidays = async () => {
  try {
   const today = new Date().toISOString().split('T')[0];
   const { data } = await supabase
    .from('academic_events')
    .select('title, start_date, description')
    .eq('event_type', 'Holiday')
    .eq('is_active', true)
    .gte('start_date', today)
    .order('start_date', { ascending: true })
    .limit(4);
   setUpcomingHolidays(data || []);
  } catch (err) {
   console.error('Failed to fetch holidays:', err);
  }
 };

 const getGreeting = () => {
 const hour = new Date().getHours();
 if (hour < 12) return 'Good Morning';
 if (hour < 18) return 'Good Afternoon';
 return 'Good Evening';
 };

 const formatHolidayDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  if (diff === 0) return { date: dayStr, badge: 'Today', badgeColor: 'bg-rose-500/15 text-rose-500' };
  if (diff === 1) return { date: dayStr, badge: 'Tomorrow', badgeColor: 'bg-amber-500/15 text-amber-500' };
  if (diff <= 7) return { date: dayStr, badge: `${diff}d away`, badgeColor: 'bg-blue-500/15 text-blue-500' };
  return { date: dayStr, badge: null, badgeColor: '' };
 };

 return (
 <div className="flex flex-col gap-6 w-full animate-fade-in">
 {/* Tabs */}
 <div className="bg-themeElevated border border-themeBorder rounded-2xl border border-white/[0.04] px-4 flex items-center overflow-x-auto no-scrollbar shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
 {tabs.map((tab) => (
 <button 
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors relative ${
 activeTab === tab
 ? 'text-themeText'
 : 'text-themeTextSec hover:text-themeText'
 }`}
 >
 {tab}
 {activeTab === tab && (
 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-themeAccent rounded-full" />
 )}
 </button>
 ))}
 </div>

 {/* Welcome */}
 <div className="bg-themeElevated border border-themeBorder rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
 <h2 className={`font-bold tracking-tight text-2xl text-themeText mb-1`}>{getGreeting()}</h2>
 <p className="text-sm text-themeTextSec font-medium">Welcome to Prudentia College of Law ERP • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
 </div>

 {/* Schedule Placeholder */}
 {role === 'student' && (
 <div className="bg-themeElevated border border-themeBorder rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-4">
 <div className="flex items-center gap-3 text-themeTextSec">
 <i className="fa-solid fa-calendar-day text-lg"></i>
 <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Today's Schedule</h3>
 </div>
 
 <div className="w-full flex flex-col items-center justify-center py-10 bg-themeApp /20 rounded-xl border border-themeBorder ">
 <i className="fa-regular fa-calendar-xmark text-2xl text-themeTextSec mb-3 opacity-50"></i>
 <span className="text-themeTextSec text-sm font-medium">No active schedule configured.</span>
 </div>
 </div>
 )}

 {/* Alerts & Notifications - Always present but clean */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-themeElevated border border-themeBorder rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6">
 <div className="flex items-center gap-3 text-themeTextSec">
 <i className="fa-solid fa-umbrella-beach text-lg"></i>
 <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Upcoming Holidays</h3>
 </div>
 {upcomingHolidays.length === 0 ? (
 <div className="w-full flex items-center justify-center py-6 bg-themeApp /20 rounded-xl border border-themeBorder ">
 <span className="text-themeTextSec text-sm font-medium">No holidays scheduled this month.</span>
 </div>
 ) : (
 <div className="flex flex-col gap-2">
  {upcomingHolidays.map((h, i) => {
   const { date, badge, badgeColor } = formatHolidayDate(h.start_date);
   return (
    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-themePanel/60 border border-themeBorder hover:border-themeAccent/30 transition-colors">
     <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-themeText">{h.title}</span>
      <span className="text-[11px] text-themeTextSec font-medium">{date}</span>
     </div>
     {badge && (
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
     )}
    </div>
   );
  })}
 </div>
 )}
 </div>
 
 <div className="bg-themeElevated border border-themeBorder rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6">
 <div className="flex items-center gap-3 text-themeTextSec">
 <i className="fa-solid fa-bell text-lg"></i>
 <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Action Alerts</h3>
 </div>
 <div className="w-full flex flex-col items-center justify-center py-6 bg-themeApp /20 rounded-xl border border-themeBorder ">
 <span className="text-themeTextSec text-sm font-medium text-center">No pending alerts.<br/>You're all caught up!</span>
 </div>
 </div>
 </div>

 </div>
 );
}

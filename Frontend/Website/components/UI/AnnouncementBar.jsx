import React, { useEffect, useState } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      // First, check if Spot Admissions is enabled in system_settings
      try {
        const { data: statusData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'admissions_status')
          .single();
          
        if (statusData && statusData.value && statusData.value.is_spot) {
          setAnnouncement({
            title: "SPOT ADMISSIONS OPEN",
            content: "Limited seats available for the current academic session. Apply immediately!",
            external_link: "/apply",
            isSpot: true
          });
          return;
        }

        // If no spot admissions, check admin_notices
        const { data, error } = await supabase
          .from('admin_notices')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data) {
          setAnnouncement(data);
        }
      } catch (e) {
        console.error("Could not fetch announcement:", e);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement || !visible) return null;

  return (
    <div className={`relative w-full z-[9999] py-2.5 px-4 flex items-center justify-center gap-4 shadow-md ${announcement.isSpot ? 'bg-red-600 text-white animate-pulse' : 'bg-[var(--primary-color)] text-white'}`}>
      <div className="flex-1 text-center text-[13px] sm:text-sm font-medium tracking-wide flex items-center justify-center gap-3">
        {announcement.isSpot ? (
          <i className="fa-solid fa-fire text-yellow-300"></i>
        ) : (
          <i className="fa-solid fa-bullhorn text-blue-200"></i>
        )}
        <span className="font-bold">{announcement.title}</span> 
        <span className="hidden sm:inline opacity-90">- {announcement.content}</span>
        {announcement.external_link && (
          <a href={announcement.external_link} className="underline font-bold text-white ml-2 hover:text-white/80 whitespace-nowrap">
            {announcement.isSpot ? "Apply Now" : "Learn More"}
          </a>
        )}
      </div>
      <button onClick={() => setVisible(false)} className="text-white hover:text-white/70 transition w-8 h-8 flex items-center justify-center absolute right-4 rounded-full bg-black/10">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}

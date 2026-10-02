import React, { useEffect, useState } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let activeAnnouncements = [];
        
        // 1. Check Spot Admissions
        const { data: statusData } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'admissions_status')
          .maybeSingle();
          
        if (statusData && statusData.value && statusData.value.is_spot) {
          activeAnnouncements.push({
            id: 'spot',
            title: "SPOT ADMISSIONS OPEN",
            content: "Limited seats available for the current academic session. Apply immediately!",
            external_link: "/apply",
            isSpot: true
          });
        }

        // 2. Fetch all public notices
        const { data, error } = await supabase
          .from('admin_notices')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
          
        if (data && data.length > 0) {
          activeAnnouncements = [...activeAnnouncements, ...data];
        }
        
        setAnnouncements(activeAnnouncements);
      } catch (e) {
        console.error("Could not fetch announcements:", e);
      }
    };
    fetchAnnouncements();
  }, []);

  if (!Array.isArray(announcements) || announcements.length === 0 || !visible) return null;

  const isCritical = announcements.some(a => a.isSpot);

  return (
    <div className={`relative w-full z-[9999] py-2.5 px-4 flex items-center shadow-md overflow-hidden ${isCritical ? 'bg-red-600 text-white' : 'bg-[var(--primary-color)] text-white'}`}>
      
      {/* Container for scrolling or static content */}
      <div className={`flex-1 flex items-center ${announcements.length > 1 ? 'animate-marquee whitespace-nowrap' : 'justify-center'}`}>
        {announcements.map((item, idx) => (
          <div key={item.id} className="inline-flex items-center gap-3 mx-8">
            {item.isSpot ? (
              <i className="fa-solid fa-fire text-yellow-300 animate-pulse"></i>
            ) : (
              <i className="fa-solid fa-bullhorn text-blue-200"></i>
            )}
            <span className="font-bold uppercase tracking-widest text-[11px] sm:text-xs bg-white/20 px-2 py-1 rounded-md border border-white/30 mr-1 shadow-sm">
              {item.title}
            </span> 
            <span className="opacity-90">{item.content}</span>
            {item.external_link ? (
              <a href={item.external_link} className="underline font-bold text-white hover:text-white/80">
                {item.isSpot ? "Apply Now" : "Learn More"}
              </a>
            ) : !item.isSpot && (
              <Link to={`/events/notice-${item.id}`} className="underline font-bold text-white hover:text-white/80">
                Learn More
              </Link>
            )}
            {/* Divider if multiple */}
            {announcements.length > 1 && <span className="mx-8 text-white/30">|</span>}
          </div>
        ))}
      </div>
      
      <button onClick={() => setVisible(false)} className="text-white hover:text-white/70 transition w-8 h-8 flex items-center justify-center absolute right-2 z-10 bg-black/20 rounded-full backdrop-blur-md">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}

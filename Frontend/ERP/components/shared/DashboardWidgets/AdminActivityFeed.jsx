/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActivity = async () => {
      try {
        // Fetch recent profile changes (new users, status changes)
        const { data: recentUsers, error: usersErr } = await supabase
          .from('profiles')
          .select('full_name, role, status, created_at, avatar_url')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent leave requests
        const { data: recentLeaves, error: leavesErr } = await supabase
          .from('leave_requests')
          .select('id, reason, status, created_at, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent attendance records
        const { data: recentAttendance, error: attErr } = await supabase
          .from('attendance')
          .select('id, status, date, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!isMounted) return;

        const feed = [];

        // Map users to activity items
        if (recentUsers && !usersErr) {
          recentUsers.forEach(u => {
            const timeAgo = getTimeAgo(u.created_at);
            feed.push({
              icon: 'fa-user-plus',
              iconColor: 'text-emerald-500',
              iconBg: 'bg-emerald-500/10',
              text: `${u.full_name} joined as ${u.role}`,
              time: timeAgo,
              timestamp: new Date(u.created_at).getTime()
            });
          });
        }

        // Map leaves to activity items
        if (recentLeaves && !leavesErr) {
          recentLeaves.forEach(l => {
            const name = l.profiles?.full_name || 'Unknown';
            const timeAgo = getTimeAgo(l.created_at);
            const statusIcon = l.status === 'approved' ? 'fa-check-circle' : l.status === 'rejected' ? 'fa-times-circle' : 'fa-clock';
            const statusColor = l.status === 'approved' ? 'text-emerald-500' : l.status === 'rejected' ? 'text-rose-500' : 'text-amber-500';
            const statusBg = l.status === 'approved' ? 'bg-emerald-500/10' : l.status === 'rejected' ? 'bg-rose-500/10' : 'bg-amber-500/10';
            feed.push({
              icon: statusIcon,
              iconColor: statusColor,
              iconBg: statusBg,
              text: `Leave ${l.status || 'requested'} for ${name}`,
              time: timeAgo,
              timestamp: new Date(l.created_at).getTime()
            });
          });
        }

        // Map attendance
        if (recentAttendance && !attErr) {
          recentAttendance.forEach(a => {
            const timeAgo = getTimeAgo(a.created_at);
            feed.push({
              icon: 'fa-fingerprint',
              iconColor: 'text-blue-500',
              iconBg: 'bg-blue-500/10',
              text: `Attendance recorded for ${a.date}`,
              time: timeAgo,
              timestamp: new Date(a.created_at).getTime()
            });
          });
        }

        // Sort by timestamp descending and take top 8
        feed.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(feed.slice(0, 8));
      } catch (err) {
        console.warn('Activity feed error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivity();
    return () => { isMounted = false; };
  }, []);

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-themePanel rounded-2xl border border-themeBorder p-5 animate-pulse">
        <div className="h-4 w-32 bg-themeElevated rounded mb-4"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-themeElevated"></div>
            <div className="flex-1"><div className="h-3 w-full bg-themeElevated rounded"></div></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-themePanel rounded-2xl border border-themeBorder p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-themeText tracking-tight uppercase flex items-center gap-2">
          <i className="fa-solid fa-wave-pulse text-themeAccent"></i> Live Activity
        </h3>
        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">Real-time</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-themeTextSec text-xs font-bold opacity-60">
          <i className="fa-solid fa-inbox text-2xl mb-2 block"></i>
          No recent activity to display
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-themeBorder/50">
          {activities.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 group">
              <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center text-xs shrink-0`}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-themeText truncate">{item.text}</p>
              </div>
              <span className="text-[10px] font-bold text-themeTextSec shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

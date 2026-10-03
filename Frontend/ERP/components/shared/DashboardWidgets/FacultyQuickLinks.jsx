/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

export default function FacultyQuickLinks({ setActiveTab }) {
  const links = [
    { id: 'mentorship', label: 'Mentorship', icon: 'fa-users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'assignments', label: 'Grading', icon: 'fa-pen-to-square', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'approvals', label: 'Leaves', icon: 'fa-calendar-check', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'notices', label: 'Notices', icon: 'fa-bullhorn', color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="w-full bg-themeElevated border border-themeBorder shadow-premium rounded-themePanel p-3 relative flex items-center justify-between gap-2 h-auto mt-auto">
      {links.map(link => (
        <button
          key={link.id}
          onClick={() => setActiveTab && setActiveTab(link.id)}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-themeApp border border-transparent hover:border-themeBorder group cursor-pointer`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.bg} ${link.color} mb-1 transition-transform group-hover:scale-110 group-active:scale-95`}>
            <i className={`fa-solid ${link.icon} text-sm`}></i>
          </div>
          <span className="text-[9px] font-bold text-themeText uppercase tracking-widest">{link.label}</span>
        </button>
      ))}
    </div>
  );
}

/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';

export default function AdminFAB({ isEmbedded = false }) {
 const [isOpen, setIsOpen] = useState(false);

 const actions = [
 { label: "Create Event", icon: "fa-calendar-plus" },
 { label: "Upload Circular", icon: "fa-file-arrow-up" },
 { label: "Create Notice", icon: "fa-thumbtack" },
 { label: "Publish Blog", icon: "fa-pen-nib" },
 { label: "Add Faculty", icon: "fa-user-tie" },
 { label: "Add Student", icon: "fa-user-graduate" },
 ];

 return (
 <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex flex-col items-end gap-3">
 {/* Action Menu */}
 <div className={`flex flex-col gap-2 transition duration-300 origin-bottom right-0 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
 {actions.map((action, i) => (
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} 
 key={i} 
 className="flex items-center gap-3 bg-themePanel/85 backdrop-blur-2xl border border-white/5 p-2 pr-4 rounded-lg hover:border-themeAccent hover:text-themeAccent transition group"
 style={{ transitionDelay: `${(actions.length - i) * 30}ms` }}
 >
 <div className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl flex items-center justify-center text-themeTextSec group-hover:bg-themeAccent group-hover:text-white transition-colors">
 <i className={`fa-solid ${action.icon} text-xs`}></i>
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-themeText group-hover:text-themeAccent whitespace-nowrap">{action.label}</span>
 </button>
 ))}
 </div>

 {/* Main Toggle Button */}
 <button type="button" 
 onClick={() => setIsOpen(!isOpen)}
 className={`w-14 h-14 rounded-lg bg-themeAccent text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
 >
 <i className="fa-solid fa-plus text-xl"></i>
 </button>
 </div>
 );
}

import { supabase } from "../../../../Shared/lib/supabase/supabaseClient";


/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminAcademicHub() {

 

 const navigate = useNavigate();

 const cards = [
 {"id": "coursebuilder", "title": "Course Builder", "icon": "fa-book-open", "desc": "Manage semesters, subjects, and Bar compliance."},
 {"id": "timetablebuilder", "title": "Timetable Builder", "icon": "fa-calendar-days", "desc": "Manually schedule classes and auto-generate grids."},
 {"id": "markscontroller", "title": "Marks Dispatcher", "icon": "fa-file-signature", "desc": "OU Internal marks tracking and CSV exports."},
 {"id": "campustimings", "title": "Campus Timings", "icon": "fa-clock", "desc": "Manage working days, Saturday rules, and period slots."}
];

 return (
 <div className="w-full animate-fade-in selection:bg-themeAccent/20 min-h-screen bg-transparent text-themeText ">
 <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8">
 <PageHeader 
 icon="fa-solid fa-graduation-cap" 
 title="Academic Center" 
 subtitle="Global management for curriculum, exams, and mentorship." 
 />

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
 {cards.map(card => (
 <div 
 key={card.id}
 onClick={() => navigate(`/admin/${card.id}`)}
 className="bg-themePanel/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] p-6 lg:p-8 rounded-[1.5rem] hover:-translate-y-1 hover:shadow-lg transition duration-300 group flex flex-col gap-4 cursor-pointer shadow-none shadow-none"
 >
 <div className="w-12 h-12 rounded-[1rem] bg-themeAccent/10 flex items-center justify-center border border-themeAccent/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
 <i className={`fa-solid ${card.icon} text-themeAccent text-xl`}></i>
 </div>
 <div>
 <h3 className="text-lg font-bold tracking-tight text-themeText mb-1">{card.title}</h3>
 <p className="text-xs font-medium text-themeTextSec leading-relaxed">{card.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

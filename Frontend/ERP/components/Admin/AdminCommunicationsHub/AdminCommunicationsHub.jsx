/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminCommunicationsHub() {
 const navigate = useNavigate();

 const cards = [
 {
 id: "whatsapp",
 title: "WhatsApp Engine",
 icon: "fa-brands fa-whatsapp",
 desc: "Manage bulk WhatsApp broadcasting, templates, and track delivery status in real-time."
 },
 {
 id: "email_manager",
 title: "Email Engine",
 icon: "fa-solid fa-envelope",
 desc: "Track SMTP server health, bulk email dispatches, and bounce logs."
 },
 {
 id: "notices",
 title: "System Notices",
 icon: "fa-solid fa-bullhorn",
 desc: "Publish internal broadcast notices to students and faculty dashboards."
 }
 ];

 return (
 <div className="w-full animate-fade-in selection:bg-themeAccent/20 min-h-screen bg-transparent text-themeText ">
 <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8">
 <PageHeader 
 icon="fa-solid fa-satellite-dish" 
 title="Communications Hub" 
 subtitle="Centralized management for emails, WhatsApp alerts, and internal platform notices." 
 />

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
 {cards.map(card => (
 <div 
 key={card.id}
 onClick={() => navigate(`/admin/${card.id}`)}
 className="bg-themePanel/60 dark:bg-themePanel/60 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] p-6 lg:p-8 rounded-[1.5rem] hover:-translate-y-1 hover:shadow-lg transition duration-300 group flex flex-col gap-4 cursor-pointer shadow-none"
 >
 <div className="w-12 h-12 rounded-[1rem] bg-themeAccent/10 flex items-center justify-center border border-themeAccent/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
 <i className={`${card.icon} text-themeAccent text-xl`}></i>
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

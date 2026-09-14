/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function FacultyAdvisingHub() {
    const navigate = useNavigate();

    const cards = [{"id": "mentorship", "title": "Mentorship Hub", "icon": "fa-handshake-angle", "desc": "Track your allocated mentees."}, {"id": "clinics", "title": "Clinical Programs", "icon": "fa-scale-balanced", "desc": "Oversight for clinics and practicals."}];

    return (
        <div className="w-full animate-fade-in selection:bg-[#007AFF]/20 min-h-screen bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7]">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12">
                <PageHeader 
                    icon="fa-solid fa-people-arrows" 
                    title="Advising Center" 
                    subtitle="Student mentorship and advisory tracking." 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {cards.map(card => (
                        <div 
                            key={card.id}
                            onClick={() => navigate(`/faculty/${card.id}`)}
                            className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-6 lg:p-8 rounded-[1.5rem] hover:-translate-y-1 hover:shadow-lg transition duration-300 group flex flex-col gap-4 cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
                        >
                            <div className="w-12 h-12 rounded-[1rem] bg-[#007AFF]/10 flex items-center justify-center border border-[#007AFF]/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i className={`fa-solid ${card.icon} text-[#007AFF] text-xl`}></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">{card.title}</h3>
                                <p className="text-xs font-medium text-[#8E8E93] leading-relaxed">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

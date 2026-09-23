/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";
import { useERP } from "../../../context/ErpContext";
import { useNavigate } from "react-router-dom";

export default function FacultyAcademicHub() {
    const { userSession } = useERP();
    const navigate = useNavigate();

    const modules = [
        { id: "courses", label: "My Courses", icon: "fa-book-open", desc: "Manage course materials and syllabus.", color: "text-blue-500" },
        { id: "attendance", label: "Attendance", icon: "fa-user-check", desc: "Mark real-time student check-ins.", color: "text-emerald-500" },
        { id: "timetable", label: "Schedule", icon: "fa-calendar-days", desc: "View your daily class roster and timetable.", color: "text-indigo-500" },
        { id: "assignments", label: "Assignments", icon: "fa-file-lines", desc: "Publish assignments and grade submissions.", color: "text-amber-500" },
        { id: "marks", label: "Internal Marks", icon: "fa-spell-check", desc: "Enter internal scores and view analytics.", color: "text-purple-500" }
    ];

    const handleNavigate = (id) => {
        if (userSession) {
            navigate(`/${userSession.role}/${id}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl shadow-inner">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white">Teaching Hub</h1>
                            <p className="text-sm font-medium text-themeTextSec mt-1">Your centralized teaching control center.</p>
                        </div>
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-2">
                    {modules.map((mod) => (
                        <div 
                            key={mod.id}
                            onClick={() => handleNavigate(mod.id)}
                            className="bg-white/60 dark:bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.05] p-6 lg:p-8 rounded-[1.5rem] hover:-translate-y-1 hover:bg-white dark:hover:bg-themePanel/60 transition-all duration-300 group flex flex-col gap-4 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <div className={`w-12 h-12 rounded-[1rem] bg-black/[0.03] dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-300 ${mod.color}`}>
                                <i className={`fa-solid ${mod.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-themeText dark:text-white mb-1 group-hover:text-themeAccent transition-colors">{mod.label}</h3>
                                <p className="text-xs font-medium text-themeTextSec leading-relaxed">{mod.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

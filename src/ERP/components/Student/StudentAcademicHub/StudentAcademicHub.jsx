/* © 2026 JSM VALOR. All Rights Reserved. */
import { motion } from 'framer-motion';
import React, { useState } from "react";
import { theme } from '../../../../Shared/theme';
import CourseVault from "../CourseVault/CourseVault";
import Attendance from "../Attendance/Attendance";
import Timetable from "../Timetable/Timetable";
import Assignments from "../Assignments/Assignments";
import StudentProgressCard from "../StudentProgressCard/StudentProgressCard";

export default function StudentAcademicHub({ isEmbedded = false, }) {
    const [activeTab, setActiveTab] = useState("vault");

    const tabs = [
        { id: "vault", label: "Course Vault", icon: "fa-book-open", desc: "Access study materials & resources", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", hover: "hover:bg-blue-500/20" },
        { id: "attendance", label: "Attendance", icon: "fa-user-check", desc: "View detailed check-ins", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/20" },
        { id: "timetable", label: "Timetable", icon: "fa-calendar-days", desc: "Your weekly class schedule", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", hover: "hover:bg-indigo-500/20" },
        { id: "assignments", label: "Assignments", icon: "fa-file-lines", desc: "Track pending & submitted work", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", hover: "hover:bg-amber-500/20" },
        { id: "examinations", label: "Progress Card", icon: "fa-award", desc: "Academic analytics & grades", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", hover: "hover:bg-purple-500/20" }
    ];

    return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
                
                {/* 360-Degree Main Panel */}
                <div className="flex-1 flex flex-col bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl overflow-hidden relative">
                    
                    {/* Header Banner */}
                    <div className="p-6 lg:p-8 border-b border-black/[0.04] dark:border-white/[0.08] flex flex-col gap-6 relative overflow-hidden shrink-0 bg-white/40 dark:bg-black/10">
                        {/* Glowing Orb */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-themeAccent/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-themeElevated border-2 border-black/5 dark:border-white/10 flex items-center justify-center shadow-sm">
                                    <i className="fa-solid fa-graduation-cap text-themeAccent text-3xl"></i>
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-themeText mb-1 flex items-center gap-3">
                                        Academic Center 360
                                        <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-themeAccent animate-pulse"></div>
                                            Active Term
                                        </span>
                                    </h1>
                                    <p className="text-xs font-bold text-themeTextSec tracking-normal flex items-center gap-3">
                                        <span><i className="fa-solid fa-book-open text-themeAccent/70 mr-1"></i> Your Centralized Learning Hub</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Navigation Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 relative z-10 mt-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`p-4 rounded-xl flex flex-col gap-2 items-start transition-all text-left group border ${
                                        activeTab === tab.id
                                            ? `bg-white dark:bg-themeElevated border-black/10 dark:border-white/20 shadow-md ${tab.color}`
                                            : `${tab.bg} ${tab.border} ${tab.color} ${tab.hover} opacity-70 hover:opacity-100`
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${activeTab === tab.id ? `${tab.bg} border ${tab.border}` : 'bg-transparent'}`}>
                                        <i className={`fa-solid ${tab.icon}`}></i>
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black tracking-tight mb-0.5">{tab.label}</h4>
                                        <p className={`text-[10px] font-medium ${activeTab === tab.id ? 'text-themeTextSec' : 'opacity-70'}`}>{tab.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 bg-transparent">
                        <div className="animate-fade-in w-full h-full max-w-7xl mx-auto">
                            {activeTab === "vault" && <CourseVault isEmbedded={true} />}
                            {activeTab === "attendance" && <Attendance isEmbedded={true} />}
                            {activeTab === "timetable" && <Timetable isEmbedded={true} />}
                            {activeTab === "assignments" && <Assignments isEmbedded={true} />}
                            {activeTab === "examinations" && <StudentProgressCard isEmbedded={true} />}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

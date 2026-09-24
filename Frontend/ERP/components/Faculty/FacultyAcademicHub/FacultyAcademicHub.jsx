/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import FacultyCourses from "../FacultyCourses/FacultyCourses";
import FacultyAttendance from "../FacultyAttendance/FacultyAttendance";
import FacultyTimetable from "../FacultyTimetable/FacultyTimetable";
import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
import FacultyMarks from "../FacultyMarks/FacultyMarks";
import FacultyTeachingDashboard from "./components/FacultyTeachingDashboard";

export default function FacultyAcademicHub() {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: "fa-chart-pie" },
        { id: "courses", label: "My Courses", icon: "fa-book-open" },
        { id: "attendance", label: "Attendance", icon: "fa-user-check" },
        { id: "timetable", label: "Schedule", icon: "fa-calendar-days" },
        { id: "assignments", label: "Assignments", icon: "fa-file-lines" },
        { id: "marks", label: "Internal Marks", icon: "fa-spell-check" }
    ];

    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                
                {/* Premium Vibrant Header */}
                <div className="relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl p-6 lg:p-8 z-10 flex flex-col gap-6">
                    {/* Background Gradients */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-themeAccent/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-themeAccent/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-themeAccent/10 border border-themeAccent/20 text-themeAccent flex items-center justify-center text-2xl shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4"></div>
                                <i className="fa-solid fa-chalkboard-user relative z-10"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white flex items-center gap-3">
                                    Teaching Hub
                                    <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-themeAccent animate-pulse"></div>
                                        Live Status
                                    </span>
                                </h1>
                                <p className="text-sm font-medium text-themeTextSec mt-1">Your centralized command center for academic operations.</p>
                            </div>
                        </div>
                    </div>

                    {/* Premium Mobile-Optimized Tab Bar */}
                    <div className="relative w-full max-w-full -mx-4 sm:mx-0 px-4 sm:px-0">
                        <div className="flex p-1.5 sm:p-2 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-xl sm:rounded-[1.25rem] border-y sm:border border-black/5 dark:border-white/5 gap-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`snap-center shrink-0 px-5 sm:px-6 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center gap-2.5 whitespace-nowrap relative overflow-hidden group ${
                                        activeTab === tab.id
                                            ? 'bg-white dark:bg-themeElevated text-themeAccent shadow-md border border-black/5 dark:border-white/10'
                                            : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}>
                                    
                                    {/* Subtle glow for active tab */}
                                    {activeTab === tab.id && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-themeAccent/10 to-transparent opacity-50"></div>
                                    )}
                                    
                                    <i className={`fa-solid ${tab.icon} relative z-10 ${activeTab === tab.id ? 'text-themeAccent drop-shadow-md' : 'group-hover:scale-110 transition-transform'}`}></i> 
                                    <span className="relative z-10 tracking-wide">{tab.label}</span>
                                    
                                    {/* Animated bottom indicator line */}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-themeAccent rounded-t-full shadow-[0_-2px_10px_currentColor]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-visible min-h-[500px]">
                    <div className="w-full h-full animate-fade-in">
                        {activeTab === "overview" && <FacultyTeachingDashboard onNavigate={setActiveTab} />}
                        {activeTab === "courses" && <FacultyCourses isEmbedded={true} />}
                        {activeTab === "attendance" && <FacultyAttendance isEmbedded={true} />}
                        {activeTab === "timetable" && <FacultyTimetable isEmbedded={true} />}
                        {activeTab === "assignments" && <FacultyAssignments isEmbedded={true} />}
                        {activeTab === "marks" && <FacultyMarks isEmbedded={true} />}
                    </div>
                </div>

            </div>
        </div>
    );
}

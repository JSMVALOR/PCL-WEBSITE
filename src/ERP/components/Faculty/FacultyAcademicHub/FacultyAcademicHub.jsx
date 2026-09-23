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
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-themeAccent to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-themeAccent/20 relative overflow-hidden group">
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

                    {/* Tab Bar (Mentorship Hub Style) */}
                    <div className="flex p-1.5 bg-black/[0.03] dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 w-fit gap-1 overflow-x-auto max-w-full custom-scrollbar relative z-10">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-themeElevated text-themeAccent border border-black/5 dark:border-white/20 shadow-md transform scale-105'
                                        : 'text-themeTextSec dark:text-white/60 hover:text-themeText dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                                }`}>
                                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-hidden min-h-[500px]">
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

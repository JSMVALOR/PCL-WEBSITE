/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from "react";
import FacultyCourses from "../FacultyCourses/FacultyCourses";
import FacultyAttendance from "../FacultyAttendance/FacultyAttendance";
import FacultyTimetable from "../FacultyTimetable/FacultyTimetable";
import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
import FacultyMarks from "../FacultyMarks/FacultyMarks";

export default function FacultyAcademicHub() {
    const [activeTab, setActiveTab] = useState("courses");

    const tabs = [
        { id: "courses", label: "My Courses", icon: "fa-book-open" },
        { id: "attendance", label: "Attendance", icon: "fa-user-check" },
        { id: "timetable", label: "Schedule", icon: "fa-calendar-days" },
        { id: "assignments", label: "Assignments", icon: "fa-file-lines" },
        { id: "marks", label: "Internal Marks", icon: "fa-spell-check" }
    ];

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

                {/* Tab Bar (Mentorship Hub Style) */}
                <div className="flex p-1.5 bg-black/[0.03] dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 w-fit gap-1 overflow-x-auto max-w-full custom-scrollbar">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-white/15 text-themeText dark:text-white border border-black/5 dark:border-white/20 shadow-sm'
                                    : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                            }`}>
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full overflow-hidden min-h-[500px]">
                    <div className="w-full h-full animate-fade-in">
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

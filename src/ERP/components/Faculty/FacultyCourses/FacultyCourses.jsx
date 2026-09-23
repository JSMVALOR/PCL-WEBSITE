/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';


import FacultyMarks from "../FacultyMarks/FacultyMarks";
import FacultyAttendance from "../FacultyAttendance/FacultyAttendance";
import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
import ClassRoster from "../ClassRoster/ClassRoster";
import SyllabusEditorModal from "../../Admin/AdminTimetableBuilder/tabs/components/SyllabusEditorModal";


const THEME_COLORS = {
    blue: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' },
    emerald: { primary: '#34C759', bg: 'rgba(52,199,89,0.1)' },
    amber: { primary: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
    rose: { primary: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
    indigo: { primary: '#5856D6', bg: 'rgba(88,86,214,0.1)' },
    purple: { primary: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },
    cyan: { primary: '#32ADE6', bg: 'rgba(50,173,230,0.1)' },
    pink: { primary: '#FF2D55', bg: 'rgba(255,45,85,0.1)' },
    fuchsia: { primary: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },
    default: { primary: '#007AFF', bg: 'rgba(0,122,255,0.1)' }
};


// Helper to derive color from batch name (mimicking Cohort colors)
const getBatchColorKey = (batchName) => {
    if (!batchName) return 'default';
    const b = batchName.toUpperCase();
    if (b.includes('BA LLB')) return 'rose';
    if (b.includes('BBA LLB')) return 'emerald';
    if (b.includes('LLM')) return 'purple';
    if (b.includes('LLB')) return 'indigo';
    return 'default';
};

export default function FacultyCourses({ isEmbedded = false,  setActiveTab }) {
 const { userSession } = useERP();
 
 const [courses, setCourses] = useState(() => {
 const cached = sessionStorage.getItem(`fac_courses_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [resources, setResources] = useState(() => {
 const cached = sessionStorage.getItem(`fac_course_resources_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 
 // UI State
 const [selectedCourse, setSelectedCourse] = useState(null);
 const [activeSidebarTab, setActiveSidebarTab] = useState("overview"); // overview, resources, attendance, marks, assignments
 const [showResourceForm, setShowResourceForm] = useState(false);
 const [formData, setFormData] = useState({ id: null, title: "", url: "", type: "Drive Link" });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [activeSyllabusSubject, setActiveSyllabusSubject] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleResourceClick = (e, item) => {
        if (item.url && item.url.includes('drive.google.com/file/d/')) {
            e.preventDefault();
            // Convert to preview link
            const match = item.url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                setPreviewUrl(`https://drive.google.com/file/d/${match[1]}/preview`);
            } else {
                window.open(item.url, '_blank');
            }
        }
    };

 useEffect(() => {
    if (userSession?.db_id) {
        const cachedCourses = sessionStorage.getItem(`fac_courses_${userSession.db_id}`);
        const cachedResources = sessionStorage.getItem(`fac_course_resources_${userSession.db_id}`);
        if (cachedCourses && cachedResources) {
            setCourses(JSON.parse(cachedCourses));
            setResources(JSON.parse(cachedResources));
        }
        fetchCourseData();
    }
 }, [userSession]);

 const fetchCourseData = async () => {
 if (!userSession?.db_id) return;
 try {
 // 1. Fetch Subjects from cohort_subjects mapped to faculty (direct + schedule)
 const { data: directSubs, error: subErr } = await supabase
 .from('cohort_subjects')
 .select('id, batch_id, master_subjects(id, name, code, credits, syllabus, theme_color)')
 .eq('faculty_id', userSession.db_id);
 if (subErr) throw subErr;

 const { data: scheduledSubs } = await supabase.from('class_schedule').select('subject_id').eq('faculty_id', userSession.db_id);

 let allSubIds = (directSubs || []).map(s => s.id);
 if (scheduledSubs && scheduledSubs.length > 0) {
    allSubIds = [...new Set([...allSubIds, ...scheduledSubs.map(s => s.subject_id)])];
 }
 
 let finalSubs = directSubs || [];
 const missingIds = allSubIds.filter(id => !finalSubs.find(s => s.id === id));
 
 if (missingIds.length > 0) {
    const { data: extraSubs } = await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code, credits, syllabus, theme_color)').in('id', missingIds);
    if (extraSubs) {
        finalSubs = [...finalSubs, ...extraSubs];
    }
 }
 
 // Map them to mimic old subjects structure for seamless integration
 const subs = finalSubs.map(cs => ({
 id: cs.id,
 batch_id: cs.batch_id,
 master_subjects: cs.master_subjects,
 name: cs.master_subjects?.name || 'Unknown',
 code: cs.master_subjects?.code || 'Unknown',
 credits: cs.master_subjects?.credits || 0
 }));
 
 // 2. Fetch Schedule
 const { data: schedule } = await supabase
 .from('class_schedule')
 .select('*')
 .in('subject_id', subs && subs.length > 0 ? subs.map(s => s.id) : ['00000000-0000-0000-0000-000000000000']);
 
 // 3. Fetch Sessions
 const { data: rawSessions } = await supabase
 .from('class_sessions')
 .select('id, present_count, total_students, status, schedule_id')
 .eq('faculty_id', userSession.db_id)
 .neq('status', 'scheduled');
 
 let sessions = rawSessions || [];
 if (sessions.length > 0) {
    const { data: schData } = await supabase.from('class_schedule').select('id, subject_id').in('id', sessions.map(s => s.schedule_id).filter(Boolean));
    if (schData) {
        sessions = sessions.map(s => ({ ...s, class_schedule: schData.find(x => x.id === s.schedule_id) }));
    }

    // Fetch real attendance records for accurate percentages
    const sessionIds = sessions.map(s => s.id).filter(Boolean);
    if (sessionIds.length > 0) {
        const { data: attRecords } = await supabase
            .from('attendance_records')
            .select('session_id, entry_status, status')
            .in('session_id', sessionIds);
        
        // Compute present_count and total_students from records
        const sessionAttMap = {};
        (attRecords || []).forEach(r => {
            if (!sessionAttMap[r.session_id]) sessionAttMap[r.session_id] = { total: 0, present: 0 };
            sessionAttMap[r.session_id].total++;
            const isPresent = r.entry_status === 'present' || r.entry_status === 'late' || (!r.entry_status && r.status === 'present');
            if (isPresent) sessionAttMap[r.session_id].present++;
        });

        sessions = sessions.map(s => ({
            ...s,
            present_count: sessionAttMap[s.id]?.present ?? (s.present_count || 0),
            total_students: sessionAttMap[s.id]?.total ?? (s.total_students || 0)
        }));
    }
 }
 
 // 4. Fetch Exam Date
 const { data: calendar } = await supabase
 .from('academic_calendar')
 .select('title, start_date')
 .gte('start_date', new Date().toISOString())
 .order('start_date', { ascending: true });
 
 const nextExam = calendar?.find(e => e.title.toLowerCase().includes('exam'));
 const examDate = nextExam ? new Date(nextExam.start_date) : null;

 // 5. Build Course Cards
 const courseData = (subs || []).map(subject => {
 const subjSchedule = (schedule || []).filter(s => s.subject_id === subject.id || (subject.master_subjects && s.subject_id === subject.master_subjects.id));
 const subjSessions = (sessions || []).filter(s => s.class_schedule?.subject_id === subject.id || (subject.master_subjects && s.class_schedule?.subject_id === subject.master_subjects.id));
 
 const batches = [...new Set(subjSchedule.map(s => s.batch).filter(Boolean))];
 const classesDone = subjSessions.length;
 
 let avgAttendance = 0;
 if (classesDone > 0) {
 let totalP = 0;
 let totalS = 0;
 subjSessions.forEach(s => {
 totalP += (s.present_count || 0);
 totalS += (s.total_students || 0);
 });
 avgAttendance = totalS > 0 ? ((totalP / totalS) * 100).toFixed(1) : 0;
 }

 let nextClass = null;
 const now = new Date();
 const currentTime = now.toTimeString().substring(0,5);
 const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 let upcomingClasses = [];
 
 subjSchedule.forEach(sch => {
 const schDayIdx = daysOfWeek.indexOf(sch.day_of_week);
 const currentDayIdx = now.getDay();
 let daysUntil = schDayIdx - currentDayIdx;
 if (daysUntil < 0 || (daysUntil === 0 && sch.start_time <= currentTime)) {
 daysUntil += 7;
 }
 const classDate = new Date(now);
 classDate.setDate(now.getDate() + daysUntil);
 const [hours, mins] = sch.start_time.split(':');
 classDate.setHours(parseInt(hours), parseInt(mins), 0, 0);
 
 upcomingClasses.push({ ...sch, dateObj: classDate, daysUntil });
 });
 
 upcomingClasses.sort((a, b) => a.dateObj - b.dateObj);
 if (upcomingClasses.length > 0) nextClass = upcomingClasses[0];
 
 let classesLeft = 0;
 if (examDate && subjSchedule.length > 0) {
 let iterDate = new Date(now);
 iterDate.setDate(iterDate.getDate() + 1);
 const scheduledDayNames = subjSchedule.map(s => s.day_of_week);
 while (iterDate < examDate) {
 const dayName = iterDate.toLocaleDateString('en-US', { weekday: 'long' });
 if (scheduledDayNames.includes(dayName)) classesLeft++;
 iterDate.setDate(iterDate.getDate() + 1);
 }
 }

 return { ...subject, batches, classesDone, avgAttendance, nextClass, classesLeft, examDate };
 });
 
 setCourses(courseData);
 sessionStorage.setItem(`fac_courses_${userSession.db_id}`, JSON.stringify(courseData));
 
 const { data: res } = await supabase
 .from('course_resources')
 .select('*')
 .eq('faculty_id', userSession.db_id)
 .order('created_at', { ascending: false });
 if (res) {
 setResources(res);
 sessionStorage.setItem(`fac_course_resources_${userSession.db_id}`, JSON.stringify(res));
 }

 } catch (error) {
 console.error(error);
 }
 };

 const handleAddResource = async (e) => {
 e.preventDefault();
 if (!selectedCourse || !formData.title || !formData.url) return;
 setIsSubmitting(true);
 try {
 let data, error;
        if (formData.id) {
            const res = await supabase.from('course_resources').update({
                title: formData.title, url: formData.url, type: formData.type
            }).eq('id', formData.id).select();
            data = res.data;
            error = res.error;
            if (error) throw error;
            setResources(resources.map(r => r.id === formData.id ? data[0] : r));
        } else {
            const res = await supabase.from('course_resources').insert({ faculty_id: userSession.db_id, cohort_subject_id: selectedCourse.id,
                title: formData.title, url: formData.url, type: formData.type
            }).select();
            data = res.data;
            error = res.error;
            if (error) throw error;
            setResources([data[0], ...resources]);
        }
 setFormData({ id: null, title: "", url: "", type: "Drive Link" });
 setShowResourceForm(false);
 } catch (error) {
 console.error(error);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDeleteResource = async (id) => {
    if (window.erpDialog) {
        window.erpDialog.confirm("Delete this resource?", "Are you sure?").then(async (yes) => {
            if (!yes) return;
            try {
                await supabase.from('course_resources').delete().eq('id', id);
                setResources(prev => prev.filter(r => r.id !== id));
                window.erpDialog.alert("Resource deleted successfully.", "success");
            } catch (error) {
                console.error(error);
                window.erpDialog.alert("Failed to delete resource.", "error");
            }
        });
    } else {
        if (!confirm("Are you sure?")) return;
        try {
            await supabase.from('course_resources').delete().eq('id', id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (error) {}
    }
};

 const getIconForType = (type) => {
 if (type.includes('Drive')) return 'fa-brands fa-google-drive text-blue-500';
 if (type.includes('PDF')) return 'fa-solid fa-file-pdf text-rose-500';
 if (type.includes('Video')) return 'fa-brands fa-youtube text-red-500';
 return 'fa-solid fa-link text-emerald-500';
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-white/10 ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-themeText" : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "pb-10"}`}>
 
 {/* HEADER */}
 <PageHeader 
 icon="fa-solid fa-layer-group" 
 title="My Courses" 
 subtitle="Manage your course materials and syllabus." 
 isEmbedded={isEmbedded}
 />

 {courses.length === 0 ? (
 <div className="w-full py-16 lg:py-24 flex flex-col items-center justify-center text-center px-4">
 <div className="w-24 h-24 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-4xl mb-6 shadow-inner">
    <i className="fa-solid fa-folder-open"></i>
 </div>
 <h3 className="text-xl lg:text-2xl text-themeText dark:text-white font-black tracking-tight">No Courses Assigned</h3>
 <p className="text-sm text-themeTextSec mt-2 max-w-sm mx-auto leading-relaxed">You currently do not have any active subjects mapped to your account. Once assigned, they will automatically appear here.</p>
 </div>
 ) : (
 <div className="flex flex-col xl:flex-row gap-6 items-start">
 
 {/* LEFT: COURSE CARDS */}
 <div className={`flex flex-col gap-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedCourse ? 'xl:w-[28%] shrink-0' : 'w-full'}`}>
 <h2 className="text-[11px] font-black uppercase tracking-widest text-themeTextSec mb-4 px-2">Assigned Subjects</h2>
 <div className={`grid gap-5 ${selectedCourse ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
 {courses.map(course => {
 const isSelected = selectedCourse?.id === course.id;
 const batchStr = course.batches?.[0] || "";
  const tColor = THEME_COLORS[course.master_subjects?.theme_color] || THEME_COLORS.default;
 return (
 <div 
 key={course.id}
 onClick={() => {
 setSelectedCourse(course);
 if(!isSelected) setActiveSidebarTab("overview");
 }}
 className={`bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border rounded-[1.25rem] overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col relative ${
 isSelected ? 'ring-2 shadow-2xl bg-white dark:bg-themePanel z-10 scale-[1.01]' : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:shadow-lg'
 }`} style={{ borderColor: isSelected ? tColor.primary : undefined }}
 >
 <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-60 pointer-events-none -mr-10 -mt-10" style={{ background: `linear-gradient(to bottom left, ${tColor.primary}44, transparent)` }}></div>
 <div className="p-5 flex flex-col gap-2 relative overflow-hidden z-10">
 
 <div className="flex items-center gap-2">
 <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight text-themeTextSec">
 {course.master_subjects?.code}
 </span>
 {course.batches.length > 0 && (
 <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight" style={{ backgroundColor: tColor.bg, color: tColor.primary }}>
 {course.batches.join(', ')}
 </span>
 )}
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText leading-tight">{course.master_subjects?.name}</h3>
 </div>
 
 {/* Course Analytics Engine */}
 <div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5 bg-transparent">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText">{course.classesDone}</span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal uppercase">Classes Done</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className={`text-xl font-semibold tracking-tight ${Number(course.avgAttendance) >= 75 ? 'text-emerald-500' : Number(course.avgAttendance) > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
 {course.avgAttendance}%
 </span>
 <span className="text-[8px] font-black text-themeTextSec tracking-normal uppercase">Avg Attendance</span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>

 {/* RIGHT: COURSE COMMAND CENTER (RIGHT SIDEBAR) */}
 {selectedCourse && (
 <div className="flex-1 w-full bg-white/60 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/5 dark:border-white/10 rounded-[2rem] flex flex-col animate-slide-in-right overflow-hidden min-h-[750px] relative">
 {/* Command Center Header */}
 <div className="p-6 lg:p-8 border-b border-black/5 dark:border-white/5 bg-transparent flex flex-col gap-6 relative z-10">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: THEME_COLORS[selectedCourse?.master_subjects?.theme_color]?.bg || THEME_COLORS.default.bg, color: THEME_COLORS[selectedCourse?.master_subjects?.theme_color]?.primary || THEME_COLORS.default.primary }}>
 <i className="fa-solid fa-graduation-cap"></i>
 </div>
 <span className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight text-themeTextSec">
 {selectedCourse.code}
 </span>
 </div>
 <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-themeText dark:text-themeText">{selectedCourse.name}</h2>
 </div>
 <button type="button" onClick={() => setSelectedCourse(null)} className="w-10 h-10 rounded-full bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 text-themeTextSec shadow-sm hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 
 {/* Command Center Tabs */}
 <div className="flex bg-transparent border-b border-black/10 dark:border-white/10 overflow-x-auto no-scrollbar w-full gap-6">
 {[
 { id: "overview", label: "Overview", icon: "fa-chart-simple" },
 { id: "attendance", label: "Attendance & Roster", icon: "fa-clipboard-user" },
 { id: "assignments", label: "Assignments", icon: "fa-file-signature" },
 { id: "marks", label: "Marks Ledger", icon: "fa-lock" },
 { id: "resources", label: "Resources", icon: "fa-google-drive" }
 ].map(tab => (
 <button type="button"
 key={tab.id}
 onClick={() => setActiveSidebarTab(tab.id)}
 className={`whitespace-nowrap pb-3 border-b-2 text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center gap-2 ${activeSidebarTab === tab.id ? "border-amber-500 text-amber-500 dark:text-amber-400" : "border-transparent text-themeTextSec hover:text-themeText dark:hover:text-themeText hover:border-black/20 dark:hover:border-white/20"}`}
 >
 <i className={`fa-solid ${tab.icon} ${activeSidebarTab === tab.id ? '' : 'opacity-70'}`}></i>
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* Content Area */}
 <div className="p-6 lg:p-8 flex-1 overflow-y-auto bg-black/[0.01] dark:bg-white/[0.01] custom-scrollbar relative z-10">
 
 {/* OVERVIEW TAB */}
 {activeSidebarTab === "overview" && (
 <div className="flex flex-col gap-6 animate-fade-in">
 <div className="flex items-center justify-between">
    <h3 className="text-[15px] font-semibold text-themeText dark:text-themeText">Course Synopsis</h3>
    {selectedCourse.master_subjects?.syllabus && (
        <button 
            onClick={() => setActiveSyllabusSubject(selectedCourse.master_subjects)}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
            <i className="fa-solid fa-book-open"></i> View Syllabus
        </button>
    )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center">
 {selectedCourse.nextClass ? (
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-themeAccent flex items-center justify-center text-xl shrink-0">
 <i className="fa-solid fa-clock"></i>
 </div>
 <div>
 <p className="text-[10px] font-black text-themeTextSec tracking-normal">Next Scheduled Class</p>
 <p className="text-lg font-bold text-themeText dark:text-themeText">
 {selectedCourse.nextClass.daysUntil === 0 ? 'Today' : selectedCourse.nextClass.daysUntil === 1 ? 'Tomorrow' : selectedCourse.nextClass.day_of_week} at {selectedCourse.nextClass.start_time.substring(0,5)}
 </p>
 <p className="text-xs text-themeTextSec font-bold mt-0.5"><i className="fa-solid fa-location-dot mr-1"></i> Room {selectedCourse.nextClass.room_no}</p>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center text-center text-themeTextSec opacity-70">
 <i className="fa-solid fa-calendar-xmark text-2xl mb-2"></i>
 <span className="text-sm font-bold">No upcoming classes scheduled.</span>
 </div>
 )}
 </div>
 
 <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between">
 <div>
 <p className="text-[10px] font-black text-themeTextSec tracking-normal">Total Credits</p>
 <p className="text-2xl font-semibold tracking-tight text-themeText dark:text-themeText">{selectedCourse.credits}</p>
 </div>
 <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
 <i className="fa-solid fa-award"></i>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* RESOURCES TAB */}
 {activeSidebarTab === "resources" && (
 <div className="flex flex-col gap-6 animate-fade-in">
 <div className="flex items-center justify-between">
 <h3 className="text-[15px] font-semibold text-themeText dark:text-themeText">Course Resources</h3>
 <button type="button" 
 onClick={() => setShowResourceForm(!showResourceForm)}
 className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-themeBorder border border-black/5 dark:border-white/5 text-themeText dark:text-themeText font-black text-[10px] tracking-normal transition"
 >
 <i className={`fa-solid ${showResourceForm ? 'fa-xmark' : 'fa-plus'} mr-1`}></i> 
 {showResourceForm ? 'Cancel' : 'Add Link'}
 </button>
 </div>

 {showResourceForm && (
 <form onSubmit={handleAddResource} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative">
        <button type="button" onClick={() => { setShowResourceForm(false); setFormData({ id: null, title: "", url: "", type: "Drive Link" }); }} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-themeTextSec">
            <i className="fa-solid fa-xmark text-xs"></i>
        </button>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-themeTextSec">Title</label>
 <input required type="text" className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-themeText outline-none focus:border-[#007AFF]" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value})} />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-themeTextSec">Type</label>
 <select className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-themeText outline-none focus:border-[#007AFF] appearance-none" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value})}>
 <option value="Drive Link">Google Drive</option>
 <option value="PDF Document">PDF Document</option>
 <option value="Video Lecture">Video Link</option>
 <option value="Web Resource">Web Link</option>
 </select>
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-themeTextSec">URL</label>
 <input required type="url" className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-themeText outline-none focus:border-[#007AFF]" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value})} />
 </div>
 <button type="submit" disabled={isSubmitting} className="btn-erp">
 {isSubmitting ? 'Saving...' : 'Save Resource'}
 </button>
 </form>
 )}

 <div className="flex flex-col gap-3">
 {resources.filter(r => r.cohort_subject_id === selectedCourse.id).length === 0 ? (
 <div className="text-center p-8 bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] rounded-2xl border border-black/10 dark:border-white/10 border-dashed">
 <p className="text-xs font-bold text-themeTextSec">No resources added yet.</p>
 </div>
 ) : (
 resources.filter(r => r.cohort_subject_id === selectedCourse.id).map(res => (
 <div key={res.id} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl p-4 hover:border-themeAccent/50 transition group flex items-center justify-between shadow-sm hover:shadow-md">
 <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-1">
 <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
 <i className={`${getIconForType(res.type)} text-lg`}></i>
 </div>
 <div>
 <h4 className="text-[15px] font-semibold text-themeText dark:text-themeText">{res.title}</h4>
 <p className="text-[10px] font-bold text-themeTextSec tracking-normal">{res.type}</p>
 </div>
 </a>
 <div className="flex flex-row items-center gap-2">
                <button 
                    onClick={() => {
                        setFormData({ id: res.id, title: res.title, url: res.url, type: res.type });
                        setShowResourceForm(true);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#007AFF]/10 text-themeTextSec hover:text-themeAccent transition"
                >
                    <i className="fa-solid fa-pen text-sm"></i>
                </button>
                <button onClick={() => handleDeleteResource(res.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition">
                    <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
            </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* EMBEDDED ATTENDANCE MODULE */}
 {activeSidebarTab === "attendance" && (
 <div className="animate-fade-in">
 <FacultyAttendance subjectContext={selectedCourse} />
 </div>
 )}

 {/* EMBEDDED MARKS MODULE */}
 {activeSidebarTab === "marks" && (
 <div className="animate-fade-in">
 <FacultyMarks subjectContext={selectedCourse} />
 </div>
 )}

 {/* EMBEDDED ASSIGNMENTS MODULE */}
 {activeSidebarTab === "assignments" && (
 <div className="animate-fade-in">
 <FacultyAssignments subjectContext={selectedCourse} />
 </div>
 )}

 

 </div>
 </div>
 )}
 
 </div>
 )}

 {previewUrl && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-5xl h-[85vh] bg-[#F2F2F7] dark:bg-[#000000] rounded-3xl overflow-hidden flex flex-col relative border border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <h3 className="text-sm font-black tracking-tight text-themeText dark:text-themeText flex items-center gap-2">
                                <i className="fa-brands fa-google-drive text-blue-500"></i> Document Preview
                            </h3>
                            <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <iframe src={previewUrl} className="w-full flex-1 border-none bg-white"></iframe>
                    </div>
                </div>
            )}
            
            {activeSyllabusSubject && (
     <SyllabusEditorModal 
         subject={activeSyllabusSubject}
         onClose={() => setActiveSyllabusSubject(null)}
         isReadOnly={true}
     />
 )}
 </div>
 </div>
 );
}
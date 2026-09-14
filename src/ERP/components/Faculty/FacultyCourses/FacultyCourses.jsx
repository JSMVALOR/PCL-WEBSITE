/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

import FacultyMarks from "../FacultyMarks/FacultyMarks";
import FacultyAttendance from "../FacultyAttendance/FacultyAttendance";
import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
import ClassRoster from "../ClassRoster/ClassRoster";

export default function FacultyCourses({ setActiveTab, isEmbedded = false }) {
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
 const [formData, setFormData] = useState({ title: "", url: "", type: "Drive Link" });
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 fetchCourseData();
 }, [userSession]);

 const fetchCourseData = async () => {
 if (!userSession?.db_id) return;
 try {
 // 1. Fetch Subjects
 const { data: subs, error: subErr } = await supabase
 .from('subjects')
 .select('id, name, code, credits')
 .eq('faculty_id', userSession.db_id);
 if (subErr) throw subErr;
 
 // 2. Fetch Schedule
 const { data: schedule } = await supabase
 .from('class_schedule')
 .select('*')
 .in('subject_id', (subs || []).map(s => s.id));
 
 // 3. Fetch Sessions
 const { data: sessions } = await supabase
 .from('class_sessions')
 .select('subject_id, status, total_students, present_count')
 .in('subject_id', (subs || []).map(s => s.id))
 .eq('status', 'completed');
 
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
 const subjSchedule = (schedule || []).filter(s => s.subject_id === subject.id);
 const subjSessions = (sessions || []).filter(s => s.subject_id === subject.id);
 
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
 const { data, error } = await supabase.from('course_resources').insert({
 faculty_id: userSession.db_id, subject_id: selectedCourse.id,
 title: formData.title, url: formData.url, type: formData.type
 }).select();
 if (error) throw error;
 setResources([data[0], ...resources]);
 setFormData({ title: "", url: "", type: "Drive Link" });
 setShowResourceForm(false);
 } catch (error) {
 console.error(error);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDeleteResource = async (id) => {
 if (!window.confirm("Delete this resource link?")) return;
 try {
 await supabase.from('course_resources').delete().eq('id', id);
 setResources(resources.filter(r => r.id !== id));
 } catch(error) {}
 };

 const getIconForType = (type) => {
 if (type.includes('Drive')) return 'fa-brands fa-google-drive text-blue-500';
 if (type.includes('PDF')) return 'fa-solid fa-file-pdf text-rose-500';
 if (type.includes('Video')) return 'fa-brands fa-youtube text-red-500';
 return 'fa-solid fa-link text-emerald-500';
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-black/5 dark:bg-white/10 ${!isEmbedded ? "min-h-screen bg-themeApp text-[#1C1C1E] dark:text-[#F2F2F7]" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 {/* HEADER */}
 <PageHeader 
 icon="fa-solid fa-layer-group" 
 title="My Courses" 
 subtitle="Manage your course materials and syllabus." 
 isEmbedded={isEmbedded}
 />

 {courses.length === 0 ? (
 <div className="py-24 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]/30 px-4">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-[#1C1C1E] dark:text-[#F2F2F7] font-black">No Courses Assigned</h3>
 <p className="text-xs lg:text-sm text-[#8E8E93] opacity-70 mt-2 max-w-xs mx-auto">You do not have any active subjects mapped to you.</p>
 </div>
 ) : (
 <div className="flex flex-col xl:flex-row gap-8 items-start">
 
 {/* LEFT: COURSE CARDS */}
 <div className={`flex flex-col gap-6 transition duration-500 ${selectedCourse ? 'xl:w-1/3 shrink-0' : 'w-full'}`}>
 <h2 className="text-[12px] font-bold tracking-tight text-[#8E8E93]">Your Active Subjects</h2>
 <div className={`grid gap-5 ${selectedCourse ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
 {courses.map(course => {
 const isSelected = selectedCourse?.id === course.id;
 return (
 <div 
 key={course.id}
 onClick={() => {
 setSelectedCourse(course);
 if(!isSelected) setActiveSidebarTab("overview");
 }}
 className={`bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 rounded-2xl overflow-hidden cursor-pointer transition duration-300 group flex flex-col ${
 isSelected ? 'border-[#007AFF] ring-4 ring-[#007AFF]/10 shadow-lg scale-[1.02]' : 'border-black/5 dark:border-white/5 hover:border-[#007AFF]/50'
 }`}
 >
 <div className="p-5 border-b border-black/5 dark:border-white/5/50 flex flex-col gap-2 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-[#007AFF]/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
 <div className="flex items-center gap-2">
 <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight text-[#8E8E93]">
 {course.code}
 </span>
 {course.batches.length > 0 && (
 <span className="bg-[#007AFF]/10 text-[#007AFF] px-2 py-0.5 rounded text-[11px] font-bold tracking-tight">
 {course.batches.join(', ')}
 </span>
 )}
 </div>
 <h3 className="text-xl font-black text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight">{course.name}</h3>
 </div>
 
 {/* Course Analytics Engine */}
 <div className="grid grid-cols-3 divide-x divide-themeBorder/50 border-b border-black/5 dark:border-white/5/50 bg-black/5 dark:bg-white/10/30">
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-black text-[#1C1C1E] dark:text-[#F2F2F7]">{course.classesDone}</span>
 <span className="text-[8px] font-black text-[#8E8E93] uppercase tracking-widest">Done</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className="text-xl font-black text-amber-500">{course.examDate ? course.classesLeft : '?'}</span>
 <span className="text-[8px] font-black text-[#8E8E93] uppercase tracking-widest">{course.examDate ? 'Left (Est)' : 'No Exam'}</span>
 </div>
 <div className="p-3 text-center flex flex-col items-center justify-center">
 <span className={`text-xl font-black ${Number(course.avgAttendance) >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
 {course.avgAttendance}%
 </span>
 <span className="text-[8px] font-black text-[#8E8E93] uppercase tracking-widest">Avg Attd</span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>

 {/* RIGHT: COURSE COMMAND CENTER (RIGHT SIDEBAR) */}
 {selectedCourse && (
 <div className="flex-1 w-full xl:w-2/3 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/5 dark:border-white/5 rounded-3xl flex flex-col animate-slide-in-right overflow-hidden min-h-[700px]">
 {/* Command Center Header */}
 <div className="p-6 lg:p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/10/30 flex flex-col gap-6">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-lg">
 <i className="fa-solid fa-graduation-cap"></i>
 </div>
 <span className="bg-themeApp border border-black/5 dark:border-white/5 px-3 py-1 rounded-full text-[12px] font-bold tracking-tight text-[#8E8E93]">
 {selectedCourse.code}
 </span>
 </div>
 <h2 className="text-2xl lg:text-3xl font-black text-[#1C1C1E] dark:text-[#F2F2F7]">{selectedCourse.name}</h2>
 </div>
 <button onClick={() => setSelectedCourse(null)} className="w-10 h-10 rounded-full bg-themeApp border border-black/5 dark:border-white/5 text-[#8E8E93] hover:text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition flex items-center justify-center">
 <i className="fa-solid fa-xmark"></i>
 </button>
 </div>
 
 {/* Command Center Tabs */}
 <div className="flex bg-themeApp p-1.5 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar">
 {[
 { id: "overview", label: "Overview", icon: "fa-chart-simple" },
 { id: "attendance", label: "Attendance", icon: "fa-clipboard-user" },
 { id: "assignments", label: "Assignments", icon: "fa-file-signature" },
 { id: "marks", label: "Marks Ledger", icon: "fa-lock" },
 { id: "roster", label: "Class Roster", icon: "fa-users-viewfinder" },
 { id: "resources", label: "Resources", icon: "fa-google-drive" }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveSidebarTab(tab.id)}
 className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg text-[12px] font-bold tracking-tight transition flex items-center justify-center gap-2 ${
 activeSidebarTab === tab.id 
 ? 'bg-black/5 dark:bg-white/10 text-[#007AFF] border border-black/5 dark:border-white/5' 
 : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:text-[#F2F2F7] border border-transparent hover:bg-black/5 dark:bg-white/10/50'
 }`}
 >
 <i className={`fa-solid ${tab.icon} ${activeSidebarTab === tab.id ? '' : 'opacity-70'}`}></i>
 {tab.label}
 </button>
 ))}
 </div>
 </div>

 {/* Content Area */}
 <div className="p-6 lg:p-8 flex-1 overflow-y-auto bg-themeApp/20 custom-scrollbar">
 
 {/* OVERVIEW TAB */}
 {activeSidebarTab === "overview" && (
 <div className="flex flex-col gap-6 animate-fade-in">
 <h3 className="text-sm font-black text-[#1C1C1E] dark:text-[#F2F2F7]">Course Synopsis</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="bg-themeApp border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-center">
 {selectedCourse.nextClass ? (
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-xl shrink-0">
 <i className="fa-solid fa-clock"></i>
 </div>
 <div>
 <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Next Scheduled Class</p>
 <p className="text-lg font-bold text-[#1C1C1E] dark:text-[#F2F2F7]">
 {selectedCourse.nextClass.daysUntil === 0 ? 'Today' : selectedCourse.nextClass.daysUntil === 1 ? 'Tomorrow' : selectedCourse.nextClass.day_of_week} at {selectedCourse.nextClass.start_time.substring(0,5)}
 </p>
 <p className="text-xs text-[#8E8E93] font-bold mt-0.5"><i className="fa-solid fa-location-dot mr-1"></i> Room {selectedCourse.nextClass.room_no}</p>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center text-center text-[#8E8E93] opacity-70">
 <i className="fa-solid fa-calendar-xmark text-2xl mb-2"></i>
 <span className="text-sm font-bold">No upcoming classes scheduled.</span>
 </div>
 )}
 </div>
 
 <div className="bg-themeApp border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center justify-between">
 <div>
 <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Total Credits</p>
 <p className="text-2xl font-black text-[#1C1C1E] dark:text-[#F2F2F7]">{selectedCourse.credits}</p>
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
 <h3 className="text-sm font-black text-[#1C1C1E] dark:text-[#F2F2F7]">Course Resources</h3>
 <button 
 onClick={() => setShowResourceForm(!showResourceForm)}
 className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-themeBorder border border-black/5 dark:border-white/5 text-[#1C1C1E] dark:text-[#F2F2F7] font-black text-[10px] uppercase tracking-widest transition"
 >
 <i className={`fa-solid ${showResourceForm ? 'fa-xmark' : 'fa-plus'} mr-1`}></i> 
 {showResourceForm ? 'Cancel' : 'Add Link'}
 </button>
 </div>

 {showResourceForm && (
 <form onSubmit={handleAddResource} className="bg-themeApp border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-[#8E8E93]">Title</label>
 <input required type="text" className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[#1C1C1E] dark:text-[#F2F2F7] outline-none focus:border-[#007AFF]" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-[#8E8E93]">Type</label>
 <select className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[#1C1C1E] dark:text-[#F2F2F7] outline-none focus:border-[#007AFF] appearance-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
 <option value="Drive Link">Google Drive</option>
 <option value="PDF Document">PDF Document</option>
 <option value="Video Lecture">Video Link</option>
 <option value="Web Resource">Web Link</option>
 </select>
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[11px] font-bold tracking-tight text-[#8E8E93]">URL</label>
 <input required type="url" className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-[#1C1C1E] dark:text-[#F2F2F7] outline-none focus:border-[#007AFF]" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
 </div>
 <button type="submit" disabled={isSubmitting} className="btn-erp">
 {isSubmitting ? 'Saving...' : 'Save Resource'}
 </button>
 </form>
 )}

 <div className="flex flex-col gap-3">
 {resources.filter(r => r.subject_id === selectedCourse.id).length === 0 ? (
 <div className="text-center p-8 bg-themeApp rounded-2xl border border-black/5 dark:border-white/5 border-dashed">
 <p className="text-xs font-bold text-[#8E8E93]">No resources added yet.</p>
 </div>
 ) : (
 resources.filter(r => r.subject_id === selectedCourse.id).map(res => (
 <div key={res.id} className="bg-themeApp border border-black/5 dark:border-white/5 rounded-xl p-4 hover:border-[#007AFF]/50 transition group flex items-center justify-between">
 <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-1">
 <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
 <i className={`${getIconForType(res.type)} text-lg`}></i>
 </div>
 <div>
 <h4 className="text-sm font-black text-[#1C1C1E] dark:text-[#F2F2F7]">{res.title}</h4>
 <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">{res.type}</p>
 </div>
 </a>
 <button onClick={() => handleDeleteResource(res.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition flex items-center justify-center shrink-0">
 <i className="fa-solid fa-trash text-xs"></i>
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* EMBEDDED ATTENDANCE MODULE */}
 {activeSidebarTab === "attendance" && (
 <div className="-m-4 lg:-m-8">
 <FacultyAttendance subjectContext={selectedCourse} />
 </div>
 )}

 {/* EMBEDDED MARKS MODULE */}
 {activeSidebarTab === "marks" && (
 <div className="-m-4 lg:-m-8">
 <FacultyMarks subjectContext={selectedCourse} />
 </div>
 )}

 {/* EMBEDDED ASSIGNMENTS MODULE */}
 {activeSidebarTab === "assignments" && (
 <div className="-m-4 lg:-m-8">
 <FacultyAssignments subjectContext={selectedCourse} />
 </div>
 )}

 {/* EMBEDDED CLASS ROSTER MODULE */}
 {activeSidebarTab === "roster" && (
 <div className="-m-4 lg:-m-8">
 <ClassRoster subjectContext={selectedCourse} />
 </div>
 )}

 </div>
 </div>
 )}
 
 </div>
 )}
 </div>
 </div>
 );
}
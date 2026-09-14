/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import PageHeader from "../../shared/PageHeader/PageHeader";

const CACHE_KEYS = {
 rooms: "coe_rooms",
 courses: "coe_courses",
 exams: "coe_exams",
 assignments: "coe_assignments",
 manual_marks: "coe_manual_marks"
};

const readCache = (key) => {
 try {
 const raw = sessionStorage.getItem(key);
 return raw ? JSON.parse(raw) : [];
 } catch {
 return [];
 }
};

const writeCache = (key, data) => {
 try {
 sessionStorage.setItem(key, JSON.stringify(data));
 } catch {}
};

const INPUT_CLS =
 "w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-themeText text-[10px] lg:text-sm font-bold px-4 py-3 rounded-themePanel outline-none focus:border-themeAccent focus:bg-themePanel/85 backdrop-blur-2xl transition-colors placeholder:text-neutral-600";

const SELECT_CLS =
 "w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-themeText text-[10px] lg:text-sm font-bold py-3 pl-4 pr-10 rounded-themePanel outline-none focus:border-themeAccent focus:bg-themePanel/85 backdrop-blur-2xl transition-colors appearance-none cursor-pointer truncate";

const LABEL_CLS = `block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1.5 ml-1`;

const SUBMIT_CLS =
 "w-full py-3.5 lg:py-4 mt-2 bg-themeAccent hover:bg-themeAccentMuted text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2";

export default function AdminExaminations({ isHubView = false, isEmbedded = false }) {
 const [view, setView] = useState("schedule");

 // Initialize from cache
 const [rooms, setRooms] = useState(() => readCache(CACHE_KEYS.rooms));
 const [exams, setExams] = useState(() => readCache(CACHE_KEYS.exams));
 const [courses, setCourses] = useState(() => readCache(CACHE_KEYS.courses));
 
 // Ledger Control State
 const [assignments, setAssignments] = useState(() => readCache(CACHE_KEYS.assignments));
 const [manualMarks, setManualMarks] = useState(() => readCache(CACHE_KEYS.manual_marks));

 // Room form
 const [roomName, setRoomName] = useState("");
 const [roomRows, setRoomRows] = useState("");
 const [roomCols, setRoomCols] = useState("");
 const [isCreatingRoom, setIsCreatingRoom] = useState(false);

 // Exam form
 const [examCourse, setExamCourse] = useState("");
 const [examType, setExamType] = useState("End Semester");
 const [examDate, setExamDate] = useState("");
 const [examStart, setExamStart] = useState("");
 const [examEnd, setExamEnd] = useState("");
 const [examRoom, setExamRoom] = useState("");
 const [isScheduling, setIsScheduling] = useState(false);

 const [isLocking, setIsLocking] = useState(false);

 const fetchMasterData = useCallback(async () => {
 try {
 const [roomRes, courseRes, examRes, asgRes, marksRes] = await Promise.all([
 supabase.from("exam_rooms").select("*").order("room_name"),
 supabase.from("batch_courses").select("*").order("batch_id"),
 supabase.from("exams").select("*, batch_courses(course_name, batch_id), exam_rooms(room_name, total_capacity)").order("exam_date", { ascending: false }),
 supabase.from("assignments").select("*, profiles!faculty_id(full_name)").order("created_at", { ascending: false }),
 supabase.from("student_marks").select("subject_name, exam_type, admin_locked").order("subject_name")
 ]);

 if (roomRes.data) { setRooms(roomRes.data); writeCache(CACHE_KEYS.rooms, roomRes.data); }
 if (courseRes.data) { setCourses(courseRes.data); writeCache(CACHE_KEYS.courses, courseRes.data); }
 if (examRes.data) { setExams(examRes.data); writeCache(CACHE_KEYS.exams, examRes.data); }
 
 if (asgRes.data) { setAssignments(asgRes.data); writeCache(CACHE_KEYS.assignments, asgRes.data); }
 
 if (marksRes.data) {
 // Deduplicate manual marks by subject and exam type
 const uniqueMarksMap = new Map();
 marksRes.data.forEach(m => {
 const key = `${m.subject_name}_${m.exam_type}`;
 // Prefer true admin_locked if any exists
 if (!uniqueMarksMap.has(key) || m.admin_locked) {
 uniqueMarksMap.set(key, m);
 }
 });
 const deduped = Array.from(uniqueMarksMap.values());
 setManualMarks(deduped);
 writeCache(CACHE_KEYS.manual_marks, deduped);
 }

 } catch (err) {
 console.error("Error loading admin data:", err);
 }
 }, []);

 useEffect(() => { fetchMasterData(); }, [fetchMasterData]);

 const handleCreateRoom = async (e) => {
 e.preventDefault();
 setIsCreatingRoom(true);
 try {
 const { error } = await supabase.from("exam_rooms").insert({ room_name: roomName, total_rows: parseInt(roomRows), seats_per_row: parseInt(roomCols) });
 if (error) throw error;
 setRoomName(""); setRoomRows(""); setRoomCols("");
 await fetchMasterData();
 } catch (error) { window.erpDialog.alert(error.message); } 
 finally { setIsCreatingRoom(false); }
 };

 const handleScheduleExam = async (e) => {
 e.preventDefault();
 setIsScheduling(true);
 try {
 const { error } = await supabase.from("exams").insert({ course_id: examCourse, exam_type: examType, exam_date: examDate, start_time: examStart, end_time: examEnd, room_id: examRoom });
 if (error) throw error;
 setExamCourse(""); setExamDate(""); setExamStart(""); setExamEnd(""); setExamRoom("");
 await fetchMasterData();
 } catch (error) { window.erpDialog.alert(error.message); } 
 finally { setIsScheduling(false); }
 };

 const handleGenerateTickets = async (examId) => {
 if (!(await window.erpDialog.confirm("Are you sure? This will mint hall tickets for the entire batch."))) return;
 try {
 const { error } = await supabase.rpc("generate_admit_cards", { p_exam_id: examId });
 if (error) throw error;
 window.erpDialog.alert("Success! Admit cards generated.");
 await fetchMasterData();
 } catch (error) { window.erpDialog.alert(`Generation Failed: ${error.message}`); }
 };

 const toggleAssignmentLock = async (asgId, currentState) => {
 setIsLocking(true);
 try {
 const { error } = await supabase.from('assignments').update({ admin_locked: !currentState }).eq('id', asgId);
 if (error) throw error;
 await fetchMasterData();
 } catch (error) { window.erpDialog.alert(`Failed to lock assignment: ${error.message}`); }
 finally { setIsLocking(false); }
 };

 const toggleManualExamLock = async (subject_name, exam_type, currentState) => {
 setIsLocking(true);
 try {
 const { error } = await supabase.from('student_marks').update({ admin_locked: !currentState }).eq('subject_name', subject_name).eq('exam_type', exam_type);
 if (error) throw error;
 await fetchMasterData();
 } catch (error) { window.erpDialog.alert(`Failed to lock exam ledger: ${error.message}`); }
 finally { setIsLocking(false); }
 };

 const tabs = [
 { id: "schedule", label: "Exam Ledger", icon: "fa-calendar-check" },
 { id: "rooms", label: "Room Config", icon: "fa-border-all" },
 { id: "marks", label: "Ledger Control", icon: "fa-lock" },
 ];

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 {!isHubView && (
 <PageHeader icon="fa-solid fa-building-columns" title="Examinations HQ" subtitle="Schedule assessments and lock academic ledgers." />
 )}

 <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-2xl backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 relative z-10 gap-1.5 w-full xl:w-auto overflow-x-auto no-scrollbar ${!isHubView ? '-mt-2 lg:-mt-4' : 'mb-6 lg:mb-8'}`}>
 {tabs.map((t) => (
 <button
 key={t.id}
 onClick={() => setView(t.id)}
 className={`flex-1 xl:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 view === t.id 
 ? 'bg-themeAccent text-white border border-themeAccent scale-100' 
 : 'text-themeTextSec hover:text-themeText hover:bg-themePanel/85 backdrop-blur-2xl border border-transparent scale-95 hover:scale-100'
 }`}
 >
 <i className={`fa-solid ${t.icon} ${view === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
 </button>
 ))}
 </div>

 {/* ═══ VIEW: SCHEDULE EXAMS ═══ */}
 {view === "schedule" && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
 <div className="lg:col-span-4 flex flex-col gap-6">
 <div className={`${theme.layout.panel} rounded-themePanel border border-white/5 p-5 lg:p-6 sticky top-24`}>
 <h3 className="text-lg font-black text-themeText mb-6">Schedule Exam</h3>
 <form onSubmit={handleScheduleExam} className="flex flex-col gap-4">
 <div>
 <label className={LABEL_CLS}>Batch / Course</label>
 <div className="relative">
 <select required value={examCourse} onChange={(e) => setExamCourse(e.target.value)} className={SELECT_CLS}>
 <option value="">Select Course...</option>
 {courses.map((c) => (<option key={c.id} value={c.id}>{c.batch_id} - {c.course_name}</option>))}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"></i>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className={LABEL_CLS}>Exam Type</label>
 <div className="relative">
 <select required value={examType} onChange={(e) => setExamType(e.target.value)} className={SELECT_CLS}>
 <option value="End Semester">End Semester</option>
 <option value="Mid Term">Mid Term</option>
 <option value="Practical">Practical</option>
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"></i>
 </div>
 </div>
 <div>
 <label className={LABEL_CLS}>Date</label>
 <input type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${INPUT_CLS} dark:[color-scheme:dark]`} />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className={LABEL_CLS}>Start Time</label>
 <input type="time" required value={examStart} onChange={(e) => setExamStart(e.target.value)} className={`${INPUT_CLS} dark:[color-scheme:dark]`} />
 </div>
 <div>
 <label className={LABEL_CLS}>End Time</label>
 <input type="time" required value={examEnd} onChange={(e) => setExamEnd(e.target.value)} className={`${INPUT_CLS} dark:[color-scheme:dark]`} />
 </div>
 </div>
 <div>
 <label className={LABEL_CLS}>Exam Room</label>
 <div className="relative">
 <select required value={examRoom} onChange={(e) => setExamRoom(e.target.value)} className={SELECT_CLS}>
 <option value="">Select Room...</option>
 {rooms.map((r) => (<option key={r.id} value={r.id}>{r.room_name} ({r.total_capacity} seats)</option>))}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"></i>
 </div>
 </div>
 <button type="submit" disabled={isScheduling} className={SUBMIT_CLS}>
 {isScheduling ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Scheduling...</> : <><i className="fa-solid fa-calendar-plus"></i> Finalize Schedule</>}
 </button>
 </form>
 </div>
 </div>
 <div className="lg:col-span-8 flex flex-col gap-5">
 {exams.length === 0 ? (
 <div className="py-20 border-2 border-dashed border-white/5 rounded-themePanel flex flex-col items-center justify-center text-center px-4 bg-themeApp">
 <i className="fa-regular fa-calendar text-4xl text-neutral-600 mb-3"></i>
 <p className="text-sm font-bold text-themeTextSec">No exams scheduled</p>
 </div>
 ) : (
 exams.map((ex) => (
 <div key={ex.id} className={`${theme.layout.panel} p-5 rounded-themePanel border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
 <div>
 <div className="flex items-center gap-3 mb-2">
 <span className="px-2 py-1 bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded text-[9px] font-black uppercase text-themeTextSec">{ex.batch_courses?.batch_id}</span>
 <span className="px-2 py-1 bg-themeAccent/10 text-themeAccent border-theme border-themeAccent/20 rounded text-[9px] font-black uppercase">{ex.exam_type}</span>
 </div>
 <h4 className="text-lg font-black text-themeText mb-1">{ex.batch_courses?.course_name}</h4>
 <div className="flex items-center gap-4 text-xs font-bold text-themeTextSec">
 <span><i className="fa-regular fa-calendar mr-1"></i> {new Date(ex.exam_date).toLocaleDateString("en-GB")}</span>
 <span><i className="fa-regular fa-clock mr-1"></i> {ex.start_time} - {ex.end_time}</span>
 <span><i className="fa-solid fa-location-dot mr-1"></i> {ex.exam_rooms?.room_name}</span>
 </div>
 </div>
 <button onClick={() => handleGenerateTickets(ex.id)} className="px-4 py-2 bg-themeElevated/90 backdrop-blur-2xl hover:bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-themeText transition-colors flex items-center gap-2">
 <i className="fa-solid fa-ticket text-emerald-400"></i> Admit Cards
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* ═══ VIEW: ROOM CONFIG ═══ */}
 {view === "rooms" && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
 <div className="lg:col-span-4">
 <div className={`${theme.layout.panel} rounded-themePanel border border-white/5 p-5 lg:p-6 sticky top-24`}>
 <h3 className="text-lg font-black text-themeText mb-6">Create Room</h3>
 <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
 <div>
 <label className={LABEL_CLS}>Room Name/Number</label>
 <input type="text" required value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Hall A" className={INPUT_CLS} />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className={LABEL_CLS}>Total Rows</label>
 <input type="number" required min="1" value={roomRows} onChange={(e) => setRoomRows(e.target.value)} placeholder="e.g. 10" className={INPUT_CLS} />
 </div>
 <div>
 <label className={LABEL_CLS}>Seats per Row</label>
 <input type="number" required min="1" value={roomCols} onChange={(e) => setRoomCols(e.target.value)} placeholder="e.g. 8" className={INPUT_CLS} />
 </div>
 </div>
 <button type="submit" disabled={isCreatingRoom} className={SUBMIT_CLS}>
 {isCreatingRoom ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-plus"></i> Add Room</>}
 </button>
 </form>
 </div>
 </div>
 <div className="lg:col-span-8">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
 {rooms.length === 0 ? (
 <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-themePanel flex flex-col items-center justify-center text-center px-4 bg-themeApp">
 <i className="fa-solid fa-border-none text-4xl text-neutral-600 mb-3"></i>
 <p className="text-sm font-bold text-themeTextSec">No rooms configured</p>
 </div>
 ) : (
 rooms.map((r) => (
 <div key={r.id} className={`${theme.layout.panel} p-5 rounded-themePanel border border-white/5 flex justify-between items-center group`}>
 <div>
 <h4 className="text-base font-black text-themeText mb-1">{r.room_name}</h4>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">{r.total_rows} rows × {r.seats_per_row} seats</p>
 </div>
 <div className="w-12 h-12 rounded-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 flex items-center justify-center">
 <span className="text-sm font-black text-themeAccent">{r.total_capacity}</span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}

 {/* ═══ VIEW: MARKS LEDGER CONTROL ═══ */}
 {view === "marks" && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-fade-in">
 
 {/* ASSIGNMENTS LEDGER */}
 <div className={`${theme.layout.panel} border border-white/5 rounded-themePanel overflow-hidden flex flex-col`}>
 <div className="p-6 border-b-theme border-white/5 bg-themeElevated/90 backdrop-blur-2xl">
 <h3 className="text-lg font-black text-themeText flex items-center gap-2">
 <i className="fa-solid fa-file-pen text-indigo-400"></i> Assignments Ledger
 </h3>
 <p className="text-[10px] uppercase font-bold text-themeTextSec mt-1">Lock faculty assignments to prevent mark changes</p>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[600px] no-scrollbar">
 {assignments.length === 0 ? (
 <p className="text-center text-themeTextSec text-xs font-bold p-8">No assignments published</p>
 ) : (
 assignments.map(asg => (
 <div key={asg.id} className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4">
 <div className="flex-1">
 <div className="flex gap-2 mb-1">
 <span className="px-2 py-0.5 bg-themeElevated/90 backdrop-blur-2xl text-[8px] font-black uppercase text-themeTextSec rounded">{asg.batch_id}</span>
 <span className="px-2 py-0.5 bg-themeElevated/90 backdrop-blur-2xl text-[8px] font-black uppercase text-indigo-400 rounded">{asg.subject_name}</span>
 </div>
 <p className="text-sm font-black text-themeText line-clamp-1">{asg.title}</p>
 <p className="text-[10px] text-themeTextSec mt-1"><i className="fa-solid fa-user-tie"></i> {asg.profiles?.full_name}</p>
 </div>
 <button 
 disabled={isLocking}
 onClick={() => toggleAssignmentLock(asg.id, asg.admin_locked)}
 className={`w-28 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${asg.admin_locked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'}`}
 >
 {asg.admin_locked ? <><i className="fa-solid fa-lock"></i> Locked</> : <><i className="fa-solid fa-lock-open"></i> Open</>}
 </button>
 </div>
 ))
 )}
 </div>
 </div>

 {/* MANUAL EXAMS LEDGER */}
 <div className={`${theme.layout.panel} border border-white/5 rounded-themePanel overflow-hidden flex flex-col`}>
 <div className="p-6 border-b-theme border-white/5 bg-themeElevated/90 backdrop-blur-2xl">
 <h3 className="text-lg font-black text-themeText flex items-center gap-2">
 <i className="fa-solid fa-pen-ruler text-rose-400"></i> Manual Exams Ledger
 </h3>
 <p className="text-[10px] uppercase font-bold text-themeTextSec mt-1">Lock subjective exam marks (Mid-Terms, Vivas)</p>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-[600px] no-scrollbar">
 {manualMarks.length === 0 ? (
 <p className="text-center text-themeTextSec text-xs font-bold p-8">No manual marks submitted yet</p>
 ) : (
 manualMarks.map((m, i) => (
 <div key={i} className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4">
 <div className="flex-1">
 <span className="px-2 py-0.5 bg-themeElevated/90 backdrop-blur-2xl border border-white/5 text-[8px] font-black uppercase text-rose-400 rounded inline-block mb-1">
 {m.exam_type}
 </span>
 <p className="text-sm font-black text-themeText line-clamp-1">{m.subject_name}</p>
 </div>
 <button 
 disabled={isLocking}
 onClick={() => toggleManualExamLock(m.subject_name, m.exam_type, m.admin_locked)}
 className={`w-28 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${m.admin_locked ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'}`}
 >
 {m.admin_locked ? <><i className="fa-solid fa-lock"></i> Locked</> : <><i className="fa-solid fa-lock-open"></i> Open</>}
 </button>
 </div>
 ))
 )}
 </div>
 </div>

 </div>
 )}
 </div>
 </div>
 );
}
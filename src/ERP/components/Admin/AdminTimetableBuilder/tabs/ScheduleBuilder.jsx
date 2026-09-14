/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';
import WeeklyChart from '../../../shared/WeeklyChart';

export default function ScheduleBuilder({ isEmbedded = false }) {
 const [schedule, setSchedule] = useState([]);
 const [subjects, setSubjects] = useState([]);
 const [rooms, setRooms] = useState([]);
 const [semesters, setSemesters] = useState([]);
 const [faculties, setFaculties] = useState([]);
 
 const [loading, setLoading] = useState(true);
 
 // Modal & Draw states
 const [selectedClass, setSelectedClass] = useState(null); // For edit/delete modal
 const [isDrawMode, setIsDrawMode] = useState(false);
 const [isCreating, setIsCreating] = useState(false);
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const handleCreate = () => {};
 const [pendingDraws, setPendingDraws] = useState([]);

 // Filter State
 const [selectedBatch, setSelectedBatch] = useState('BBA LL.B. (Hons.)'); // Example fallback

 // Brush State
 const [subjectId, setSubjectId] = useState('');
 const [roomId, setRoomId] = useState('');
 const [facultyId, setFacultyId] = useState('');

 const fetchData = async () => {
 setLoading(true);
 try {
 // 1. Fetch Classrooms
 const { data: roomData } = await supabase.from('academic_classrooms').select('id, name').eq('status', 'Active');
 setRooms(roomData || []);
 if (roomData?.length > 0 && !roomId) setRoomId(roomData[0].id);

 // 2. Fetch Subjects (for the dropdown)
 const { data: subData } = await supabase.from('subjects').select('id, name, theme_color, faculty_id, faculty:profiles(full_name)');
 setSubjects(subData || []);
 if (subData?.length > 0 && !subjectId) setSubjectId(subData[0].id);

 // 2.5 Fetch Faculties
 const { data: facData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
 setFaculties(facData || []);

 // 3. Fetch Active Semesters (to construct batch names)
 const { data: semData } = await supabase.from('academic_semesters').select('id, name, programme').eq('is_active_globally', true);
 setSemesters(semData || []);
 if (semData?.length > 0 && !semData.find(s => `${s.programme} - ${s.name}` === selectedBatch)) {
 setSelectedBatch(`${semData[0].programme} - ${semData[0].name}`);
 }

 // 4. Fetch actual schedule for the selected batch
 if (selectedBatch) {
 const { data: schedData, error } = await supabase
 .from('class_schedule')
 .select(`
 id, batch, day_of_week, start_time, end_time,
 subject:subjects(name, theme_color, faculty:profiles(full_name)),
 room:academic_classrooms(name),
 faculty:profiles(full_name)
 `)
 .eq('batch', selectedBatch);
 
 if (error) throw error;
 
 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };
 
 const formatted = (schedData || []).map(s => ({
 id: s.id,
 day: daysMap[s.day_of_week] || 'Monday',
 time: s.start_time.slice(0, 5),
 endTime: s.end_time.slice(0, 5),
 subject: s.subject?.name,
 color: s.subject?.theme_color,
 room: s.room?.name,
 faculty: s.faculty?.full_name || s.subject?.faculty?.full_name,
 raw: s
 }));
 
 setSchedule(formatted);
 }
 } catch (err) {
 console.error("Failed to fetch schedule data:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, [selectedBatch]);

 useEffect(() => {
 if (subjectId && subjects.length > 0) {
 const selectedSub = subjects.find(s => s.id === subjectId);
 if (selectedSub && selectedSub.faculty_id) {
 setFacultyId(selectedSub.faculty_id);
 } else {
 setFacultyId('');
 }
 }
 }, [subjectId, subjects]);

 // Check for double booking
 const checkConflicts = async (faculty, room, d, sTime, eTime) => {
 try {
 // Check against Database
 // Check if faculty is busy
 if (faculty) {
 const { data: facConflict } = await supabase
 .from('class_schedule')
 .select('id, batch')
 .eq('faculty_id', faculty)
 .eq('day_of_week', d)
 .lt('start_time', eTime)
 .gt('end_time', sTime);
 
 if (facConflict && facConflict.length > 0) {
 return `Faculty is already booked for another batch (${facConflict[0].batch}) at this time.`;
 }
 }

 // Check if room is busy
 if (room) {
 const { data: roomConflict } = await supabase
 .from('class_schedule')
 .select('id, batch')
 .eq('room_id', room)
 .eq('day_of_week', d)
 .lt('start_time', eTime)
 .gt('end_time', sTime);
 
 if (roomConflict && roomConflict.length > 0) {
 return `Room is already booked for another batch (${roomConflict[0].batch}) at this time.`;
 }
 }

 // Check against Pending Local Drafts
 for (let draft of pendingDraws) {
 if (draft.raw.day_of_week === d && draft.raw.start_time < eTime && draft.raw.end_time > sTime) {
 if (faculty && draft.raw.faculty_id === faculty) return `Faculty is already booked in your unsaved drafts.`;
 if (room && draft.raw.room_id === room) return `Room is already booked in your unsaved drafts.`;
 if (selectedBatch === draft.raw.batch) return `Batch is already booked in your unsaved drafts.`;
 }
 }

 return null; // no conflict
 } catch (err) {
 console.error("Conflict check error:", err);
 return null;
 }
 };

 const handleSlotClick = async (dayString, timeStr) => {
 if (!isDrawMode) return;
 if (!subjectId || !roomId) {
 alert("Please select a Subject and Room in the Draw Toolbar first.");
 return;
 }

 const daysMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
 const d = daysMap[dayString];
 
 // Calculate end time (default + 1 hour)
 const [h, m] = timeStr.split(':');
 const endHour = parseInt(h, 10) + 1;
 const endTimeStr = `${String(endHour).padStart(2, '0')}:${m}`;

 const conflictMsg = await checkConflicts(facultyId, roomId, d, timeStr + ':00', endTimeStr + ':00');
 if (conflictMsg) {
 alert(`Conflict Detected: ${conflictMsg}`);
 return;
 }

 const selectedSub = subjects.find(s => s.id === subjectId);
 const selectedRoom = rooms.find(r => r.id === roomId);
 const selectedFac = faculties.find(f => f.id === facultyId);

 const draftObj = {
 id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
 day: dayString,
 time: timeStr,
 endTime: endTimeStr,
 subject: selectedSub?.name,
 color: selectedSub?.theme_color,
 room: selectedRoom?.name,
 faculty: selectedFac?.full_name || selectedSub?.faculty?.full_name,
 isDraft: true,
 raw: {
 batch: selectedBatch,
 subject_id: subjectId,
 room_id: roomId,
 faculty_id: facultyId || null,
 day_of_week: d,
 start_time: timeStr + ':00',
 end_time: endTimeStr + ':00',
 status: 'Scheduled'
 }
 };

 setPendingDraws(prev => [...prev, draftObj]);
 };

 const handleSaveDraws = async () => {
 if (pendingDraws.length === 0) return;
 try {
 setLoading(true);
 const inserts = pendingDraws.map(d => d.raw);
 const { error } = await supabase.from('class_schedule').insert(inserts);
 
 if (error) throw error;
 
 setPendingDraws([]);
 fetchData();
 window.erpDialog?.alert(`Successfully saved ${inserts.length} classes!`);
 } catch (err) {
 console.error("Failed to save drafts:", err);
 window.erpDialog?.alert("Error saving drawn classes.");
 setLoading(false);
 }
 };

 // Removed handleCreate as draw mode handles creation

 const handleDeleteClass = async () => {
 if (!selectedClass) return;
 if (!window.confirm(`Delete ${selectedClass.subject} class from the schedule?`)) return;
 
 try {
 const { error } = await supabase.from('class_schedule').delete().eq('id', selectedClass.id);
 if (error) throw error;
 
 setSelectedClass(null);
 fetchData();
 } catch (err) {
 console.error("Failed to delete class:", err);
 window.erpDialog?.alert("Error deleting class.");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in pb-12 relative">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h2 className="text-xl font-black text-themeText">Timetable Builder</h2>
 <p className="text-xs font-bold text-themeTextSec">Construct exact schedules directly injected into student and faculty feeds.</p>
 </div>
 
 <div className="flex gap-4 items-center w-full md:w-auto">
 <div className="relative">
 <i className="fa-solid fa-layer-group absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs"></i>
 <select 
 value={selectedBatch} 
 onChange={e => setSelectedBatch(e.target.value)} 
 className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-themeText outline-none appearance-none cursor-pointer hover:border-themeAccent transition-colors"
 >
 {semesters.map(s => (
 <option key={s.id} value={`${s.programme} - ${s.name}`}>{s.programme} - {s.name}</option>
 ))}
 </select>
 </div>
 
 <button type="button" 
 onClick={() => setIsDrawMode(!isDrawMode)} 
 className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition whitespace-nowrap border ${isDrawMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-themeElevated/90 backdrop-blur-2xl border-black/5 dark:border-white/10 text-themeText hover:border-themeAccent'}`}
 >
 <i className="fa-solid fa-paintbrush mr-2"></i> Draw Mode
 </button>
 </div>
 </div>
 
 {/* Draw Mode Brush Toolbar */}
 {isDrawMode && (
 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 animate-fade-in -mt-2">
 <div className="flex items-center gap-2 shrink-0">
 <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
 <i className="fa-solid fa-palette text-sm"></i>
 </div>
 <div>
 <p className="text-xs font-black text-amber-500 uppercase tracking-wider leading-tight">Active Brush</p>
 <p className="text-[10px] font-bold text-themeTextSec">Click grid to paint a 1-hour slot.</p>
 </div>
 </div>
 <div className="flex flex-wrap md:flex-nowrap gap-3 flex-1">
 <select className="flex-1 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 <select className="flex-1 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={roomId} onChange={e => setRoomId(e.target.value)}>
 {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
 </select>
 <select className="flex-1 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
 <option value="">No Faculty</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 </div>
 {pendingDraws.length > 0 && (
 <div className="flex items-center gap-2 ml-auto shrink-0 border-l border-amber-500/30 pl-4">
 <button type="button" onClick={() => setPendingDraws([])} className="px-3 py-2 rounded-lg text-[10px] font-black uppercase text-amber-500 hover:bg-amber-500/10 transition-colors">
 Clear
 </button>
 <button type="button" onClick={handleSaveDraws} className="px-4 py-2 rounded-lg text-xs font-black uppercase bg-amber-500 text-white hover:bg-amber-600 transition-colors">
 Save {pendingDraws.length} {pendingDraws.length === 1 ? 'Class' : 'Classes'}
 </button>
 </div>
 )}
 </div>
 )}

 {loading ? (
 <div className="h-64 flex items-center justify-center">
 <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
 </div>
 ) : (
 <WeeklyChart schedule={[...schedule, ...pendingDraws]} role="admin" onLectureClick={(cls) => setSelectedClass(cls)} isDrawMode={isDrawMode} onSlotClick={handleSlotClick} />
 )}

 {/* CREATE MODAL */}
 {isCreating && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-themePanel/85 backdrop-blur-2xl w-full max-w-lg rounded-themePanel overflow-hidden border border-white/5 flex flex-col">
 <div className="px-6 py-5 border-b border-white/5 bg-themeElevated/50 flex justify-between items-center">
 <div>
 <h3 className="text-lg font-black text-themeText">Schedule New Class</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-0.5">{selectedBatch}</p>
 </div>
 <button type="button" onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] hover:bg-themeBorderStrong text-themeText transition-colors">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 
 <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Subject</label>
 <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="col-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Faculty</label>
 <select value={facultyId} onChange={e => setFacultyId(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 <option value="">-- Select Faculty --</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 {subjects.find(s => s.id === subjectId)?.faculty_id && (
 <p className="text-[10px] font-bold text-emerald-500 mt-1"><i className="fa-solid fa-magic mr-1"></i> Auto-assigned based on subject</p>
 )}
 </div>

 <div className="col-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Classroom</label>
 <select value={roomId} onChange={e => setRoomId(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Day</label>
 <select value={day} onChange={e => setDay(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 <option value="1">Monday</option>
 <option value="2">Tuesday</option>
 <option value="3">Wednesday</option>
 <option value="4">Thursday</option>
 <option value="5">Friday</option>
 <option value="6">Saturday</option>
 <option value="7">Sunday</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Start Time</label>
 <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark transition-colors" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">End Time</label>
 <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark transition-colors" />
 </div>
 </div>
 
 <button type="submit" className="btn-erp">
 Schedule Class
 </button>
 </form>
 </div>
 </div>
 )}

 {/* MANAGE/DELETE MODAL */}
 {selectedClass && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-themePanel/85 backdrop-blur-2xl w-full max-w-sm rounded-themePanel overflow-hidden border border-white/5 flex flex-col relative">
 <button type="button" onClick={() => setSelectedClass(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder text-themeText transition-colors z-10">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 
 <div className="p-6 pt-10 flex flex-col items-center text-center gap-2">
 <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-2xl mb-2">
 <i className="fa-regular fa-calendar-minus"></i>
 </div>
 <h3 className="text-xl font-black text-themeText">{selectedClass.subject}</h3>
 <p className="text-sm font-bold text-themeTextSec">{selectedClass.day}, {selectedClass.time} - {selectedClass.endTime}</p>
 
 <div className="flex flex-col gap-1 mt-4 w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-xl p-4">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Faculty</span>
 <span className="text-xs font-bold text-themeText">{selectedClass.faculty}</span>
 </div>
 <div className="w-full h-px bg-themeBorder my-1"></div>
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Room</span>
 <span className="text-xs font-bold text-themeText">{selectedClass.room}</span>
 </div>
 </div>
 
 <button type="button" onClick={handleDeleteClass} className="w-full bg-rose-500 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors mt-6">
 Delete Class
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}

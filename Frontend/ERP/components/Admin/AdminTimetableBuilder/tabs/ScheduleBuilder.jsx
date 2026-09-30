/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';

import HoldButton from '../../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';
import WeeklyChart from '../../../shared/WeeklyChart';

export default function ScheduleBuilder({}) {
 const [schedule, setSchedule] = useState([]);
 const [subjects, setSubjects] = useState([]);
 const [batches, setBatches] = useState([]);
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
 const [facultyId, setFacultyId] = useState('');
 const [cohortColor, setCohortColor] = useState('blue');

 const fetchData = async () => {
 setLoading(true);
 try {
 // 1.5 Fetch Faculties
 const { data: facData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
 setFaculties(facData || []);

 // 2. Fetch Active Batches FIRST
 const { data: semData } = await supabase.from('academic_batches').select('id, name').eq('status', 'active');
 setBatches(semData || []);
 
 let currentBatchString = selectedBatch;
 if (semData?.length > 0 && !semData.find(s => s.name === selectedBatch)) {
    currentBatchString = semData[0].name;
    setSelectedBatch(currentBatchString);
 }

 const activeBatchObj = (semData || []).find(s => s.name === currentBatchString);
 const activeBatchId = activeBatchObj ? activeBatchObj.id : null;

 // Fetch the selected cohort's theme color to use as fallback
 let fetchedCohortColor = 'blue';
 if (currentBatchString) {
    const { data: batchData } = await supabase.from('academic_batches').select('theme_color, academic_programs(theme_color)').eq('name', currentBatchString).single();
    if (batchData) {
        fetchedCohortColor = batchData.academic_programs?.theme_color || batchData.theme_color || 'blue';
    }
 }
 setCohortColor(fetchedCohortColor);

 // 3. Fetch Subjects ONLY for this specific batch
 if (activeBatchId) {
    const { data: cohortData } = await supabase.from('cohort_subjects')
        .select('faculty_id, master_subjects(id, name, theme_color)')
        .eq('batch_id', activeBatchId);
    
    if (cohortData) {
        const filteredSubjects = cohortData.filter(c => c.master_subjects).map(c => ({
            id: c.master_subjects.id,
            name: c.master_subjects.name,
            theme_color: c.master_subjects.theme_color,
            faculty_id: c.faculty_id
        }));
        setSubjects(filteredSubjects);
        // Force update the selected subject if it's invalid for this batch
        if (filteredSubjects.length > 0 && (!subjectId || !filteredSubjects.find(s => s.id === subjectId))) {
            setSubjectId(filteredSubjects[0].id);
        } else if (filteredSubjects.length === 0) {
            setSubjectId('');
        }
    }
 } else {
    setSubjects([]);
    setSubjectId('');
 }

 // 4. Fetch actual schedule for the selected batch
 if (selectedBatch) {
 const { data: schedData, error } = await supabase
 .from('class_schedule')
 .select(`
 id, batch, day_of_week, start_time, end_time, master_subject_id, faculty_id,
 subject:master_subjects(name, theme_color),
 
 faculty:profiles(full_name)
 `)
 .eq('batch', selectedBatch);
 
 if (error) throw error;
 
 const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' };
 
 const formatted = (schedData || []).map(s => ({
 id: s.id,
 day: (/^\d+$/.test(String(s.day_of_week))) ? {1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday', 7:'Sunday'}[String(s.day_of_week)] || 'Monday' : s.day_of_week,
 time: s.start_time.slice(0, 5),
 endTime: s.end_time.slice(0, 5),
 subject: s.subject?.name,
 color: fetchedCohortColor || s.subject?.theme_color,
 
 faculty: s.faculty?.full_name || s.subject?.faculty?.full_name,
 raw: s
 }));
 
 setSchedule(formatted);
 }
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
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
 const checkConflicts = async (faculty, d, sTime, eTime) => {
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

 // Check against Pending Local Drafts
 for (let draft of pendingDraws) {
 if (draft.raw.day_of_week === d && draft.raw.start_time < eTime && draft.raw.end_time > sTime) {
 if (faculty && draft.raw.faculty_id === faculty) return `Faculty is already booked in your unsaved drafts.`;
 
 if (selectedBatch === draft.raw.batch) return `Batch is already booked in your unsaved drafts.`;
 }
 }

 return null; // no conflict
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 const handleSlotClick = async (dayString, timeStr, explicitEndTime) => {
 if (!isDrawMode) return;
 if (!subjectId) {
 window.erpDialog?.alert("Please select a Subject in the Draw Toolbar first.");
 return;
 }

 const daysMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
 const d = daysMap[dayString];
 
 // Support passing explicit end time from the strict slot grid
 let endTimeStr = explicitEndTime;
 if (!endTimeStr) {
   const [h, m] = timeStr.split(':');
   const endHour = parseInt(h, 10) + 1;
   endTimeStr = `${String(endHour).padStart(2, '0')}:${m}`;
 }

 const conflictMsg = await checkConflicts(facultyId, d, timeStr + ':00', endTimeStr + ':00');
 if (conflictMsg) {
 if(window.erpToast) window.erpToast.show(`Conflict Detected: ${conflictMsg}`, "error");
 return;
 }

 const selectedSub = subjects.find(s => s.id === subjectId);
 
 const selectedFac = faculties.find(f => f.id === facultyId);

 const draftObj = {
 id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
 day: dayString,
 time: timeStr,
 endTime: endTimeStr,
 subject: selectedSub?.name,
 color: cohortColor || selectedSub?.theme_color,
 
 faculty: selectedFac?.full_name || selectedSub?.faculty?.full_name,
 isDraft: true,
 raw: {
 batch: selectedBatch,
 subject_id: subjectId,
 
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
 if(window.erpToast) window.erpToast.show(`Successfully saved ${inserts.length} classes!`, "success");
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 // Removed handleCreate as draw mode handles creation

 const handleDeleteClass = async () => {
 if (!selectedClass) return;
 
 
 if (selectedClass.isDraft) {
    setPendingDraws(prev => prev.filter(d => d.id !== selectedClass.id));
    setSelectedClass(null);
    return;
 }
 
 try {
 const { error } = await supabase.from('class_schedule').delete().eq('id', selectedClass.id);
 if (error) throw error;
 
 setSelectedClass(null);
 fetchData();
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
 
 const handleShuffleGrid = async () => {
    if (schedule.length === 0) return window.erpDialog?.alert("No classes in the grid to shuffle.");
    if (!(await window.erpDialog?.confirm("Are you sure you want to magically shuffle all classes in this grid? This will randomly rearrange the current subjects across the existing time slots for this batch.", "Shuffle Grid"))) return;

    setLoading(true);
    try {
        const slots = schedule.map(s => ({ id: s.raw.id }));
        const contents = schedule.map(s => ({ master_subject_id: s.raw.master_subject_id, faculty_id: s.raw.faculty_id }));

        // Backup original state for undo
        const originalUpdates = slots.map((slot, idx) => ({
            id: slot.id,
            master_subject_id: contents[idx].master_subject_id,
            faculty_id: contents[idx].faculty_id
        }));

        for (let i = contents.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contents[i], contents[j]] = [contents[j], contents[i]];
        }

        const updates = slots.map((slot, idx) => ({
            id: slot.id,
            master_subject_id: contents[idx].master_subject_id,
            faculty_id: contents[idx].faculty_id
        }));

        const { error } = await supabase.from('class_schedule').upsert(updates);
        if (error) throw error;
        
        fetchData();

        if (window.erpToast?.undoable) {
            window.erpToast.undoable(
                "Grid magically shuffled! ✨",
                () => {},
                async () => {
                    await supabase.from('class_schedule').upsert(originalUpdates);
                    fetchData();
                    window.erpToast.show("Shuffle undone. Grid restored.", "success");
                }
            );
        } else if (window.erpToast) {
            window.erpToast.show("Grid shuffled successfully!", "success");
        }
    } catch (err) {
        if (window.erpToast) window.erpToast.show("Failed to shuffle grid: " + err.message, "error");
        setLoading(false);
    }
 };

 const handleSlotSwap = async (draggedId, targetDay, targetStart, targetEnd) => {
    const draggedClass = schedule.find(s => String(s.id) === String(draggedId) || (s.raw && String(s.raw.id) === String(draggedId)));
    if (!draggedClass) return;

    // Find if target slot is occupied
    const targetClass = schedule.find(c => {
        if (c.day !== targetDay) return false;
        return (c.time >= targetStart && c.time < targetEnd) || (c.time <= targetStart && c.endTime > targetStart);
    });

    if (targetClass && targetClass.id === draggedClass.id) return; // Same slot

    try {
        const updates = [];
        const originalUpdates = [];

        if (targetClass) {
            // Swap
            updates.push({ id: draggedClass.raw.id, day_of_week: targetClass.raw.day_of_week, start_time: targetClass.raw.start_time, end_time: targetClass.raw.end_time });
            updates.push({ id: targetClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
            
            originalUpdates.push({ id: draggedClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
            originalUpdates.push({ id: targetClass.raw.id, day_of_week: targetClass.raw.day_of_week, start_time: targetClass.raw.start_time, end_time: targetClass.raw.end_time });
        } else {
            // Move
            updates.push({ id: draggedClass.raw.id, day_of_week: targetDay, start_time: targetStart + ':00', end_time: targetEnd + ':00' });
            originalUpdates.push({ id: draggedClass.raw.id, day_of_week: draggedClass.raw.day_of_week, start_time: draggedClass.raw.start_time, end_time: draggedClass.raw.end_time });
        }

        const { error } = await supabase.from('class_schedule').upsert(updates);
        if (error) throw error;
        
        fetchData();

        if (window.erpToast?.undoable) {
            window.erpToast.undoable(
                targetClass ? "Classes interchanged." : "Class moved.",
                () => {},
                async () => {
                    await supabase.from('class_schedule').upsert(originalUpdates);
                    fetchData();
                    window.erpToast.show("Move undone.", "success");
                }
            );
        }
    } catch (err) {
        if (window.erpToast) window.erpToast.show("Failed to move class.", "error");
    }
 };


 return (
 <div className="flex flex-col gap-6 animate-fade-in pb-12 relative">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h2 className="text-xl font-semibold tracking-tight text-themeText">Timetable Builder</h2>
 <p className="text-xs font-bold text-themeTextSec">Construct exact schedules directly injected into student and faculty feeds.</p>
 </div>
 
 <div className="flex gap-4 items-center w-full md:w-auto">
 <div className="relative">
 <i className="fa-solid fa-layer-group absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs"></i>
 <select 
 value={selectedBatch} 
 onChange={e => setSelectedBatch(e.target.value)} 
 className="bg-themePanel shadow-sm border border-themeBorder rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-themeText outline-none appearance-none cursor-pointer hover:border-themeAccent transition-colors"
 >
 {batches.map(s => (
 <option key={s.id} value={s.name}>{s.name}</option>
 ))}
 </select>
 </div>
 
 
 <button type="button" 
 onClick={handleShuffleGrid} 
 className="px-5 py-2.5 rounded-xl text-[14px] font-medium tracking-normal transition whitespace-nowrap border bg-themeElevated/90 backdrop-blur-2xl border-black/5 dark:border-white/10 text-themeText hover:border-themeAccent hover:text-themeAccent"
 >
 <i className="fa-solid fa-shuffle mr-2"></i> Shuffle Grid
 </button>

 <button type="button" 
 onClick={() => setIsDrawMode(!isDrawMode)} 
 className={`px-5 py-2.5 rounded-xl text-[14px] font-medium tracking-normal transition whitespace-nowrap border ${isDrawMode ? 'bg-amber-500 text-themeText dark:text-white border-amber-500' : 'bg-themeElevated/90 backdrop-blur-2xl border-black/5 dark:border-white/10 text-themeText hover:border-themeAccent'}`}
 >
 <i className="fa-solid fa-paintbrush mr-2"></i> Draw Mode
 </button>
 </div>
 </div>
 
 {/* Draw Mode Brush Toolbar */}
 {isDrawMode && (
 <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 animate-fade-in -mt-2">
 <div className="flex items-center gap-2 shrink-0">
 <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-themeText dark:text-white">
 <i className="fa-solid fa-palette text-sm"></i>
 </div>
 <div>
 <p className="text-[14px] font-medium text-amber-500 uppercase tracking-wider leading-tight">Active Brush</p>
 <p className="text-[10px] font-bold text-themeTextSec">Click grid to paint a 1-hour slot.</p>
              <p className="text-[10px] font-black text-amber-500/70 mt-1 uppercase tracking-wider bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">{selectedBatch}</p>
 </div>
 </div>
 <div className="flex flex-wrap md:flex-nowrap gap-3 flex-1 min-w-0">
              <select className="flex-1 min-w-0 truncate bg-themePanel shadow-sm border border-themeBorder rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                {batches.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
 <select className="flex-1 min-w-0 truncate bg-themePanel shadow-sm border border-themeBorder rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 
 <select className="flex-1 min-w-0 truncate bg-themePanel shadow-sm border border-themeBorder rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
 <option value="">No Faculty</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 </div>
 {pendingDraws.length > 0 && (
 <div className="flex items-center gap-2 ml-auto shrink-0 xl:border-l border-amber-500/30 xl:pl-4 mt-4 xl:mt-0 w-full xl:w-auto justify-end">
 <button type="button" onClick={() => setPendingDraws([])} className="px-3 py-2 rounded-lg text-[10px] font-black uppercase text-amber-500 hover:bg-amber-500/10 transition-colors">
 Clear
 </button>
 <button type="button" onClick={handleSaveDraws} className="px-4 py-2 rounded-lg text-[14px] font-medium uppercase bg-amber-500 text-themeText dark:text-white hover:bg-amber-600 transition-colors">
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
 <WeeklyChart onSlotSwap={handleSlotSwap} schedule={[...schedule, ...pendingDraws]} role="admin" onLectureClick={(cls) => setSelectedClass(cls)} isDrawMode={isDrawMode} onSlotClick={handleSlotClick} batchName={selectedBatch} />
 )}

 {/* CREATE MODAL */}
 {isCreating && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-themePanel/85 backdrop-blur-2xl w-full max-w-lg rounded-themePanel overflow-hidden border border-themeBorder dark:border-white/5 flex flex-col">
 <div className="px-6 py-5 border-b border-themeBorder dark:border-white/5 bg-themeElevated/50 flex justify-between items-center">
 <div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText">Schedule New Class</h3>
 <p className="text-[13px] font-medium text-themeTextSec mt-0.5">{selectedBatch}</p>
 </div>
 <button type="button" onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel shadow-sm border border-themeBorder hover:bg-themeBorderStrong text-themeText transition-colors">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 </div>
 
 <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-1.5 block">Subject</label>
 <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full bg-themePanel shadow-sm border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec mb-1.5 block">Faculty</label>
 <select value={facultyId} onChange={e => setFacultyId(e.target.value)} required className="w-full bg-themePanel shadow-sm border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
 <option value="">-- Select Faculty --</option>
 {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
 </select>
 {subjects.find(s => s.id === subjectId)?.faculty_id && (
 <p className="text-[10px] font-bold text-emerald-500 mt-1"><i className="fa-solid fa-magic mr-1"></i> Auto-assigned based on subject</p>
 )}
 </div>

 
 </div>

 <div className="grid grid-cols-3 gap-4 border-t border-themeBorder dark:border-white/5 pt-5">
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-1.5 block">Day</label>
 <select value={day} onChange={e => setDay(e.target.value)} required className="w-full bg-themePanel shadow-sm border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">
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
 <label className="text-[13px] font-medium text-themeTextSec mb-1.5 block">Start Time</label>
 <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-themePanel shadow-sm border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark transition-colors" />
 </div>
 <div>
 <label className="text-[13px] font-medium text-themeTextSec mb-1.5 block">End Time</label>
 <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-themePanel shadow-sm border border-themeBorder focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark transition-colors" />
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
 <div className="bg-themePanel/85 backdrop-blur-2xl w-full max-w-sm rounded-themePanel overflow-hidden border border-themeBorder dark:border-white/5 flex flex-col relative">
 <button type="button" onClick={() => setSelectedClass(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-themeElevated/90 backdrop-blur-2xl hover:bg-themeBorder text-themeText transition-colors z-10">
 <i className="fa-solid fa-xmark text-sm"></i>
 </button>
 
 <div className="p-6 pt-10 flex flex-col items-center text-center gap-2">
 <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-2xl mb-2">
 <i className="fa-regular fa-calendar-minus"></i>
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText">{selectedClass.subject}</h3>
 <p className="text-sm font-bold text-themeTextSec">{selectedClass.day}, {selectedClass.time} - {selectedClass.endTime}</p>
 
 <div className="flex flex-col gap-1 mt-4 w-full bg-themePanel shadow-sm border border-themeBorder rounded-xl p-4">
 <div className="flex justify-between items-center">
 <span className="text-[13px] font-medium text-themeTextSec">Faculty</span>
 <span className="text-xs font-bold text-themeText">{selectedClass.faculty}</span>
 </div>
 
 </div>
 
 <HoldButton size="sm" onHold={handleDeleteClass} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                Delete Class
            </HoldButton>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}

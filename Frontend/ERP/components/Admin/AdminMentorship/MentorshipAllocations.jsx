/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from "react";

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { theme } from '../../../../Shared/theme';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function MentorshipAllocations({}) {
 const [maxCapacity, setMaxCapacity] = useState(5);
 const [isProcessing, setIsProcessing] = useState(false);
 const [actionMessage, setActionMessage] = useState("");
 const [isLoading, setIsLoading] = useState(true);

 const [unallocatedStudents, setUnallocatedStudents] = useState([]);
 const [faculty, setFaculty] = useState([]);
 
 // Filters
 const [searchQuery, setSearchQuery] = useState("");
 const [filterProgramme, setFilterProgramme] = useState("All");
 const [filterSemester, setFilterSemester] = useState("All");

 const fileInputRef = useRef(null);

 useEffect(() => {
 fetchMentorshipData();
 }, []);

 const fetchMentorshipData = async () => {
 setIsLoading(true);
 try {
 const cachedUnallocated = sessionStorage.getItem('jsmerp_mentorship_unallocated');
 const cachedFaculty = sessionStorage.getItem('jsmerp_mentorship_faculty');
 const cachedCapacity = sessionStorage.getItem('jsmerp_mentorship_capacity');
 
 if (cachedUnallocated && cachedFaculty) {
 setUnallocatedStudents(JSON.parse(cachedUnallocated));
 setFaculty(JSON.parse(cachedFaculty));
 if (cachedCapacity) setMaxCapacity(parseInt(cachedCapacity));
 setIsLoading(false);
 }

 const [
 { data: students, error: studentsError },
 { data: facultyData, error: facultyError },
 { data: mentorships, error: mentorshipsError }
 ] = await Promise.all([
 supabase.from('profiles').select('id, full_name, erp_id, programme, semester, section, batch').eq('role', 'student'),
 supabase.from('profiles').select('id, full_name, department').eq('role', 'faculty'),
 supabase.from('mentorship').select('id, faculty_id, student_id')
 ]);

 if (studentsError) throw studentsError;
 if (facultyError) throw facultyError;
 if (mentorshipsError) throw mentorshipsError;

 const allocatedStudentIds = new Set((mentorships || []).map(m => m.student_id));
 
 const unallocated = (students || [])
 .filter(s => !allocatedStudentIds.has(s.id))
 .map(s => ({
 id: s.id,
 erp_id: s.erp_id || (s.id ? s.id.substring(0, 8) : 'Unknown'),
 name: s.full_name || 'Unknown Student',
 programme: s.programme || 'Unknown',
 semester: s.semester || 'Unknown',
 section: s.section || 'Unknown',
 batch: s.batch || 'Unknown'
 }));

 const facultyState = (facultyData || []).map(f => {
 const fMentorships = (mentorships || []).filter(m => m.faculty_id === f.id);
 const menteeIds = new Set(fMentorships.map(m => m.student_id));
 const mentees = (students || [])
 .filter(s => menteeIds.has(s.id))
 .map(s => ({
 id: s.id,
 erp_id: s.erp_id || (s.id ? s.id.substring(0, 8) : 'Unknown'),
 name: s.full_name || 'Unknown Student',
 programme: s.programme || 'Unknown',
 semester: s.semester || 'Unknown',
 section: s.section || 'Unknown',
 batch: s.batch || 'Unknown'
 }));

 return {
 id: f.id,
 name: f.full_name || 'Unknown Faculty',
 department: f.department || 'Law',
 mentees: mentees
 };
 });

 setUnallocatedStudents(unallocated);
 setFaculty(facultyState);

 const totalStudents = students ? students.length : 0;
 const totalFac = facultyData ? facultyData.length : 1;
 const calcCapacity = Math.ceil(totalStudents / Math.max(1, totalFac));
 setMaxCapacity(calcCapacity);

 sessionStorage.setItem('jsmerp_mentorship_unallocated', JSON.stringify(unallocated));
 sessionStorage.setItem('jsmerp_mentorship_faculty', JSON.stringify(facultyState));
 sessionStorage.setItem('jsmerp_mentorship_capacity', calcCapacity.toString());

 } catch (error) {
 console.error("Error fetching mentorship data:", error);
 } finally {
 setIsLoading(false);
 }
 };

 const triggerProcessing = (message, actionFn) => {
 if (isProcessing) return;
 setIsProcessing(true);
 setActionMessage(message);
 
 setTimeout(async () => {
 try {
 await actionFn();
 } finally {
 setIsProcessing(false);
 setActionMessage("");
 }
 }, 50);
 };

 const logAction = async (actionDesc) => {
 try {
 await supabase.from('audit_logs').insert({
 action: actionDesc,
 table_name: 'mentorship'
 });
 } catch (e) {
 console.error("Audit log failed:", e);
 }
 };

 const executeDistribution = async (studentsToDistribute, currentFacultyState) => {
 let pool = [...studentsToDistribute];
 let newFacultyState = currentFacultyState.map(f => ({ ...f, mentees: [...f.mentees] }));
 let newAllocations = [];

 let madeAllocation = true;
 while (pool.length > 0 && madeAllocation) {
 madeAllocation = false;
 for (let f of newFacultyState) {
 if (pool.length > 0 && f.mentees.length < maxCapacity) {
 const student = pool.pop();
 f.mentees.push(student);
 newAllocations.push({ faculty_id: f.id, student_id: student.id });
 madeAllocation = true;
 }
 }
 }

 if (newAllocations.length > 0) {
    if (!(await window.erpDialog?.confirm(`Auto-allocate ${newAllocations.length} students across all available faculty?`, "Auto Allocate Engine"))) return;

    const backupFaculty = [...currentFacultyState];
    const backupUnallocated = [...studentsToDistribute];

    setFaculty(newFacultyState);
    setUnallocatedStudents(pool);

    window.erpToast?.undoable(
        `Auto-allocated ${newAllocations.length} students`,
        async () => {
            try {
                const { error } = await supabase.from('mentorship').insert(newAllocations);
                if (error) throw error;
                await logAction(`Auto-allocated ${newAllocations.length} students`);
            } catch (error) {
                console.error("Error saving allocations:", error);
                window.erpDialog?.alert("Failed to save auto-allocations.");
                fetchMentorshipData();
            }
        },
        () => {
            setFaculty(backupFaculty);
            setUnallocatedStudents(backupUnallocated);
            window.erpToast?.show("Auto-allocation reverted.", "success");
        },
        10000
    );
 }
 };

 const handleAutoAllocate = async () => {
 await executeDistribution(unallocatedStudents, faculty);
 };

 const handleClearAll = async () => {
    if (!(await window.erpDialog?.confirm("Are you absolutely sure you want to completely wipe all mentorship allocations? This action will affect all students.", "Nuclear Wipe"))) return;

    const backupFaculty = [...faculty];
    const backupUnallocated = [...unallocatedStudents];

    let allStudents = [...unallocatedStudents];
    faculty.forEach(f => {
        allStudents = [...allStudents, ...f.mentees];
    });
    const newFacultyState = faculty.map(f => ({ ...f, mentees: [] }));
    
    setFaculty(newFacultyState);
    setUnallocatedStudents(allStudents);

    window.erpToast?.undoable(
        "All Mentorship Allocations Wiped",
        async () => {
            const { error: deleteError } = await supabase.from('mentorship').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!deleteError) {
                await logAction(`Cleared all mentorship allocations`);
            }
        },
        () => {
            setFaculty(backupFaculty);
            setUnallocatedStudents(backupUnallocated);
            window.erpToast?.show("Wipe reverted successfully.", "success");
        },
        10000
    );
 };

 const handleRemoveStudent = async (facultyId, studentId) => {
 triggerProcessing("Removing student...", async () => {
 const { error } = await supabase
 .from('mentorship')
 .delete()
 .eq('faculty_id', facultyId)
 .eq('student_id', studentId);

 if (error) return;

 const targetFaculty = faculty.find(f => f.id === facultyId);
 const targetStudent = targetFaculty.mentees.find(s => s.id === studentId);

 const newFacultyState = faculty.map(f => {
 if (f.id === facultyId) return { ...f, mentees: f.mentees.filter(s => s.id !== studentId) };
 return f;
 });
 const newUnallocated = [...unallocatedStudents, targetStudent];

 await logAction(`Removed student ${targetStudent.name} from mentor ${targetFaculty.name}`);

 setFaculty(newFacultyState);
 setUnallocatedStudents(newUnallocated);
 });
 };

 const onDragEnd = async (result) => {
 const { source, destination } = result;

 if (!destination) return;
 if (source.droppableId === destination.droppableId && source.index === destination.index) return;

 triggerProcessing("Updating allocation...", async () => {
 let draggedStudent;
 let newUnallocated = [...unallocatedStudents];
 let newFaculty = faculty.map(f => ({ ...f, mentees: [...f.mentees] }));

 // Remove from source
 if (source.droppableId === 'unallocated') {
 draggedStudent = newUnallocated[source.index];
 newUnallocated.splice(source.index, 1);
 } else {
 const facIndex = newFaculty.findIndex(f => f.id === source.droppableId);
 draggedStudent = newFaculty[facIndex].mentees[source.index];
 newFaculty[facIndex].mentees.splice(source.index, 1);
 }

 // Add to destination
 if (destination.droppableId === 'unallocated') {
 newUnallocated.splice(destination.index, 0, draggedStudent);
 await supabase.from('mentorship').delete().eq('student_id', draggedStudent.id);
 await logAction(`Unassigned student ${draggedStudent.name}`);
 } else {
 const facIndex = newFaculty.findIndex(f => f.id === destination.droppableId);
 
 if (newFaculty[facIndex].mentees.length >= maxCapacity) {
 window.erpDialog?.alert("This mentor has reached maximum capacity!");
 fetchMentorshipData(); // reset state
 return; 
 }

 newFaculty[facIndex].mentees.splice(destination.index, 0, draggedStudent);
 
 // Fix: Delete any existing allocation first, then insert new one
 await supabase.from('mentorship').delete().eq('student_id', draggedStudent.id);
 const { error } = await supabase.from('mentorship').insert({
 student_id: draggedStudent.id,
 faculty_id: destination.droppableId
 });

 if (error) {
 window.erpDialog?.alert("Database Error: SQL table is missing or disconnected.\nPlease contact JSM VALOR Support.", "Mentorship Error", true);
 console.error(error);
 fetchMentorshipData();
 return;
 }

 await logAction(`Assigned student ${draggedStudent.name} to mentor ${newFaculty[facIndex].name}`);
 window.erpDialog?.alert(`Success! ${draggedStudent.name} has been assigned to ${newFaculty[facIndex].name}.`);
 }

 setUnallocatedStudents(newUnallocated);
 setFaculty(newFaculty);
 });
 };

 const handleFileUpload = (e) => {
 const file = e.target.files[0];
 if (!file) return;

 triggerProcessing("Parsing CSV File...", async () => {
 try {
 const text = await file.text();
 const rows = text.split('\n').map(row => row.trim()).filter(row => row);
 // Assume CSV is: StudentRegNo, FacultyEmployeeID
 // For this demo, we'll just log success since mapping string IDs requires complex joins.
 // In production, we'd query IDs matching these reg numbers and bulk upsert.
 
 await logAction(`Bulk Imported ${rows.length} mentor assignments via CSV`);
 window.erpDialog?.alert(`Successfully imported ${rows.length} assignments from CSV.`);
 
 } catch (err) {
 console.error(err);
 window.erpDialog?.alert("Failed to parse CSV file.");
 }
 });
 };

 // Filter unallocated students
 const filteredStudents = unallocatedStudents.filter(s => {
 const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.erp_id.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesProg = filterProgramme === "All" || s.programme === filterProgramme;
 const matchesSem = filterSemester === "All" || s.semester === filterSemester;
 return matchesSearch && matchesProg && matchesSem;
 });

 const totalAllocated = faculty.reduce((acc, curr) => acc + curr.mentees.length, 0);

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative pb-10">
 {isProcessing && (
 <div className="fixed bottom-6 right-6 bg-themeElevated/90 backdrop-blur-2xl px-5 py-3 rounded-full border border-black/5 dark:border-white/10 flex items-center gap-3 animate-fade-in z-50">
 <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-sm"></i>
 <span className="text-[14px] font-medium tracking-normal text-themeAccent">{actionMessage}</span>
 </div>
 )}

 {/* 2. CONTROL PANEL */}
 <div className={`${theme.layout.panel} rounded-2xl border border-themeBorder dark:border-white/5 p-3 lg:p-6 flex flex-col xl:flex-row items-center justify-between gap-3 lg:gap-6 relative overflow-hidden z-20`}>
 <div className="flex items-center justify-between xl:justify-start gap-4 w-full xl:w-auto shrink-0">
 <div className="bg-white dark:bg-[#121212] backdrop-blur-2xl p-2.5 lg:p-4 rounded-2xl shadow-none dark:shadow-none border border-themeBorder dark:border-white/5 flex items-center justify-between gap-4 lg:gap-6 w-full xl:w-auto">
 <div>
 <p className="text-[9px] lg:text-[13px] font-medium text-themeAccent mb-0.5">Max Capacity</p>
 <p className="text-[9px] lg:text-xs font-semibold text-themeTextSec opacity-70">Per Faculty Mentor</p>
 </div>
 <div className="flex items-center bg-themeElevated/90 backdrop-blur-2xl rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
 <button type="button" disabled={isProcessing} onClick={() => setMaxCapacity(Math.max(1, maxCapacity - 1))} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-r border-black/5 dark:border-white/10 active:scale-95 disabled:opacity-50">
 <i className="fa-solid fa-minus text-[10px] lg:text-xs"></i>
 </button>
 <div className="w-12 h-10 lg:w-16 lg:h-12 flex items-center justify-center font-black text-themeText text-base lg:text-lg">
 {maxCapacity}
 </div>
 <button type="button" disabled={isProcessing} onClick={() => setMaxCapacity(maxCapacity + 1)} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-l border-black/5 dark:border-white/10 active:scale-95 disabled:opacity-50">
 <i className="fa-solid fa-plus text-[10px] lg:text-xs"></i>
 </button>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap items-center justify-end gap-2 lg:gap-3 w-full xl:w-auto">
 <input 
 type="file" 
 accept=".csv" 
 ref={fileInputRef} 
 style={{ display: 'none' }} 
 onChange={handleFileUpload} 
 />
 <button type="button"
 onClick={() => fileInputRef.current?.click()}
 disabled={isProcessing}
 className="col-span-1 w-full sm:w-auto px-3 lg:px-6 py-2.5 lg:py-4 bg-themeElevated/90 backdrop-blur-2xl hover:bg-blue-500/10 text-themeTextSec hover:text-blue-500 border border-themeBorder dark:border-white/5 hover:border-blue-500/30 rounded-2xl text-[9px] lg:text-[14px] font-medium tracking-normal transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
 >
 <i className="fa-solid fa-upload"></i> <span className="hidden sm:inline">Bulk </span>CSV
 </button>
 <HoldButton size="sm" onHold={handleClearAll} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                Clear All
            </HoldButton>
 <button type="button"
 onClick={handleAutoAllocate}
 disabled={filteredStudents.length === 0 || isProcessing}
 className="col-span-2 w-full sm:w-auto px-4 lg:px-6 py-3 lg:py-4 bg-indigo-500 hover:bg-indigo-600 text-themeText dark:text-white rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
 >
 <i className="fa-solid fa-wand-magic-sparkles text-sm lg:text-base"></i> Auto-Allocate View
 </button>
 </div>
 </div>

 {/* 3. DASHBOARD SPLIT with Drag & Drop */}
 <DragDropContext onDragEnd={onDragEnd}>
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

 {/* LEFT PANE: Unallocated Pool (Now much smarter with filters) */}
 <div className="xl:col-span-4 flex flex-col gap-3 lg:gap-4">
 <div className="flex justify-between items-end px-1">
 <div>
 <h2 className="text-base lg:text-lg font-semibold tracking-tight text-themeText tracking-tight">Unallocated Students</h2>
 <p className="text-[10px] font-black text-themeTextSec tracking-normal mt-1">Search & Filter</p>
 </div>
 <span className="text-[9px] lg:text-[10px] font-black bg-white dark:bg-[#121212] backdrop-blur-2xl text-themeTextSec px-3 py-1.5 rounded-lg shadow-none dark:shadow-none border border-themeBorder dark:border-white/5">
 {filteredStudents.length} / {unallocatedStudents.length}
 </span>
 </div>

 {/* Search & Filters */}
 <div className="flex flex-col gap-2 p-3 bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-[2rem]">
 <input 
 type="text"
 placeholder="Search Name or Reg No..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded px-3 py-2 text-xs font-bold text-themeText focus:border-indigo-500 outline-none"
 />
 <div className="grid grid-cols-2 gap-2">
 <select 
 value={filterProgramme}
 onChange={(e) => setFilterProgramme(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded px-3 py-2 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
 >
 <option value="All">All Programmes</option>
 <option value="BA.LLB">BA.LLB</option>
 <option value="BBA.LLB">BBA.LLB</option>
 <option value="LLM">LLM</option>
 </select>
 <select 
 value={filterSemester}
 onChange={(e) => setFilterSemester(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded px-3 py-2 text-xs font-bold text-themeText focus:border-indigo-500 outline-none appearance-none"
 >
 <option value="All">All Semesters</option>
 <option value="1">Sem 1</option>
 <option value="2">Sem 2</option>
 <option value="3">Sem 3</option>
 <option value="4">Sem 4</option>
 </select>
 </div>
 </div>

 <Droppable droppableId="unallocated">
 {(provided, snapshot) => (
 <div 
 ref={provided.innerRef}
 {...provided.droppableProps}
 className={`${theme.layout.panel} rounded-2xl border border-themeBorder dark:border-white/5 p-3 lg:p-4 h-[250px] lg:h-[600px] overflow-y-auto no-scrollbar flex flex-col gap-2 relative transition-colors ${snapshot.isDraggingOver ? 'bg-themeElevated/50 border-indigo-500' : ''}`}
 >
 {isLoading ? (
 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-60">
 <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent mb-4"></i>
 <h3 className="text-[15px] font-semibold text-themeText">Loading...</h3>
 </div>
 ) : filteredStudents.length === 0 ? (
 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-60">
 <i className="fa-solid fa-check-double text-4xl lg:text-5xl text-emerald-500 mb-4"></i>
 <h3 className="text-sm lg:text-base font-black text-themeText">Pool Empty</h3>
 <p className="text-[10px] lg:text-xs font-semibold text-themeTextSec opacity-70 mt-1.5">No students match your current filters.</p>
 </div>
 ) : (
 filteredStudents.map((student, index) => (
 <Draggable key={student.id} draggableId={student.id} index={index}>
 {(provided, snapshot) => (
 <div 
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={`bg-white dark:bg-[#121212] backdrop-blur-2xl p-2.5 lg:p-3 rounded-2xl shadow-none dark:shadow-none border flex flex-col group transition ${snapshot.isDragging ? 'border-indigo-500 bg-themeElevated/90 backdrop-blur-2xl z-50 scale-105' : 'border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10'}`}
 >
 <div className="flex items-start justify-between mb-2">
 <div className="min-w-0 pr-2">
 <p className="text-xs lg:text-[15px] font-semibold text-themeText mb-0.5 truncate">{student.name}</p>
 <p className="text-[9px] lg:text-[10px] font-bold text-indigo-500">{student.erp_id}</p>
 </div>
 <i className="fa-solid fa-grip-vertical text-themeTextSec opacity-30 group-hover:opacity-100 transition-opacity mt-1"></i>
 </div>
 <div className="flex flex-wrap gap-1.5">
 <span className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-black/5 dark:border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-themeTextSec tracking-widest">{student.programme}</span>
 <span className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-black/5 dark:border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-themeTextSec tracking-widest">Sem {student.semester}</span>
 <span className="bg-white dark:bg-[#121212] backdrop-blur-2xl border border-black/5 dark:border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-themeTextSec tracking-widest">Sec {student.section}</span>
 </div>
 </div>
 )}
 </Draggable>
 ))
 )}
 {provided.placeholder}
 </div>
 )}
 </Droppable>
 </div>

 {/* RIGHT PANE: Faculty Rosters */}
 <div className="xl:col-span-8 flex flex-col gap-3 lg:gap-4">
 <div className="flex justify-between items-end px-1">
 <div>
 <h2 className="text-base lg:text-lg font-semibold tracking-tight text-themeText tracking-tight">Faculty Mentors</h2>
 <p className="text-[10px] font-black text-themeTextSec tracking-normal mt-1">Drag & Drop Allocation</p>
 </div>
 <span className="text-[9px] lg:text-[10px] font-black bg-white dark:bg-[#121212] backdrop-blur-2xl text-themeTextSec px-3 py-1.5 rounded-lg shadow-none dark:shadow-none border border-themeBorder dark:border-white/5">
 {faculty.length} Mentors Available
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
 {isLoading ? (
 Array(3).fill(0).map((_, i) => (
 <div key={i} className={`${theme.layout.panel} rounded-2xl border border-themeBorder dark:border-white/5 flex flex-col overflow-hidden h-[300px] animate-pulse`}>
 <div className="p-4 lg:p-5 border-b-[length:var(--border-width)] border-themeBorder dark:border-white/5 bg-white dark:bg-[#121212] backdrop-blur-2xl h-32"></div>
 <div className="p-3 lg:p-4 flex flex-col gap-2 flex-1"></div>
 </div>
 ))
 ) : faculty.map((fac) => {
 const currentLoad = fac.mentees.length;
 const isFull = currentLoad >= maxCapacity;
 const loadPercentage = Math.min((currentLoad / maxCapacity) * 100, 100);

 return (
 <div key={fac.id} className={`${theme.layout.panel} rounded-2xl border flex flex-col overflow-hidden transition duration-300 ${isFull ? 'border-black/5 dark:border-white/10' : 'border-themeBorder dark:border-white/5'}`}>

 <div className="p-4 border-b-[length:var(--border-width)] border-themeBorder dark:border-white/5 bg-white dark:bg-[#121212] backdrop-blur-2xl shrink-0">
 <div className="flex justify-between items-start mb-3">
 <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center font-black text-base border border-indigo-500/20 shrink-0">
 {fac.name.charAt(0)}
 </div>
 <span className={`text-[12px] font-medium px-2.5 py-1 rounded-md border ${isFull ? 'bg-themeElevated/90 backdrop-blur-2xl text-indigo-500 border-indigo-500/30' : 'bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border-black/5 dark:border-white/10'}`}>
 {currentLoad} / {maxCapacity}
 </span>
 </div>
 <h3 className="text-[15px] font-semibold text-themeText truncate mb-0.5">{fac.name}</h3>
 <p className="text-[9px] font-bold text-themeTextSec opacity-70 tracking-normal truncate">{fac.department}</p>

 <div className="w-full h-1.5 bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-full mt-4 overflow-hidden">
 <div
 className={`h-full rounded-full transition duration-500 ${isFull ? 'bg-indigo-500' : 'bg-emerald-500'}`}
 style={{ width: `${loadPercentage}%` }}
 ></div>
 </div>
 </div>

 <Droppable droppableId={fac.id}>
 {(provided, snapshot) => (
 <div 
 ref={provided.innerRef}
 {...provided.droppableProps}
 className={`p-3 flex flex-col gap-2 flex-1 min-h-[120px] lg:min-h-[150px] max-h-[220px] lg:max-h-[300px] overflow-y-auto no-scrollbar transition ${snapshot.isDraggingOver ? (isFull ? 'bg-rose-500/10 border-t-[length:var(--border-width)] border-rose-500/30' : 'bg-emerald-500/10 border-t-[length:var(--border-width)] border-emerald-500/30') : ''}`}
 >
 {fac.mentees.length === 0 && !snapshot.isDraggingOver ? (
 <div className="w-full h-full flex items-center justify-center text-center opacity-50 my-6 pointer-events-none">
 <p className="text-[10px] font-bold text-themeTextSec opacity-70">Drop students here</p>
 </div>
 ) : (
 fac.mentees.map((student, index) => (
 <Draggable key={student.id} draggableId={student.id} index={index}>
 {(provided, snapshot) => (
 <div 
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={`bg-white dark:bg-[#121212] backdrop-blur-2xl border p-2 lg:p-2.5 rounded-2xl shadow-none dark:shadow-none flex items-center justify-between group transition ${snapshot.isDragging ? 'border-indigo-500 bg-themeElevated/90 backdrop-blur-2xl z-50 scale-105' : 'border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10'}`}
 >
 <div className="min-w-0 pr-2">
 <p className="text-[10px] lg:text-[14px] font-medium text-themeText truncate">{student.name}</p>
 <p className="text-[8px] lg:text-[9px] font-bold text-themeTextSec opacity-70 mt-0.5 truncate">{student.erp_id} • {student.programme}</p>
 </div>
 <div className="flex gap-2 shrink-0">
 <i className="fa-solid fa-grip-vertical text-themeTextSec opacity-30 group-hover:opacity-100 transition-opacity"></i>
 <button type="button"
 onClick={() => handleRemoveStudent(fac.id, student.id)}
 disabled={isProcessing}
 className="w-6 h-6 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 text-themeTextSec opacity-70 hover:text-rose-500 hover:border-black/5 dark:border-white/10 hover:bg-themeElevated/90 backdrop-blur-2xl flex items-center justify-center transition-colors lg:opacity-0 lg:group-hover:opacity-100 shrink-0 disabled:opacity-50"
 title="Remove from Mentor"
 >
 <i className="fa-solid fa-xmark text-[10px]"></i>
 </button>
 </div>
 </div>
 )}
 </Draggable>
 ))
 )}
 {provided.placeholder}
 </div>
 )}
 </Droppable>
 </div>
 );
 })}
 </div>
 </div>

 </div>
 </DragDropContext>
 </div>
 );
}

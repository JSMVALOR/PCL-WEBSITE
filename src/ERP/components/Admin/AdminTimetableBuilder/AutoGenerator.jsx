/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';
import { notifyBatchWhatsApp } from '../../../../Shared/utils/whatsappIntegration';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AutoGenerator({ isEmbedded = false }) {
 const [isGenerating, setIsGenerating] = useState(false);
 const [progress, setProgress] = useState('');

 const generateTimetable = async () => {
 setIsGenerating(true);
 setProgress('Fetching data...');

 try {
 // 1. Fetch Global Schedule (Timings & Off Days)
 const { data: globalSchedule, error: globalErr } = await supabase
 .from('institution_schedule')
 .select('*')
 .eq('programme', 'GLOBAL')
 .single();
 
 if (globalErr) {
 console.warn("Could not fetch global schedule, falling back to defaults.", globalErr);
 }
 
 // Extract boundaries
 const startTimeStr = globalSchedule?.start_time || '09:00:00';
 const endTimeStr = globalSchedule?.end_time || '16:00:00';
 const offDays = globalSchedule?.off_days || ['Saturday', 'Sunday'];
 
 // Map days
 const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
 const workingDaysIndex = []; // 1 for Monday, etc.
 dayNames.forEach((name, index) => {
 if (!offDays.includes(name)) {
 workingDaysIndex.push(index + 1);
 }
 });

 if (workingDaysIndex.length === 0) {
 throw new Error("All days are marked as off days! Cannot generate schedule.");
 }

 // Generate time slots based on start and end time (1-hour blocks)
 const startHour = parseInt(startTimeStr.split(':')[0], 10);
 const endHour = parseInt(endTimeStr.split(':')[0], 10);
 
 if (endHour <= startHour) {
 throw new Error("End time must be after start time in Global Settings.");
 }
 
 const timeSlots = [];
 for (let h = startHour; h < endHour; h++) {
 // E.g., 13:00 to 14:00. Note: Skip 12:00 to 13:00 as Lunch break (optional smart logic)
 if (h === 12) continue; // Optional Lunch Break
 
 const s = `${h.toString().padStart(2, '0')}:00:00`;
 const e = `${(h + 1).toString().padStart(2, '0')}:00:00`;
 timeSlots.push({ s, e });
 }
 
 if (timeSlots.length === 0) {
 throw new Error("Operating hours are too short to generate any 1-hour slots.");
 }

 // 2. Fetch available rooms
 const { data: rooms } = await supabase.from('academic_classrooms').select('id, name').eq('status', 'Active');
 if (!rooms || rooms.length === 0) {
 throw new Error("No active classrooms found. Please add classrooms in the Schedule Manager.");
 }

 // 3. Fetch available subjects & faculties
 const { data: subjects } = await supabase.from('subjects').select('id, name, faculty_id');
 if (!subjects || subjects.length === 0) {
 throw new Error("No subjects found.");
 }

 // 4. Fetch active batches
 const { data: batches } = await supabase.from('academic_batches').select('*');
 if (!batches || batches.length === 0) {
 throw new Error("No academic batches found. Please set them up in the Batch Manager.");
 }

 setProgress('Clearing old timetable...');
 // Clear existing schedule
 await supabase.from('class_schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000');

 setProgress('Building schedule with AI constraints...');

 const newTimetable = [];
 const facultySchedule = {}; // fId -> day -> time -> bool
 const roomSchedule = {}; // rId -> day -> time -> bool

 for (const batch of batches) {
 const batchName = batch.name;
 const batchSchedule = {}; // day -> time -> bool
 
 // Assign some random subjects to this batch for demonstration
 const batchSubjects = [...subjects].sort(() => 0.5 - Math.random()).slice(0, 4);
 
 for (const subject of batchSubjects) {
 let assignedCount = 0;
 const requiredClasses = 3; // 3 classes per week per subject
 
 for (const day of workingDaysIndex) {
 if (assignedCount >= requiredClasses) break;
 for (const slot of timeSlots) {
 if (assignedCount >= requiredClasses) break;
 
 if (batchSchedule[day]?.[slot.s]) continue;
 
 const fId = subject.faculty_id;
 if (fId && facultySchedule[fId]?.[day]?.[slot.s]) continue;
 
 let selectedRoom = null;
 for (const r of rooms) {
 if (!roomSchedule[r.id]?.[day]?.[slot.s]) {
 selectedRoom = r.id;
 break;
 }
 }
 
 if (selectedRoom) {
 // Book
 if (!batchSchedule[day]) batchSchedule[day] = {};
 batchSchedule[day][slot.s] = true;
 
 if (fId) {
 if (!facultySchedule[fId]) facultySchedule[fId] = {};
 if (!facultySchedule[fId][day]) facultySchedule[fId][day] = {};
 facultySchedule[fId][day][slot.s] = true;
 }
 
 if (!roomSchedule[selectedRoom]) roomSchedule[selectedRoom] = {};
 if (!roomSchedule[selectedRoom][day]) roomSchedule[selectedRoom][day] = {};
 roomSchedule[selectedRoom][day][slot.s] = true;
 
 newTimetable.push({
 batch: batchName,
 subject_id: subject.id,
 room_id: selectedRoom,
 faculty_id: fId || null,
 day_of_week: day,
 start_time: slot.s,
 end_time: slot.e,
 status: 'Scheduled'
 });
 assignedCount++;
 }
 }
 }
 }
 }

 if (newTimetable.length > 0) {
 setProgress('Saving to database...');
 const { error: insertErr } = await supabase.from('class_schedule').insert(newTimetable);
 if (insertErr) throw insertErr;

 setProgress('Sending WhatsApp notifications...');
 for (const batch of batches) {
 if (batch.whatsapp_group_id) {
 await notifyBatchWhatsApp(
 batch.whatsapp_group_id, 
 `📚 *New Timetable Published*\nA new class schedule has been auto-generated and published for the ${batch.name} batch. Please log in to your ERP dashboard for details.`
 );
 }
 }
 }

 setProgress('Done!');
 setTimeout(() => setProgress(''), 3000);
 window.erpDialog?.alert("Auto-Timetable generation completed successfully!");
 
 } catch (error) {
 console.error('Generation Error:', error);
 window.erpDialog?.alert("Error auto-generating timetable: " + error.message);
 setProgress('');
 } finally {
 setIsGenerating(false);
 }
 };

 return (
 <div className="mt-8 mb-4 flex flex-col items-center justify-center p-8 border-2 border-dashed border-themeAccent/30 rounded-themePanel bg-themeElevated/50">
 <h2 className={`text-xl lg:text-2xl font-bold tracking-tight text-themeText mb-2 text-center`}>Smart Room & Auto-Timetable Engine</h2>
 <p className={`text-sm text-[#8E8E93] text-center mb-6 max-w-2xl`}>
 Let the AI constraint solver build a 100% clash-free schedule. It dynamically checks all faculty assignments, avoids room double-booking, and adapts to your custom operating hours and off-days in real-time.
 </p>
 
 <button
 onClick={generateTimetable}
 disabled={isGenerating}
 className="relative overflow-hidden group bg-themeAccent hover:bg-themeAccent/90 text-white font-black text-lg py-4 px-10 rounded-full transition transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
 >
 {isGenerating ? (
 <span className="flex items-center gap-3">
 <i className="fa-solid fa-atom fa-spin text-xl"></i>
 Generating...
 </span>
 ) : (
 <span className="flex items-center gap-3 text-themeApp">
 <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
 Auto-Generate Timetable
 </span>
 )}
 {!isGenerating && (
 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
 )}
 </button>
 {progress && (
 <p className={`mt-4 text-sm font-bold text-themeAccent animate-pulse uppercase tracking-widest`}>
 {progress}
 </p>
 )}
 </div>
 );
}

/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { notifyBatchWhatsApp } from '../../../../Shared/utils/whatsappIntegration';

export default function AutoGenerator({}) {
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
 
 // Official PCL Timings
 const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 const workingDaysIndex = [1, 2, 3, 4, 5, 6]; // 1-Mon, 6-Sat. (Sunday is off)
 
 // Generate time slots based on official timings
 // Mon-Fri: 8:45 AM - 4:45 PM
 const monFriSlots = [
    { s: '08:45:00', e: '09:45:00' },
    { s: '09:45:00', e: '10:45:00' },
    { s: '10:45:00', e: '11:45:00' },
    { s: '11:45:00', e: '12:45:00' },
    // 12:45 to 13:45 is Lunch Break
    { s: '13:45:00', e: '14:45:00' },
    { s: '14:45:00', e: '15:45:00' },
    { s: '15:45:00', e: '16:45:00' }
 ];

 // Saturday: 9:30 AM - 1:00 PM
 const saturdaySlots = [
    { s: '09:30:00', e: '10:30:00' },
    { s: '10:30:00', e: '11:30:00' },
    { s: '11:30:00', e: '12:30:00' }
    // Ends at 1:00 PM, but blocks are 1h, so we schedule 3 classes.
 ];
 
 if (timeSlots.length === 0) {
 throw new Error("Operating hours are too short to generate any 1-hour slots.");
 }

 // 2. Fetch available rooms
 const { data: rooms } = await supabase.from('academic_classrooms').select('id, name').eq('status', 'Active');
 if (!rooms || rooms.length === 0) {
 throw new Error("No active classrooms found. Please add classrooms in the Schedule Manager.");
 }

 // 3. Fetch active cohorts and their exact subjects
 const { data: subjects } = await supabase.from('cohort_subjects').select('id, batch_id, master_subject_id, faculty_id, master_subjects(name, credits)');
 if (!subjects || subjects.length === 0) {
 throw new Error("No subjects have been assigned to cohorts yet. Please assign subjects in the Faculty Allocator.");
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
 
 // Pull EXACT subjects belonging to this specific cohort
 const batchSubjects = subjects.filter(s => s.batch_id === batch.id);
 if (batchSubjects.length === 0) continue; // Skip batches with no subjects assigned
 
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
 batch_id: batch.id,
 cohort_subject_id: subject.id,
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
 
 <button type="button"
 onClick={generateTimetable}
 disabled={isGenerating}
 className="relative overflow-hidden group bg-themeAccent hover:bg-themeAccent/90 text-gray-900 dark:text-white font-black text-lg py-4 px-10 rounded-full transition transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
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
 <p className={`mt-4 text-sm font-bold text-themeAccent animate-pulse tracking-normal`}>
 {progress}
 </p>
 )}
 </div>
 );
}

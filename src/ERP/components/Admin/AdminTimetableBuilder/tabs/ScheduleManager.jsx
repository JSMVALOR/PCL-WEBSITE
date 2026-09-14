/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

const DAYS_OF_WEEK = [
 "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function ScheduleManager({ isEmbedded = false }) {
 const [settings, setSettings] = useState(null);
 const [classrooms, setClassrooms] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Form state - Timings
 const [startTime, setStartTime] = useState('09:00');
 const [endTime, setEndTime] = useState('16:00');
 const [offDays, setOffDays] = useState(['Saturday', 'Sunday']);

 // Form state - New Classroom
 const [newRoomName, setNewRoomName] = useState('');
 const [newRoomCapacity, setNewRoomCapacity] = useState(30);
 const [newRoomType, setNewRoomType] = useState('Lecture Hall');

 const fetchAllData = async () => {
 setLoading(true);
 try {
 // Fetch Timings
 const { data: scheduleData, error: scheduleError } = await supabase
 .from('institution_schedule')
 .select('*')
 .eq('programme', 'GLOBAL')
 .single();

 if (scheduleError && scheduleError.code !== 'PGRST116') throw scheduleError;

 if (scheduleData) {
 setSettings(scheduleData);
 setStartTime(scheduleData.start_time.substring(0, 5));
 setEndTime(scheduleData.end_time.substring(0, 5));
 setOffDays(scheduleData.off_days || []);
 }

 // Fetch Classrooms
 const { data: roomsData, error: roomsError } = await supabase
 .from('academic_classrooms')
 .select('*')
 .order('name');
 
 if (roomsError) {
 // If table doesn't exist yet, just ignore (might not have run SQL artifact)
 console.warn("Classrooms table might not exist yet:", roomsError.message);
 setClassrooms([]);
 } else {
 setClassrooms(roomsData || []);
 }

 } catch (err) {
 console.error("Failed to fetch schedule settings:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchAllData();
 }, []);

 const toggleOffDay = (day) => {
 setOffDays(prev => 
 prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
 );
 };

 const handleSaveSchedule = async (e) => {
 e.preventDefault();
 setSaving(true);
 try {
 const { error } = await supabase
 .from('institution_schedule')
 .upsert({
 programme: 'GLOBAL',
 start_time: startTime + ':00',
 end_time: endTime + ':00',
 off_days: offDays,
 updated_at: new Date().toISOString()
 }, { onConflict: 'programme' });

 if (error) throw error;
 
 window.erpDialog?.alert("Schedule settings saved successfully.");
 fetchAllData();
 } catch (err) {
 console.error("Failed to save schedule settings:", err);
 window.erpDialog?.alert("Error saving settings.");
 } finally {
 setSaving(false);
 }
 };

 const handleAddClassroom = async (e) => {
 e.preventDefault();
 if (!newRoomName.trim()) return;

 try {
 const { error } = await supabase.from('academic_classrooms').insert([{
 name: newRoomName.trim(),
 capacity: newRoomCapacity,
 type: newRoomType,
 status: 'Active'
 }]);

 if (error) throw error;

 setNewRoomName('');
 setNewRoomCapacity(30);
 setNewRoomType('Lecture Hall');
 fetchAllData();
 window.erpDialog?.alert("Classroom added successfully.");
 } catch (err) {
 console.error("Error adding classroom:", err);
 window.erpDialog?.alert("Failed to add classroom. Did you run the SQL artifact?");
 }
 };

 const toggleClassroomStatus = async (id, currentStatus) => {
 const newStatus = currentStatus === 'Active' ? 'Maintenance' : 'Active';
 try {
 const { error } = await supabase
 .from('academic_classrooms')
 .update({ status: newStatus })
 .eq('id', id);
 
 if (error) throw error;
 fetchAllData();
 } catch (err) {
 console.error("Error updating status:", err);
 window.erpDialog?.alert("Failed to update status.");
 }
 };

 const deleteClassroom = async (id) => {
 if (!window.confirm("Are you sure you want to delete this classroom?")) return;
 try {
 const { error } = await supabase
 .from('academic_classrooms')
 .delete()
 .eq('id', id);
 
 if (error) throw error;
 fetchAllData();
 } catch (err) {
 console.error("Error deleting classroom:", err);
 window.erpDialog?.alert("Failed to delete classroom. It might be in use.");
 }
 };

 if (loading) {
 return (
 <div className="h-64 flex items-center justify-center">
 <i className="fa-solid fa-spinner fa-spin text-themeAccent text-3xl"></i>
 </div>
 );
 }

 return (
 <div className="flex flex-col gap-8 animate-fade-in relative pb-10">
 <div>
 <h2 className="text-xl font-black text-themeText">Institution Schedule Manager</h2>
 <p className="text-xs font-bold text-themeTextSec">Configure global timings, off days, and academic classrooms.</p>
 </div>

 {/* TIMINGS & OFF DAYS SECTION */}
 <form onSubmit={handleSaveSchedule} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Operating Hours */}
 <div className="flex flex-col gap-4 bg-themePanel/85 backdrop-blur-2xl p-5 rounded-2xl border border-white/5">
 <div className="flex items-center gap-3 border-b border-white/5 pb-3">
 <i className="fa-regular fa-clock text-blue-500 text-lg"></i>
 <h3 className="text-sm font-black text-themeText">Operating Hours</h3>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">College Start Time</label>
 <input 
 type="time" 
 value={startTime} 
 onChange={e => setStartTime(e.target.value)} 
 required 
 className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" 
 />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">College End Time</label>
 <input 
 type="time" 
 value={endTime} 
 onChange={e => setEndTime(e.target.value)} 
 required 
 className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none color-scheme-dark" 
 />
 </div>
 </div>
 </div>

 {/* Weekly Off Days */}
 <div className="flex flex-col gap-4 bg-themePanel/85 backdrop-blur-2xl p-5 rounded-2xl border border-white/5">
 <div className="flex items-center gap-3 border-b border-white/5 pb-3">
 <i className="fa-regular fa-calendar-xmark text-rose-500 text-lg"></i>
 <h3 className="text-sm font-black text-themeText">Weekly Off Days</h3>
 </div>
 
 <div className="flex flex-wrap gap-2">
 {DAYS_OF_WEEK.map(day => {
 const isOff = offDays.includes(day);
 return (
 <button
 key={day}
 type="button"
 onClick={() => toggleOffDay(day)}
 className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${
 isOff 
 ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' 
 : 'bg-themeElevated/90 backdrop-blur-2xl text-themeTextSec border border-black/5 dark:border-white/10 hover:border-themeText hover:text-themeText'
 }`}
 >
 {isOff ? <i className="fa-solid fa-xmark mr-1"></i> : <i className="fa-solid fa-check mr-1 text-emerald-500"></i>}
 {day.substring(0, 3)}
 </button>
 );
 })}
 </div>
 <p className="text-[10px] font-bold text-themeTextSec mt-2">
 Click a day to toggle it as a working day or an off day.
 </p>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-white/5">
 <button 
 type="submit" 
 disabled={saving}
 className="bg-themeAccent text-themeApp px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
 >
 {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
 Save Global Schedule
 </button>
 </div>
 </form>

 {/* CLASSROOM MANAGEMENT SECTION */}
 <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6">
 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
 <i className="fa-solid fa-school text-emerald-500 text-lg"></i>
 <div>
 <h3 className="text-base font-black text-themeText">Academic Classrooms</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Manage rooms available for timetable scheduling</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Add Room Form */}
 <div className="lg:col-span-1 bg-themePanel/85 backdrop-blur-2xl p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
 <h4 className="text-xs font-black uppercase tracking-widest text-themeText">Add New Room</h4>
 
 <form onSubmit={handleAddClassroom} className="flex flex-col gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Room Name / Number</label>
 <input 
 type="text" 
 placeholder="e.g. LH 101"
 value={newRoomName}
 onChange={e => setNewRoomName(e.target.value)}
 required
 className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none transition"
 />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Capacity (Seats)</label>
 <input 
 type="number" 
 min="1"
 value={newRoomCapacity}
 onChange={e => setNewRoomCapacity(parseInt(e.target.value) || 0)}
 required
 className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none transition"
 />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5 block">Room Type</label>
 <select 
 value={newRoomType}
 onChange={e => setNewRoomType(e.target.value)}
 className="w-full bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] focus:border-themeAccent rounded-xl px-4 py-2.5 text-sm font-bold text-themeText outline-none transition appearance-none"
 >
 <option value="Lecture Hall">Lecture Hall</option>
 <option value="Moot Court">Moot Court</option>
 <option value="Computer Lab">Computer Lab</option>
 <option value="Seminar Hall">Seminar Hall</option>
 <option value="Auditorium">Auditorium</option>
 </select>
 </div>
 <button 
 type="submit"
 className="w-full bg-themeElevated/90 backdrop-blur-2xl text-emerald-500 hover:text-themeApp hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition mt-2"
 >
 <i className="fa-solid fa-plus mr-2"></i> Add Room
 </button>
 </form>
 </div>

 {/* Rooms List */}
 <div className="lg:col-span-2">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {classrooms.length === 0 ? (
 <div className="col-span-full py-12 text-center text-themeTextSec text-sm font-bold border border-white/5 border-dashed rounded-2xl">
 No classrooms defined yet.
 </div>
 ) : (
 classrooms.map(room => (
 <div key={room.id} className="bg-themePanel/85 backdrop-blur-2xl p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group relative overflow-hidden">
 <div className="flex justify-between items-start z-10">
 <div>
 <h4 className="text-sm font-black text-themeText">{room.name}</h4>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec bg-themeElevated/90 backdrop-blur-2xl px-2 py-0.5 rounded border border-black/5 dark:border-white/10">{room.type}</span>
 <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec bg-themeElevated/90 backdrop-blur-2xl px-2 py-0.5 rounded border border-black/5 dark:border-white/10">{room.capacity} Seats</span>
 </div>
 </div>
 
 <button 
 onClick={() => deleteClassroom(room.id)}
 className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shrink-0 opacity-0 group-hover:opacity-100"
 title="Delete Classroom"
 >
 <i className="fa-solid fa-trash text-[10px]"></i>
 </button>
 </div>

 <div className="border-t border-white/5 pt-3 flex justify-between items-center z-10 mt-1">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${room.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
 <span className="text-[10px] font-black uppercase tracking-widest text-themeText">{room.status}</span>
 </div>
 <button 
 onClick={() => toggleClassroomStatus(room.id, room.status)}
 className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded transition-colors ${room.status === 'Active' ? 'bg-themeElevated/90 backdrop-blur-2xl text-amber-500 hover:bg-amber-500/20' : 'bg-themeElevated/90 backdrop-blur-2xl text-emerald-500 hover:bg-emerald-500/20'}`}
 >
 {room.status === 'Active' ? 'Set Maintenance' : 'Set Active'}
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

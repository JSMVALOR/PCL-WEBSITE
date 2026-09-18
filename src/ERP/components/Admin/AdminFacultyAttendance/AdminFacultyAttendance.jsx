import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from '../../shared/PageHeader/PageHeader';
import { format, parseISO } from 'date-fns';

export default function AdminFacultyAttendance({ isEmbedded = false }) {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedDate]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);

            // 1. Get all faculty profiles
            const { data: faculty } = await supabase
                .from('profiles')
                .select('id, full_name, erp_id, avatar_url')
                .eq('role', 'faculty')
                .order('full_name', { ascending: true });

            if (!faculty) return;

            // 2. Get today's class sessions (to see who took attendance)
            const { data: sessions } = await supabase
                .from('class_sessions')
                .select('faculty_id')
                .eq('date', selectedDate);

            const facultyWithSessions = new Set((sessions || []).map(s => s.faculty_id));

            // 3. Get manual admin overrides from faculty_attendance_log
            const { data: logs } = await supabase
                .from('faculty_attendance_log')
                .select('*')
                .eq('date', selectedDate);

            const logMap = {};
            (logs || []).forEach(log => {
                logMap[log.faculty_id] = log;
            });

            // 4. Determine status for each faculty
            const enriched = faculty.map(f => {
                const manualLog = logMap[f.id];
                const tookClass = facultyWithSessions.has(f.id);

                let status = 'pending';
                let source = '';

                if (manualLog) {
                    status = manualLog.status; // 'absent' or 'present'
                    source = 'admin_override';
                } else if (tookClass) {
                    status = 'present';
                    source = 'auto_class';
                }

                return { ...f, status, source };
            });

            setFacultyData(enriched);
        } catch (error) {
            console.error("Error fetching faculty attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkStatus = async (facultyId, status) => {
        try {
            setActionLoading(facultyId);
            
            // Upsert into faculty_attendance_log
            const payload = {
                faculty_id: facultyId,
                date: selectedDate,
                status: status,
                // if they are marked absent, we count the full day as late_minutes so payroll deducts it
                // OR we just rely on the status 'absent' in the payroll module.
            };

            const { error } = await supabase
                .from('faculty_attendance_log')
                .upsert(payload, { onConflict: 'faculty_id,date' });

            if (error) {
                // If the constraint isn't set up, fallback to simple insert/update manually
                const { data: existing } = await supabase.from('faculty_attendance_log').select('id').eq('faculty_id', facultyId).eq('date', selectedDate).maybeSingle();
                if (existing) {
                    await supabase.from('faculty_attendance_log').update({ status }).eq('id', existing.id);
                } else {
                    await supabase.from('faculty_attendance_log').insert([payload]);
                }
            }

            fetchAttendanceData();
        } catch (error) {
            console.error(error);
            alert("Failed to mark attendance.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={`w-full animate-fade-in selection:bg-themeAccent/30 ${!isEmbedded ? "min-h-screen bg-transparent text-themeText font-sans" : ""}`}>
            <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
                
                {!isEmbedded && (
                    <PageHeader 
                        icon="fa-solid fa-user-clock" 
                        title="Faculty Attendance" 
                        subtitle="Monitor staff presence based on class activity and manually override absences for payroll deduction."
                    />
                )}

                <div className="w-full bg-themeElevated border border-black/10 dark:border-white/10 rounded-[2rem] p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-black text-themeText mb-1 tracking-tight">Daily Roster Check</h3>
                            <p className="text-xs text-themeTextSec uppercase tracking-widest font-bold">Faculty are automatically marked present if they initiate a class session.</p>
                        </div>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-black/5 dark:bg-[#121212] border border-black/10 dark:border-white/10 text-themeText text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-themeAccent/50 transition-colors"
                        />
                    </div>

                    {loading ? (
                        <div className="w-full h-40 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {facultyData.map(fac => (
                                <div key={fac.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl gap-4 hover:border-themeAccent/20 transition-colors group">
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center font-bold overflow-hidden border border-themeAccent/20 shrink-0">
                                            {fac.avatar_url ? <img src={fac.avatar_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-tie text-xl"></i>}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-themeText mb-0.5">{fac.full_name}</h4>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">{fac.erp_id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-0 border-black/10 dark:border-white/10 pt-4 sm:pt-0">
                                        
                                        {/* Status Badge */}
                                        <div className="flex-1 sm:flex-none">
                                            {fac.status === 'present' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <i className="fa-solid fa-check"></i> Present
                                                    </span>
                                                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">
                                                        {fac.source === 'auto_class' ? '(Auto: Class Taken)' : '(Manual Override)'}
                                                    </span>
                                                </div>
                                            ) : fac.status === 'absent' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <i className="fa-solid fa-xmark"></i> Absent
                                                    </span>
                                                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">
                                                        (Admin Enforced)
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <i className="fa-solid fa-hourglass-half"></i> Pending
                                                    </span>
                                                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">
                                                        (No classes logged yet)
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {fac.status !== 'present' && (
                                                <button 
                                                    onClick={() => handleMarkStatus(fac.id, 'present')}
                                                    disabled={actionLoading === fac.id}
                                                    className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-500 transition-colors flex items-center justify-center border border-transparent hover:border-emerald-500/30"
                                                    title="Force Mark Present"
                                                >
                                                    {actionLoading === fac.id ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <i className="fa-solid fa-check text-[10px]"></i>}
                                                </button>
                                            )}
                                            {fac.status !== 'absent' && (
                                                <button 
                                                    onClick={() => handleMarkStatus(fac.id, 'absent')}
                                                    disabled={actionLoading === fac.id}
                                                    className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center border border-transparent hover:border-rose-500/30"
                                                    title="Force Mark Absent (LOP)"
                                                >
                                                    {actionLoading === fac.id ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <i className="fa-solid fa-xmark text-[10px]"></i>}
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

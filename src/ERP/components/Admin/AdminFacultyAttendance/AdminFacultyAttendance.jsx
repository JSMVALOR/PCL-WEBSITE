import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from '../../shared/PageHeader/PageHeader';

import { useERP } from '../../../context/ErpContext';

export default function AdminFacultyAttendance({ isEmbedded = false }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [facultyData, setFacultyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const { userSession } = useERP();
    const [auditModal, setAuditModal] = useState({ isOpen: false, facultyId: null, newStatus: '', previousStatus: '' });
    const [auditReason, setAuditReason] = useState('');
    const [auditHistory, setAuditHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

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

    const handleMarkStatus = (facultyId, status, currentStatus) => {
        setAuditModal({ isOpen: true, facultyId, newStatus: status, previousStatus: currentStatus });
        setAuditReason('');
    };

    const confirmMarkStatus = async (e) => {
        e.preventDefault();
        const { facultyId, newStatus, previousStatus } = auditModal;
        
        try {
            setActionLoading(facultyId);
            setAuditModal({ isOpen: false, facultyId: null, newStatus: '', previousStatus: '' });
            
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

            // 3. Write to Audit Trail
            await supabase.from('attendance_audit_logs').insert([{
                faculty_id: facultyId,
                admin_id: userSession.db_id,
                date: selectedDate,
                previous_status: previousStatus || 'pending',
                new_status: newStatus,
                action_reason: auditReason
            }]);

            fetchAttendanceData();
        } catch (error) {
            console.error(error);
            alert("Failed to mark attendance.");
        } finally {
            setActionLoading(null);
        }
    };

    const fetchAuditHistory = async (facultyId) => {
        try {
            const { data } = await supabase
                .from('attendance_audit_logs')
                .select('*, admin:admin_id(full_name)')
                .eq('faculty_id', facultyId)
                .order('created_at', { ascending: false })
                .limit(10);
            if(data) {
                setAuditHistory(data);
                setShowHistoryModal(true);
            }
        } catch(e) { console.error(e); }
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
                            {facultyData.length === 0 ? (
                                <div className="w-full py-16 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4 mt-2">
                                    <i className="fa-solid fa-users-slash text-4xl lg:text-5xl text-themeTextSec opacity-50 mb-4"></i>
                                    <h3 className="text-lg lg:text-xl font-black text-themeText tracking-tight">No Faculty Records Found</h3>
                                    <p className="text-xs lg:text-sm text-themeTextSec mt-2 max-w-sm mx-auto font-medium">There are currently no users with the faculty role registered in the system.</p>
                                </div>
                            ) : facultyData.map(fac => (
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
                                                    onClick={() => handleMarkStatus(fac.id, 'present', fac.status)}
                                                    disabled={actionLoading === fac.id}
                                                    className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-500 transition-colors flex items-center justify-center border border-transparent hover:border-emerald-500/30"
                                                    title="Force Mark Present"
                                                >
                                                    {actionLoading === fac.id ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <i className="fa-solid fa-check text-[10px]"></i>}
                                                </button>
                                            )}
                                            {fac.status !== 'absent' && (
                                                <button 
                                                    onClick={() => handleMarkStatus(fac.id, 'absent', fac.status)}
                                                    disabled={actionLoading === fac.id}
                                                    className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center border border-transparent hover:border-rose-500/30"
                                                    title="Force Mark Absent (LOP)"
                                                >
                                                    {actionLoading === fac.id ? <i className="fa-solid fa-spinner fa-spin text-[10px]"></i> : <i className="fa-solid fa-xmark text-[10px]"></i>}
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => fetchAuditHistory(fac.id)}
                                                className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center border border-transparent hover:border-white/20 ml-2"
                                                title="View Edit History"
                                            >
                                                <i className="fa-solid fa-clock-rotate-left text-[10px]"></i>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* AUDIT REASON MODAL */}
                {auditModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="bg-themeElevated border border-black/10 dark:border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#161616]">
                                <h3 className="text-lg font-black text-themeText tracking-tight">Override Confirmation</h3>
                                <p className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold mt-1">This action modifies payroll deductions.</p>
                            </div>
                            <form onSubmit={confirmMarkStatus} className="p-6 flex flex-col gap-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Mandatory Reason / Note</label>
                                    <textarea 
                                        required
                                        autoFocus
                                        value={auditReason}
                                        onChange={(e) => setAuditReason(e.target.value)}
                                        placeholder="e.g., Unnotified absence, left campus early..."
                                        className="w-full h-24 bg-black/5 dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm text-themeText outline-none focus:border-themeAccent/50 transition-colors resize-none"
                                    ></textarea>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button type="button" onClick={() => setAuditModal({isOpen:false})} className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-themeText font-bold text-xs uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl bg-themeAccent text-white font-bold text-xs uppercase tracking-widest shadow-md hover:bg-themeAccent/90 transition-colors">Confirm & Log</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* AUDIT HISTORY MODAL */}
                {showHistoryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="bg-themeElevated border border-black/10 dark:border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#161616] flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-themeText tracking-tight">Edit History</h3>
                                    <p className="text-[10px] text-themeTextSec uppercase tracking-widest font-bold mt-1">Admin Audit Trail</p>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-themeTextSec hover:text-themeText">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                                {auditHistory.length === 0 ? (
                                    <p className="text-xs text-themeTextSec text-center italic py-4">No override history found.</p>
                                ) : (
                                    auditHistory.map(log => (
                                        <div key={log.id} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-themeAccent flex items-center gap-1.5"><i className="fa-solid fa-user-shield"></i> {log.admin?.full_name || 'Admin'}</span>
                                                <span className="text-[9px] font-bold text-themeTextSec">{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                            <p className="text-sm font-bold text-themeText">Changed status to: <span className={log.new_status === 'absent' ? 'text-rose-500' : 'text-emerald-500'}>{log.new_status.toUpperCase()}</span></p>
                                            <div className="bg-black/5 dark:bg-[#121212] p-2 rounded-lg mt-1">
                                                <p className="text-xs text-themeText italic">"{log.action_reason}"</p>
                                            </div>
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

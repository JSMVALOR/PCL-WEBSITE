import React, { useState, useEffect } from 'react';
import { useERP } from '../../../../ERP/context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import OrganizationDirectory from '../../shared/OrganizationDirectory/OrganizationDirectory';

export default function ParentDashboard({ onLogout }) {
    const { userSession } = useERP();
    const [studentData, setStudentData] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [activeModal, setActiveModal] = useState(null); // 'attendance' | 'marks' | 'leaves'
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'organization'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const { data: mapping } = await supabase.from('parent_student_mappings').select('student_id').eq('parent_id', userSession.db_id || userSession.id).maybeSingle();
            
            let student = null;
            if (mapping && mapping.student_id) {
                const { data } = await supabase.from('profiles').select('*').eq('id', mapping.student_id).maybeSingle();
                student = data;
            } else {
                const { data } = await supabase.from('profiles').select('*').eq('role', 'student').limit(1).maybeSingle();
                student = data;
            }

            if (student) {
                setStudentData(student);
                const { data: att } = await supabase.from('attendance_records').select('*, class_sessions(id, date, class_schedule(master_subjects(name, code)))').eq('student_id', student.id);
                // Map it so UI rendering (a.class_sessions?.subject) still works
                const formattedAtt = (att || []).map(a => ({
                    ...a,
                    class_sessions: {
                        date: a.class_sessions?.date,
                        subject: a.class_sessions?.class_schedule?.master_subjects?.name || 'Unknown'
                    }
                }));
                setAttendance(formattedAtt);
            }
        } catch (error) {
            console.error("Error fetching parent data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!studentData) return;
        const channel = supabase
            .channel('parent-attendance-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${studentData.id}` },
                (payload) => {
                    fetchStudentData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [studentData]);

    if (loading) return <div className="flex h-screen items-center justify-center text-themeText"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>;




    const totalCount = attendance.length;
    const presentCount = attendance.filter(a => a.entry_status === 'present' || a.entry_status === 'late' || (!a.entry_status && a.status === 'present')).length;
    const lateCount = attendance.filter(a => a.entry_status === 'late').length;
    const attPercentage = totalCount === 0 ? 100 : Math.round((presentCount / totalCount) * 100);

    return (
        <div className="min-h-screen bg-themeApp p-4 sm:p-8 font-sans selection:bg-themeAccent/20">
            {/* Header */}
            
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-[32px] font-semibold text-themeText tracking-tight font-sans">Parent Portal</h1>
                    <p className="text-[15px] font-medium text-themeTextSec">Welcome back, {userSession?.name}</p>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/10 w-full sm:w-auto">
                        <button 
                            onClick={() => setViewMode('dashboard')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                viewMode === 'dashboard' ? 'bg-white dark:bg-themeElevated text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText'
                            }`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setViewMode('organization')}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                viewMode === 'organization' ? 'bg-white dark:bg-themeElevated text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText'
                            }`}
                        >
                            Directory
                        </button>
                    </div>

                    <button onClick={onLogout} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors shrink-0">
                        Logout
                    </button>
                </div>
            </header>


            {viewMode === 'organization' ? (
                <OrganizationDirectory />
            ) : studentData ? (
                <div className="max-w-[1200px] mx-auto animate-fade-in">
                    
                    {/* BENTO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
                        
                        {/* 1. Student Profile Block (Span 8) */}
                        <div className="col-span-1 md:col-span-6 lg:col-span-8 bg-white/70 dark:bg-black/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group">
                            <div className="w-28 h-28 rounded-[24px] bg-themeElevated border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative z-10">
                                {studentData.profile_picture_url ? <img src={studentData.profile_picture_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user-graduate text-4xl text-themeTextSec"></i>}
                            </div>
                            <div className="flex flex-col text-center sm:text-left relative z-10 w-full">
                                <span className="text-[13px] font-semibold text-themeAccent mb-1 px-3 py-1 bg-themeAccent/10 rounded-full w-fit mx-auto sm:mx-0">Enrolled Student</span>
                                <h2 className="text-[32px] font-semibold text-themeText tracking-tight font-sans mb-2">{studentData.full_name}</h2>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                                    <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-4 flex flex-col">
                                        <span className="text-[12px] font-medium text-themeTextSec">ERP ID</span>
                                        <span className="text-[15px] font-semibold text-themeText">{studentData.erp_id}</span>
                                    </div>
                                    <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-4 flex flex-col">
                                        <span className="text-[12px] font-medium text-themeTextSec">Programme</span>
                                        <span className="text-[15px] font-semibold text-themeText">{studentData.programme || 'Law'} &bull; Sem {studentData.semester || '1'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Activity Ring (Attendance) (Span 4) */}
                        <div onClick={() => setActiveModal('attendance')} className="col-span-1 md:col-span-6 lg:col-span-4 bg-white/70 dark:bg-black/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#007AFF]/30 transition-colors relative group">
                            <h3 className="absolute top-6 left-6 text-[15px] font-semibold text-themeText flex items-center gap-2">
                                <i className="fa-solid fa-chart-pie text-themeAccent"></i> Activity
                            </h3>
                            <button className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-themeTextSec group-hover:bg-[#007AFF]/10 group-hover:text-themeAccent transition-colors">
                                <i className="fa-solid fa-chevron-right text-[10px]"></i>
                            </button>

                            <div className="relative w-36 h-36 mt-8 mb-4 drop-shadow-[0_4px_12px_rgba(0,122,255,0.3)] dark:drop-shadow-[0_4px_16px_rgba(0,122,255,0.4)]">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" className="stroke-black/5 dark:stroke-white/[0.05] fill-none" strokeWidth="8" />
                                    <circle 
                                        cx="50" cy="50" r="40" 
                                        className="stroke-[#007AFF] fill-none transition-all duration-1000 ease-out" 
                                        strokeWidth="8" strokeLinecap="round" 
                                        style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * attPercentage) / 100 }} 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[32px] font-semibold text-themeText tracking-tight font-sans -ml-1">{attPercentage}<span className="text-lg">%</span></span>
                                </div>
                            </div>
                            <span className="text-[13px] font-medium text-themeTextSec">Overall Attendance</span>
                        </div>

                        {/* 3. CGPA Block (Span 4) */}
                        <div onClick={() => setActiveModal('marks')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-white/70 dark:bg-black/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-6 cursor-pointer hover:border-[#34C759]/30 transition-colors flex flex-col gap-4 relative group">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-[16px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-graduation-cap text-xl"></i>
                                </div>
                                <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"></i>
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-[36px] font-semibold text-themeText tracking-tight leading-none mb-1">{(studentData.cgpa || 0).toFixed(2)}</span>
                                <span className="text-[13px] font-medium text-themeTextSec">Current CGPA</span>
                            </div>
                        </div>

                        {/* 4. Leaves Block (Span 4) */}
                        <div onClick={() => setActiveModal('leaves')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-white/70 dark:bg-black/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-6 cursor-pointer hover:border-[#FF9500]/30 transition-colors flex flex-col gap-4 relative group">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-[16px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-plane-departure text-lg"></i>
                                </div>
                                <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"></i>
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-[36px] font-semibold text-themeText tracking-tight leading-none mb-1">0</span>
                                <span className="text-[13px] font-medium text-themeTextSec">Active Leaves</span>
                            </div>
                        </div>

                        {/* 5. Invoices Block (Span 4) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white/70 dark:bg-black/40 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none p-6 cursor-pointer hover:border-[#AF52DE]/30 transition-colors flex flex-col gap-4 relative group">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-[16px] bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-file-invoice-dollar text-lg"></i>
                                </div>
                                <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"></i>
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-[36px] font-semibold text-themeText tracking-tight leading-none mb-1">₹0</span>
                                <span className="text-[13px] font-medium text-themeTextSec">Pending Dues</span>
                            </div>
                        </div>

                    </div>

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
                    <i className="fa-solid fa-link-slash text-4xl mb-4"></i>
                    <p>No student linked to this account.</p>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-themePanel w-full max-w-lg rounded-3xl border border-themeBorder dark:border-white/10 p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-themeTextSec hover:text-themeText dark:text-white transition">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                            
                            {activeModal === 'attendance' && (
                                <div>
                                    <h3 className="text-xl font-semibold tracking-tight text-themeText mb-4"><i className="fa-solid fa-calendar-check text-themeAccent mr-2"></i> Attendance Details</h3>
                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                                        {attendance.length === 0 ? <p className="text-themeTextSec text-sm">No attendance records found.</p> : attendance.map(a => (
                                            <div key={a.id} className="flex justify-between items-center p-3 rounded-xl bg-themeElevated border border-themeBorder dark:border-white/5">
                                                <div>
                                                    <p className="text-sm font-bold text-themeText">{new Date(a.class_sessions?.date || a.marked_at).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-themeTextSec tracking-normal font-black">{a.class_sessions?.subject || 'General'}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[13px] font-medium ${a.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {a.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
            {/* Organization closes here if it was a ternary, but wait! */}

                            {activeModal === 'marks' && (
                                <div>
                                    <h3 className="text-xl font-semibold tracking-tight text-themeText mb-4"><i className="fa-solid fa-graduation-cap text-emerald-500 mr-2"></i> Academic Performance</h3>
                                    <p className="text-themeTextSec text-sm">Detailed marks break down will appear here.</p>
                                </div>
                            )}
            {/* Organization closes here if it was a ternary, but wait! */}

                            {activeModal === 'leaves' && (
                                <div>
                                    <h3 className="text-xl font-semibold tracking-tight text-themeText mb-4"><i className="fa-solid fa-plane-departure text-amber-500 mr-2"></i> Leave History</h3>
                                    <p className="text-themeTextSec text-sm">Pending and past leaves will appear here.</p>
                                </div>
                            )}
            {/* Organization closes here if it was a ternary, but wait! */}
                        </motion.div>
                    </div>
                )}
            {/* Organization closes here if it was a ternary, but wait! */}
            </AnimatePresence>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import { sendSystemEmail } from '../../../lib/EmailService';

export default function AdminAttendanceIssues() {
    const [isLoading, setIsLoading] = useState(true);
    const [appeals, setAppeals] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('appeals'); // 'appeals' | 'debarment'
    
    // Debarment state
    const [students, setStudents] = useState([]);
    const [debarThreshold, setDebarThreshold] = useState(75);
    const [debarBatch, setDebarBatch] = useState('');
    const [debarLoading, setDebarLoading] = useState(false);

    const fetchAppeals = async () => {
        setIsLoading(true);
        try {
            const { data: tickets, error } = await supabase
                .from('helpdesk_tickets')
                .select('*, user:profiles!helpdesk_tickets_user_id_fkey(full_name, erp_id)')
                .eq('category', 'Attendance')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const mapped = (tickets || []).map(t => {
                let parsed = {};
                try { parsed = JSON.parse(t.system_metadata) || {}; } catch (e) {}
                return {
                    id: t.id,
                    student_name: t.user?.full_name || 'Unknown',
                    student_erp: t.user?.erp_id || 'N/A',
                    subject: t.subject || 'Unknown Subject',
                    reason: t.description,
                    status: t.status,
                    created_at: t.created_at,
                    session_id: parsed.session_id,
                    student_id: parsed.student_id,
                    record_id: parsed.record_id
                };
            });
            setAppeals(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDebarmentData = async () => {
        setDebarLoading(true);
        try {
            let query = supabase.from('profiles').select('id, full_name, erp_id, is_debarred, debarment_reason, academic_batch').eq('role', 'student');
            if (debarBatch) query = query.eq('academic_batch', debarBatch);
            
            const { data: stuData } = await query;
            if (!stuData) return;

            const { data: attData } = await supabase.from('attendance_records').select('student_id, entry_status, status');
            const { data: leaves } = await supabase.from('leave_requests').select('student_id, status').eq('status', 'approved');

            const processed = stuData.map(s => {
                const sAtt = (attData || []).filter(a => a.student_id === s.id);
                // We simplify exemption computation for this aggregate overview
                const total = sAtt.length;
                const present = sAtt.filter(a => ['present', 'late'].includes(a.entry_status || a.status)).length;
                const percentage = total === 0 ? 100 : Math.round((present / total) * 100);
                
                return {
                    ...s,
                    attendance_percentage: percentage
                };
            }).sort((a, b) => a.attendance_percentage - b.attendance_percentage);

            setStudents(processed);
        } catch(e) {
            console.error(e);
        } finally {
            setDebarLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'appeals') fetchAppeals();
        else fetchDebarmentData();
    }, [activeTab, debarBatch]);

    const handleAction = async (appeal, action) => {
        if(!appeal.session_id || !appeal.student_id) return window.erpDialog?.alert("Invalid payload. Missing session/student ID.");
        if(!(await window.erpDialog?.confirm(`Are you sure you want to ${action} this appeal?`))) return;
        
        setProcessingId(appeal.id);
        try {
            if (action === 'grant') {
                const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', appeal.session_id).eq('student_id', appeal.student_id);
                let attError;
                if (existing && existing.length > 0) {
                    const { error } = await supabase.from('attendance_records').update({ entry_status: 'present', marked_by: 'admin_override' }).eq('id', existing[0].id);
                    attError = error;
                } else {
                    const { error } = await supabase.from('attendance_records').insert({ session_id: appeal.session_id, student_id: appeal.student_id, entry_status: 'present', marked_by: 'admin_override' });
                    attError = error;
                }
                if (attError) throw attError;
                await supabase.from('helpdesk_tickets').update({ status: 'resolved', admin_reply: 'Appeal Granted by Administration.' }).eq('id', appeal.id);
            } else {
                await supabase.from('helpdesk_tickets').update({ status: 'closed', admin_reply: 'Appeal Rejected by Administration.' }).eq('id', appeal.id);
            }
            fetchAppeals();
            window.erpDialog?.alert(`Appeal successfully ${action}ed.`);
        } catch (error) {
            window.erpDialog?.alert("Failed to process appeal: " + error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDebarAction = async (student, action) => {
        if(!(await window.erpDialog?.confirm(`Are you sure you want to ${action} ${student.full_name}?`))) return;
        setProcessingId(student.id);
        try {
            if (action === 'Issue Warning') {
                await sendSystemEmail('SHORTAGE_WARNING', {
                    student_name: student.full_name,
                    attendance_percentage: student.attendance_percentage,
                    threshold: debarThreshold,
                    portal_link: window.location.origin + '/login'
                });
                window.erpDialog?.alert('Warning email sent successfully.', 'Success');
            } else if (action === 'Debar') {
                await supabase.from('profiles').update({ is_debarred: true, debarment_reason: `Debarred due to severe attendance shortage (${student.attendance_percentage}%). Minimum required is ${debarThreshold}%.` }).eq('id', student.id);
                await sendSystemEmail('DEBARMENT_NOTICE', {
                    student_name: student.full_name,
                    attendance_percentage: student.attendance_percentage,
                    threshold: debarThreshold,
                    portal_link: window.location.origin + '/login'
                });
                window.erpDialog?.alert('Student has been debarred.', 'Success');
                fetchDebarmentData();
            } else if (action === 'Reinstate') {
                await supabase.from('profiles').update({ is_debarred: false, debarment_reason: null }).eq('id', student.id);
                window.erpDialog?.alert('Student has been reinstated.', 'Success');
                fetchDebarmentData();
            }
        } catch(e) {
            window.erpDialog?.alert("Failed to process action: " + e.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-themeText dark:text-white font-sans animate-fade-in pb-12">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
                
                <PageHeader 
                    icon="fa-solid fa-clipboard-question" 
                    title="Attendance & Debarment" 
                    subtitle="Review disputes and manage attendance debarment thresholds."
                />

                <div className="flex bg-black/[0.03] dark:bg-white/[0.04] p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/10 w-fit">
                    <button onClick={() => setActiveTab('appeals')} className={`px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${activeTab === 'appeals' ? 'bg-white dark:bg-white/10 text-themeText dark:text-white shadow-sm' : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white'}`}>Appeals</button>
                    <button onClick={() => setActiveTab('debarment')} className={`px-6 py-2 rounded-lg text-[13px] font-medium transition-all ${activeTab === 'debarment' ? 'bg-white dark:bg-white/10 text-themeText dark:text-white shadow-sm' : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white'}`}>Debarment System</button>
                </div>

                {activeTab === 'appeals' ? (
                    isLoading ? (
                        <div className="w-full py-20 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {appeals.length === 0 ? (
                                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4 col-span-full">
                                    <i className="fa-solid fa-clipboard-check text-4xl text-black/10 dark:text-white/10 mb-4"></i>
                                    <h3 className="text-base font-black text-themeText dark:text-white">No Issues Pending</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/40 mt-1">All attendance disputes have been resolved.</p>
                                </div>
                            ) : (
                                appeals.map(appeal => (
                                    <div key={appeal.id} className="bg-white/70 dark:bg-[#121212]/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block ${
                                                    appeal.status === 'open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    appeal.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    'bg-black/5 dark:bg-white/5 text-themeTextSec dark:text-white/50 border-themeBorder dark:border-white/10'
                                                }`}>
                                                    {appeal.status}
                                                </span>
                                                <h4 className="text-sm font-black text-themeText dark:text-white">{appeal.student_name}</h4>
                                                <p className="text-[10px] font-bold tracking-widest text-themeTextSec dark:text-white/50 uppercase">{appeal.student_erp}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">{appeal.subject}</p>
                                            <p className="text-xs font-medium text-themeText dark:text-white/70 leading-relaxed">"{appeal.reason}"</p>
                                        </div>

                                        {appeal.status === 'open' && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => handleAction(appeal, 'grant')} disabled={processingId === appeal.id} className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-black transition-colors">Grant</button>
                                                <button onClick={() => handleAction(appeal, 'reject')} disabled={processingId === appeal.id} className="flex-1 py-3 bg-black/5 hover:bg-rose-500/10 border border-themeBorder dark:border-white/10 hover:border-rose-500/20 rounded-xl text-themeTextSec dark:text-white/50 hover:text-rose-500 text-xs font-black transition-colors">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/70 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-[2rem] p-6">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2 block">Debarment Threshold (%)</label>
                                <input type="number" value={debarThreshold} onChange={e => setDebarThreshold(Number(e.target.value))} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-themeAccent/50" />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2 block">Filter Batch</label>
                                <input type="text" placeholder="e.g. BATCH-2026" value={debarBatch} onChange={e => setDebarBatch(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-themeAccent/50" />
                            </div>
                        </div>

                        {debarLoading ? (
                            <div className="w-full py-20 flex justify-center"><div className="w-6 h-6 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {students.map(s => {
                                    const isBelow = s.attendance_percentage < debarThreshold;
                                    return (
                                        <div key={s.id} className={`bg-white/70 dark:bg-[#121212]/70 backdrop-blur-3xl saturate-[1.8] border ${s.is_debarred ? 'border-rose-500/30 bg-rose-500/5' : isBelow ? 'border-amber-500/30' : 'border-black/5 dark:border-white/5'} rounded-[2rem] p-6 flex flex-col gap-4`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-black text-themeText dark:text-white">{s.full_name}</h4>
                                                    <p className="text-[10px] font-bold tracking-widest text-themeTextSec dark:text-white/50 uppercase">{s.erp_id}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-black ${s.is_debarred ? 'bg-rose-500/10 text-rose-500' : isBelow ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {s.attendance_percentage}%
                                                </div>
                                            </div>

                                            {s.is_debarred ? (
                                                <>
                                                    <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl text-xs font-medium border border-rose-500/20">
                                                        <i className="fa-solid fa-ban mr-2"></i> Debarred
                                                    </div>
                                                    <button onClick={() => handleDebarAction(s, 'Reinstate')} disabled={processingId === s.id} className="mt-2 w-full py-3 bg-black/5 hover:bg-emerald-500/10 border border-themeBorder dark:border-white/10 hover:border-emerald-500/20 rounded-xl text-themeTextSec dark:text-white/50 hover:text-emerald-500 text-xs font-black transition-colors">Reinstate</button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <button onClick={() => handleDebarAction(s, 'Issue Warning')} disabled={processingId === s.id || !isBelow} className={`flex-1 py-3 rounded-xl text-xs font-black transition-colors ${isBelow ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-black/5 text-themeTextSec/50 cursor-not-allowed'}`}>Warning</button>
                                                    <button onClick={() => handleDebarAction(s, 'Debar')} disabled={processingId === s.id || !isBelow} className={`flex-1 py-3 rounded-xl text-xs font-black transition-colors ${isBelow ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-black/5 text-themeTextSec/50 cursor-not-allowed'}`}>Debar</button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

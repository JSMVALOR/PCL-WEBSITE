/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyMentorship() {
    const { userSession } = useERP();
    const facultyId = userSession?.db_id || userSession?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [mentees, setMentees] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Mentorship mappings
            const { data: mappings } = await supabase
                .from('mentorship')
                .select('student_id')
                .eq('faculty_id', facultyId);

            const studentIds = (mappings || []).map(m => m.student_id);

            // 2. Fetch Profiles for mentees
            let menteesData = [];
            if (studentIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, erp_id, programme, avatar_url')
                    .in('id', studentIds);
                
                // Fetch attendance for these mentees
                const { data: att } = await supabase
                    .from('attendance_records')
                    .select('student_id, entry_status, status')
                    .in('student_id', studentIds);
                
                menteesData = (profiles || []).map(p => {
                    const studentAtt = (att || []).filter(a => a.student_id === p.id);
                    const total = studentAtt.length;
                    const present = studentAtt.filter(a => a.entry_status === 'present' || a.entry_status === 'late' || (!a.entry_status && a.status === 'present')).length;
                    return {
                        ...p,
                        attendance_percentage: total === 0 ? 100 : Math.round((present / total) * 100)
                    };
                });
            }
            setMentees(menteesData);

            // 3. Fetch Meetings
            const { data: mtgs } = await supabase
                .from('mentorship_meetings')
                .select('*')
                .eq('faculty_id', facultyId)
                .order('scheduled_at', { ascending: false });

            if (mtgs) {
                // Map student names
                const mappedMtgs = mtgs.map(m => {
                    const student = menteesData.find(stu => stu.id === m.student_id);
                    return { ...m, student: student || { full_name: 'Unknown Student' } };
                });
                setMeetings(mappedMtgs);
            }

            // 4. Fetch Attendance Appeals (pending_mentor)
            if (studentIds.length > 0) {
                const { data: tkts } = await supabase
                    .from('helpdesk_tickets')
                    .select('*')
                    .eq('category', 'Attendance')
                    .eq('status', 'pending_mentor')
                    .in('user_id', studentIds)
                    .order('created_at', { ascending: false });
                
                if (tkts) {
                    const mappedTkts = tkts.map(t => {
                        const student = menteesData.find(stu => stu.id === t.user_id);
                        return { ...t, student: student || { full_name: 'Unknown Student' } };
                    });
                    setAppeals(mappedTkts);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (facultyId) fetchData();
    }, [facultyId]);

    const handleMeetingStatus = async (meetingId, newStatus) => {
        setActionLoading(meetingId);
        try {
            await supabase.from('mentorship_meetings').update({ status: newStatus }).eq('id', meetingId);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAppealAction = async (ticketId, isApproved) => {
        setActionLoading(ticketId);
        try {
            if (isApproved) {
                await supabase.from('helpdesk_tickets').update({ status: 'open', admin_reply: 'Mentor Approved. Pending Admin Review.' }).eq('id', ticketId);
            } else {
                await supabase.from('helpdesk_tickets').update({ status: 'resolved', admin_reply: 'Rejected by Mentor.' }).eq('id', ticketId);
            }
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-gray-900 dark:text-white font-sans animate-fade-in pb-12">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
                
                <PageHeader 
                    icon="fa-solid fa-users-viewfinder" 
                    title="Mentorship Dashboard" 
                    subtitle="Manage your assigned students and schedule guidance sessions."
                />

                {isLoading ? (
                    <div className="w-full py-16 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* Mentees Roster */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-4">
                            <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                <i className="fa-solid fa-user-graduate text-gray-500 dark:text-white/50"></i> Assigned Mentees
                            </h3>
                            
                            {mentees.length === 0 ? (
                                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                    <i className="fa-solid fa-users-slash text-2xl text-gray-300 dark:text-white/20 mb-3"></i>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">No mentees assigned.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {mentees.map(m => (
                                        <div key={m.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-amber-500/30 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/5 text-gray-400 dark:text-white/30 flex items-center justify-center font-black">
                                                {m.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
    <h4 className="text-sm font-black text-gray-900 dark:text-white">{m.full_name}</h4>
    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.attendance_percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {m.attendance_percentage}% Att.
    </div>
</div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mt-1">{m.programme} • {m.erp_id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Meeting Requests */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                <i className="fa-solid fa-inbox text-gray-500 dark:text-white/50"></i> Session Requests
                            </h3>
                            
                            {meetings.length === 0 ? (
                                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                    <i className="fa-solid fa-mug-hot text-4xl text-neutral-800 mb-4"></i>
                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1 tracking-tight">Inbox Empty</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">No session requests from mentees.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {meetings.map(meeting => (
                                        <div key={meeting.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block ${
                                                    meeting.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    meeting.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    meeting.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {meeting.status}
                                                </span>
                                                <h4 className="text-sm font-black text-gray-900 dark:text-white">{meeting.topic || 'Mentorship Session'}</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mt-1 flex items-center gap-2">
                                                    <i className="fa-solid fa-user text-amber-500/50"></i> {meeting.student?.full_name}
                                                </p>
                                                {meeting.scheduled_at && (
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1 flex items-center gap-2">
                                                        <i className="fa-solid fa-clock"></i> {new Date(meeting.scheduled_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {meeting.status === 'pending' && (
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button 
                                                        onClick={() => handleMeetingStatus(meeting.id, 'scheduled')}
                                                        disabled={actionLoading === meeting.id}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-black transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMeetingStatus(meeting.id, 'cancelled')}
                                                        disabled={actionLoading === meeting.id}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-rose-500/10 text-gray-500 dark:text-white/50 hover:text-rose-500 border border-gray-300 dark:border-white/10 hover:border-rose-500/20 rounded-xl text-xs font-black transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                            {meeting.status === 'scheduled' && (
                                                <button 
                                                    onClick={() => handleMeetingStatus(meeting.id, 'completed')}
                                                    disabled={actionLoading === meeting.id}
                                                    className="w-full sm:w-auto px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-black transition-colors"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

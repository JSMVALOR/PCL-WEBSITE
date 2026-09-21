/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import MentorshipChatHub from '../../shared/MentorshipChatHub';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import Attendance from "../../Student/Attendance/Attendance";
import MenteeAcademicRecord from "./MenteeAcademicRecord";

export default function FacultyMentorship() {
    const { userSession } = useERP();
    const facultyId = userSession?.db_id || userSession?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [mentees, setMentees] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [menteeTab, setMenteeTab] = useState('attendance');

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
                    .select('id, full_name, erp_id, programme, profile_picture_url, academic_batch')
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

        
            // 5. Fetch Grievances assigned to this mentor
            const { data: grievData } = await supabase
                .from('grievances')
                .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name), accused:profiles!grievances_accused_id_fkey(full_name)')
                .eq('assigned_to', facultyId)
                .order('created_at', { ascending: false });
            if (grievData) setGrievances(grievData);

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
        
            // 5. Fetch Grievances assigned to this mentor
            const { data: grievData } = await supabase
                .from('grievances')
                .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name), accused:profiles!grievances_accused_id_fkey(full_name)')
                .eq('assigned_to', facultyId)
                .order('created_at', { ascending: false });
            if (grievData) setGrievances(grievData);

        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };


    const handleGrievanceAction = async (grievanceId, newStatus, notes = "") => {
        setActionLoading(grievanceId);
        try {
            const { error } = await supabase.from('grievances').update({ status: newStatus, resolution_notes: notes, updated_at: new Date() }).eq('id', grievanceId);
            if (error) throw error;
            window.erpDialog?.alert(`Grievance marked as ${newStatus}.`);
            
            setGrievances(prev => prev.map(g => g.id === grievanceId ? { ...g, status: newStatus, resolution_notes: notes } : g));
        } catch (error) {
            console.error(error);
            window.erpDialog?.alert("Failed to update grievance.");
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
        
            // 5. Fetch Grievances assigned to this mentor
            const { data: grievData } = await supabase
                .from('grievances')
                .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name), accused:profiles!grievances_accused_id_fkey(full_name)')
                .eq('assigned_to', facultyId)
                .order('created_at', { ascending: false });
            if (grievData) setGrievances(grievData);

        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-themeApp flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-amber-500"></i>
                    <p className="text-sm font-bold text-themeTextSec uppercase tracking-widest">Loading Mentorship...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white">Mentorship Hub</h1>
                            <p className="text-sm font-medium text-themeTextSec mt-1">Manage mentees and track academic progress.</p>
                        </div>
                    </div>
                </div>

                {selectedMentee ? (
                    /* ──── MENTEE PROFILE VIEW ──── */
                    <div className="flex flex-col gap-6">
                        {/* Back Button + Mentee Header */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button onClick={() => { setSelectedMentee(null); setMenteeTab('attendance'); }} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-left text-themeTextSec dark:text-white/60"></i>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black">
                                    {selectedMentee.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-themeText dark:text-white">{selectedMentee.full_name}</h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">{selectedMentee.erp_id} • {selectedMentee.programme}</p>
                                </div>
                            </div>
                            <div className={`ml-auto px-3 py-1 rounded-lg text-xs font-black ${selectedMentee.attendance_percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {selectedMentee.attendance_percentage}% Attendance
                            </div>
                        </div>

                        {/* Tab Bar */}
                        <div className="flex p-1.5 bg-black/[0.03] dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 w-fit gap-1">
                            {[
                                { id: 'attendance', label: 'Attendance', icon: 'fa-clipboard-user' },
                                { id: 'academic', label: 'Academic Record', icon: 'fa-graduation-cap' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setMenteeTab(tab.id)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-2 ${
                                        menteeTab === tab.id
                                            ? 'bg-white dark:bg-white/15 text-themeText dark:text-white border border-black/5 dark:border-white/20 shadow-sm'
                                            : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                                    }`}>
                                    <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                            {menteeTab === 'attendance' && (
                                <Attendance menteeId={selectedMentee.id} isEmbedded={true} />
                            )}
                            {menteeTab === 'academic' && (
                                <MenteeAcademicRecord menteeId={selectedMentee.id} mentorId={facultyId} />
                            )}
                        </div>
                    </div>
                ) : (
                    /* ──── MAIN DASHBOARD ──── */
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Mentees Roster */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-4">
                            <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                                <i className="fa-solid fa-user-graduate text-themeTextSec dark:text-white/50"></i> Assigned Mentees
                                {mentees.length > 0 && <span className="text-xs font-bold text-themeTextSec ml-auto">{mentees.length}</span>}
                            </h3>
                            
                            {mentees.length === 0 ? (
                                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                    <i className="fa-solid fa-users-slash text-2xl text-gray-300 dark:text-white/20 mb-3"></i>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">No mentees assigned.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {mentees.map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => setSelectedMentee(m)}
                                            className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-amber-500/30 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm">
                                                {m.full_name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-black text-themeText dark:text-white truncate">{m.full_name}</h4>
                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${m.attendance_percentage >= 75 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {m.attendance_percentage}%
                                                    </div>
                                                </div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mt-1">{m.programme} • {m.erp_id}</p>
                                            </div>
                                            <i className="fa-solid fa-chevron-right text-[10px] text-themeTextSec dark:text-white/30 group-hover:text-amber-500 transition-colors"></i>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Attendance Appeals */}
                            {appeals.length > 0 && (
                                <div className="flex flex-col gap-3 mt-4">
                                    <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                                        <i className="fa-solid fa-gavel text-rose-500/70"></i> Attendance Appeals
                                        <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md text-[10px] font-black ml-auto">{appeals.length}</span>
                                    </h3>
                                    {appeals.map(appeal => (
                                        <div key={appeal.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                                            <div>
                                                <h4 className="text-sm font-black text-themeText dark:text-white">{appeal.student?.full_name}</h4>
                                                <p className="text-[10px] text-themeTextSec dark:text-white/50 mt-1">{appeal.description || 'No reason provided'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAppealAction(appeal.id, true)} disabled={actionLoading === appeal.id} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-black transition-colors">Approve</button>
                                                <button onClick={() => handleAppealAction(appeal.id, false)} disabled={actionLoading === appeal.id} className="flex-1 py-2 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-xl text-xs font-black transition-colors">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                            {grievances.length > 0 && (
                                <div className="flex flex-col gap-3 mt-4">
                                    <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                                        <i className="fa-solid fa-scale-balanced text-rose-500/70"></i> Grievance Reports
                                        <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md text-[10px] font-black ml-auto">{grievances.filter(g => g.status === 'pending' || g.status === 'investigating').length} Active</span>
                                    </h3>
                                    {grievances.map(g => (
                                        <div key={g.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h4 className="text-sm font-black text-rose-500">{g.category}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${g.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : g.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-black/5 dark:bg-white/10 text-themeTextSec'}`}>{g.status}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-themeTextSec mt-1">Reporter: {g.reporter?.full_name}</p>
                                                <p className="text-[10px] font-bold text-themeTextSec">Against: {g.accused?.full_name}</p>
                                                <p className="text-xs text-themeText dark:text-white mt-2 border-l-2 border-rose-500/30 pl-2 py-0.5">"{g.description}"</p>
                                                {g.resolution_notes && (
                                                    <p className="text-[10px] text-themeTextSec italic mt-2">Notes: {g.resolution_notes}</p>
                                                )}
                                            </div>
                                            {(g.status === 'pending' || g.status === 'investigating') && (
                                            <div className="flex flex-wrap gap-2">
                                                {g.status === 'pending' && <button onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Investigate</button>}
                                                <button onClick={async () => { const notes = await window.erpDialog.prompt("Resolution Notes:"); if(notes) handleGrievanceAction(g.id, 'resolved', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Resolve</button>
                                                <button onClick={async () => { const notes = await window.erpDialog.prompt("Dismissal Reason:"); if(notes) handleGrievanceAction(g.id, 'dismissed', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-white/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Dismiss</button>
                                                <button onClick={() => handleGrievanceAction(g.id, 'escalated_to_admin', 'Escalated by mentor')} disabled={actionLoading === g.id} className="w-full py-1.5 bg-themeAccent/10 text-themeAccent hover:bg-themeAccent/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-themeAccent/20">Escalate to Admin</button>
                                            </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* Meeting Requests */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-4">
                            <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                                <i className="fa-solid fa-inbox text-themeTextSec dark:text-white/50"></i> Session Requests
                            </h3>
                            
                            {meetings.length === 0 ? (
                                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                    <i className="fa-solid fa-mug-hot text-4xl text-neutral-800 mb-4"></i>
                                    <h3 className="text-base font-black text-themeText dark:text-white mb-1 tracking-tight">Inbox Empty</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">No session requests from mentees.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {meetings.map(meeting => (
                                        <div key={meeting.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block ${
                                                    meeting.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    meeting.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    meeting.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {meeting.status}
                                                </span>
                                                <h4 className="text-sm font-black text-themeText dark:text-white">{meeting.topic || 'Mentorship Session'}</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mt-1 flex items-center gap-2">
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
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-rose-500/10 text-themeTextSec dark:text-white/50 hover:text-rose-500 border border-black/5 dark:border-white/10 hover:border-rose-500/20 rounded-xl text-xs font-black transition-colors"
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

                {selectedMentee && (
                    <MentorshipChatHub 
                        receiverId={selectedMentee.id}
                        receiverName={selectedMentee.full_name}
                        receiverRole="Mentee"
                        receiverAvatar={selectedMentee.profile_picture_url}
                    />
                )}
            </div>
        </div>
    );
}
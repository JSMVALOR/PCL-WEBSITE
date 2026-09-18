/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function Mentorship() {
    const { userSession } = useERP();
    const studentId = userSession?.db_id || userSession?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [mentorData, setMentorData] = useState(null);
    const [meetingHistory, setMeetingHistory] = useState([]);
    
    // Modal State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestForm, setRequestForm] = useState({ topic: '', preferred_date: '' });
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Allocation
            const { data: allocData } = await supabase
                .from('mentorship')
                .select('faculty_id')
                .eq('student_id', studentId)
                .order('allocated_at', { ascending: false })
                .limit(1);

            let mentorId = allocData?.[0]?.faculty_id;
            
            if (mentorId) {
                const { data: mentor } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, department')
                    .eq('id', mentorId)
                    .single();
                if (mentor) setMentorData(mentor);
            }

            // Fetch Meetings
            const { data: meetingData } = await supabase
                .from('mentorship_meetings')
                .select('*')
                .eq('student_id', studentId)
                .order('scheduled_at', { ascending: false });
            
            if (meetingData) setMeetingHistory(meetingData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) fetchData();
    }, [studentId]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: "", text: "" });

        if (!mentorData) {
            setStatusMessage({ type: "error", text: "No mentor assigned." });
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase.from('mentorship_meetings').insert([{
                student_id: studentId,
                faculty_id: mentorData.id,
                topic: requestForm.topic,
                status: 'pending',
                scheduled_at: requestForm.preferred_date ? new Date(requestForm.preferred_date).toISOString() : null,
                notes: 'Student requested session'
            }]);

            if (error) throw error;
            setStatusMessage({ type: "success", text: "Session requested successfully!" });
            fetchData();
            setTimeout(() => {
                setShowRequestModal(false);
                setRequestForm({ topic: '', preferred_date: '' });
                setStatusMessage({ type: "", text: "" });
            }, 1500);
        } catch (error) {
            setStatusMessage({ type: "error", text: "Failed to request session." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-gray-900 dark:text-white font-sans animate-fade-in pb-12">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
                
                <PageHeader 
                    icon="fa-solid fa-people-arrows" 
                    title="Mentorship Hub" 
                    subtitle="Connect with your assigned faculty mentor for academic guidance."
                    rightContent={
                        mentorData ? (
                            <button 
                                onClick={() => setShowRequestModal(true)}
                                className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs lg:text-sm hover:bg-amber-400 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                <i className="fa-solid fa-calendar-plus"></i> Request Session
                            </button>
                        ) : null
                    }
                />

                <div className="flex flex-col gap-6">
                    {isLoading ? (
                        <div className="w-full py-16 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : !mentorData ? (
                        <div className="w-full py-20 lg:py-32 text-center flex flex-col items-center justify-center">
                            <i className="fa-solid fa-user-slash text-4xl lg:text-5xl text-neutral-800 mb-4 lg:mb-6"></i>
                            <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">No Mentor Assigned</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 max-w-sm mx-auto">Please contact administration for allocation.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            
                            {/* Mentor Profile Card */}
                            <div className="w-full lg:w-1/3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center h-fit">
                                <div className="w-24 h-24 rounded-full bg-white/5 border border-gray-300 dark:border-white/10 text-gray-400 dark:text-white/30 flex items-center justify-center text-3xl font-black mb-4">
                                    {mentorData.full_name.charAt(0)}
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{mentorData.full_name}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">{mentorData.department}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-white/50 mt-4 flex items-center gap-2">
                                    <i className="fa-solid fa-envelope"></i> {mentorData.email}
                                </p>
                            </div>

                            {/* Session History */}
                            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                                <h3 className="text-base lg:text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                                    <i className="fa-solid fa-clock-rotate-left text-gray-500 dark:text-white/50"></i> Session History
                                </h3>

                                {meetingHistory.length === 0 ? (
                                    <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                                        <i className="fa-solid fa-mug-hot text-2xl text-gray-300 dark:text-white/20 mb-3"></i>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">No sessions recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {meetingHistory.map(meeting => (
                                            <div key={meeting.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 dark:text-white">{meeting.topic || 'Mentorship Session'}</h4>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mt-1">
                                                        {meeting.scheduled_at ? new Date(meeting.scheduled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date TBD'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                                    meeting.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    meeting.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    meeting.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* REQUEST MODAL */}
                {showRequestModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-white/[0.08] flex justify-between items-start bg-[#161616]">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1 text-gray-900 dark:text-white">Request Session</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-white/50 font-bold uppercase tracking-widest">Connect with your mentor.</p>
                                </div>
                                <button type="button" onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-white/10 transition-colors">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleRequestSubmit} className="p-6 flex flex-col gap-5">
                                {statusMessage.text && (
                                    <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border ${statusMessage.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                                        <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check" : "fa-triangle-exclamation"}`}></i>
                                        {statusMessage.text}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Discussion Topic</label>
                                    <input type="text" required value={requestForm.topic} onChange={e => setRequestForm({...requestForm, topic: e.target.value})} placeholder="e.g. Career Guidance, Academic Help" className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:border-amber-500 outline-none transition placeholder:text-gray-300 dark:text-white/20" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Preferred Date & Time (Optional)</label>
                                    <input type="datetime-local" value={requestForm.preferred_date} onChange={e => setRequestForm({...requestForm, preferred_date: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:border-amber-500 outline-none transition [color-scheme:dark]" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-4 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <><i className="fa-solid fa-paper-plane"></i> Submit Request</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

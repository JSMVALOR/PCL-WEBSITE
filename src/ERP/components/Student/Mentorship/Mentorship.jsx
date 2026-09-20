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
                    .select('id, full_name, email, department, profile_picture_url, faculty_profiles(designation)')
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
        <div className="w-full min-h-screen bg-transparent text-themeText dark:text-white font-sans animate-fade-in pb-12">
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
                            <h3 className="text-base lg:text-lg font-black text-themeText dark:text-white mb-1 tracking-tight">No Mentor Assigned</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 max-w-sm mx-auto">Please contact administration for allocation.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            
                            {/* Mentor Profile Card */}
                            <div className="w-full lg:w-1/3 bg-themeApp border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center h-fit relative overflow-hidden group hover:border-themeAccent/50 transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-themeAccent/20 transition-all"></div>
                                <div className="relative w-28 h-28 mb-6">
                                    <div className="absolute inset-0 bg-themeAccent/10 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-full h-full rounded-full bg-themeElevated border-2 border-themeBorder shadow-lg text-themeTextSec flex items-center justify-center text-4xl font-black overflow-hidden ring-4 ring-themeApp">
                                        {mentorData.profile_picture_url ? (
                                            <img src={mentorData.profile_picture_url} alt={mentorData.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="bg-gradient-to-br from-themeText to-themeTextSec bg-clip-text text-transparent drop-shadow-sm">{mentorData.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-themeApp rounded-full shadow-sm"></div>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-themeText leading-tight">{mentorData.full_name}</h3>
                                {mentorData.faculty_profiles?.designation && (
                                    <p className="text-xs font-bold text-themeTextSec dark:text-white/50 mt-1 uppercase tracking-widest">{mentorData.faculty_profiles.designation}</p>
                                )}
                                <span className="mt-3 px-3 py-1 rounded-full bg-themeElevated border border-themeBorder text-[11px] font-black uppercase tracking-widest text-themeAccent shadow-sm">{mentorData.department || 'Mentorship Team'}</span>
                                <div className="w-full h-px bg-themeBorderStrong my-6"></div>
                                <a href={`mailto:${mentorData.email}`} className="w-full py-3.5 rounded-xl bg-themeElevated border border-themeBorder text-themeText hover:bg-themeAccent hover:text-themeText text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm group/btn">
                                    <i className="fa-solid fa-paper-plane group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform"></i> Message Mentor
                                </a>
                            </div>

                            {/* Session History */}
                            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                                <h3 className="text-base lg:text-lg font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                                    <i className="fa-solid fa-clock-rotate-left text-themeTextSec dark:text-white/50"></i> Session History
                                </h3>

                                {meetingHistory.length === 0 ? (
                                    <div className="w-full py-20 lg:py-24 flex flex-col items-center justify-center bg-themeApp border border-themeBorder border-dashed rounded-[2rem] text-center px-4 group hover:border-themeAccent/30 transition-colors cursor-pointer" onClick={() => setShowRequestModal(true)}>
                                        <div className="w-20 h-20 bg-themeElevated border border-themeBorder rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            <i className="fa-solid fa-mug-hot text-3xl text-themeTextSec opacity-70 group-hover:text-themeAccent transition-colors"></i>
                                        </div>
                                        <h3 className="text-[17px] font-black tracking-tight text-themeText mb-1">No Mentorship Sessions</h3>
                                        <p className="text-xs font-bold text-themeTextSec opacity-70 max-w-sm mx-auto mb-6">You haven't had any sessions with your mentor yet. Booking a session is a great way to stay on track.</p>
                                        <button className="px-6 py-2.5 rounded-xl bg-themeElevated border border-themeBorder text-themeText hover:bg-themeAccent hover:text-themeText text-xs font-bold transition-all shadow-sm">
                                            Request First Session
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {meetingHistory.map(meeting => (
                                            <div key={meeting.id} className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-themeText dark:text-white">{meeting.topic || 'Mentorship Session'}</h4>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mt-1">
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
                        <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-y-auto max-h-[90vh] border border-white/[0.08] shadow-2xl flex flex-col pb-28 sm:pb-0">
                            <div className="p-6 border-b border-white/[0.08] flex justify-between items-start bg-[#161616]">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1 text-themeText dark:text-white">Request Session</h3>
                                    <p className="text-[10px] text-themeTextSec dark:text-white/50 font-bold uppercase tracking-widest">Connect with your mentor.</p>
                                </div>
                                <button type="button" onClick={() => setShowRequestModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white/10 transition-colors">
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
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Discussion Topic</label>
                                    <input type="text" required value={requestForm.topic} onChange={e => setRequestForm({...requestForm, topic: e.target.value})} placeholder="e.g. Career Guidance, Academic Help" className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition placeholder:text-gray-300 dark:text-white/20" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Preferred Date & Time (Optional)</label>
                                    
                                    {/* INLINE CALENDAR & TIME PICKER */}
                                    <div className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-2xl p-4 selection:bg-transparent">
                                        <div className="flex justify-between items-center mb-4">
                                            <button type="button" onClick={() => {
                                                const d = new Date(requestForm.preferred_date || new Date());
                                                d.setMonth(d.getMonth() - 1);
                                                setRequestForm({...requestForm, preferred_date: new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)});
                                            }} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-themeText dark:text-white">
                                                <i className="fa-solid fa-chevron-left text-xs"></i>
                                            </button>
                                            <span className="text-sm font-bold text-themeText dark:text-white tracking-tight">
                                                {new Date(requestForm.preferred_date || new Date()).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button type="button" onClick={() => {
                                                const d = new Date(requestForm.preferred_date || new Date());
                                                d.setMonth(d.getMonth() + 1);
                                                setRequestForm({...requestForm, preferred_date: new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)});
                                            }} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-themeText dark:text-white">
                                                <i className="fa-solid fa-chevron-right text-xs"></i>
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                <div key={d} className="text-[10px] font-bold text-themeTextSec dark:text-white/40">{d}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {(() => {
                                                const currentD = new Date(requestForm.preferred_date || new Date());
                                                const year = currentD.getFullYear();
                                                const month = currentD.getMonth();
                                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                                const firstDay = new Date(year, month, 1).getDay();
                                                const today = new Date();
                                                today.setHours(0,0,0,0);
                                                
                                                const days = Array(firstDay).fill(null);
                                                for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
                                                
                                                return days.map((date, i) => {
                                                    if (!date) return <div key={i} className="aspect-square"></div>;
                                                    const isSelected = requestForm.preferred_date && new Date(requestForm.preferred_date).getDate() === date.getDate() && new Date(requestForm.preferred_date).getMonth() === date.getMonth();
                                                    const isPast = date < today;
                                                    
                                                    return (
                                                        <button 
                                                            key={i} 
                                                            type="button"
                                                            disabled={isPast}
                                                            onClick={() => {
                                                                const old = new Date(requestForm.preferred_date || new Date());
                                                                date.setHours(old.getHours(), old.getMinutes());
                                                                setRequestForm({...requestForm, preferred_date: new Date(date - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)});
                                                            }}
                                                            className={`aspect-square flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                                                                isSelected 
                                                                ? 'bg-amber-500 text-black shadow-md scale-105 z-10' 
                                                                : isPast 
                                                                    ? 'text-themeTextSec dark:text-white/20 opacity-50 cursor-not-allowed'
                                                                    : 'text-themeText dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                                                            }`}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    );
                                                });
                                            })()}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-themeBorder dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
                                            {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"].map(time => {
                                                const currHour = (requestForm.preferred_date ? new Date(requestForm.preferred_date).getHours() : 0).toString().padStart(2, '0');
                                                const isSelectedTime = requestForm.preferred_date && time.startsWith(currHour);
                                                return (
                                                    <button 
                                                        type="button" 
                                                        key={time}
                                                        onClick={() => {
                                                            const old = new Date(requestForm.preferred_date || new Date());
                                                            const [h, m] = time.split(':');
                                                            old.setHours(parseInt(h), parseInt(m));
                                                            setRequestForm({...requestForm, preferred_date: new Date(old - old.getTimezoneOffset() * 60000).toISOString().slice(0, 16)});
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors border ${
                                                            isSelectedTime ? 'bg-amber-500 text-black border-amber-500 shadow-sm' : 'bg-white/50 dark:bg-white/5 border-themeBorder dark:border-white/5 text-themeTextSec dark:text-white/60 hover:text-themeText dark:hover:text-white hover:border-black/10 dark:hover:border-white/20'
                                                        }`}
                                                    >
                                                        {parseInt(time.split(':')[0]) > 12 ? parseInt(time.split(':')[0]) - 12 + ':00 PM' : time === '12:00' ? '12:00 PM' : time + ' AM'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
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

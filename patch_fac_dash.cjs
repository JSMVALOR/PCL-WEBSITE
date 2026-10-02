const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx';
let code = fs.readFileSync(file, 'utf8');

const dashStart = '/* ──── MAIN DASHBOARD ──── */';
const dashEnd = '{selectedMentee && (';

const startIndex = code.indexOf(dashStart);
const endIndex = code.indexOf(dashEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find dashboard block");
    process.exit(1);
}

const beforeDash = code.substring(0, startIndex);
const afterDash = code.substring(endIndex);

const newDash = `/* ──── MAIN DASHBOARD ──── */
 <div className="flex flex-col gap-8">
 
 {/* Quick Stats Bar */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2"><i className="fa-solid fa-users"></i></div>
        <h4 className="text-2xl font-black text-themeText">{mentees.length}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Assigned Mentees</p>
    </div>
    <div className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2"><i className="fa-solid fa-mug-hot"></i></div>
        <h4 className="text-2xl font-black text-themeText">{meetings.filter(m => m.status === 'pending').length}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Pending Sessions</p>
    </div>
    <div className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2"><i className="fa-solid fa-gavel"></i></div>
        <h4 className="text-2xl font-black text-themeText">{appeals.length}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Active Appeals</p>
    </div>
    <div className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2"><i className="fa-solid fa-trophy"></i></div>
        <h4 className="text-2xl font-black text-themeText">{achievements.length}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Unverified Achievements</p>
    </div>
 </div>

 {/* Mentees Grid */}
 <div className="flex flex-col gap-4">
    <h3 className="text-lg font-black tracking-tight text-themeText flex items-center gap-2">
        <i className="fa-solid fa-user-graduate text-themeAccent"></i> My Mentees
    </h3>
    {mentees.length === 0 ? (
        <div className="w-full py-12 flex flex-col items-center justify-center bg-themeElevated/50 border-2 border-dashed border-themeBorder rounded-3xl text-center px-4">
            <i className="fa-solid fa-users-slash text-3xl text-themeTextSec/30 mb-3"></i>
            <p className="text-xs font-bold uppercase tracking-widest text-themeTextSec">No mentees assigned yet.</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mentees.map(m => (
                <div 
                    key={m.id} 
                    onClick={() => setSelectedMentee(m)}
                    className="bg-themePanel/80 backdrop-blur-xl border border-themeBorder rounded-2xl p-5 flex flex-col gap-4 group hover:border-themeAccent/40 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-themeAccent/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-themeElevated shadow-sm border border-themeBorder flex items-center justify-center font-black text-lg overflow-hidden shrink-0">
                            <img src={getAvatarUrl(m)} alt={m.full_name} className="w-full h-full object-cover" />
                        </div>
                        <div className={\`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest \${m.attendance_percentage >= 75 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}\`}>
                            {m.attendance_percentage}% Att
                        </div>
                    </div>
                    <div>
                        <h4 className="text-base font-black text-themeText truncate group-hover:text-themeAccent transition-colors">{m.full_name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1">{m.erp_id}</p>
                        <p className="text-xs font-semibold text-themeText/70 mt-1 truncate">{m.programme}</p>
                    </div>
                    <div className="pt-3 border-t border-themeBorder/50 flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">View 360° Profile</span>
                        <i className="fa-solid fa-arrow-right text-xs text-themeTextSec group-hover:text-themeAccent group-hover:translate-x-1 transition-all"></i>
                    </div>
                </div>
            ))}
        </div>
    )}
 </div>

 {/* Action Center (Split View) */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
    
    {/* Left Column: Meetings & Achievements */}
    <div className="flex flex-col gap-6">
        {/* Meeting Requests */}
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-black tracking-tight text-themeText flex items-center gap-2">
                <i className="fa-solid fa-inbox text-blue-500"></i> Session Requests
            </h3>
            {meetings.length === 0 ? (
                <div className="w-full py-10 flex flex-col items-center justify-center bg-themeElevated/30 border border-dashed border-themeBorder rounded-2xl text-center px-4">
                    <i className="fa-solid fa-mug-hot text-2xl text-themeTextSec/30 mb-2"></i>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Inbox Empty</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {meetings.map(meeting => (
                        <div key={meeting.id} className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className={\`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border mb-2 inline-block \${
                                        meeting.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        meeting.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        meeting.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }\`}>
                                        {meeting.status}
                                    </span>
                                    <h4 className="text-sm font-black text-themeText">{meeting.topic || 'Mentorship Session'}</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1 flex items-center gap-2">
                                        <img src={getAvatarUrl(meeting.mentee)} alt="" className="w-4 h-4 rounded-full" />
                                        {meeting.mentee?.full_name}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-black text-themeText uppercase tracking-widest">
                                        {new Date(meeting.preferred_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                    </p>
                                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{meeting.preferred_time.substring(0, 5)}</p>
                                </div>
                            </div>
                            {meeting.notes && (
                                <p className="text-xs text-themeText/80 bg-themeElevated p-2 rounded-lg italic">"{meeting.notes}"</p>
                            )}
                            {meeting.status === 'pending' && (
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => handleMeetingAction(meeting.id, 'scheduled')} disabled={actionLoading === meeting.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Accept</button>
                                    <button onClick={async () => { const notes = await window.erpDialog.prompt("Reason for cancellation:"); if (notes) handleMeetingAction(meeting.id, 'cancelled', notes); }} disabled={actionLoading === meeting.id} className="flex-1 py-1.5 bg-themePanel/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-themeBorder hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Decline</button>
                                </div>
                            )}
                            {meeting.status === 'scheduled' && (
                                <button onClick={() => handleMeetingAction(meeting.id, 'completed')} disabled={actionLoading === meeting.id} className="w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors mt-1">Mark Completed</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Unverified Achievements */}
        {achievements.length > 0 && (
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black tracking-tight text-themeText flex items-center gap-2">
                    <i className="fa-solid fa-medal text-amber-500"></i> Verify Achievements
                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md text-[10px] font-black ml-auto">{achievements.length}</span>
                </h3>
                <div className="flex flex-col gap-3">
                    {achievements.map(ach => (
                        <div key={ach.id} className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-widest mb-1 inline-block">{ach.category}</span>
                                    <h4 className="text-sm font-black text-themeText leading-tight">{ach.title}</h4>
                                    <p className="text-[10px] font-bold text-themeTextSec mt-1 flex items-center gap-1.5">
                                        <img src={getAvatarUrl(ach.student)} alt="" className="w-3.5 h-3.5 rounded-full" />
                                        {ach.student?.full_name}
                                    </p>
                                </div>
                            </div>
                            {ach.role && <p className="text-xs text-themeText/80">Role: <span className="font-semibold">{ach.role}</span></p>}
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => handleAchievementVerify(ach.id, 'approve')} disabled={actionLoading === ach.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Verify</button>
                                <button onClick={() => handleAchievementVerify(ach.id, 'reject')} disabled={actionLoading === ach.id} className="flex-1 py-1.5 bg-themePanel/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-themeBorder hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>

    {/* Right Column: Appeals & Grievances */}
    <div className="flex flex-col gap-6">
        {/* Attendance Appeals */}
        {appeals.length > 0 && (
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black tracking-tight text-themeText flex items-center gap-2">
                    <i className="fa-solid fa-gavel text-rose-500"></i> Attendance Appeals
                    <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md text-[10px] font-black ml-auto">{appeals.length}</span>
                </h3>
                <div className="flex flex-col gap-3">
                    {appeals.map(appeal => (
                        <div key={appeal.id} className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <img src={getAvatarUrl(appeal.student)} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                <div>
                                    <h4 className="text-sm font-black text-themeText">{appeal.student?.full_name}</h4>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">{appeal.student?.erp_id}</p>
                                </div>
                            </div>
                            <p className="text-xs text-themeText/80 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">{appeal.description || 'No reason provided'}</p>
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => handleAppealAction(appeal.id, true)} disabled={actionLoading === appeal.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Approve</button>
                                <button onClick={() => handleAppealAction(appeal.id, false)} disabled={actionLoading === appeal.id} className="flex-1 py-1.5 bg-themePanel/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-themeBorder hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Grievances */}
        {grievances.length > 0 && (
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black tracking-tight text-themeText flex items-center gap-2">
                    <i className="fa-solid fa-scale-balanced text-rose-500"></i> Grievance Reports
                    <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-md text-[10px] font-black ml-auto">{grievances.filter(g => g.status === 'pending' || g.status === 'investigating').length} Active</span>
                </h3>
                <div className="flex flex-col gap-3">
                    {grievances.map(g => (
                        <div key={g.id} className="bg-themePanel/60 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>
                            <div className="flex justify-between items-start pl-2">
                                <div>
                                    <h4 className="text-sm font-black text-rose-500">{g.category}</h4>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <p className="text-[10px] font-bold text-themeTextSec flex items-center gap-1"><span className="text-themeText/50 w-12 uppercase">Reporter</span> {g.reporter?.full_name}</p>
                                        <p className="text-[10px] font-bold text-themeTextSec flex items-center gap-1"><span className="text-themeText/50 w-12 uppercase">Against</span> {g.accused?.full_name}</p>
                                    </div>
                                </div>
                                <span className={\`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest \${g.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : g.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-themeElevated text-themeTextSec'}\`}>{g.status}</span>
                            </div>
                            
                            <div className="pl-2 mt-1">
                                <p className="text-xs text-themeText italic bg-themeElevated/50 p-2 rounded-md border-l-2 border-rose-500/30">"{g.description}"</p>
                                {g.resolution_notes && (
                                    <p className="text-[10px] text-themeTextSec italic mt-2"><span className="font-bold uppercase not-italic mr-1">Notes:</span>{g.resolution_notes}</p>
                                )}
                            </div>

                            {(g.status === 'pending' || g.status === 'investigating') && (
                                <div className="flex flex-wrap gap-2 pl-2 mt-1">
                                    {g.status === 'pending' && <button onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Investigate</button>}
                                    <button onClick={async () => { const notes = await window.erpDialog.prompt("Resolution Notes:"); if(notes) handleGrievanceAction(g.id, 'resolved', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Resolve</button>
                                    <button onClick={async () => { const notes = await window.erpDialog.prompt("Dismissal Reason:"); if(notes) handleGrievanceAction(g.id, 'dismissed', notes); }} disabled={actionLoading === g.id} className="flex-1 py-1.5 bg-themePanel/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 border border-themeBorder hover:border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Dismiss</button>
                                    <button onClick={() => handleGrievanceAction(g.id, 'escalated_to_admin', 'Escalated by mentor')} disabled={actionLoading === g.id} className="w-full py-1.5 bg-themeAccent/10 text-themeAccent hover:bg-themeAccent/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-themeAccent/20">Escalate to Admin</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
 </div>
 </div>
 `;

fs.writeFileSync(file, beforeDash + newDash + afterDash);
console.log("Patched dashboard");

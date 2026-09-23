import re

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'r') as f:
    content = f.read()

grievance_action = """
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
"""

content = content.replace("    const handleAppealAction", grievance_action + "\n    const handleAppealAction")

grievance_ui = """
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
"""

content = content.replace("                        {/* Meeting Requests */}", grievance_ui + "\n                        {/* Meeting Requests */}")

with open('src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx', 'w') as f:
    f.write(content)

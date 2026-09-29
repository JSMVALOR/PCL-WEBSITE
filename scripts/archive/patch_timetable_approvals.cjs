const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', 'utf8');

const timetableRender = `
            {activeTab === 'timetable_reschedules' && (
                <div className="flex flex-col w-full">
                    {timetableRequests.length === 0 ? (
                        <div className="col-span-full py-12 text-center border-b border-black/5 dark:border-white/10">
                            <p className="text-sm font-semibold text-themeTextSec">No pending timetable reschedules.</p>
                        </div>
                    ) : (
                        timetableRequests.map(req => (
                            <div key={req.id} className={"py-6 px-4 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-1">
                                            <i className="fa-solid fa-calendar-alt text-lg"></i>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-themeText text-lg">{req.faculty?.full_name || 'Faculty'}</h4>
                                                <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                                                    Reschedule
                                                </span>
                                                <span className="text-xs font-bold text-themeTextSec px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-themeTextSec mb-2">Subject: {req.subject?.name || req.subject_id}</p>
                                            
                                            <div className="flex gap-6 mt-3 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-themeTextSec mb-1">Original Slot</span>
                                                    <span className="text-sm font-bold line-through opacity-70">{new Date(req.original_date).toLocaleDateString()} - {req.original_time}</span>
                                                </div>
                                                <div className="flex flex-col justify-center text-themeTextSec">
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-bold text-themeTextSec mb-1 text-blue-500">Requested Slot</span>
                                                    <span className="text-sm font-bold text-themeText">{new Date(req.requested_date).toLocaleDateString()} - {req.requested_time}</span>
                                                </div>
                                            </div>
                                            
                                            {req.reason && (
                                                <div className="mt-4 text-sm text-themeTextSec">
                                                    <span className="font-bold text-themeText">Reason: </span>
                                                    {req.reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {req.status === 'Pending' ? (
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => handleAction('timetable_reschedules', req.id, 'Approved')}
                                                className="btn-erp bg-emerald-500 text-white hover:bg-emerald-600 shadow-none border-0"
                                            >
                                                Approve Reschedule
                                            </button>
                                            <button 
                                                onClick={() => handleAction('timetable_reschedules', req.id, 'Rejected')}
                                                className="btn-erp bg-transparent text-rose-500 border border-rose-500 hover:bg-rose-500/10 shadow-none"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={\`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded border \${req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}\`}>
                                            {req.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}`;

if (!content.includes("activeTab === 'timetable_reschedules' &&")) {
    content = content.replace(
        /\{activeTab === 'faculty_leaves' && \(/,
        `${timetableRender}\n\n            {activeTab === 'faculty_leaves' && (`
    );
    fs.writeFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', content);
    console.log("Restored timetable_reschedules render block");
}

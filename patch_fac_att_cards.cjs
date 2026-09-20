const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let c = fs.readFileSync(p, 'utf8');

const badBlock = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
                                    <div key={cls.id} className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/5 p-5 flex flex-col hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                                                    <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-gray-500 dark:text-white/50">Room {cls.room?.name || "TBD"}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">{cls.subject?.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 mt-1">{cls.batch} • Semester {cls.semester}</p>
                                            </div>
                                            {cls.session?.status === 'completed' ? (
        <button type="button" onClick={() => handleStartAttendance(cls)} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-xl text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 text-[13px] font-medium transition active:scale-[0.98]">
            View Completed Session
        </button>
    ) : (
                                            <button type="button" 
                                                onClick={() => handleStartAttendance(cls)}
                                                    className={\`w-full py-3 rounded-xl text-[13px] font-medium transition \${cls.session?.status === 'completed' ? 'bg-white/10 text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-themeAccent hover:bg-themeAccent/90 text-gray-900 dark:text-white active:scale-[0.98]'}\`}
                                            >
                                                {cls.session?.status === 'completed' ? 'Session Locked (Completed)' : cls.session?.status === 'ongoing' ? 'Resume Attendance' : 'Start Attendance Session'}
                                            </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>`;

const goodBlock = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
                                    <div key={cls.id} className="bg-themeApp border border-themeBorder rounded-[1.5rem] p-6 flex flex-col hover:border-themeAccent/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] transition-all duration-300 group">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-themeElevated border border-themeBorder px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest text-themeTextSec uppercase">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                                            <span className="bg-themeElevated border border-themeBorder px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest text-themeTextSec uppercase">{cls.room?.name || "TBD"}</span>
                                        </div>
                                        
                                        <div className="mb-6 flex-1">
                                            <h3 className="text-[17px] font-black tracking-tight text-themeText leading-tight group-hover:text-themeAccent transition-colors">{cls.subject?.name}</h3>
                                            <p className="text-[12px] font-bold text-themeTextSec mt-1">{cls.batch} <span className="opacity-50 mx-1">•</span> Sem {cls.semester}</p>
                                        </div>

                                        <div className="mt-auto">
                                            {cls.session?.status === 'completed' ? (
                                                <button type="button" onClick={() => handleStartAttendance(cls)} className="w-full py-3.5 rounded-xl bg-themeElevated border border-themeBorder text-themeTextSec hover:bg-themeBorder hover:text-themeText text-[13px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm">
                                                    <i className="fa-solid fa-check-circle text-emerald-500"></i> View Completed Session
                                                </button>
                                            ) : (
                                                <button type="button" 
                                                    onClick={() => handleStartAttendance(cls)}
                                                    className={\`w-full py-3.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm hover:shadow-md \${cls.session?.status === 'completed' ? 'bg-themeElevated text-themeTextSec cursor-not-allowed' : 'bg-themeAccent text-gray-900 hover:bg-themeAccent/90'}\`}
                                                >
                                                    {cls.session?.status === 'ongoing' ? <><i className="fa-solid fa-play"></i> Resume Session</> : <><i className="fa-solid fa-power-off"></i> Start Session</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>`;

c = c.replace(badBlock, goodBlock);
fs.writeFileSync(p, c);
console.log("Patched attendance cards");

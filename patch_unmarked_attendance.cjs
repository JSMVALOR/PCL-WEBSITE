const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add state for unmarked subjects
c = c.replace(
    /const \[allSubjects, setAllSubjects\] = useState\(\[\]\);/,
    `const [allSubjects, setAllSubjects] = useState([]);
    const [unmarkedSubjects, setUnmarkedSubjects] = useState([]);
    const [selectedUnmarkedSubject, setSelectedUnmarkedSubject] = useState(null);`
);

// 2. Add calculation in fetchAllSubjects
const fetchLogic = `if (cohortSubs && cohortSubs.length > 0) {
            const { data: sessions, error: sesError } = await supabase
                .from('class_sessions')
                .select('present_count, total_students, schedule:schedule_id(subject_id)')
                .eq('faculty_id', userSession.db_id)
                .neq('status', 'scheduled');
            
            if (sesError) throw sesError;

            // Fetch schedules and basic sessions for unmarked calculation
            const { data: fullSchedule } = await supabase.from('class_schedule').select('id, subject_id, day_of_week, start_time, batch').in('subject_id', cohortSubs.map(c => c.id));
            const { data: allSessions } = await supabase.from('class_sessions').select('id, schedule_id, date, status').in('schedule_id', (fullSchedule||[]).map(s=>s.id));

            // Calculate unmarked dates
            const today = new Date();
            today.setHours(0,0,0,0);
            const pastDates = [];
            for(let i=1; i<=30; i++) {
                let d = new Date(today);
                d.setDate(d.getDate() - i);
                pastDates.push(d);
            }
            
            const unmarkedMap = {};
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            cohortSubs.forEach(cs => {
                const subSched = (fullSchedule||[]).filter(s => s.subject_id === cs.id);
                if (subSched.length === 0) return;

                const missed = [];
                pastDates.forEach(dateObj => {
                    const dayName = dayNames[dateObj.getDay()];
                    // check if schedule has this day
                    const classesOnThisDay = subSched.filter(s => String(s.day_of_week) === dayName || String(s.day_of_week) === String(dateObj.getDay()));
                    
                    classesOnThisDay.forEach(sch => {
                        // ignore if the semester wasn't active yet, but we'll assume last 30 days is fine for now
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const sessionExists = (allSessions||[]).find(ses => ses.schedule_id === sch.id && ses.date === dateStr);
                        if (!sessionExists) {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch });
                        } else if (sessionExists.status !== 'completed') {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status });
                        }
                    });
                });

                if (missed.length > 0) {
                    unmarkedMap[cs.id] = {
                        id: cs.id,
                        name: cs.master_subjects?.name || 'Unknown',
                        code: cs.master_subjects?.code || 'Unknown',
                        batch: cs.batch_id,
                        missed: missed.sort((a,b) => new Date(b.date) - new Date(a.date))
                    };
                }
            });
            setUnmarkedSubjects(Object.values(unmarkedMap));

            const subjectsWithStats = cohortSubs.map(cs => {`;

c = c.replace(/if \(cohortSubs && cohortSubs\.length > 0\) \{[\s\S]*?const subjectsWithStats = cohortSubs\.map\(cs => \{/, fetchLogic);

// 3. Add Unmarked tab to the header navigation
c = c.replace(
    /\{ id: "analytics", label: "Subject Rosters", icon: "fa-book-open", disabled: false \}/,
    `{ id: "analytics", label: "Subject Rosters", icon: "fa-book-open", disabled: false },
    { id: "unmarked", label: "Unmarked", icon: "fa-clipboard-question", disabled: false }`
);

// 4. Render the unmarked tab content
const unmarkedHTML = `{activeTab === 'unmarked' && (
 <div className="flex flex-col gap-6 animate-fade-in">
    {selectedUnmarkedSubject ? (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedUnmarkedSubject(null)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-arrow-left text-gray-700 dark:text-gray-300"></i>
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{selectedUnmarkedSubject.name}</h2>
                    <p className="text-sm font-medium text-gray-500">{selectedUnmarkedSubject.code} • {selectedUnmarkedSubject.batch}</p>
                </div>
            </div>
            <div className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Unmarked Dates (Last 30 Days)</h3>
                <div className="flex flex-col gap-3">
                    {selectedUnmarkedSubject.missed.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                                    <i className="fa-solid fa-calendar-xmark text-rose-500"></i>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                                    <p className="text-xs font-medium text-gray-500">{m.time} • {m.batch}</p>
                                </div>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded">Missing</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ) : (
        unmarkedSubjects.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
                <i className="fa-solid fa-check-circle text-4xl text-emerald-500 mb-4"></i>
                <h3 className="text-lg text-gray-900 dark:text-white font-black">All Caught Up!</h3>
                <p className="text-xs text-gray-500 dark:text-white/50 mt-2 max-w-sm mx-auto">You have no unmarked attendance for any subjects in the last 30 days.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {unmarkedSubjects.map(sub => (
                    <div key={sub.id} onClick={() => setSelectedUnmarkedSubject(sub)} className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 cursor-pointer hover:border-amber-500/50 transition-colors group flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                {sub.missed.length} Missing
                            </span>
                            <i className="fa-solid fa-arrow-right text-gray-400 group-hover:text-amber-500 transition-colors"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight mb-1">{sub.name}</h3>
                            <p className="text-xs font-medium text-gray-500">{sub.code} • {sub.batch}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    )}
 </div>
)}
`;

c = c.replace(/\{activeTab === 'analytics' && \([\s\S]*?\}\s*\)\}/, (match) => {
    return match + '\n\n' + unmarkedHTML;
});

fs.writeFileSync(p, c);
console.log("Patched unmarked attendance feature.");

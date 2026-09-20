const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add allSubjects state
c = c.replace(
    `const [todayClasses, setTodayClasses] = useState(() => {`,
    `const [allSubjects, setAllSubjects] = useState([]);
 const [todayClasses, setTodayClasses] = useState(() => {`
);

// 2. Add fetchAllSubjects to useEffect
c = c.replace(
    `fetchTodayClasses();
 }
 }, [userSession]);`,
    `fetchTodayClasses();
 fetchAllSubjects();
 }
 }, [userSession]);
 
 const fetchAllSubjects = async () => {
    if (!userSession?.db_id) return;
    try {
        const { data: cohortSubs, error: subErr } = await supabase
            .from('cohort_subjects')
            .select('id, batch_id, master_subjects(id, name, code)')
            .eq('faculty_id', userSession.db_id);
        if (subErr) throw subErr;

        if (cohortSubs && cohortSubs.length > 0) {
            const { data: sessions, error: sesError } = await supabase
                .from('class_sessions')
                .select('cohort_subject_id, present_count, total_students')
                .eq('faculty_id', userSession.db_id)
                .neq('status', 'scheduled');
            
            if (sesError) throw sesError;

            const subjectsWithStats = cohortSubs.map(cs => {
                const subSessions = (sessions || []).filter(s => s.cohort_subject_id === cs.id);
                const classesDone = subSessions.length;
                let avgAttendance = 0;
                let totalP = 0;
                let totalS = 0;
                if (classesDone > 0) {
                    subSessions.forEach(s => {
                        totalP += (s.present_count || 0);
                        totalS += (s.total_students || 0);
                    });
                    if (totalS > 0) avgAttendance = Math.round((totalP / totalS) * 100);
                }
                return {
                    id: cs.id,
                    batch: cs.batch_id,
                    name: cs.master_subjects?.name || 'Unknown',
                    code: cs.master_subjects?.code || 'Unknown',
                    classesDone,
                    avgAttendance,
                    totalAttended: totalP,
                    totalPossible: totalS
                };
            });
            setAllSubjects(subjectsWithStats);
            
            // Auto switch to analytics if no classes today
            const cachedToday = sessionStorage.getItem(\`fac_todayClasses_\${userSession?.db_id}\`);
            const todayLen = cachedToday ? JSON.parse(cachedToday).length : 0;
            // if (todayLen === 0 && !activeSession) setActiveTab('analytics');
        }
    } catch(err) { console.error(err); }
 };`
);

// 3. Rename "Risk Analytics" tab to "Subject Rosters"
c = c.replace(
    `{ id: "analytics", label: "Risk Analytics", icon: "fa-chart-pie", disabled: false }`,
    `{ id: "analytics", label: "Subject Rosters", icon: "fa-book-open", disabled: false }`
);

// 4. Replace the Analytics empty state with the rendered list of subjects
const analyticsHTML = `{activeTab === 'analytics' && (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-chart-line text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-gray-900 dark:text-white font-black">Analytics Engine Compiling...</h3>
 <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-sm mx-auto">This panel will aggregate data across all your subjects and automatically highlight students falling below the 75% engagement threshold.</p>
 </div>
)}`;

const newAnalyticsHTML = `{activeTab === 'analytics' && (
 <div className="flex flex-col gap-6 animate-fade-in">
    {allSubjects.length === 0 ? (
        <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
            <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
            <h3 className="text-lg lg:text-xl text-gray-900 dark:text-white font-black">No Subjects Assigned</h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-sm mx-auto">You have no active subjects mapped to you for this academic term.</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allSubjects.map(sub => (
                <div key={sub.id} className="bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col overflow-hidden group hover:border-black/10 dark:hover:border-white/10 transition-colors">
                    <div className="p-6 pb-4 border-b border-black/5 dark:border-white/5 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight text-[#8E8E93]">
                                {sub.code}
                            </span>
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight">
                                {sub.batch}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight">{sub.name}</h3>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black/5 dark:divide-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                        <div className="p-4 text-center flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{sub.classesDone}</span>
                            <span className="text-[9px] uppercase font-black text-[#8E8E93] tracking-wider mt-1">Sessions</span>
                        </div>
                        <div className="p-4 text-center flex flex-col items-center justify-center">
                            <span className="text-2xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{sub.totalAttended}</span>
                            <span className="text-[9px] uppercase font-black text-[#8E8E93] tracking-wider mt-1">Attended</span>
                        </div>
                        <div className="p-4 text-center flex flex-col items-center justify-center">
                            <span className={\`text-2xl font-semibold tracking-tight \${sub.avgAttendance >= 75 ? 'text-emerald-500' : 'text-rose-500'}\`}>{sub.avgAttendance}%</span>
                            <span className="text-[9px] uppercase font-black text-[#8E8E93] tracking-wider mt-1">Avg Attd</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )}
 </div>
)}`;

c = c.replace(analyticsHTML, newAnalyticsHTML);

// 5. If todayClasses.length === 0, let's make the default tab "analytics" (Subject Rosters) inside the component load!
c = c.replace(
    /const \[activeTab, setActiveTab\] = useState\("today"\);/g,
    `const [activeTab, setActiveTab] = useState(() => {
        const cached = sessionStorage.getItem(\`fac_todayClasses_\${userSession?.db_id}\`);
        return (cached && JSON.parse(cached).length > 0) ? "today" : "analytics";
    });`
);

fs.writeFileSync(p, c);
console.log("Attendance Analytics added.");

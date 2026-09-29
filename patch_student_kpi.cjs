const fs = require('fs');
const file = 'Frontend/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetContent = `{/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        {[
                            { label: 'Pending Tasks', val: stats.assignmentsPending || 0, icon: 'fa-list-check', tab: 'academic_center' },
                            { label: 'Attendance', val: \`\${stats.attendance}%\`, icon: 'fa-user-check', tab: 'academic_center' },
                            { label: 'Assignments', val: \`\${stats.assignmentsSubmitted}/\${stats.assignmentsTotal || 0}\`, icon: 'fa-file-lines', tab: 'academic_center' },
                            { label: 'CGPA', val: stats.cgpa.toFixed(2), icon: 'fa-graduation-cap', tab: 'academic_center' }
                        ].map((m, i) => (
                            <div key={i} onClick={() => m.tab ? setActiveTab(m.tab) : null} className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-4 flex flex-col justify-center relative group cursor-pointer hover:border-themeAccent/30 hover:bg-white/80 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec mb-3">
                                    <i className={\`fa-solid \${m.icon}\`}></i>
                                </div>
                                <h3 className="text-xl font-black text-themeText mb-0.5">{m.val}</h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec">{m.label}</p>
                            </div>
                        ))}
                    </div>`;

const replacement = `{/* Metrics Ribbon (Unboxed) */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-6 lg:gap-10 shrink-0 py-2 border-b border-black/[0.04] dark:border-white/[0.04]">
                        {[
                            { label: 'Pending Tasks', val: stats.assignmentsPending || 0, icon: 'fa-list-check', color: 'text-rose-500', tab: 'academic_center' },
                            { label: 'Attendance', val: \`\${stats.attendance}%\`, icon: 'fa-user-check', color: 'text-emerald-500', tab: 'academic_center' },
                            { label: 'Assignments', val: \`\${stats.assignmentsSubmitted}/\${stats.assignmentsTotal || 0}\`, icon: 'fa-file-lines', color: 'text-indigo-500', tab: 'academic_center' },
                            { label: 'CGPA', val: stats.cgpa.toFixed(2), icon: 'fa-graduation-cap', color: 'text-amber-500', tab: 'academic_center' }
                        ].map((m, i) => (
                            <div key={i} onClick={() => m.tab ? setActiveTab(m.tab) : null} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer hover:opacity-80 transition-opacity">
                                <div className={\`w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-xl \${m.color}\`}>
                                    <i className={\`fa-solid \${m.icon}\`}></i>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-black tracking-tight text-themeText leading-none">{m.val}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1">{m.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>`;

content = content.replace(targetContent, replacement);
fs.writeFileSync(file, content);

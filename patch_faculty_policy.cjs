const fs = require('fs');

let file = 'Frontend/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let content = fs.readFileSync(file, 'utf8');

const policyUI = `
                {/* POLICY SUMMARY & BALANCES */}
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm mb-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <h3 className="text-sm font-black text-themeText dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-scale-balanced text-themeAccent"></i> Institutional Leave Policy & Balances
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Casual Leave */}
                        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-themeTextSec dark:text-white/50 uppercase tracking-wider">Casual (CL)</span>
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-bold">1/Month</span>
                            </div>
                            <div className="text-2xl font-black text-themeText dark:text-white mb-1">
                                {Math.max(0, accruedCL - usedCL)} <span className="text-sm font-bold text-themeTextSec dark:text-white/30 tracking-widest uppercase">Left</span>
                            </div>
                            <p className="text-[10px] text-themeTextSec dark:text-white/50 font-medium leading-relaxed">Max 2 days can be combined. Accrues monthly (Total {accruedCL} accrued so far). Used: {usedCL}</p>
                        </div>

                        {/* On Duty */}
                        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-themeTextSec dark:text-white/50 uppercase tracking-wider">On Duty (OD)</span>
                                <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded font-bold">Max 30</span>
                            </div>
                            <div className="text-2xl font-black text-themeText dark:text-white mb-1">
                                {Math.max(0, 30 - usedOD)} <span className="text-sm font-bold text-themeTextSec dark:text-white/30 tracking-widest uppercase">Left</span>
                            </div>
                            <p className="text-[10px] text-themeTextSec dark:text-white/50 font-medium leading-relaxed">For seminars, exams, or official representation. Subject to principal's approval. Used: {usedOD}</p>
                        </div>

                        {/* Vacations */}
                        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-themeTextSec dark:text-white/50 uppercase tracking-wider">Vacations</span>
                                <span className="bg-purple-500/10 text-purple-500 text-[10px] px-2 py-0.5 rounded font-bold">Seasonal</span>
                            </div>
                            <div className="text-2xl font-black text-themeText dark:text-white mb-1">
                                15 <span className="text-sm font-bold text-themeTextSec dark:text-white/30 tracking-widest uppercase">Days Each</span>
                            </div>
                            <p className="text-[10px] text-themeTextSec dark:text-white/50 font-medium leading-relaxed">Winter Used: {usedWinter}/15 <br/> Summer Used: {usedSummer}/15</p>
                        </div>

                        {/* Event Policy */}
                        <div className="bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Event Policy</span>
                                <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400/80 font-bold leading-relaxed">
                                Leaves during official college events are strictly blocked. In the case of extreme medical emergencies, apply with documented proof and contact the HOD directly.
                            </p>
                        </div>
                    </div>
                </div>
`;

content = content.replace(
    /\{\/\* Leave History List \*\/\}/,
    policyUI + '\n                {/* Leave History List */}'
);

fs.writeFileSync(file, content);

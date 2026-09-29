const fs = require('fs');
const file = 'Frontend/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetContent = `{/* Campus Notices */}
                        <div className="flex-1 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative flex flex-col shrink-0">
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Campus Notices</h3>
                                <button onClick={() => setActiveTab('notices')} className="text-themeAccent text-xs hover:underline font-bold">View All</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {notices.length > 0 ? notices.slice(0, 5).map((n, i) => (
                                    <div key={i} className="p-4 bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                        <h4 className="text-sm font-bold text-themeText mb-1">{n.title}</h4>
                                        <p className="text-xs text-themeTextSec truncate">{n.content}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center opacity-50">
                                        <i className="fa-regular fa-bell-slash text-2xl mb-2"></i>
                                        <p className="text-xs font-bold uppercase tracking-widest">No New Notices</p>
                                    </div>
                                )}
                            </div>
                        </div>`;

const replacement = `{/* Campus Notices (Unboxed) */}
                        <div className="flex-1 relative flex flex-col shrink-0">
                            <div className="flex justify-between items-center mb-5 shrink-0 border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                                <h3 className="text-sm font-black tracking-tight text-themeText uppercase">Campus Notices</h3>
                                <button onClick={() => setActiveTab('notices')} className="text-themeAccent text-xs hover:underline font-bold">View All</button>
                            </div>
                            <div className="flex flex-col gap-4">
                                {notices.length > 0 ? notices.slice(0, 5).map((n, i) => (
                                    <div key={i} className="pb-3 border-b border-black/[0.02] dark:border-white/[0.02] cursor-pointer hover:opacity-80 transition-opacity">
                                        <h4 className="text-sm font-bold text-themeText mb-1">{n.title}</h4>
                                        <p className="text-xs text-themeTextSec line-clamp-2">{n.content}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center opacity-50 bg-black/5 dark:bg-white/5 rounded-2xl">
                                        <i className="fa-regular fa-bell-slash text-2xl mb-2"></i>
                                        <p className="text-xs font-bold uppercase tracking-widest">No New Notices</p>
                                    </div>
                                )}
                            </div>
                        </div>`;

content = content.replace(targetContent, replacement);
fs.writeFileSync(file, content);

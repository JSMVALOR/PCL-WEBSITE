const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\{\/\* 1\. HEADER BANNER \*\/\}.*?\{\/\* 1\.5 ACTION REQUIRED BANNER \*\/\}/s;

const replacement = `{/* 1. HEADER BANNER */}
            <div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-purple-500/5 via-transparent to-transparent py-8 shrink-0">
                <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2 md:px-6">
                    <div className="flex items-center gap-5">
                        <div className={\`w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm \${currentTheme.iconBox}\`}>
                            <i className="fa-solid fa-calendar-star"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">College Events</h1>
                            <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Upcoming & Past Campus Activities</p>
                        </div>
                    </div>
                    {canCreate && (
                        <button type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-purple-600 text-white px-6 py-3.5 rounded-xl font-bold text-[13px] tracking-wide hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
                        >
                            <i className="fa-solid fa-calendar-plus"></i> Add Event
                        </button>
                    )}
                </div>
            </div>

            {/* 1.5 ACTION REQUIRED BANNER */}`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content);

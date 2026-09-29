const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\{!isHubView && \(\s*<PageHeader icon="fa-solid fa-bullhorn" title="Broadcast & Events Center" subtitle="Publish official notices across the ERP and manage the academic calendar\." \/>\s*\)\}/;

const replacement = `{!isHubView && (
    <div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 shrink-0">
        <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-themeAccent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-themeAccent shadow-sm">
                    <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">System Broadcast</h1>
                    <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Publish notices & manage calendar</p>
                </div>
            </div>
            {/* The right side content can be something if needed, maybe total broadcasts stat? */}
        </div>
    </div>
)}`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content);

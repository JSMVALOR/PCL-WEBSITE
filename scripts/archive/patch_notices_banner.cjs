const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<PageHeader[\s\S]*?<\/button>\s*<\/div>\s*\}\s*\/>/m;

const replacement = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-[#007AFF]/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-[#007AFF]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 px-2 md:px-6">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-[#007AFF] shadow-sm">
                <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Notice Board</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Official communication & events</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-center w-full xl:w-auto">
            <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 w-full md:w-auto">
                <button type="button" 
                    onClick={() => {setActiveMainTab('broadcasts'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                    className={\`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-tight transition \${activeMainTab === "broadcasts" ? 'bg-white dark:bg-themeElevated text-themeText dark:text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}\`}
                >
                    Notices
                </button>
                <button type="button" 
                    onClick={() => {setActiveMainTab('events'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                    className={\`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-[13px] font-bold tracking-tight transition \${activeMainTab === "events" ? 'bg-white dark:bg-themeElevated text-themeText dark:text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}\`}
                >
                    Events
                </button>
            </div>
            
            {activeMainTab === "broadcasts" && (
                <div className="relative flex-1 md:w-64 w-full">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec text-[13px]"></i>
                    <input 
                        type="text" 
                        placeholder="Search notices..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 focus:border-[#007AFF]/50 focus:bg-white dark:focus:bg-themeElevated rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-semibold text-themeText dark:text-themeText placeholder:text-themeTextSec outline-none transition-all shadow-inner"
                    />
                </div>
            )}

            {(userSession?.role === 'faculty' || userSession?.role === 'admin') && !isBroadcasting && activeMainTab === 'broadcasts' && (
                <button type="button" 
                    onClick={() => setIsBroadcasting(true)} 
                    className="px-6 py-2.5 bg-[#007AFF]/10 text-themeAccent hover:bg-[#007AFF]/20 rounded-xl text-[13px] font-bold tracking-tight transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                >
                    <i className="fa-solid fa-satellite-dish"></i> Broadcast
                </button>
            )}
        </div>
    </div>
</div>`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetContent = `    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-black text-themeText tracking-tight uppercase">System Overview</h3>
                <button 
                    onClick={handleRefreshDatabase} 
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <i className={\`fa-solid fa-arrows-rotate \${refreshing ? 'animate-spin' : ''}\`}></i> 
                    {refreshing ? 'Syncing DB...' : 'Refresh Database'}
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* 1. Students */}
            <div onClick={() => setActiveTab && setActiveTab('users')} className="cursor-pointer w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.students.total}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Active Students</p>
                </div>
            </div>

            {/* 2. Faculty */}
            <div onClick={() => setActiveTab && setActiveTab('faculty')} className="cursor-pointer w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.faculty.total}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Active Faculty</p>
                </div>
            </div>

            {/* 3. Attendance */}
            <div onClick={() => setActiveTab && setActiveTab('attendance')} className="cursor-pointer w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-themeAccent/10 text-themeAccent border border-themeAccent/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.attendance.rate}%</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Avg Attendance</p>
                </div>
            </div>

            {/* 4. Approvals */}
            <div onClick={() => setActiveTab && setActiveTab('approvals')} className="cursor-pointer w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-sm shrink-0 relative">
                        {data.approvals.total > 0 && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span>}
                        <i className="fa-solid fa-clipboard-list"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{data.approvals.total}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Pending Actions</p>
                </div>
            </div>

            {/* 5. Revenue */}
            <div className="w-full h-[140px] bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between group hover:border-themeAccent transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-sm shrink-0">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-themeText tracking-tight">{formatCurrency(data.fees.collected)}</p>
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 truncate">Total Revenue</p>
                </div>
            </div>

            </div>
        </div>
    );`;

const replacement = `    return (
        <div className="flex flex-col gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-6 mb-2">
            <div className="flex justify-between items-center px-1 mb-2">
                <h3 className="text-sm font-black text-themeText tracking-tight uppercase">System Overview</h3>
                <button 
                    onClick={handleRefreshDatabase} 
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                    <i className={\`fa-solid fa-arrows-rotate \${refreshing ? 'animate-spin' : ''}\`}></i> 
                    {refreshing ? 'Syncing DB...' : 'Refresh Database'}
                </button>
            </div>
            
            <div className="flex flex-wrap lg:flex-nowrap gap-6 lg:gap-10 shrink-0">
                
                {/* 1. Students */}
                <div onClick={() => setActiveTab && setActiveTab('users')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.students.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Students</p>
                    </div>
                </div>

                {/* 2. Faculty */}
                <div onClick={() => setActiveTab && setActiveTab('faculty')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.faculty.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Faculty</p>
                    </div>
                </div>

                {/* 3. Attendance */}
                <div onClick={() => setActiveTab && setActiveTab('attendance')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.attendance.rate}%</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Attendance</p>
                    </div>
                </div>

                {/* 4. Approvals */}
                <div onClick={() => setActiveTab && setActiveTab('approvals')} className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl shrink-0 relative">
                        {data.approvals.total > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                        )}
                        <i className="fa-solid fa-clipboard-list"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{data.approvals.total}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Pending Actions</p>
                    </div>
                </div>

                {/* 5. Fees */}
                <div className="flex-1 min-w-[140px] flex items-center gap-4 relative group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl font-black text-themeText tracking-tight leading-none">{formatCurrency(data.fees.collected)}</p>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 truncate">Total Revenue</p>
                    </div>
                </div>
                
            </div>
        </div>
    );`;

if (content.includes(targetContent)) {
    content = content.replace(targetContent, replacement);
    fs.writeFileSync(file, content);
    console.log("Success");
} else {
    console.error("Target content not found exactly. Will attempt fallback.");
}

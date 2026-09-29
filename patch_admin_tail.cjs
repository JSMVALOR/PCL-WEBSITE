const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

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
    );
}`;

const returnIndex = lines.findIndex(l => l.startsWith('    return ('));
if (returnIndex !== -1) {
    const newContent = lines.slice(0, returnIndex).join('\n') + '\n' + replacement;
    fs.writeFileSync(file, newContent);
    console.log("Success");
}

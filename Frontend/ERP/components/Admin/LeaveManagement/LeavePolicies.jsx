import React from 'react';

export default function LeavePolicies() {
    const policies = [
        {
            title: "Casual Leave",
            status: "ACTIVE",
            description: "For personal reasons and short absences.",
            limit: "12 Days",
            approval: "Yes (Admin)",
            color: "emerald"
        },
        {
            title: "Earned Leave",
            status: "ACTIVE",
            description: "Accrued paid leave for long-term employees.",
            limit: "15 Days",
            approval: "Yes (Admin)",
            color: "amber"
        },
        {
            title: "Maternity Leave",
            status: "ACTIVE",
            description: "Extended leave for expecting mothers.",
            limit: "180 Days",
            approval: "Yes (Admin)",
            color: "purple"
        },
        {
            title: "Sick Leave",
            status: "ACTIVE",
            description: "For medical emergencies and health issues.",
            limit: "10 Days",
            approval: "Yes (Admin)",
            color: "rose"
        }
    ];

    const getColorClasses = (color) => {
        const map = {
            emerald: {
                bg: "bg-emerald-500/10",
                text: "text-emerald-500",
                border: "border-emerald-500/50"
            },
            amber: {
                bg: "bg-amber-500/10",
                text: "text-amber-500",
                border: "border-amber-500/50"
            },
            purple: {
                bg: "bg-purple-500/10",
                text: "text-purple-500",
                border: "border-purple-500/50"
            },
            rose: {
                bg: "bg-rose-500/10",
                text: "text-rose-500",
                border: "border-rose-500/50"
            }
        };
        return map[color] || map.emerald;
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-3xl">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-themeText dark:text-white mb-1">Leave Policies Configuration</h2>
                    <p className="text-xs font-bold text-themeTextSec dark:text-white/50 tracking-widest uppercase">Manage annual limits and rules for different leave types.</p>
                </div>
                <button className="px-5 py-2.5 bg-themeAccent hover:bg-themeAccent/90 text-[var(--bg-color)] rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 whitespace-nowrap">
                    <i className="fa-solid fa-plus"></i> New Policy
                </button>
            </div>

            {/* Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy, idx) => {
                    const c = getColorClasses(policy.color);
                    return (
                        <div key={idx} className={\`bg-white dark:bg-themeApp border border-black/5 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-\${policy.color}-500/30 transition-colors\`}>
                            <div className={\`absolute top-0 left-0 w-full h-1 bg-\${policy.color}-500\`}></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${c.bg} \${c.text} text-xl\`}>
                                        <i className="fa-solid fa-scale-balanced"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-themeText dark:text-white text-base">{policy.title}</h3>
                                        <span className={\`text-[10px] font-black uppercase tracking-widest \${c.text}\`}>{policy.status}</span>
                                    </div>
                                </div>
                                <button className="text-themeTextSec dark:text-white/30 hover:text-themeText dark:hover:text-white transition-colors">
                                    <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>
                            </div>

                            <p className="text-sm font-medium text-themeTextSec dark:text-white/60 mb-8 h-10">
                                {policy.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40">Annual Limit</span>
                                    <span className="text-sm font-black text-themeText dark:text-white">{policy.limit}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40">Requires Approval</span>
                                    <span className="text-sm font-black text-amber-500">{policy.approval}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

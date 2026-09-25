/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminMootCourt() {
    return (
        <div className="w-full animate-fade-in selection:bg-themeAccent/20 min-h-screen bg-themeApp text-themeText dark:text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                <PageHeader 
                    icon="fa-solid fa-gavel" 
                    title="Moot Court Society" 
                    subtitle="Manage inter-college competitions, internal trials, and memorial scoring." 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Widget */}
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Active Teams</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">12</div>
                        <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-md">+3 this semester</p>
                    </div>
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Upcoming Competitions</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">4</div>
                        <p className="text-[11px] font-bold text-amber-500 bg-amber-500/10 w-fit px-2 py-0.5 rounded-md">Next: Philip C. Jessup</p>
                    </div>
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Memorials Submitted</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">28</div>
                        <p className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-md">Pending Review: 5</p>
                    </div>
                </div>

                {/* Empty State / Coming Soon Layout for the Table */}
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-themeAccent/10 flex items-center justify-center mb-4">
                        <i className="fa-solid fa-list-check text-2xl text-themeAccent"></i>
                    </div>
                    <h2 className="text-xl font-black text-themeText dark:text-white mb-2">Moot Roster Engine Initialization</h2>
                    <p className="text-sm font-medium text-themeTextSec max-w-md">
                        The courtroom simulator and pairing algorithm is currently being deployed by the engineering team. Full functionality will be available in the next patch.
                    </p>
                </div>
            </div>
        </div>
    );
}

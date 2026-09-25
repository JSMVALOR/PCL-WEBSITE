/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminLegalAid() {
    return (
        <div className="w-full animate-fade-in selection:bg-rose-500/20 min-h-screen bg-themeApp text-themeText dark:text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                <PageHeader 
                    icon="fa-solid fa-hand-holding-hand" 
                    title="Legal Aid Clinic" 
                    subtitle="Track pro-bono cases, community outreach, and student legal services." 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Active Cases</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">45</div>
                        <p className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-md">12 Resolved this month</p>
                    </div>
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Total Pro-Bono Hours</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">1,240</div>
                        <p className="text-[11px] font-bold text-amber-500 bg-amber-500/10 w-fit px-2 py-0.5 rounded-md">Across 80 students</p>
                    </div>
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                        <h3 className="text-sm font-black tracking-tight text-themeTextSec uppercase">Community Camps</h3>
                        <div className="text-4xl font-black text-themeText dark:text-white">3</div>
                        <p className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 w-fit px-2 py-0.5 rounded-md">Upcoming: Rural Legal Drive</p>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                        <i className="fa-solid fa-file-contract text-2xl text-rose-500"></i>
                    </div>
                    <h2 className="text-xl font-black text-themeText dark:text-white mb-2">Case Management System V2 Deployment</h2>
                    <p className="text-sm font-medium text-themeTextSec max-w-md">
                        We are migrating to a secure, encrypted case ledger for legal aid records to ensure client confidentiality. The ledger will be live shortly.
                    </p>
                </div>
            </div>
        </div>
    );
}

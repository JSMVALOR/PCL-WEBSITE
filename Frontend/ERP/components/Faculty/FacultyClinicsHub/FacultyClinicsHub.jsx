/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function FacultyClinicsHub() {
    return (
        <div className="w-full animate-fade-in selection:bg-[#007AFF]/20 min-h-screen bg-transparent text-themeText dark:text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                <PageHeader 
                    icon="fa-solid fa-scale-balanced" 
                    title="Clinics Hub" 
                    subtitle="Oversight for moot court, placements, and legal aid." 
                />
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center min-h-[500px]">
                    <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                        <i className="fa-solid fa-person-digging text-4xl text-amber-500"></i>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-themeText mb-3">Module Offline for Upgrades</h2>
                    <p className="text-sm font-medium text-themeTextSec max-w-md leading-relaxed">
                        We are currently restructuring the Clinics Hub engine to provide a perfected and more efficient experience. Please check back later.
                    </p>
                </div>
            </div>
        </div>
    );
}

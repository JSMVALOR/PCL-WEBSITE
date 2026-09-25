/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function MootCourt() {
    return (
        <div className="w-full animate-fade-in selection:bg-themeAccent/20 min-h-screen bg-themeApp text-themeText dark:text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                <PageHeader 
                    icon="fa-solid fa-gavel" 
                    title="Moot Court Portal" 
                    subtitle="Register for competitions, track internal rankings, and submit memorials." 
                />

                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-themeAccent/10 flex items-center justify-center mb-6">
                        <i className="fa-solid fa-scale-balanced text-3xl text-themeAccent"></i>
                    </div>
                    <h2 className="text-xl font-black text-themeText dark:text-white mb-2">Moot Court Season Incoming</h2>
                    <p className="text-sm font-medium text-themeTextSec max-w-md mb-6">
                        The Moot Court Society is currently preparing the rosters and rules for the upcoming semester. Registration lines will open shortly.
                    </p>
                    <button className="px-6 py-3 bg-themeText dark:bg-white text-themeApp dark:text-black rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform">
                        Notify Me
                    </button>
                </div>
            </div>
        </div>
    );
}

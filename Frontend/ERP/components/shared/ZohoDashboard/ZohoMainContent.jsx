import React, { useState } from 'react';

export default function ZohoMainContent({ session, role }) {
    const [activeTab, setActiveTab] = useState('Overview');
    const tabs = ['Overview', 'Analytics', 'Recent Activity'];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Tabs */}
            <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] px-4 flex items-center overflow-x-auto no-scrollbar shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                {tabs.map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-5 text-[13px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
                            tab === activeTab ? 'border-[#007AFF] text-themeAccent' : 'border-transparent text-themeTextSec hover:text-themeText'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Greeting Card */}
            <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] p-8 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 p-3 border border-themeBorder dark:border-white/10">
                    <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex flex-col flex-grow">
                    <h2 className="text-themeText text-[22px] font-bold tracking-tight">{getGreeting()} {session?.full_name || 'User'}</h2>
                    <p className="text-themeTextSec text-[14px] mt-1 font-medium">System operations are nominal. Have a productive day.</p>
                </div>
                <div className="shrink-0 text-themeText opacity-40 text-4xl hidden sm:block">
                    <i className="fa-solid fa-moon"></i>
                </div>
            </div>

            {/* Work Schedule - Hidden for Admin, Visible for Faculty/Student */}
            {role !== 'admin' && (
                <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-themeTextSec">
                            <i className="fa-regular fa-clock text-lg"></i>
                            <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Work Schedule</h3>
                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-black/20 rounded-xl border border-themeBorder dark:border-white/5">
                        <i className="fa-regular fa-calendar-xmark text-2xl text-themeTextSec mb-3 opacity-50"></i>
                        <span className="text-themeTextSec text-sm font-medium">No active schedule configured.</span>
                    </div>
                </div>
            )}

            {/* Alerts & Notifications - Always present but clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-themeTextSec">
                        <i className="fa-solid fa-umbrella-beach text-lg"></i>
                        <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Upcoming Holidays</h3>
                    </div>
                    <div className="w-full flex items-center justify-center py-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-themeBorder dark:border-white/5">
                        <span className="text-themeTextSec text-sm font-medium">No holidays scheduled this month.</span>
                    </div>
                </div>
                
                <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-themeTextSec">
                        <i className="fa-solid fa-bell text-lg"></i>
                        <h3 className="text-[15px] font-semibold tracking-tight text-themeText">Action Alerts</h3>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-themeBorder dark:border-white/5">
                        <span className="text-themeTextSec text-sm font-medium text-center">No pending alerts.<br/>You're all caught up!</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
